import cron from 'node-cron';
import { processEmails } from './emailProcessor.js';
import { sendTextMessage } from '@repo/shared/whatsapp';
import { prisma as db } from '@repo/db';
import logger from '@repo/shared/logger';

let isProcessing = false;

export const initScheduler = () => {
  // Check emails every 1 minute — with overlap protection
  cron.schedule('* * * * *', async () => {
    if (isProcessing) {
      logger.warn('Previous email processing still running — skipping this cycle.');
      return;
    }

    isProcessing = true;
    try {
      logger.info('Running scheduled email check...');
      await processEmails();
    } catch (error) {
      logger.error('Scheduled email check failed:', error);
    } finally {
      isProcessing = false;
    }
  });

  // Daily digest — runs every minute and checks each user's configured time
  cron.schedule('* * * * *', async () => {
    try {
      const now = new Date();
      const currentTime = `${String(now.getHours()).padStart(2, '0')}:${String(now.getMinutes()).padStart(2, '0')}`;

      const digestSettings = await db.digestSetting.findMany({
        where: { enabled: true, sendTime: currentTime },
        include: { user: true },
      });

      for (const setting of digestSettings) {
        if (!setting.user.whatsapp) continue;

        const undigestedEmails = await db.processedEmail.findMany({
          where: {
            userId: setting.userId,
            digestIncluded: false,
            notified: false,
          },
          orderBy: { processedAt: 'desc' },
        });

        if (undigestedEmails.length < setting.minEmails) continue;

        // Build digest message
        const lines = undigestedEmails.slice(0, 10).map((e: any, i: number) => {
          const priority = e.priorityScore ? `⚡${e.priorityScore}` : '';
          return `${i + 1}. ${priority} *${e.subject || 'No Subject'}*\n   ${e.summary || 'No summary'}`;
        });

        const message = `📋 *Daily Email Digest*\n\n${lines.join('\n\n')}\n\n📊 Total unread: ${undigestedEmails.length}${undigestedEmails.length > 10 ? ` (showing top 10)` : ''}`;

        await sendTextMessage(setting.user.whatsapp, message);

        // Mark as included in digest
        await db.processedEmail.updateMany({
          where: {
            id: { in: undigestedEmails.map((e: any) => e.id) },
          },
          data: { digestIncluded: true },
        });

        logger.info(`Sent daily digest to user ${setting.userId} (${undigestedEmails.length} emails)`);
      }
    } catch (error) {
      logger.error('Daily digest failed:', error);
    }
  });

  logger.info('Scheduler initialized (email check + daily digest).');
};
