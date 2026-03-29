import { Redis } from 'ioredis';
import logger from '@repo/shared/logger';

// Env is loaded centrally via config/env.ts (first import in index.ts)

const REDIS_URL = process.env.REDIS_URL || 'redis://localhost:6379';

export const redisConnection = new Redis(REDIS_URL, {
  maxRetriesPerRequest: null,
});

redisConnection.on('error', (err) => {
  logger.error('Redis connection error:', err);
});

redisConnection.on('connect', () => {
  logger.info('Connected to Redis');
});
