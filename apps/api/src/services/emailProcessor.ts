import { fetchLatestEmails } from './gmailService.js';
import { fetchOutlookEmails } from './outlookService.js';
import { summarizeEmail } from './aiService.js';
import { sendNotification } from './whatsappService.js';
import db from '../config/db.js';
import { emailQueue } from './queueService.js';

export const processEmails = async () => {
  console.log('Starting multi-user email processing (Producer)...');
  
  const users = await db.user.findMany({
    include: { accounts: { where: { isActive: true } } }
  });

  for (const user of users) {
    for (const account of user.accounts) {
      let emails: any[] = [];
      if (account.provider === 'gmail') {
        emails = await fetchLatestEmails(user.id);
      } else if (account.provider === 'outlook') {
        emails = await fetchOutlookEmails(user.id);
      }

      for (const email of emails) {
        // Check if already processed
        const existing = await db.processedEmail.findUnique({ 
          where: { userId_messageId: { userId: user.id, messageId: email.id } } 
        });
        if (existing) continue;

        // Push to Redis Queue for async processing
        await emailQueue.add(`email-${email.id}`, {
          userId: user.id,
          accountId: account.id,
          email,
          whatsapp: user.whatsapp
        });
        
        console.log(`Email listed for processing: ${email.id}`);
      }
    }
  }
  
  console.log('Multi-user email discovery complete. All jobs queued.');
};

export const handleEmailJob = async (jobData: any) => {
  const { userId, accountId, email, whatsapp } = jobData;

  console.log(`Processing email ${email.id} with AI summary...`);
  
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

  console.log(`Successfully processed email ${email.id}.`);
};
