import { fetchLatestEmails, FetchedEmail } from './gmailService.js';
import { fetchOutlookEmails, FetchedOutlookEmail } from './outlookService.js';
import db from '../config/db.js';
import { emailQueue } from './queueService.js';
import logger from '../utils/logger.js';

export interface EmailJobData {
  userId: number;
  accountId: number;
  email: FetchedEmail | FetchedOutlookEmail;
  whatsapp: string | null;
}

export const processEmails = async (): Promise<void> => {
  logger.info('Starting multi-user email processing (Producer)...');
  
  const users = await db.user.findMany({
    include: { accounts: { where: { isActive: true } } }
  });

  for (const user of users) {
    for (const account of user.accounts) {
      let emails: (FetchedEmail | FetchedOutlookEmail)[] = [];
      try {
        if (account.provider === 'gmail') {
          emails = await fetchLatestEmails(user.id);
        } else if (account.provider === 'outlook') {
          emails = await fetchOutlookEmails(user.id);
        }
      } catch (err) {
        logger.error(`Failed to fetch emails for user ${user.id}, account ${account.id}:`, err);
        continue;
      }

      for (const email of emails) {
        // Check if already processed
        const existing = await db.processedEmail.findUnique({ 
          where: { userId_messageId: { userId: user.id, messageId: email.id } } 
        });
        if (existing) continue;

        // Push to Redis Queue for async processing
        const jobData: EmailJobData = {
          userId: user.id,
          accountId: account.id,
          email,
          whatsapp: user.whatsapp,
        };

        await emailQueue.add(`email-${email.id}`, jobData);
        
        logger.info(`Email queued for processing: ${email.id}`);
      }
    }
  }
  
  logger.info('Multi-user email discovery complete. All jobs queued.');
};
