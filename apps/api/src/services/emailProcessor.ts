import { fetchLatestEmails as fetchGmail } from './gmailService.js';
import { fetchLatestEmails } from './gmailService.js';
import { fetchOutlookEmails } from './outlookService.js';
import { summarizeEmail } from './aiService.js';
import { sendNotification } from './whatsappService.js';
import db from '../config/db.js';

export const processEmails = async () => {
  console.log('Starting multi-user email processing...');
  
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
        // In Prisma, we use the userId_messageId unique index
        const existing = await db.processedEmail.findUnique({ 
          where: { userId_messageId: { userId: user.id, messageId: email.id } } 
        });
        if (existing) continue;

        // AI Analysis
        const analysis = await summarizeEmail(email.subject, email.body);
        
        // Check filter rules
        const rules = await db.filterRule.findMany({ where: { userId: user.id, isActive: true } });
        const priorityRule = rules.find(r => r.ruleType === 'priority_min');
        const minPriority = priorityRule ? parseInt(priorityRule.value) : 5;

        if (analysis.priority >= minPriority) {
          if (user.whatsapp) {
            await sendNotification(user.whatsapp, email.subject, analysis.summary, analysis.priority);
          }
        }

        // Mark as processed with full metadata
        await db.processedEmail.create({
          data: {
            userId: user.id,
            emailAccountId: account.id,
            messageId: email.id,
            subject: email.subject,
            sender: email.sender,
            summary: analysis.summary,
            priorityScore: analysis.priority,
            notified: analysis.priority >= minPriority,
            processedAt: new Date()
          }
        });
      }
    }
  }
  
  console.log('Multi-user email processing complete.');
};
