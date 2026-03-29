import { summarizeEmail } from '@repo/shared/ai'
import { sendNotification } from '@repo/shared/whatsapp'
import { prisma as db } from '@repo/db'
import logger from '@repo/shared/logger'

export const handleEmailJob = async (jobData: any): Promise<void> => {
  const { userId, accountId, email, whatsapp } = jobData;

  logger.info(`Processing email ${email.id} with AI summary...`);

  // AI Analysis (Gemini)
  const analysis = await summarizeEmail(email.subject, email.body);

  // Check filter rules
  const rules = await db.filterRule.findMany({ where: { userId, isActive: true } });
  const priorityRule = rules.find((r: any) => r.ruleType === 'priority_min');
  const minPriority = priorityRule ? parseInt(priorityRule.value) : 5;

  const shouldNotify = analysis.priority >= minPriority;

  if (shouldNotify && whatsapp) {
    await sendNotification(whatsapp, email.subject, analysis.summary, analysis.priority);
    logger.info(`Notification sent to ${whatsapp} for email ${email.id}`);
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
      priorityScore: analysis.priority,
      notified: shouldNotify,
      processedAt: new Date()
    }
  });

  logger.info(`Successfully processed email ${email.id}.`);
};
