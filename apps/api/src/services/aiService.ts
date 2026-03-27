import Anthropic from '@anthropic-ai/sdk';
import dotenv from 'dotenv';

dotenv.config();

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
});

export interface EmailSummary {
  summary: string;
  priority: number;
  category: string;
}

export const summarizeEmail = async (subject: string, body: string): Promise<EmailSummary> => {
  if (!process.env.ANTHROPIC_API_KEY) {
    console.warn('ANTHROPIC_API_KEY not set, skipping AI summarization');
    return { summary: body.substring(0, 100) + '...', priority: 5, category: 'unknown' };
  }

  const prompt = `
    Analyze the following email and provide:
    1. A concise summary (max 2 sentences).
    2. A priority score from 1 to 10 (10 being most urgent).
    3. A brief category (e.g., Work, Personal, Newsletter, Security).

    Subject: ${subject}
    Body: ${body}

    Respond ONLY in JSON format like this:
    { "summary": "...", "priority": 5, "category": "..." }
  `;

  try {
    const response = await anthropic.messages.create({
      model: 'claude-3-sonnet-20240229',
      max_tokens: 300,
      messages: [{ role: 'user', content: prompt }],
    });

    const content = response.content?.[0];
    if (content && content.type === 'text' && content.text) {
      return JSON.parse(content.text);
    }
    throw new Error('Unexpected response format from Claude');
  } catch (error) {
    console.error('Error calling AI service:', error);
    return { summary: 'Error summarizing email', priority: 5, category: 'error' };
  }
};
