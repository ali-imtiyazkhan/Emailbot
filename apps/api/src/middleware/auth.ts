import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import logger from '../utils/logger.js';

const JWT_SECRET = process.env.JWT_SECRET;
if (!JWT_SECRET) {
  logger.error('CRITICAL: JWT_SECRET environment variable is not set. Authentication will not work.');
  logger.error('Add JWT_SECRET to your Render environment variables or .env file.');
}

export interface AuthPayload {
  userId: number;
  email: string;
}

// Extend Express Request to carry the authenticated user
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

/**
 * Generate a JWT token for a given user.
 */
export const generateToken = (payload: AuthPayload): string => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Set JWT_SECRET environment variable.');
  }
  return jwt.sign(payload, JWT_SECRET, { expiresIn: '7d' });
};


export const verifyToken = (token: string): AuthPayload => {
  if (!JWT_SECRET) {
    throw new Error('JWT_SECRET is not configured. Set JWT_SECRET environment variable.');
  }
  return jwt.verify(token, JWT_SECRET) as AuthPayload;
};

export const requireAuth = (req: Request, res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ error: 'Authentication required. Provide a Bearer token.' });
    return;
  }

  const token = header.split(' ')[1];

  try {

    if (!token) {
      res.status(401).json({ error: 'Authentication required. Provide a Bearer token.' });
      return;
    }
    const decoded = verifyToken(token);
    req.user = decoded;
    next();
  } catch (err) {
    logger.warn('Invalid JWT token presented');
    res.status(401).json({ error: 'Invalid or expired token.' });
  }
};
