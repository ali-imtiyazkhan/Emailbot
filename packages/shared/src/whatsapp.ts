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

export const sendNotification = async (to: string, subject: string, summary: string, priority: number): Promise<string | undefined> => {
  const message = `📧 *${subject}*\n\n📝 ${summary}\n\n⚠️ Priority: ${priority}/10\n\n_Reply to this message to send an email back to the sender._`;
  return await sendTextMessage(to, message);
};
