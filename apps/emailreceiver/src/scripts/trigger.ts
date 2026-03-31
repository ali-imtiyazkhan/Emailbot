import { processEmails } from '../services/emailProcessor.js';
import logger from '@repo/shared/logger';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root
dotenv.config({ path: path.join(__dirname, '../../../../.env') });

async function manualTrigger() {
  logger.info('🚀 Manually triggering email check...');
  try {
    await processEmails();
    logger.info('✅ Manual check complete.');
  } catch (error) {
    logger.error('❌ Manual check failed:', error);
  } finally {
    process.exit(0);
  }
}

manualTrigger();
