import { Router } from 'express';
import { prisma as db } from '@repo/db';
import { sendTextMessage } from '@repo/shared/whatsapp';
import logger from '@repo/shared/logger';
import { sendEmailReply as sendGmailReply } from '../services/gmailService.js';
import { sendEmailReply as sendOutlookReply } from '../services/outlookService.js';
import { refineEmailReply } from '../services/aiService.js';
import { emailQueue } from '../services/queueService.js';


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
  // Respond 200 immediately to prevent Meta timeout/retry
  res.sendStatus(200);

  try {
    const entry = req.body.entry?.[0];
    const changes = entry?.changes?.[0];
    const value = changes?.value;
    const message = value?.messages?.[0];

    // if message present
    if (message) {
      const text = message.text?.body;
      const from = message.from;
      const context = message.context;
      logger.info('Received WhatsApp message:', { text, from, replyContext: context?.id, msgId: message.id, type: message.type });

      // Find the user by WhatsApp number (try with and without + prefix)
      let user = await db.user.findFirst({ where: { whatsapp: from } });
      if (!user && from) {
        const withPlus = from.startsWith('+') ? from : `+${from}`;
        const withoutPlus = from.startsWith('+') ? from.slice(1) : from;
        user = await db.user.findFirst({
          where: { OR: [{ whatsapp: withPlus }, { whatsapp: withoutPlus }] }
        });
      }
      if (!user) {
        logger.warn(`No user found with WhatsApp number: ${from}`);
        return;
      }
      logger.info(`Found user ${user.id} (${user.email}) for WhatsApp reply`);

      // Handle REPLIES to email notifications
      if (context?.id && text) {
        logger.info(`Looking up ProcessedEmail for user ${user.id} with whatsappMessageId: "${context.id}"`);
        const originalEmail = await db.processedEmail.findFirst({
          where: { userId: user.id, whatsappMessageId: context.id },
          include: { emailAccount: true }
        });

        if (originalEmail) {
          logger.info(`Found matching email: "${originalEmail.subject}" (ID: ${originalEmail.messageId}, provider: ${originalEmail.emailAccount.provider})`);

          let finalReplyText = text;
          let wasImproved = false;

          if (user.aiReplyImprovement) {
            try {
              const improved = await refineEmailReply(
                originalEmail.subject || 'No Subject',
                originalEmail.summary || '',
                text
              );
              if (improved && improved !== text) {
                finalReplyText = improved;
                wasImproved = true;
                logger.info(`AI improved reply for user ${user.id}: "${text.substring(0, 30)}..." -> "${improved.substring(0, 30)}..."`);
              }
            } catch (aiErr) {
              logger.error('AI refinement failed, using original text:', aiErr);
            }
          }

          let success = false;
          try {
            if (originalEmail.emailAccount.provider === 'gmail') {
              logger.info(`Sending Gmail reply for user ${user.id} to message ${originalEmail.messageId}`);
              success = await sendGmailReply(user.id, originalEmail.messageId, finalReplyText);
            } else if (originalEmail.emailAccount.provider === 'outlook') {
              logger.info(`Sending Outlook reply for user ${user.id} to message ${originalEmail.messageId}`);
              success = await sendOutlookReply(user.id, originalEmail.messageId, finalReplyText);
            } else {
              logger.error(`Unknown email provider: ${originalEmail.emailAccount.provider}`);
            }
          } catch (replyErr) {
            logger.error(`Error sending email reply for user ${user.id}:`, replyErr);
          }

          if (success) {
            logger.info(`Email reply sent successfully for user ${user.id} to ${originalEmail.sender}`);
            const improvedNotice = wasImproved ? '\n\n_✨ Polished by AI for a professional tone._' : '';
            await sendTextMessage(from, `✅ Your reply has been sent to *${originalEmail.sender}*${improvedNotice}`);
          } else {
            logger.error(`Failed to send email reply for user ${user.id}`);
            await sendTextMessage(from, `❌ Failed to send your email reply. The email account may need to be reconnected. Please check your dashboard.`);
          }
          return;
        } else {
          logger.warn(`No ProcessedEmail found for user ${user.id} with whatsappMessageId: ${context.id}. The notification may be from an older session or different account.`);
          await sendTextMessage(from, `⚠️ Could not find the original email for this reply. It may have expired or been sent from a different account.`);
          return;
        }
      }

      // Handle COMMANDS
      const command = text?.toUpperCase().trim();
      logger.info(`Processing command: "${command}" for user ${user.id}`);

      if (command === 'FULL') {
        const lastEmail = await db.processedEmail.findFirst({
          where: { userId: user.id },
          orderBy: { processedAt: 'desc' }
        });
        if (lastEmail) {
          await sendTextMessage(from, `📄 *Full Email Subject*: ${lastEmail.subject}\n\n${lastEmail.summary}\n\n_Full content feature coming soon (requires fetching body by ID)_`);
        } else {
          await sendTextMessage(from, '📭 No emails found in your history.');
        }
      } else if (command === 'PAUSE') {
        await db.emailAccount.updateMany({
          where: { userId: user.id },
          data: { isActive: false }
        });
        await sendTextMessage(from, '⏸️ Notifications paused. Reply "RESUME" to start again.');
        logger.info(`User ${user.id} paused notifications`);
      } else if (command === 'RESUME') {
        await db.emailAccount.updateMany({
          where: { userId: user.id },
          data: { isActive: true }
        });
        await sendTextMessage(from, '▶️ Notifications resumed!');
        logger.info(`User ${user.id} resumed notifications`);
      } else if (command === 'SKIP') {
        await sendTextMessage(from, '⏭️ Current alert skipped.');
      } else if (command?.startsWith('SNOOZE')) {
        const match = text?.match(/snooze\s+(\d+)\s*(h|m|hr|min)/i);
        if (match) {
          const amount = parseInt(match[1]);
          const unit = match[2].toLowerCase();
          const delayMs = unit.startsWith('h') ? amount * 60 * 60 * 1000 : amount * 60 * 1000;
          const delayLabel = unit.startsWith('h') ? `${amount} hour(s)` : `${amount} minute(s)`;

          const lastEmail = await db.processedEmail.findFirst({
            where: { userId: user.id, notified: true },
            orderBy: { processedAt: 'desc' },
          });

          if (lastEmail) {
            await emailQueue.add(
              `snooze-${lastEmail.id}`,
              {
                userId: user.id,
                accountId: lastEmail.emailAccountId,
                whatsapp: from,
                email: { id: lastEmail.messageId, subject: lastEmail.subject || 'No Subject', sender: lastEmail.sender || 'Unknown', body: lastEmail.summary || '' },
              },
              { delay: delayMs }
            );
            await sendTextMessage(from, `⏰ Got it! I'll remind you about "*${lastEmail.subject}*" in ${delayLabel}.`);
            logger.info(`User ${user.id} snoozed "${lastEmail.subject}" for ${delayLabel}`);
          } else {
            await sendTextMessage(from, '❌ No recent email to snooze.');
          }
        } else {
          await sendTextMessage(from, '⚠️ Usage: SNOOZE 2h or SNOOZE 30m');
        }
      } else if (context?.id) {
        logger.info(`Reply with context.id=${context.id} had no matching email in DB — text was: "${text}"`);
      } else {
        logger.info(`Unrecognized message from ${from}: "${text}" — no reply context and not a known command`);
        await sendTextMessage(from, `👋 Hi! I'm your EmailBot. Reply to any email notification to send a reply, or use commands like PAUSE, RESUME, SKIP, SNOOZE.`);
      }
    }
  } catch (error) {
    logger.error('Unhandled error in webhook handler:', error);
  }
});

export default router;
