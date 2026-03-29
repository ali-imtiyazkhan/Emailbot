import { validateEnv } from '@repo/shared/env'
import logger from '@repo/shared/logger'
import { initWorker } from './services/queueService.js'

// Validate required environment variables
validateEnv(['REDIS_URL', 'GOOGLE_API_KEY', 'WHATSAPP_ACCESS_TOKEN', 'WHATSAPP_PHONE_NUMBER_ID']);

logger.info('🚀 WhatsApp Sender worker starting...');

try {
  initWorker();
  logger.info('✅ WhatsApp Sender worker initialized.');
} catch (error) {
  logger.error('❌ Failed to start WhatsApp Sender:', error);
  process.exit(1);
}
