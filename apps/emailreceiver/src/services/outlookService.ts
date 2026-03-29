import axios from 'axios';
import { prisma as db } from '@repo/db';
import logger from '@repo/shared/logger';

export interface FetchedOutlookEmail {
  id: string;
  subject: string;
  sender: string;
  body: string;
  receivedAt: Date;
}

export const fetchOutlookEmails = async (userId: number): Promise<FetchedOutlookEmail[]> => {
  const account = await db.emailAccount.findFirst({
    where: { userId, provider: 'outlook', isActive: true },
  });

  if (!account || !account.refreshToken) {
    logger.warn(`No active Outlook account for user ${userId}`);
    return [];
  }

  // Refresh token logic
  try {
    const params = new URLSearchParams();
    params.append('client_id', process.env.OUTLOOK_CLIENT_ID!);
    params.append('client_secret', process.env.OUTLOOK_CLIENT_SECRET!);
    params.append('refresh_token', account.refreshToken);
    params.append('grant_type', 'refresh_token');

    const tokenRes = await axios.post(
      `https://login.microsoftonline.com/${process.env.OUTLOOK_TENANT_ID}/oauth2/v2.0/token`,
      params
    );

    const accessToken = tokenRes.data.access_token;
    
    const res = await axios.get('https://graph.microsoft.com/v1.0/me/messages?$filter=isRead eq false&$top=10', {
      headers: { Authorization: `Bearer ${accessToken}` }
    });

    const messages = res.data.value || [];
    const emails: FetchedOutlookEmail[] = [];

    for (const msg of messages) {
      emails.push({
        id: msg.id,
        subject: msg.subject || 'No Subject',
        sender: msg.from?.emailAddress?.address || 'Unknown',
        body: msg.bodyPreview || '', // MS Graph provides bodyPreview nicely
        receivedAt: new Date(msg.receivedDateTime),
      });
    }

    return emails;
  } catch (error) {
    logger.error(`Error fetching Outlook for user ${userId}:`, error);
    return [];
  }
};
