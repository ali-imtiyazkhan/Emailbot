import { summarizeEmail } from '../packages/shared/src/ai.js';
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root
dotenv.config({ path: path.join(__dirname, '../.env') });

async function testAI() {
  console.log('🧪 Testing Gemini AI Model...');
  console.log('Using API KEY starting with:', process.env.GOOGLE_API_KEY?.substring(0, 5));
  
  const subject = "Test Email Subject";
  const body = "This is a test email body that we want to summarize using the Gemini API. Please provide a JSON response with summary, priority, and category.";
  
  try {
    const result = await summarizeEmail(subject, body);
    console.log('✅ Success! Result:', JSON.stringify(result, null, 2));
  } catch (error: any) {
    console.error('❌ AI Test Failed:', error.message || error);
    if (error.stack) console.error(error.stack);
  }
}

testAI();
