import { Queue, Worker, Job } from 'bullmq';
import { redisConnection } from '../config/redis.js';
import { handleEmailJob } from './emailProcessor.js';

const QUEUE_NAME = 'email-processing';

export const emailQueue = new Queue(QUEUE_NAME, {
  connection: redisConnection,
});

export const initWorker = () => {
  const worker = new Worker(
    QUEUE_NAME,
    async (job: Job) => {
      console.log(`Processing job ${job.id} for email ${job.data.messageId}`);
      await handleEmailJob(job.data);
    },
    {
      connection: redisConnection,
      concurrency: 5, // Process 5 emails at a time
    }
  );

  worker.on('completed', (job) => {
    console.log(`Job ${job.id} completed successfully`);
  });

  worker.on('failed', (job, err) => {
    console.error(`Job ${job?.id} failed: ${err.message}`);
  });

  console.log('Email processing worker initialized.');
  return worker;
};
