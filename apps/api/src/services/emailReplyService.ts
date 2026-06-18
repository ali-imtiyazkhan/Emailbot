import axios from 'axios';
import logger from '@repo/shared/logger';

interface ReplyOptions {
  emailAccount: any;
  originalSender: string;
  originalSubject: string;
  replyBody: string;
  originalMessageId: string;
}

const GMAIL_TOKEN_URL = 'https://oauth2.googleapis.com/token';
const GMAIL_API_BASE = 'https://gmail.googleapis.com/gmail/v1/users/me';

async function refreshGmailToken(account: any): Promise<string> {
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
  return res.data.access_token;
}

export const sendEmailReply = async (options: ReplyOptions): Promise<void> => {
  const { emailAccount, originalSender, originalSubject, replyBody, originalMessageId } = options;

  if (emailAccount.provider === 'gmail') {
    await sendGmailReply(emailAccount, originalSender, originalSubject, replyBody, originalMessageId);
  } else if (emailAccount.provider === 'outlook') {
    await sendOutlookReply(emailAccount, originalSender, originalSubject, replyBody, originalMessageId);
  } else {
    throw new Error(`Unknown email provider: ${emailAccount.provider}`);
  }
};

async function sendGmailReply(
  account: any,
  to: string,
  subject: string,
  body: string,
  threadMessageId: string
): Promise<void> {
  const accessToken = await refreshGmailToken(account);

  const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
  const rawMessage = [
    `To: ${to}`,
    `Subject: ${replySubject}`,
    `In-Reply-To: ${threadMessageId}`,
    `References: ${threadMessageId}`,
    `Content-Type: text/plain; charset=utf-8`,
    '',
    body,
  ].join('\n');

  const encodedMessage = Buffer.from(rawMessage)
    .toString('base64')
    .replace(/\+/g, '-')
    .replace(/\//g, '_')
    .replace(/=+$/, '');

  await axios.post(
    `${GMAIL_API_BASE}/messages/send`,
    { raw: encodedMessage, threadId: threadMessageId },
    {
      headers: {
        Authorization: `Bearer ${accessToken}`,
        'Content-Type': 'application/json',
      },
      timeout: 15000,
    }
  );

  logger.info(`Gmail reply sent to ${to}`);
}

async function sendOutlookReply(
  account: any,
  to: string,
  subject: string,
  body: string,
  originalMessageId: string
): Promise<void> {
  const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID!,
      client_secret: process.env.OUTLOOK_CLIENT_SECRET!,
      refresh_token: account.refreshToken,
      grant_type: 'refresh_token',
    }),
  });

  if (!tokenResponse.ok) {
    throw new Error(`Failed to refresh Outlook token: ${await tokenResponse.text()}`);
  }

  const tokens = await tokenResponse.json();

  const replyResponse = await fetch(`https://graph.microsoft.com/v1.0/me/messages/${originalMessageId}/reply`, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${tokens.access_token}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      comment: body,
    }),
  });

  if (!replyResponse.ok) {
    throw new Error(`Outlook API returned ${replyResponse.status}: ${await replyResponse.text()}`);
  }

  logger.info(`Outlook reply sent to ${to}`);
}
