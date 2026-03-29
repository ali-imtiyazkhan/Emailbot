import { Worker, Job } from 'bullmq';
import { handleEmailJob } from './emailWorkerHandler.js';
import logger from '@repo/shared/logger';

export interface EmailJobData {
  userId: number;
  accountId: number;
  email: any;
  whatsapp: string | null;
}

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';
const QUEUE_NAME = 'email-processing';

export const initWorker = () => {
  const worker = new Worker<EmailJobData>(
    QUEUE_NAME,
    async (job: Job<EmailJobData>) => {
      logger.info(`Processing job ${job.id} for email ${job.data.email?.id}`);
      await handleEmailJob(job.data);
    },
    {
      connection: { url: REDIS_URL },
      concurrency: 5,
    }
  );

  worker.on('completed', (job) => {
    logger.info(`Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    logger.error(`Job ${job?.id} failed: ${err.message}`);
  });

  logger.info('Email processing worker initialized.');
  return worker;
};
