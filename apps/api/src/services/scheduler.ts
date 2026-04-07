import cron from 'node-cron';
import { processEmails } from './emailProcessor.js';
import { sendTextMessage } from './whatsappService.js';
import db from '../config/db.js';
import logger from '../utils/logger.js';

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
      // Fetch all enabled digest settings and check against each user's timezone
      const digestSettings = await db.digestSetting.findMany({
        where: { enabled: true },
        include: { user: true },
      });

      const matchedSettings = digestSettings.filter(setting => {
        try {
          const userTime = new Date().toLocaleTimeString('en-GB', {
            hour: '2-digit', minute: '2-digit', hour12: false,
            timeZone: setting.timezone,
          });
          return userTime === setting.sendTime;
        } catch {
          const now = new Date();
          const utcTime = `${String(now.getUTCHours()).padStart(2, '0')}:${String(now.getUTCMinutes()).padStart(2, '0')}`;
          return utcTime === setting.sendTime;
        }
      });

      for (const setting of matchedSettings) {
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
        const lines = undigestedEmails.slice(0, 10).map((e, i) => {
          const priority = e.priorityScore ? `⚡${e.priorityScore}` : '';
          return `${i + 1}. ${priority} *${e.subject || 'No Subject'}*\n   ${e.summary || 'No summary'}`;
        });

        const message = `📋 *Daily Email Digest*\n\n${lines.join('\n\n')}\n\n📊 Total unread: ${undigestedEmails.length}${undigestedEmails.length > 10 ? ` (showing top 10)` : ''}`;

        await sendTextMessage(setting.user.whatsapp, message);

        // Mark as included in digest
        await db.processedEmail.updateMany({
          where: {
            id: { in: undigestedEmails.map(e => e.id) },
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
