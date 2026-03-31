import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function testGemini() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_API_KEY is not set");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  // Try different models if one fails
  const models = ["gemini-1.5-flash", "gemini-1.5-flash-latest", "gemini-1.5-pro"];

  for (const modelName of models) {
    console.log(`Testing model: ${modelName}...`);
    try {
      const model = genAI.getGenerativeModel({ model: modelName });
      const result = await model.generateContent("Hello, simple test.");
      const response = await result.response;
      console.log(`✅ Success with ${modelName}:`, response.text());
      break; 
    } catch (err) {
      console.error(`❌ Failed with ${modelName}:`, err.message);
    }
  }
}

testGemini();
