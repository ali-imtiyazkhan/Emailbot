import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '.env') });

async function listModels() {
  const apiKey = process.env.GOOGLE_API_KEY;
  if (!apiKey) {
    console.error("GOOGLE_API_KEY is not set");
    return;
  }

  const genAI = new GoogleGenerativeAI(apiKey);
  
  try {
    console.log("Listing models...");
    // The library doesn't have a direct listModels on genAI, usually it's a separate call if using the REST API
    // But we can try to guess or use a known one.
    // Let's try gemini-2.0-flash which is the newest.
    const model = genAI.getGenerativeModel({ model: "gemini-2.0-flash" });
    const result = await model.generateContent("Hello.");
    console.log("✅ Success with gemini-2.0-flash:", (await result.response).text());
  } catch (err) {
    console.error("❌ Failed with gemini-2.0-flash:", err.message);
  }

  try {
    const model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
    const result = await model.generateContent("Hello.");
    console.log("✅ Success with gemini-1.5-flash-8b:", (await result.response).text());
  } catch (err) {
    console.error("❌ Failed with gemini-1.5-flash-8b:", err.message);
  }
}

listModels();
