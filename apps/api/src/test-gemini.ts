import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import path from 'path';

dotenv.config({ path: path.resolve(process.cwd(), '../../.env') });

const configuration = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = configuration.getGenerativeModel({ model: "gemini-1.5-flash" });

async function testGemini() {
    console.log("Using API Key:", process.env.GOOGLE_API_KEY ? "EXISTS" : "MISSING");
    try {
        const result = await model.generateContent("Hello, are you working?");
        const response = await result.response;
        console.log("Gemini Response:", response.text());
    } catch (error) {
        console.error("Gemini Test Failed:", JSON.stringify(error, null, 2) || error);
    }
}

testGemini();
