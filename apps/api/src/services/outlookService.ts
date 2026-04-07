import axios from 'axios';
import db from '../config/db.js';
import logger from '../utils/logger.js';
import { refreshOutlookToken } from '../config/outlook.js';

export interface FetchedOutlookEmail {
  id: string;
  subject: string;
  sender: string;
  body: string;
  receivedAt?: Date;
}

/**
 * Fetch latest unread emails for a specific user's Outlook account.
 */
export const fetchOutlookEmails = async (userId: number): Promise<FetchedOutlookEmail[]> => {
  const account = await db.emailAccount.findFirst({ 
    where: { userId, provider: 'outlook', isActive: true } 
  });
  
  if (!account || !account.accessToken) {
    logger.warn(`No active Outlook account found for user ${userId}`);
    return [];
  }

  let accessToken = account.accessToken;

  // Check if token is expired or about to expire (within 5 mins)
  const isExpired = account.tokenExpiry && 
                    (account.tokenExpiry.getTime() - Date.now() < 300000);

  if (isExpired && account.refreshToken) {
    try {
      logger.info(`Outlook token expired for user ${userId}. Refreshing...`);
      const refreshed = await refreshOutlookToken(account.refreshToken);
      
      accessToken = refreshed.access_token;
      
      await db.emailAccount.update({
        where: { id: account.id },
        data: {
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token || account.refreshToken,
          tokenExpiry: new Date(Date.now() + (refreshed.expires_in * 1000)),
        }
      });
      
      logger.info(`Successfully refreshed Outlook token for user ${userId}`);
    } catch (error: unknown) {
      const err = error as { response?: { data?: unknown }; message?: string };
      logger.error(`Failed to refresh Outlook token for user ${userId}:`, 
                   err.response?.data || err.message);
      return [];
    }
  }

  try {
    const response = await axios.get('https://graph.microsoft.com/v1.0/me/messages', {
      headers: { Authorization: `Bearer ${accessToken}` },
      params: { 
        $filter: 'isRead eq false', 
        $top: 15,
        $select: 'id,subject,from,bodyPreview,receivedDateTime'
      },
    });

    interface OutlookMessage {
      id: string;
      subject: string;
      from?: { emailAddress?: { address?: string } };
      bodyPreview?: string;
      receivedDateTime?: string;
    }

    const messages: OutlookMessage[] = response.data.value || [];
    
    return messages.map((msg) => ({
      id: msg.id,
      subject: msg.subject,
      sender: msg.from?.emailAddress?.address || 'Unknown',
      body: msg.bodyPreview || 'No content preview available.',
      receivedAt: msg.receivedDateTime ? new Date(msg.receivedDateTime) : undefined,
    }));
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown; status?: number }; message?: string };
    logger.error(`Error fetching Outlook for user ${userId}:`, 
                 err.response?.data || err.message);
                 
    if (err.response?.status === 401) {
      await db.emailAccount.update({
        where: { id: account.id },
        data: { isActive: false }
      });
      logger.warn(`Deactivated Outlook account for user ${userId} due to 401.`);
    }
    
    return [];
  }
};
export const sendEmailReply = async (userId: number, originalMessageId: string, replyText: string): Promise<boolean> => {
  const account = await db.emailAccount.findFirst({
    where: { userId, provider: 'outlook', isActive: true }
  });

  if (!account || !account.accessToken) {
    logger.warn(`No active Outlook account found for user ${userId} to send reply`);
    return false;
  }

  let accessToken = account.accessToken;

  // Refresh token if expired or about to expire (within 5 mins)
  const isExpired = account.tokenExpiry && 
                    (account.tokenExpiry.getTime() - Date.now() < 300000);

  if (isExpired && account.refreshToken) {
    try {
      const refreshed = await refreshOutlookToken(account.refreshToken);
      accessToken = refreshed.access_token;
      await db.emailAccount.update({
        where: { id: account.id },
        data: {
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token || account.refreshToken,
          tokenExpiry: new Date(Date.now() + (refreshed.expires_in * 1000)),
        }
      });
      logger.info(`Refreshed Outlook token for reply (user ${userId})`);
    } catch (refreshErr: any) {
      logger.error(`Failed to refresh Outlook token for reply (user ${userId}):`, refreshErr.message);
      return false;
    }
  }

  try {
    // Microsoft Graph has a specific "createReply" action which handle threading headers automatically
    const createReplyResponse = await axios.post(
      `https://graph.microsoft.com/v1.0/me/messages/${originalMessageId}/createReply`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    const draftId = createReplyResponse.data.id;

    // Update the draft with the reply text
    await axios.patch(
      `https://graph.microsoft.com/v1.0/me/messages/${draftId}`,
      {
        body: {
          contentType: 'Text',
          content: `${replyText}\n\n--\nSent via EmailBot`
        }
      },
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    // Send the draft
    await axios.post(
      `https://graph.microsoft.com/v1.0/me/messages/${draftId}/send`,
      {},
      { headers: { Authorization: `Bearer ${accessToken}` } }
    );

    logger.info(`Successfully sent Outlook reply for user ${userId} to message ${originalMessageId}`);
    return true;
  } catch (error: any) {
    logger.error(`Error sending Outlook reply for user ${userId}:`, 
                 error.response?.data || error.message);
    return false;
  }
};
