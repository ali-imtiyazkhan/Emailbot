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
    const msgId = response.data.messages?.[0]?.id;
    logger.info(`WhatsApp text message sent to ${to}: ${msgId}`);
    return msgId;
  } catch (error: any) {
    const errDetail = error.response?.data?.error || error.message;
    logger.error(`Error sending WhatsApp message to ${to}: ${JSON.stringify(errDetail)}`);

    if (error.response?.data?.error?.code === 190) {
      logger.error('🚨 WhatsApp Access Token EXPIRED or INVALID. Please refresh it in the Meta Developer Dashboard.');
    }
    if (error.response?.data?.error?.code === 131051) {
      logger.error(`🚨 Cannot send non-template message to ${to} outside 24-hour window. Use a template message instead.`);
    }

    return undefined;
  }
};

export const sendTemplateMessage = async (to: string, templateName: string, components: any[] = [], languageCode: string = 'en_US'): Promise<string | undefined> => {
  if (!process.env.WHATSAPP_ACCESS_TOKEN || !process.env.WHATSAPP_PHONE_NUMBER_ID) {
    logger.warn('WHATSAPP_ACCESS_TOKEN or WHATSAPP_PHONE_NUMBER_ID not set, skipping template message');
    return;
  }

  const url = `https://graph.facebook.com/${WHATSAPP_API_VERSION}/${process.env.WHATSAPP_PHONE_NUMBER_ID}/messages`;

  const templatePayload: any = {
    name: templateName,
    language: { code: languageCode },
  };

  if (components && components.length > 0) {
    templatePayload.components = [
      {
        type: 'body',
        parameters: components,
      },
    ];
  }

  try {
    const response = await axios.post(
      url,
      {
        messaging_product: 'whatsapp',
        to,
        type: 'template',
        template: templatePayload,
      },
      {
        headers: {
          Authorization: `Bearer ${process.env.WHATSAPP_ACCESS_TOKEN}`,
          'Content-Type': 'application/json',
        },
      }
    );
    const msgId = response.data.messages?.[0]?.id;
    logger.info(`WhatsApp template message sent to ${to}: ${msgId}`);
    return msgId;
  } catch (error: any) {
    const errDetail = error.response?.data?.error || error.message;
    logger.error(`Error sending WhatsApp template message to ${to}: ${JSON.stringify(errDetail)}`);

    if (error.response?.data?.error?.code === 190) {
      logger.error('🚨 WhatsApp Access Token EXPIRED or INVALID. Please refresh it in the Meta Developer Dashboard.');
    }
    if (error.response?.data?.error?.code === 131005) {
      logger.error(`🚨 Template "new_email_notification" may not be approved or does not exist. Check Meta Business Manager.`);
    }

    return undefined;
  }
};

export const sendNotification = async (to: string, subject: string, summary: string, priority: number): Promise<string | undefined> => {
  // Use the template to bypass the 24-hour customer care window restriction
  const sanitize = (text: string) => text.replace(/[\n\r\t]/g, ' ').replace(/\s{2,}/g, ' ').trim();
  const parameters = [
    { type: 'text', text: sanitize(subject), parameter_name: 'subject' },
    { type: 'text', text: sanitize(summary), parameter_name: 'summary' },
    { type: 'text', text: String(priority), parameter_name: 'priority' },
  ];

  logger.info(`Sending test template notification to ${to}...`);
  // Try custom template first; if not approved yet, use pre-built 'hello_world'
  let templateMsgId = await sendTemplateMessage(to, 'new_email_notification', parameters, 'en_US');
  if (!templateMsgId) {
    logger.info(`Custom template pending, using pre-built 'hello_world' template for ${to}...`);
    templateMsgId = await sendTemplateMessage(to, 'hello_world', [], 'en_US');
  }

  // Follow up with email details
  const detailsText = `📧 *New Email*\n*Subject:* ${subject}\n\n*Summary:* ${summary}\n\n*Priority:* ${priority}/10`;
  await sendTextMessage(to, detailsText);

  return templateMsgId;
};
