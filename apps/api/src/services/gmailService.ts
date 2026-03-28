import { google } from 'googleapis';
import db from '../config/db.js';
import logger from '../utils/logger.js';
import { googleOAuth2Client } from '../config/google.js';


export const fetchLatestEmails = async (userId: number) => {
  const account = await db.emailAccount.findFirst({ 
    where: { userId, provider: 'gmail', isActive: true } 
  });
  
  if (!account || !account.accessToken) {
    logger.warn(`No active Gmail account found for user ${userId}`);
    return [];
  }

  googleOAuth2Client.setCredentials({
    access_token: account.accessToken,
    refresh_token: account.refreshToken || undefined,
    expiry_date: account.tokenExpiry ? account.tokenExpiry.getTime() : undefined,
  });

  googleOAuth2Client.on('tokens', async (tokens) => {
    if (tokens.access_token) {
      await db.emailAccount.update({
        where: { id: account.id },
        data: {
          accessToken: tokens.access_token,
          tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
          ...(tokens.refresh_token ? { refreshToken: tokens.refresh_token } : {}),
        }
      });
      logger.info(`Refreshed Gmail access token for user ${userId}`);
    }
  });

  const gmail = google.gmail({ version: 'v1', auth: googleOAuth2Client });

  try {
    const res = await gmail.users.messages.list({ 
      userId: 'me', 
      q: 'is:unread', 
      maxResults: 15 
    });
    
    const messages = res.data.messages || [];
    const emails = [];

    for (const msg of messages) {
      const detail = await gmail.users.messages.get({ 
        userId: 'me', 
        id: msg.id! 
      });
      
      const payload = detail.data.payload;
      const headers = payload?.headers;
      
      const subject = headers?.find(h => h.name === 'Subject')?.value || 'No Subject';
      const from = headers?.find(h => h.name === 'From')?.value || 'Unknown';
      
      // Extract snippet or body
      let body = detail.data.snippet || '';
      
      // Attempt to get full body if available (simplified)
      if (payload?.parts) {
        const textPart = payload.parts.find(p => p.mimeType === 'text/plain');
        if (textPart?.body?.data) {
          body = Buffer.from(textPart.body.data, 'base64').toString();
        }
      } else if (payload?.body?.data) {
        body = Buffer.from(payload.body.data, 'base64').toString();
      }

      emails.push({ 
        id: msg.id, 
        subject, 
        sender: from, 
        body 
      });
    }

    return emails;
  } catch (error: any) {
    logger.error(`Error fetching Gmail for user ${userId}:`, error.message);
    // If it's an auth error, we might want to deactivate the account
    if (error.code === 401) {
      await db.emailAccount.update({
        where: { id: account.id },
        data: { isActive: false }
      });
      logger.warn(`Deactivated Gmail account for user ${userId} due to auth failure.`);
    }
    return [];
  }
};
