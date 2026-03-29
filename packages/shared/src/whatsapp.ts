import axios from 'axios';
import logger from './logger.js';

const WHATSAPP_API_VERSION = 'v22.0';

export const sendTextMessage = async (to: string, text: string): Promise<void> => {
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    logger.warn('WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set, skipping message');
    return;
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  try {
    await axios.post(
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
  } catch (error: any) {
    logger.error('Error sending WhatsApp message:', error.response?.data || error.message);
  }
};

export const sendNotification = async (to: string, subject: string, summary: string, priority: number): Promise<void> => {
  const message = `📧 *${subject}*\n\n📝 ${summary}\n\n⚠️ Priority: ${priority}/10\n\n_Reply with "FULL" for more, or "SKIP" to ignore._`;
  await sendTextMessage(to, message);
};
