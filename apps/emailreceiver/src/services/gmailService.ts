import { google } from 'googleapis';
import { prisma as db } from '@repo/db';
import logger from '@repo/shared/logger';

export interface FetchedEmail {
  id: string;
  subject: string;
  sender: string;
  body: string;
  receivedAt: Date;
}

const createOAuth2Client = () => {
  return new google.auth.OAuth2(
    process.env.GMAIL_CLIENT_ID,
    process.env.GMAIL_CLIENT_SECRET,
    process.env.GMAIL_REDIRECT_URI
  );
};

export const fetchLatestEmails = async (userId: number): Promise<FetchedEmail[]> => {
  const account = await db.emailAccount.findFirst({
    where: { userId, provider: 'gmail', isActive: true },
  });

  if (!account || !account.refreshToken) {
    logger.warn(`No active Gmail account for user ${userId}`);
    return [];
  }

  const oauth2Client = createOAuth2Client();
  oauth2Client.setCredentials({
    refresh_token: account.refreshToken,
  });

  try {
    const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
    const res = await gmail.users.messages.list({
      userId: 'me',
      q: 'is:unread',
      maxResults: 10,
    });

    const messages = res.data.messages || [];
    const emails: FetchedEmail[] = [];

    for (const msg of messages) {
      const details = await gmail.users.messages.get({
        userId: 'me',
        id: msg.id!,
      });

      const payload = details.data.payload;
      const headers = payload?.headers || [];
      const subject = headers.find((h) => h.name === 'Subject')?.value || 'No Subject';
      const sender = headers.find((h) => h.name === 'From')?.value || 'Unknown';

      // Simple body extraction (preferring plain text)
      let body = '';
      if (payload?.parts) {
        const textPart = payload.parts.find((p) => p.mimeType === 'text/plain');
        if (textPart && textPart.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString();
        }
      } else if (payload?.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString();
      }

      emails.push({
        id: msg.id!,
        subject,
        sender,
        body,
        receivedAt: new Date(parseInt(details.data.internalDate!)),
      });
    }

    return emails;
  } catch (error) {
    logger.error(`Error fetching Gmail for user ${userId}:`, error);
    return [];
  }
};
