import axios from 'axios';
import { prisma as db } from '@repo/db';
import logger from '@repo/shared/logger';

export interface FetchedEmail {
  id: string;
  subject: string;
  sender: string;
  body: string;
  receivedAt: Date;
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

  const { access_token, expires_in, refresh_token } = res.data;
  const tokenExpiry = expires_in ? new Date(now + expires_in * 1000) : null;

  await db.emailAccount.update({
    where: { id: account.id },
    data: {
      accessToken: access_token,
      refreshToken: refresh_token || account.refreshToken,
      tokenExpiry,
      isActive: true,
    },
  });

  logger.info(`Refreshed Gmail token for account ${account.id}`);
  return access_token;
}

export const fetchLatestEmails = async (userId: number): Promise<FetchedEmail[]> => {
  const account = await db.emailAccount.findFirst({
    where: { userId, provider: 'gmail', isActive: true },
  });

  if (!account || !account.refreshToken) {
    logger.warn(`No active Gmail account for user ${userId}`);
    return [];
  }

  try {
    const accessToken = await ensureValidToken(account);

    const listRes = await axios.get(`${GMAIL_API_BASE}/messages`, {
      params: { q: 'is:unread', maxResults: 10 },
      headers: { Authorization: `Bearer ${accessToken}` },
      timeout: 15000,
    });

    const messages = listRes.data.messages || [];
    const emails: FetchedEmail[] = [];

    for (const msg of messages) {
      const detailRes = await axios.get(`${GMAIL_API_BASE}/messages/${msg.id}`, {
        headers: { Authorization: `Bearer ${accessToken}` },
        timeout: 15000,
      });

      const payload = detailRes.data.payload;
      const headers = payload?.headers || [];
      const subject = headers.find((h: any) => h.name === 'Subject')?.value || 'No Subject';
      const sender = headers.find((h: any) => h.name === 'From')?.value || 'Unknown';

      let body = detailRes.data.snippet || '';
      if (payload?.parts) {
        const textPart = payload.parts.find((p: any) => p.mimeType === 'text/plain');
        if (textPart && textPart.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString();
        }
      } else if (payload?.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString();
      }

      emails.push({
        id: msg.id,
        subject,
        sender,
        body,
        receivedAt: new Date(parseInt(detailRes.data.internalDate!)),
      });
    }

    return emails;
  } catch (error) {
    logger.error(`Error fetching Gmail for user ${userId}:`, error);

    if (axios.isAxiosError(error) && error.response?.status === 401) {
      await db.emailAccount.update({
        where: { id: account.id },
        data: { isActive: false },
      });
      logger.warn(`Deactivated Gmail account ${account.id} due to 401`);
    }

    return [];
  }
};
