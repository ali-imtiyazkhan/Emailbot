import { summarizeEmail } from '@repo/shared/ai';
import { sendNotification } from './whatsappService.js';
import db from '../config/db.js';
import logger from '../utils/logger.js';
import { EmailJobData } from './emailProcessor.js';

export const handleEmailJob = async (jobData: EmailJobData): Promise<void> => {
  const { userId, accountId, email, whatsapp } = jobData;

  logger.info(`Processing email ${email.id} with AI summary...`);

  const analysis = await summarizeEmail(email.subject, email.body);

  const rules = await db.filterRule.findMany({ where: { userId, isActive: true } });
  const priorityRule = rules.find(r => r.ruleType === 'priority_min');
  const minPriority = priorityRule ? parseInt(priorityRule.value) : 5;

  const senderRules = rules.filter(r => r.ruleType === 'sender');
  const senderMatch = senderRules.some(r => 
    email.sender.toLowerCase().includes(r.value.toLowerCase())
  );
  const keywordRules = rules.filter(r => r.ruleType === 'keyword');
  const keywordMatch = keywordRules.some(r => 
    (email.subject || '').toLowerCase().includes(r.value.toLowerCase())
  );

  const aiFailed = analysis.category === 'error';
  const shouldNotify = aiFailed || senderMatch || keywordMatch || analysis.priority >= minPriority;

  let whatsappMessageId: string | undefined = undefined;
  if (shouldNotify && whatsapp) {
    whatsappMessageId = await sendNotification(whatsapp, email.subject, analysis.summary, analysis.priority);
  }
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
};
