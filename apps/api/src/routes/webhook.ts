import { Router } from 'express';
import { prisma as db } from '@repo/db';
import { sendTextMessage } from '@repo/shared/whatsapp';
import logger from '@repo/shared/logger';
import { sendEmailReply as sendGmailReply } from '../services/gmailService.js';
import { sendEmailReply as sendOutlookReply } from '../services/outlookService.js';
const router = Router();

// Webhook verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Incoming message handler
router.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (message) {
    const text = message.text?.body;
    const from = message.from;
    const context = message.context; // Contains the ID of the message being replied to
    logger.info('Received WhatsApp message:', { text, from, replyContext: context?.id });
    
    // Find the user by WhatsApp number
    const user = await db.user.findFirst({ where: { whatsapp: from } });
    if (!user) return res.sendStatus(200);

    // 1. Handle REPLIES to email notifications
    if (context?.id && text) {
      const originalEmail = await db.processedEmail.findFirst({
        where: { userId: user.id, whatsappMessageId: context.id },
        include: { emailAccount: true }
      });

      if (originalEmail) {
        logger.info(`Forwarding WhatsApp reply as email for user ${user.id} (Original Msg: ${originalEmail.messageId})`);
        
        let success = false;
        if (originalEmail.emailAccount.provider === 'gmail') {
          success = await sendGmailReply(user.id, originalEmail.messageId, text);
        } else if (originalEmail.emailAccount.provider === 'outlook') {
          success = await sendOutlookReply(user.id, originalEmail.messageId, text);
        }

        if (success) {
          await sendTextMessage(from, `✅ Your reply has been sent to *${originalEmail.sender}*`);
        } else {
          await sendTextMessage(from, `❌ Failed to send your email reply. Please try again later.`);
        }
        return res.sendStatus(200);
      }
    }

    // 2. Handle COMMANDS
    const command = text?.toUpperCase();
    if (command === 'FULL') {
      const lastEmail = await db.processedEmail.findFirst({
        where: { userId: user.id },
        orderBy: { processedAt: 'desc' }
      });
      if (lastEmail) {
        await sendTextMessage(from, `📄 *Full Email Subject*: ${lastEmail.subject}\n\n${lastEmail.summary}\n\n_Full content feature coming soon (requires fetching body by ID)_`);
      }
    } else if (command === 'PAUSE') {
      await db.emailAccount.updateMany({
        where: { userId: user.id },
        data: { isActive: false }
      });
      await sendTextMessage(from, '⏸️ Notifications paused. Reply "RESUME" to start again.');
    } else if (command === 'RESUME') {
      await db.emailAccount.updateMany({
        where: { userId: user.id },
        data: { isActive: true }
      });
      await sendTextMessage(from, '▶️ Notifications resumed!');
    } else if (command === 'SKIP') {
      await sendTextMessage(from, '⏭️ Current alert skipped.');
    }
  }

  res.sendStatus(200);
});

export default router;
