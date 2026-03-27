import axios from 'axios';
import dotenv from 'dotenv';

dotenv.config();

const WHATSAPP_API_URL = `https://graph.facebook.com/v21.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

export const sendWhatsAppMessage = async (to: string, text: string) => {
  if (!process.env.WHATSAPP_ACCESS_TOKEN) {
    console.warn('WHATSAPP_ACCESS_TOKEN not set, skipping message');
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
    console.error('Error sending WhatsApp message:', error.response?.data || error.message);
  }
};

export const sendNotification = async (to: string, subject: string, summary: string, priority: number) => {
  const message = `📧 *${subject}*\n\n📝 ${summary}\n\n⚠️ Priority: ${priority}/10\n\n_Reply with "FULL" for more, or "SKIP" to ignore._`;
  await sendTextMessage(to, message);
};

export const sendTextMessage = async (to: string, text: string) => {
  const url = `https://graph.facebook.com/v22.0/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;
  await axios.post(url, {
    messaging_product: 'whatsapp',
    to,
    type: 'text',
    text: { body: text },
  }, {
    headers: { Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}` },
  });
};
