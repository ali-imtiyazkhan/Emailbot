import { summarizeEmail } from './aiService.js';
import { sendNotification } from './whatsappService.js';
import db from '../config/db.js';
import logger from '../utils/logger.js';

export const handleEmailJob = async (jobData: any) => {
  const { userId, accountId, email, whatsapp } = jobData;

  logger.info(`Processing email ${email.id} with AI summary...`);

  // AI Analysis
  const analysis = await summarizeEmail(email.subject, email.body);

  // Check filter rules
  const rules = await db.filterRule.findMany({ where: { userId, isActive: true } });
  const priorityRule = rules.find(r => r.ruleType === 'priority_min');
  const minPriority = priorityRule ? parseInt(priorityRule.value) : 5;

  const shouldNotify = analysis.priority >= minPriority;

  if (shouldNotify && whatsapp) {
    await sendNotification(whatsapp, email.subject, analysis.summary, analysis.priority);
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
