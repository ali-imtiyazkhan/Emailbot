import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from './logger.js';

// getAIModel is a function that returns the AI model
const getAIModel = (() => {
  let model: any;
  return () => {
    if (!model) {
      const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
      model = genAI.getGenerativeModel({ model: "gemini-1.5-flash-8b" });
    }
    return model;
  };
})();


export interface EmailSummary {
  summary: string;
  priority: number;
  category: string;
}

// summarizeEmail is a function that summarizes the email
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
    const model = getAIModel();
    const result = await model.generateContent(prompt);
    const response = await result.response;
    let text = response.text();
    
    // Clean up potential markdown formatting if Gemini wraps in ```json
    text = text.replace(/```json\n?|```/g, '').trim();

    try {
      const parsed = JSON.parse(text) as EmailSummary;
      parsed.priority = Math.max(1, Math.min(10, Math.round(parsed.priority)));
      return parsed;
    } catch (parseError) {
      logger.error('Failed to parse Gemini JSON response:', { text, error: parseError });
      return { 
        summary: body.substring(0, 150) + (body.length > 150 ? '...' : ''), 
        priority: 7, 
        category: 'unanalyzed' 
      };
    }
  } catch (err: any) {
    logger.error('Error calling Google Gemini service:', { error: err.message || err });
    // Default to priority 10 to ensure the user gets a notification if AI is down (fail-open)
    return { 
      summary: `[AI Error] ${body.substring(0, 150)}...`, 
      priority: 10, 
      category: 'error' 
    };
  }
};
