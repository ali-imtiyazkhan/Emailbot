import { validateEnv } from '@repo/shared/env'
import logger from '@repo/shared/logger'
import { initScheduler } from './services/scheduler.js'

// Validate required environment variables
validateEnv(['DATABASE_URL', 'REDIS_URL']);

logger.info('🚀 Email Receiver service starting...');

try {
  initScheduler();
  logger.info('✅ Email Receiver scheduler initialized.');
} catch (error) {
  logger.error('❌ Failed to start Email Receiver:', error);
  process.exit(1);
}
