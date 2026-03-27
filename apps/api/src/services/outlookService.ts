import axios from 'axios';
import db from '../config/db.js';
import dotenv from 'dotenv';

dotenv.config();

export const fetchOutlookEmails = async (userId: number) => {
  const account = await db.emailAccount.findFirst({ 
    where: { userId, provider: 'outlook', isActive: true } 
  });
  if (!account) return [];

  try {
    const response = await axios.get('https://graph.microsoft.com/v1.0/me/messages', {
      headers: { Authorization: `Bearer ${account.accessToken}` },
      params: { $filter: 'isRead eq false', $top: 10 },
    });

    const messages = response.data.value || [];
    return messages.map((msg: any) => ({
      id: msg.id,
      subject: msg.subject,
      from: msg.from?.emailAddress?.address,
      body: msg.bodyPreview || msg.body?.content,
    }));
  } catch (error: any) {
    console.error('Error fetching Outlook emails:', error.response?.data || error.message);
    return [];
  }
};
