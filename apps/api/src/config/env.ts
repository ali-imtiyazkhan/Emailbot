import dotenv from 'dotenv';
import path from 'path';

// Single centralized env load — relative to monorepo root
dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

// Validate critical environment variables at startup
const required = ['DATABASE_URL'] as const;
const missing = required.filter((key) => !process.env[key]);

if (missing.length > 0) {
  console.error(`❌ Missing required environment variables: ${missing.join(', ')}`);
  console.error('   Make sure your root .env file exists and is configured.');
  process.exit(1);
}
