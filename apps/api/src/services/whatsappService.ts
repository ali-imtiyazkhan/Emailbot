import axios from 'axios';
import logger from '../utils/logger.js';

// Env is loaded centrally via config/env.ts (first import in index.ts)
const WHATSAPP_API_VERSION = 'v22.0';
const WHATSAPP_API_URL = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

export const sendTextMessage = async (to: string, text: string): Promise<string | undefined> => {
  if (!process.env.WHATSAPP_ACCESS_TOKEN) {
    logger.warn('WHATSAPP_ACCESS_TOKEN not set, skipping message');
    return undefined;
  }

  try {
    const response = await axios.post(
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
    return response.data?.messages?.[0]?.id;
  } catch (error: unknown) {
    const err = error as { response?: { data?: unknown }; message?: string };
    logger.error('Error sending WhatsApp message:', err.response?.data || err.message);
    return undefined;
  }
};

export const sendNotification = async (to: string, subject: string, summary: string, priority: number): Promise<string | undefined> => {
  const message = `📧 *${subject}*\n\n📝 ${summary}\n\n⚠️ Priority: ${priority}/10\n\n_Reply with "FULL" for more, or "SKIP" to ignore._`;
  return await sendTextMessage(to, message);
};
