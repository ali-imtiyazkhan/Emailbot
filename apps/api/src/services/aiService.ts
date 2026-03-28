import { GoogleGenerativeAI } from "@google/generative-ai";
import dotenv from 'dotenv';
import logger from '../utils/logger.js';

dotenv.config();

const configuration = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = configuration.getGenerativeModel({ model: "gemini-1.5-flash" });

export interface EmailSummary {
  summary: string;
  priority: number;
  category: string;
}

export const summarizeEmail = async (subject: string, body: string): Promise<EmailSummary> => {
  if (!process.env.GOOGLE_API_KEY) {
    logger.warn('GOOGLE_API_KEY not set, skipping AI summarization');
    return { summary: body.substring(0, 100) + '...', priority: 5, category: 'unknown' };
  }

  const prompt = `
    Analyze the following email and provide:
    1. A concise summary (max 2 sentences).
    2. A priority score from 1 to 10 (10 being most urgent).
    3. A brief category (e.g., Work, Personal, Newsletter, Security).

    Subject: ${subject}
    Body: ${body}

    Respond ONLY in valid JSON format like this:
    { "summary": "...", "priority": 5, "category": "..." }
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting if Gemini wraps in ```json
    text = text.replace(/```json\n?|```/g, '').trim();

    try {
      return JSON.parse(text);
    } catch (parseError) {
      logger.error('Failed to parse Gemini JSON response:', text);
      throw new Error('Invalid JSON from AI');
    }
  } catch (error: any) {
    logger.error('Error calling Google Gemini service:', error.message);
    return { summary: 'Error summarizing email', priority: 5, category: 'error' };
  }
};
