import axios from 'axios';
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const WHATSAPP_API_VERSION = 'v22.0';
const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

export const sendTextMessage = async (to: string, text: string) => {
  if (!process.env.WHATSAPP_ACCESS_TOKEN) {
    logger.warn('WHATSAPP_ACCESS_TOKEN not set, skipping message');
    return;
  }

  try {
    await axios.post(
      WHATSAPP_API_URL,
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

export const sendNotification = async (to: string, subject: string, summary: string, priority: number) => {
  const message = `📧 *${subject}*\n\n📝 ${summary}\n\n⚠️ Priority: ${priority}/10\n\n_Reply with "FULL" for more, or "SKIP" to ignore._`;
  await sendTextMessage(to, message);
};
