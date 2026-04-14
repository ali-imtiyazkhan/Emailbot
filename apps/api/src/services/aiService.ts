import { GoogleGenerativeAI } from "@google/generative-ai";
import logger from '../utils/logger.js';

// Env is loaded centrally via config/env.ts (first import in index.ts)

const configuration = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY || "");
const model = configuration.getGenerativeModel({ model: "gemini-1.5-flash" });

// NOTE: summarizeEmail has been removed from here to avoid duplication.
// The canonical version lives in packages/shared/src/ai.ts and is used by the worker.

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

