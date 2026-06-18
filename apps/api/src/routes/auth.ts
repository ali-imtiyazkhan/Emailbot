import { Router } from 'express';
import crypto from 'crypto';
import { google } from 'googleapis';
import axios from 'axios';
import { prisma as db } from '@repo/db';
import logger from '@repo/shared/logger';
import { createGoogleOAuth2Client, GMAIL_SCOPES } from '../config/google.js';
import { OUTLOOK_AUTH_URL, OUTLOOK_TOKEN_URL, OUTLOOK_SCOPES } from '../config/outlook.js';
import { verifyToken, generateToken } from '../middleware/auth.js';
import { redisConnection } from '../config/redis.js';

const router = Router();

// ── OAuth State helpers (CSRF protection) ──────────────────
const STATE_PREFIX = 'oauth_state:';
const STATE_TTL_SECONDS = 600; // 10 minutes

async function generateOAuthState(userId?: number): Promise<string> {
  const state = crypto.randomBytes(32).toString('hex');
  try {
    await redisConnection.set(`${STATE_PREFIX}${state}`, String(userId ?? ''), 'EX', STATE_TTL_SECONDS);
  } catch (err: any) {
    logger.error('Failed to store OAuth state in Redis: %s', err.message);
    throw new Error('OAuth state storage failed — Redis may be unavailable');
  }
  return state;
}

async function verifyOAuthState(state: string, userId?: number): Promise<boolean> {
  const key = `${STATE_PREFIX}${state}`;
  let storedUserId: string | null;
  try {
    storedUserId = await redisConnection.get(key);
  } catch (err: any) {
    logger.error('Failed to read OAuth state from Redis: %s', err.message);
    return false;
  }
  if (!storedUserId) {
    logger.warn('OAuth state not found in Redis (key=%s) — possible expiry or missing storage', key);
    return false;
  }
  // If state was stored without a userId (empty string), accept any valid userId
  if (storedUserId !== '') {
    if (userId === undefined || parseInt(storedUserId) !== userId) {
      logger.warn('OAuth state userId mismatch: stored=%s, expected=%s', storedUserId, userId);
      return false;
    }
  }
  await redisConnection.del(key).catch(() => {});
  return true;
}

// ─── Token Endpoint ───────────────────────────────────────
// Returns a JWT for the first user (convenience for demo/single-user deployment).
// Gated by AUTH_TOKEN_SECRET in production to prevent unauthorized access.
router.get('/token', async (req, res) => {
  const tokenSecret = process.env.AUTH_TOKEN_SECRET;

  if (tokenSecret) {
    const providedSecret = req.query.secret || req.headers['x-auth-secret'];
    if (providedSecret !== tokenSecret) {
      res.status(401).json({ error: 'Unauthorized. Invalid auth secret.' });
      return;
    }
  } else if (process.env.NODE_ENV === 'production') {
    logger.warn('WARNING: Running /auth/token in production without AUTH_TOKEN_SECRET set. Anyone can access your emailbot dashboard!');
  }

  try {
    let user = await db.user.findFirst({ orderBy: { id: 'asc' } });
    if (!user) {
      user = await db.user.create({
        data: { email: 'admin@emailbot.io', name: 'Admin' },
      });
      logger.info('Auto-created default user (id=%d) — no user existed in DB', user.id);
    }
    const token = generateToken({ userId: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error: any) {
    logger.error('Error generating token:', error.message);
    res.status(500).json({ error: error.message === 'JWT_SECRET is not configured. Set JWT_SECRET environment variable.'
      ? 'Server misconfiguration: JWT_SECRET is not set.'
      : 'Failed to generate token' });
  }
});

// ─── Gmail OAuth2 ─────────────────────────────────────────

// Step 1: Return Google consent screen URL to the frontend
router.get('/gmail/connect', async (req, res) => {
  try {
    let userId: number | undefined;
    // If auth token is provided, tie OAuth state to the user for CSRF
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      try {
        const decoded = verifyToken(header.split(' ')[1] as unknown as string);
        userId = decoded.userId;
      } catch { /* token invalid, proceed without user binding */ }
    }

    const state = await generateOAuthState(userId);

    const googleOAuth2Client = createGoogleOAuth2Client();
    const authUrl = googleOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: GMAIL_SCOPES,
      state,
    });
    res.json({ url: authUrl });
  } catch (error: any) {
    logger.error('Gmail connect URL generation error:', error);
    res.status(500).json({ error: 'Failed to generate Gmail connection URL' });
  }
});

// Step 2: Exchange authorization code for tokens (called by frontend callback page)
router.post('/gmail/connect', async (req, res) => {
  try {
    const { code, state } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Missing authorization code.' });
      return;
    }

    // Resolve user: from JWT if provided, otherwise fall back to first user
    let userId: number | undefined;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      try {
        const decoded = verifyToken(header.split(' ')[1] as unknown as string);
        userId = decoded.userId;
      } catch { /* ignore invalid token */ }
    }
    if (!userId) {
      let firstUser = await db.user.findFirst({ orderBy: { id: 'asc' } });
      if (!firstUser) {
        firstUser = await db.user.create({
          data: { email: 'admin@emailbot.io', name: 'Admin' },
        });
        logger.info('Auto-created default user (id=%d) during Gmail connect', firstUser.id);
      }
      userId = firstUser.id;
    }

    // Verify OAuth state parameter (CSRF protection) - skip userId check if state was unbound
    if (!state || !(await verifyOAuthState(state, userId))) {
      res.status(403).json({ error: 'Invalid or expired OAuth state. Please try connecting again.' });
      return;
    }

    // Exchange code for tokens using direct HTTP call (bypasses gaxios/HTTP2 issues on Render)
    const googleOAuth2Client = createGoogleOAuth2Client();
    const tokenResponse = await axios.post(
      'https://oauth2.googleapis.com/token',
      {
        code,
        client_id: process.env.GMAIL_CLIENT_ID,
        client_secret: process.env.GMAIL_CLIENT_SECRET,
        redirect_uri: process.env.GMAIL_REDIRECT_URI,
        grant_type: 'authorization_code',
      },
      {
        headers: { 'Content-Type': 'application/json' },
        timeout: 15000,
      }
    );
    const tokens = tokenResponse.data;
    logger.info('Google token exchange — access_token=%s refresh_token=%s expires=%s',
      tokens.access_token?.substring(0, 20) + '...' || 'none',
      tokens.refresh_token?.substring(0, 20) + '...' || 'none',
      tokens.expiry_date ? new Date(tokens.expiry_date).toISOString() : 'none');
    googleOAuth2Client.setCredentials(tokens);

    // Get the user's email address from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: googleOAuth2Client });
    const userInfo = await oauth2.userinfo.get();
    const gmailAddress = userInfo.data.email;

    if (!gmailAddress) {
      res.status(400).json({ error: 'Could not retrieve email address from Google.' });
      return;
    }

    // PERSISTENCE: Store or update the Gmail account
    const existing = await db.emailAccount.findFirst({
      where: { userId, provider: 'gmail' }
    });

    const accountData = {
      accessToken: tokens.access_token ?? null,
      refreshToken: tokens.refresh_token ?? (existing?.refreshToken ?? null),
      tokenExpiry: tokens.expiry_date ? new Date(tokens.expiry_date) : null,
      email: gmailAddress,
      isActive: true,
    };

    if (existing) {
      await db.emailAccount.update({
        where: { id: existing.id },
        data: accountData,
      });
    } else {
      await db.emailAccount.create({
        data: {   
          userId,
          provider: 'gmail',
          ...accountData,
        },
      });
    }

    // Sync User profile if it's the first connection or still using default seed
    const currentUser = await db.user.findUnique({ where: { id: userId } });
    if (currentUser && (currentUser.email === 'admin@emailbot.io' || !currentUser.name)) {
      await db.user.update({
        where: { id: userId },
        data: {
          email: gmailAddress,
          name: userInfo.data.name || currentUser.name,
        }
      });
      logger.info(`Updated user ${userId} profile to match Google account: ${gmailAddress}`);
    }

    logger.info(`Gmail connected for user ${userId}: ${gmailAddress}`);
    res.json({ success: true, email: gmailAddress });
  } catch (error: any) {
    logger.error('Gmail callback error:', error);
    res.status(500).json({ error: error.message || 'Failed to connect Gmail account' });
  }
});

// ─── Outlook OAuth2 ───────────────────────────────────────

// Step 1: Return Microsoft consent screen URL to the frontend
router.get('/outlook/connect', async (req, res) => {
  try {
    let userId: number | undefined;
    // If auth token is provided, tie OAuth state to the user for CSRF
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      try {
        const decoded = verifyToken(header.split(' ')[1] as unknown as string);
        userId = decoded.userId;
      } catch { /* token invalid, proceed without user binding */ }
    }

    const state = await generateOAuthState(userId);

    const params = new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      response_type: 'code',
      redirect_uri: process.env.OUTLOOK_REDIRECT_URI || '',
      response_mode: 'query',
      scope: OUTLOOK_SCOPES,
      prompt: 'consent',
      state,
    });
    const authUrl = `${OUTLOOK_AUTH_URL}?${params.toString()}`;
    res.json({ url: authUrl });
  } catch (error: any) {
    logger.error('Outlook connect URL generation error:', error);
    res.status(500).json({ error: 'Failed to generate Outlook connection URL' });
  }
});

// Step 2: Exchange authorization code for tokens (called by frontend callback page)
router.post('/outlook/connect', async (req, res) => {
  try {
    const { code, state } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Missing authorization code.' });
      return;
    }

    // Resolve user: from JWT if provided, otherwise fall back to first user
    let userId: number | undefined;
    const header = req.headers.authorization;
    if (header && header.startsWith('Bearer ')) {
      try {
        const decoded = verifyToken(header.split(' ')[1] as unknown as string);
        userId = decoded.userId;
      } catch { /* ignore invalid token */ }
    }
    if (!userId) {
      let firstUser = await db.user.findFirst({ orderBy: { id: 'asc' } });
      if (!firstUser) {
        firstUser = await db.user.create({
          data: { email: 'admin@emailbot.io', name: 'Admin' },
        });
        logger.info('Auto-created default user (id=%d) during Outlook connect', firstUser.id);
      }
      userId = firstUser.id;
    }

    // Verify OAuth state parameter (CSRF protection) - skip userId check if state was unbound
    if (!state || !(await verifyOAuthState(state, userId))) {
      res.status(403).json({ error: 'Invalid or expired OAuth state. Please try connecting again.' });
      return;
    }

    // Exchange code for tokens via Microsoft Token Endpoint
    const tokenResponse = await axios.post(
      OUTLOOK_TOKEN_URL,
      new URLSearchParams({
        client_id: process.env.OUTLOOK_CLIENT_ID || '',
        client_secret: process.env.OUTLOOK_CLIENT_SECRET || '',
        code,
        redirect_uri: process.env.OUTLOOK_REDIRECT_URI || '',
        grant_type: 'authorization_code',
        scope: OUTLOOK_SCOPES,
      }),
      { headers: { 'Content-Type': 'application/x-www-form-urlencoded' } }
    );

    const { access_token, refresh_token, expires_in } = tokenResponse.data;
    logger.info('Outlook token exchange — access_token=%s refresh_token=%s expires_in=%ds',
      access_token?.substring(0, 20) + '...' || 'none',
      refresh_token?.substring(0, 20) + '...' || 'none',
      expires_in ?? 'none');

    // Get the user's identity from Microsoft Graph API
    const profileResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const outlookEmail = profileResponse.data.mail || profileResponse.data.userPrincipalName;

    // PERSISTENCE: Store or update the Outlook account
    const existing = await db.emailAccount.findFirst({
      where: { userId, provider: 'outlook' }
    });

    const accountData = {
      accessToken: access_token,
      refreshToken: refresh_token ?? (existing?.refreshToken ?? null),
      tokenExpiry: new Date(Date.now() + (expires_in * 1000)),
      email: outlookEmail,
      isActive: true,
    };

    if (existing) {
      await db.emailAccount.update({
        where: { id: existing.id },
        data: accountData,
      });
    } else {
      await db.emailAccount.create({
        data: {
          userId,
          provider: 'outlook',
          ...accountData,
        },
      });
    }

    logger.info(`Outlook connected for user ${userId}: ${outlookEmail}`);
    res.json({ success: true, email: outlookEmail });
  } catch (error: any) {
    logger.error('Outlook callback error:', error.response?.data || error);
    res.status(500).json({ error: error.message || 'Failed to connect Outlook account' });
  }
});

export default router;

