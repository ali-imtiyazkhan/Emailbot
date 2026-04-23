import { summarizeEmail } from '@repo/shared/ai'
import { sendNotification } from '@repo/shared/whatsapp'
import { prisma as db } from '@repo/db'
import logger from '@repo/shared/logger'

export const handleEmailJob = async (jobData: any): Promise<void> => {
  const { userId, accountId, email, whatsapp } = jobData;

  logger.info(`Processing email ${email.id} for user ${userId}...`);

  try {
    // AI Analysis
    const analysis = await summarizeEmail(email.subject, email.body);

    // Check filter rules
    const rules = await db.filterRule.findMany({ where: { userId, isActive: true } });
    const priorityRule = rules.find((r: any) => r.ruleType === 'priority_min');
    const minPriority = priorityRule ? parseInt(priorityRule.value) : 5;

    // Check sender rules — always notify if sender matches
    const senderRules = rules.filter((r: any) => r.ruleType === 'sender');
    const senderMatch = senderRules.some((r: any) => 
      email.sender.toLowerCase().includes(r.value.toLowerCase())
    );

    // Check keyword rules — always notify if keyword found in subject
    const keywordRules = rules.filter((r: any) => r.ruleType === 'keyword');
    const keywordMatch = keywordRules.some((r: any) => 
      (email.subject || '').toLowerCase().includes(r.value.toLowerCase())
    );

    // Fail-open: If AI failed (category 'error'), we force notification
    const aiFailed = analysis.category === 'error';
    const shouldNotify = aiFailed || senderMatch || keywordMatch || analysis.priority >= minPriority;

    if (aiFailed) {
      logger.warn(`AI Analysis failed for email ${email.id}. Falling back to default notification.`);
    }
    if (senderMatch) {
      logger.info(`Sender rule matched for email ${email.id}`);
    }
    if (keywordMatch) {
      logger.info(`Keyword rule matched for email ${email.id}`);
    }

    let whatsappMessageId: string | undefined;
    if (shouldNotify && whatsapp) {
      whatsappMessageId = await sendNotification(whatsapp, email.subject, analysis.summary, analysis.priority);
      logger.info(`Notification sent to ${whatsapp} for email ${email.id} (WA CID: ${whatsappMessageId})`);
    } else {
      logger.info(`Notification skipped for email ${email.id} (Priority: ${analysis.priority}, Threshold: ${minPriority}, WhatsApp: ${!!whatsapp})`);
    }

    // Mark as processed with full metadata
    await db.processedEmail.create({
      data: {
        userId,
        emailAccountId: accountId,
        messageId: email.id,
        subject: email.subject,
        sender: email.sender,
        summary: analysis.summary,
        category: analysis.category,
        priorityScore: analysis.priority,
        notified: shouldNotify,
        whatsappMessageId,
        processedAt: new Date()
      }
    });

    logger.info(`Successfully processed email ${email.id}.`);
  } catch (error: any) {
    logger.error(`Critical error in handleEmailJob for email ${email.id}:`, error);
    
    // Last resort fallback: try to send a basic notification if everything else failed
    if (whatsapp) {
      try {
        await sendNotification(whatsapp, email.subject, "Error processing full summary. Please check your email dashboard.", 10);
      } catch (waError) {
        logger.error("Failed to send even the error notification to WhatsApp:", waError);
      }
    }
  }
};
