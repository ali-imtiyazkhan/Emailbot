import { Queue } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { EmailJobData } from './emailProcessor.js';
import logger from '../utils/logger.js';

const QUEUE_NAME = 'email-processing';

export const emailQueue = new Queue<EmailJobData>(QUEUE_NAME, {
  connection: redisConnection,
  defaultJobOptions: {
    attempts: 3,
    backoff: { type: 'exponential', delay: 5000 },
  },
});

logger.info('Email processing queue initialized.');
