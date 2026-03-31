import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testExactModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  const genAI = new GoogleGenerativeAI(apiKey);
  
  const exactNames = ["models/gemini-2.0-flash", "models/gemini-flash-latest"];

  for (const name of exactNames) {
    console.log(`Testing with exact name: ${name}...`);
    try {
      const model = genAI.getGenerativeModel({ model: name });
      const result = await model.generateContent("Hello.");
      console.log(`✅ Success with ${name}`);
      break;
    } catch (err) {
      console.error(`❌ Failed with ${name}:`, err.message);
    }
  }
}

testExactModels();
