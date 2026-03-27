import { google } from 'googleapis';
import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

const oauth2Client = new google.auth.OAuth2(
  process.env.GMAIL_CLIENT_ID,
  process.env.GMAIL_CLIENT_SECRET,
  process.env.GMAIL_REDIRECT_URI
);

export const getGmailAuthUrl = () => {
  return oauth2Client.generateAuthUrl({
    access_type: 'offline',
    scope: ['https://www.googleapis.com/auth/gmail.readonly'],
  });
};

export const fetchLatestEmails = async (userId: number) => {
  const account = await db.emailAccount.findFirst({ 
    where: { userId, provider: 'gmail', isActive: true } 
  });
  if (!account) return [];

  oauth2Client.setCredentials({
    access_token: account.accessToken || undefined,
    refresh_token: account.refreshToken || undefined,
    expiry_date: account.tokenExpiry ? account.tokenExpiry.getTime() : undefined,
  });

  const gmail = google.gmail({ version: 'v1', auth: oauth2Client });
  const res = await gmail.users.messages.list({ userId: 'me', q: 'is:unread', maxResults: 10 });
  const messages = res.data.messages || [];

  const emails = [];
  for (const msg of messages) {
    const detail = await gmail.users.messages.get({ userId: 'me', id: msg.id! });
    const payload = detail.data.payload;
    const headers = payload?.headers;
    const subject = headers?.find(h => h.name === 'Subject')?.value || 'No Subject';
    const from = headers?.find(h => h.name === 'From')?.value || 'Unknown';
    
    // Simple body extraction
    let body = '';
    if (payload?.parts && payload.parts[0]) {
      body = Buffer.from(payload.parts[0].body?.data as string || '', 'base64').toString();
    } else {
      body = Buffer.from(payload?.body?.data as string || '', 'base64').toString();
    }

    emails.push({ id: msg.id, subject, from, body });
  }

  return emails;
};
