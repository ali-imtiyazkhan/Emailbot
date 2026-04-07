import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Load .env from workspace root
dotenv.config({ path: path.join(__dirname, '../.env') });

async function listModels() {
  console.log('🔍 Fetching available models for Gemini API...');
  console.log('Using API KEY starting with:', process.env.GOOGLE_API_KEY?.substring(0, 5));
  
  try {
    const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
    // Google SDK doesn't have a simple listModels, so we'll use a fetch request
    const response = await fetch(`https://generativelanguage.googleapis.com/v1beta/models?key=${process.env.GOOGLE_API_KEY}`);
    const data = await response.json();
    
    if (data.models) {
      console.log('✅ Available Models:');
      data.models.forEach((m: any) => {
        if (m.supportedGenerationMethods.includes('generateContent')) {
          console.log(`- ${m.name} (${m.displayName})`);
        }
      });
    } else {
      console.log('❌ No models found or error response:', JSON.stringify(data, null, 2));
    }
  } catch (error: any) {
    console.error('❌ Failed to list models:', error.message || error);
  }
}

listModels();
