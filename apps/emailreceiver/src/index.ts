import { validateEnv } from '@repo/shared/env'
import logger from '@repo/shared/logger'
import { initScheduler } from './services/scheduler.js'

// Validate required environment variables
validateEnv(['DATABASE_URL', 'REDIS_URL', 'GMAIL_CLIENT_ID', 'GMAIL_CLIENT_SECRET', 'OUTLOOK_CLIENT_ID', 'OUTLOOK_CLIENT_SECRET', 'OUTLOOK_TENANT_ID']);

logger.info('🚀 Email Receiver service starting...');

try {
  initScheduler();
  logger.info('✅ Email Receiver scheduler initialized.');
} catch (error) {
  logger.error('❌ Failed to start Email Receiver:', error);
  process.exit(1);
}
