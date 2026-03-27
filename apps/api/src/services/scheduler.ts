import cron from 'node-cron';
import { processEmails } from './emailProcessor.js';
import logger from '../utils/logger.js';

export const initScheduler = () => {
  // Check emails every 15 minutes
  cron.schedule('*/15 * * * *', async () => {
    logger.info('Running scheduled email check...');
    await processEmails();
  });

  // Daily digest at 8:00 PM
  cron.schedule('0 20 * * *', async () => {
    logger.info('Running scheduled daily digest...');
    // Logic for daily digest would go here
  });

  logger.info('Scheduler initialized.');
};
