import { Router, Request, Response } from 'express';
import { prisma as db } from '@repo/db';
import logger from '@repo/shared/logger';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { sendEmailReply } from '../services/emailReplyService.js';

const router = Router();
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY!);

// Webhook verification (Meta requires this)
router.get('/webhook/whatsapp', (req: Request, res: Response) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    logger.info('WhatsApp webhook verified');
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Incoming message handler
router.post('/webhook/whatsapp', async (req: Request, res: Response) => {
  // Always respond 200 immediately — Meta will retry if you don't
  res.sendStatus(200);

  try {
    const body = req.body;

    // Extract the message from Meta's payload structure
    const entry = body?.entry?.[0];
    const change = entry?.changes?.[0];
    const value = change?.value;
    const messages = value?.messages;

    if (!messages || messages.length === 0) {
      // This is a status update (delivered, read, etc.) — ignore it
      return;
    }

    const incomingMsg = messages[0];

    // We only care about text replies
    if (incomingMsg.type !== 'text') {
      logger.info(`Ignoring non-text WhatsApp message type: ${incomingMsg.type}`);
      return;
    }

    const replyText = incomingMsg.text?.body;
    const contextMessageId = incomingMsg.context?.id; // ID of the message they replied to

    if (!contextMessageId) {
      logger.info('WhatsApp message has no reply context — not a reply to a notification, ignoring.');
      return;
    }

    logger.info(`Incoming WhatsApp reply to message ${contextMessageId}: "${replyText}"`);

    // KEY: Match the WhatsApp message ID to the original email in your DB
    const processedEmail = await db.processedEmail.findFirst({
      where: { whatsappMessageId: contextMessageId },
      include: { emailAccount: true }, // to get OAuth tokens for sending
    });

    if (!processedEmail) {
      logger.warn(`No email found for WhatsApp message ID: ${contextMessageId}`);
      return;
    }

    logger.info(`Matched reply to email: "${processedEmail.subject}" from ${processedEmail.sender}`);

    // Polish the reply with AI
    const polishedReply = await polishReplyWithAI(replyText, processedEmail.subject || '', processedEmail.sender || '');

    // Send the polished reply as an email
    await sendEmailReply({
      emailAccount: processedEmail.emailAccount,
      originalSender: processedEmail.sender || '',
      originalSubject: processedEmail.subject || '',
      replyBody: polishedReply,
      originalMessageId: processedEmail.messageId,
    });

    logger.info(` Reply sent successfully for email: ${processedEmail.messageId}`);

  } catch (error) {
    logger.error('Error processing WhatsApp webhook:', error);
  }
});

//  AI polishing function
async function polishReplyWithAI(
  rawReply: string,
  originalSubject: string,
  originalSender: string
): Promise<string> {
  try {
    const model = genAI.getGenerativeModel({ model: 'gemini-2.5-flash-lite' });

    const prompt = `You are a professional email assistant. 
The user received an email with subject: "${originalSubject}" from ${originalSender}.
They want to reply with this raw message: "${rawReply}"

Polish this into a professional, well-structured email reply. 
Keep the core intent and tone of the user's message.
Return ONLY the email body text, no subject line, no "Dear..." unless they included it.`;

    const result = await model.generateContent(prompt);
    const polished = result.response.text();
    logger.info('AI polished the reply successfully');
    return polished;
  } catch (error) {
    logger.warn('AI polishing failed, using raw reply:', error);
    return rawReply; // fallback to raw reply if AI fails
  }
}

export default router;
