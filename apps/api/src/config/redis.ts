import { Redis } from 'ioredis';
import dotenv from 'dotenv';
import path from 'path';
import logger from '../utils/logger.js';

dotenv.config({ path: path.join(process.cwd(), '../../.env') });

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
