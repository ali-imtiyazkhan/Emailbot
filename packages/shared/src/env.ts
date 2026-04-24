import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const potentialPaths = [
  path.resolve(process.cwd(), '.env'),
  path.resolve(__dirname, '../../../.env'),
];

for (const p of potentialPaths) {
  if (fs.existsSync(p)) {
    dotenv.config({ path: p });
    break;
  }
}

export const env = process.env;

export const validateEnv = (required: string[]) => {
  const missing = required.filter((key) => !process.env[key]);

  if (missing.length > 0) {
    console.error(`Missing required environment variables: ${missing.join(', ')}`);
    console.error('Make sure your root .env file exists and is configured.');
    process.exit(1);
  }
};
