import axios from 'axios';
import db from '../config/db.js';
import logger from '../utils/logger.js';
import { refreshOutlookToken } from '../config/outlook.js';

/**
 * Fetch latest unread emails for a specific user's Outlook account.
 */
export const fetchOutlookEmails = async (userId: number) => {
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
      
      // Update database with new tokens
      await db.emailAccount.update({
        where: { id: account.id },
        data: {
          accessToken: refreshed.access_token,
          refreshToken: refreshed.refresh_token || account.refreshToken,
          tokenExpiry: new Date(Date.now() + (refreshed.expires_in * 1000)),
        }
      });
      
      logger.info(`Successfully refreshed Outlook token for user ${userId}`);
    } catch (error: any) {
      logger.error(`Failed to refresh Outlook token for user ${userId}:`, 
                   error.response?.data || error.message);
      // Optional: Mark as inactive if refresh fails
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

    const messages = response.data.value || [];
    
    return messages.map((msg: any) => ({
      id: msg.id,
      subject: msg.subject,
      sender: msg.from?.emailAddress?.address || 'Unknown',
      body: msg.bodyPreview || 'No content preview available.',
      receivedAt: msg.receivedDateTime ? new Date(msg.receivedDateTime) : undefined,
    }));
  } catch (error: any) {
    logger.error(`Error fetching Outlook for user ${userId}:`, 
                 error.response?.data || error.message);
                 
    if (error.response?.status === 401) {
      await db.emailAccount.update({
        where: { id: account.id },
        data: { isActive: false }
      });
      logger.warn(`Deactivated Outlook account for user ${userId} due to 401.`);
    }
    
    return [];
  }
};
