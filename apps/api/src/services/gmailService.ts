import axios from 'axios';
import db from '../config/db.js';
import logger from '../utils/logger.js';

export interface FetchedEmail {
  id: string;
  subject: string;
  sender: string;
  body: string;
}

const GMAIL_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

async function ensureValidToken(account: {
  id: number;
  accessToken: string | null;
  refreshToken: string | null;
  tokenExpiry: Date | null;
}): Promise<string> {
  const now = Date.now();
  const isExpired = !account.accessToken || (account.tokenExpiry && account.tokenExpiry.getTime() <= now + 60000);

  if (!isExpired) {
    return account.accessToken!;
  }

  if (!account.refreshToken) {
    throw new Error('No refresh token available');
  }

  const res = await axios.post(
    GMAIL_TOKEN_URL,
    {
      client_id: process.env.GMAIL_CLIENT_ID,
      client_secret: process.env.GMAIL_CLIENT_SECRET,
      refresh_token: account.refreshToken,
      grant_type: 'refresh_token',
    },
    {
      headers: { 'Content-Type': 'application/json' },
      timeout: 15000,
    }
  );

  const { access_token, expires_in } = res.data;
  const tokenExpiry = expires_in ? new Date(now + expires_in * 1000) : null;

  await db.emailAccount.update({
    where: { id: account.id },
    data: {
      accessToken: access_token,
      tokenExpiry,
      isActive: true,
    },
  });

  logger.info(`Refreshed Gmail access token for account ${account.id}`);
  return access_token;
}

export const fetchLatestEmails = async (userId: number): Promise<FetchedEmail[]> => {
  const account = await db.emailAccount.findFirst({
    where: { userId, provider: 'gmail', isActive: true }
  });

  if (!account || !account.accessToken) {
    logger.warn(`No active Gmail account found for user ${userId}`);
    return [];
  }

  try {
    const accessToken = await ensureValidToken(account);

    const listRes = await axios.get(`${GMAIL_API_BASE}/messages`, {
      params: { q: 'is:unread', maxResults: 15 },
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 15000,
    });

    const messages = listRes.data.messages || [];
    const emails: FetchedEmail[] = [];

    for (const msg of messages) {
      if (!msg.id) continue;

      const detailRes = await axios.get(`${GMAIL_API_BASE}/messages/${msg.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 15000,
      });

      const payload = detailRes.data.payload;
      const headers = payload?.headers || [];

      const subject = headers.find((h: any) => h.name?.toLowerCase() === 'subject')?.value || 'No Subject';
      const from = headers.find((h: any) => h.name?.toLowerCase() === 'from')?.value || 'Unknown';

      let body = detailRes.data.snippet || '';
      if (payload?.parts) {
        const textPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString();
        }
      } else if (payload?.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString();
      }

      emails.push({ id: msg.id, subject, sender: from, body });
    }

    return emails;
  } catch (error: unknown) {
    const err = error as { code?: number; message?: string; response?: { status?: number } };
    logger.error(`Error fetching Gmail for user ${userId}:`, err.message);

    if (err.code === 401 || (err as any).response?.status === 401) {
      await db.emailAccount.update({
        where: { id: account.id },
        data: { isActive: false }
      });
      logger.warn(`Deactivated Gmail account for user ${userId} due to auth failure.`);
    }
    return [];
  }
};

export const sendEmailReply = async (userId: number, originalMessageId: string, replyText: string): Promise<boolean> => {
  const account = await db.emailAccount.findFirst({
    where: { userId, provider: 'gmail', isActive: true }
  });

  if (!account || !account.accessToken) {
    logger.warn(`No active Gmail account found for user ${userId} to send reply`);
    return false;
  }

  try {
    const accessToken = await ensureValidToken(account);

    // Fetch the original message to get threading headers
    const originalRes = await axios.get(`${GMAIL_API_BASE}/messages/${originalMessageId}`, {
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 15000,
    });

    const headers = originalRes.data.payload?.headers || [];
    const subject = headers.find((h: any) => h.name?.toLowerCase() === 'subject')?.value || '';
    const from = headers.find((h: any) => h.name?.toLowerCase() === 'from')?.value || '';
    const messageIdHeader = headers.find((h: any) => h.name?.toLowerCase() === 'message-id')?.value || '';
    const references = headers.find((h: any) => h.name?.toLowerCase() === 'references')?.value || '';

    const replySubject = subject.toLowerCase().startsWith('re:') ? subject : `Re: ${subject}`;

    const emailLines = [
      `To: ${from}`,
      `Subject: ${replySubject}`,
      `In-Reply-To: ${messageIdHeader}`,
      `References: ${references ? references + ' ' : ''}${messageIdHeader}`,
      'Content-Type: text/plain; charset="UTF-8"',
      '',
      replyText,
      '',
      '--',
      'Sent via EmailBot'
    ];

    const raw = Buffer.from(emailLines.join('\r\n'))
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    await axios.post(
      `${GMAIL_API_BASE}/messages/send`,
      { raw, threadId: originalRes.data.threadId },
      {
        headers: {
          Authorization: `Bearer ${accessToken}`,
          'Content-Type': 'application/json',
        },
        timeout: 15000,
      }
    );

    logger.info(`Successfully sent Gmail reply for user ${userId} to message ${originalMessageId}`);
    return true;
  } catch (error: any) {
    logger.error(`Error sending Gmail reply for user ${userId}:`, error.message, error.response?.data);
    if (error.code === 401 || error.response?.status === 401) {
      await db.emailAccount.update({
        where: { id: account.id },
        data: { isActive: false }
      });
      logger.warn(`Deactivated Gmail account for user ${userId} due to 401 during reply`);
    }
    return false;
  }
};
