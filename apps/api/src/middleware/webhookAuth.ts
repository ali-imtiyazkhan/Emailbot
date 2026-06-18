import { Request, Response, NextFunction } from 'express';
import crypto from 'crypto';
import logger from '../utils/logger.js';

/**
 * Middleware to verify Meta's WhatsApp webhook signature.
 * Compares X-Hub-Signature-256 header against HMAC-SHA256 of the raw body.
 * 
 * Requires `req.rawBody` to be populated (see index.ts express.json verify option).
 */
export const verifyWebhookSignature = (req: Request, res: Response, next: NextFunction): void => {
  const appSecret = process.env.WHATSAPP_APP_SECRET;

  // Skip verification if app secret is not configured (with warning)
  if (!appSecret) {
    logger.warn('WHATSAPP_APP_SECRET not set — skipping webhook signature verification. Set it in production!');
    next();
    return;
  }

  const signature = req.headers['x-hub-signature-256'] as string | undefined;

  if (!signature) {
    logger.warn('Webhook request missing X-Hub-Signature-256 header');
    res.sendStatus(401);
    return;
  }

  const rawBody = (req as any).rawBody;
  if (!rawBody) {
    logger.error('Raw body not available for signature verification');
    res.sendStatus(500);
    return;
  }

  const expectedSignature = 'sha256=' + crypto
    .createHmac('sha256', appSecret)
    .update(rawBody)
    .digest('hex');

  const isValid = crypto.timingSafeEqual(
    Buffer.from(signature),
    Buffer.from(expectedSignature),
  );

  if (!isValid) {
    logger.warn('Invalid webhook signature — rejecting request');
    res.sendStatus(403);
    return;
  }

  next();
};
