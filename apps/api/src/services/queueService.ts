import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { handleEmailJob } from './emailWorkerHandler.js';
import logger from '../utils/logger.js';

const QUEUE_NAME = 'email-processing';

export const emailQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
});

export const initWorker = () => {
  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      logger.info(`Processing job ${job.id} for email ${job.data.email?.id}`);
      await handleEmailJob(job.data);
    },
    {
      connection: redisConnection,
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
