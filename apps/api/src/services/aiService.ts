import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from '../utils/logger.js';

// Env is loaded centrally via config/env.ts (first import in index.ts)

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
      const parsed = JSON.parse(text) as EmailSummary;
      // Validate the parsed response
      if (typeof parsed.summary !== 'string' || typeof parsed.priority !== 'number') {
        throw new Error('Invalid structure');
      }
      parsed.priority = Math.max(1, Math.min(10, Math.round(parsed.priority)));
      return parsed;
    } catch (parseError) {
      logger.error('Failed to parse Gemini JSON response:', text);
      // Return a safe fallback instead of silently defaulting to priority 5
      return { summary: 'AI could not analyze this email', priority: 3, category: 'unanalyzed' };
    }
  } catch (err: any) {
    logger.error('Error calling Google Gemini service:', { error: err.message || err, stack: err.stack });
    // Lower fallback priority to avoid false-positive notifications
    return { summary: 'Error summarizing email', priority: 3, category: 'error' };
  }
};

/**
 * Refines a raw user reply into a professional email body based on the context of the original email.
 */
export const refineEmailReply = async (originalSubject: string, originalBody: string, userReply: string): Promise<string> => {
  if (!process.env.GOOGLE_API_KEY) {
    logger.warn('GOOGLE_API_KEY not set, skipping AI reply refinement');
    return userReply;
  }

  const prompt = `
    You are an AI assistant helping a user write professional email replies.
    Based on the following original email and the user's short response, generate a professional, polite, and well-structured email body.
    
    ORIGINAL EMAIL SUBJECT: ${originalSubject}
    ORIGINAL EMAIL BODY: ${originalBody}
    
    USER'S SHORT RESPONSE: "${userReply}"
    
    INSTRUCTIONS:
    - If the user's response is very short (e.g., "ok", "yes", "thanks"), expand it into a full, polite professional sentence.
    - If the user's response is already detailed, just polish the grammar and professional tone.
    - Keep the reply concise and to the point.
    - DO NOT include placeholders like [Your Name]. Just provide the body text.
    - DO NOT include "Subject:" or "To:" headers.
    - The output should ONLY be the body of the reply email.
  `;

  try {
    const result = await model.generateContent(prompt);
    const response = await result.response;
    return response.text().trim();
  } catch (err: any) {
    logger.error('Error refining email reply with Gemini:', err.message);
    return userReply; // Fallback to original text if AI fails
  }
};

