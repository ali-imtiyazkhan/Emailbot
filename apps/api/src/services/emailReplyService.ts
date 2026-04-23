import { google } from 'googleapis';
import logger from '@repo/shared/logger';

interface ReplyOptions {
  emailAccount: any;
  originalSender: string;
  originalSubject: string;
  replyBody: string;
  originalMessageId: string;
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
  const oauth2Client = new google.auth.OAuth2(
    process.env.GOOGLE_CLIENT_ID,
    process.env.GOOGLE_CLIENT_SECRET
  );

  oauth2Client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken,
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });

  // Build RFC 2822 email with threading headers
  const replySubject = subject.startsWith('Re:') ? subject : `Re: ${subject}`;
  const rawMessage = [
    `To: ${to}`,
    `Subject: ${replySubject}`,
    `In-Reply-To: ${threadMessageId}`,   // this threads it correctly
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

  await gmail.users.messages.send({
    userId: 'me',
    requestBody: {
      raw: encodedMessage,
      threadId: threadMessageId, // keeps it in the same Gmail thread
    },
  });

  logger.info(`Gmail reply sent to ${to}`);
}

async function sendOutlookReply(
  account: any,
  to: string,
  subject: string,
  body: string,
  originalMessageId: string
): Promise<void> {
  // Refresh token if needed
  const tokenResponse = await fetch('https://login.microsoftonline.com/common/oauth2/v2.0/token', {
    method: 'POST',
    headers: { 'Content-Type': 'application/x-www-form-urlencoded' },
    body: new URLSearchParams({
      client_id: process.env.MICROSOFT_CLIENT_ID!,
      client_secret: process.env.MICROSOFT_CLIENT_SECRET!,
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
      message: {
        body: { contentType: 'Text', content: body },
      },
      comment: body,
    }),
  });

  if (!replyResponse.ok) {
    throw new Error(`Outlook API returned ${replyResponse.status}: ${await replyResponse.text()}`);
  }

  logger.info(`Outlook reply sent to ${to}`);
}
