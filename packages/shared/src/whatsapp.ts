import axios from 'axios';
import logger from './logger.js';

const WHATSAPP_API_VERSION = 'v22.0';

export const sendTextMessage = async (to: string, text: string): Promise<string | undefined> => {
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    logger.warn('WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set, skipping message');
    return;
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'text',
        text: { body: text },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.messages?.[0]?.id;
  } catch (error: any) {
    logger.error('Error sending WhatsApp message:', error.response?.data || error.message);
    return undefined;
  }
};

export const sendTemplateMessage = async (to: string, templateName: string, components: any[]): Promise<string | undefined> => {
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    logger.warn('WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set, skipping template message');
    return;
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: {
          name: templateName,
          language: { code: 'en' },
          components: [
            {
              type: 'body',
              parameters: components,
            },
          ],
        },
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    return response.data.messages?.[0]?.id;
  } catch (error: any) {
    logger.error('Error sending WhatsApp template message:', error.response?.data || error.message);
    
    // Help the user with common token errors
    if (error.response?.data?.error?.code === 190) {
      logger.error('🚨 WhatsApp Access Token EXPIRED or INVALID. Please refresh it in the Meta Developer Dashboard.');
    }
    
    return undefined;
  }
};

export const sendNotification = async (to: string, subject: string, summary: string, priority: number): Promise<string | undefined> => {
  // Use the template to bypass the 24-hour customer care window restriction
  const sanitize = (text: string) => text.replace(/[\n\r\t]/g, ' ').replace(/\s{2,}/g, ' ').trim();
  const parameters = [
    { type: 'text', text: sanitize(subject) },
    { type: 'text', text: sanitize(summary) },
    { type: 'text', text: String(priority) },
  ];

  logger.info(`Sending template-based notification to ${to}...`);
  return await sendTemplateMessage(to, 'new_email_notification', parameters);
};
