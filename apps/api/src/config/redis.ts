import { Redis } from 'ioredis';
import logger from '@repo/shared/logger';

if (!process.env.REDIS_URL) {
  logger.warn('REDIS_URL is not set. OAuth state management and queue will not work. Set REDIS_URL in your environment.');
}

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
  logger.error('Redis connection error:', err.message);
});

redisConnection.on('connect', () => {
  logger.info('Connected to Redis');
});
