import { Router } from 'express';
import { google } from 'googleapis';
import axios from 'axios';
import { prisma as db } from '@repo/db';
import logger from '@repo/shared/logger';
import { createGoogleOAuth2Client, GMAIL_SCOPES } from '../config/google.js';
import { OUTLOOK_AUTH_URL, OUTLOOK_TOKEN_URL, OUTLOOK_SCOPES } from '../config/outlook.js';
import { verifyToken, generateToken, requireAuth } from '../middleware/auth.js';

const router = Router();

/** Escape HTML to prevent XSS injection in inline responses */
const escapeHtml = (str: string): string =>
  str.replace(/&/g, '&amp;').replace(/</g, '&lt;').replace(/>/g, '&gt;').replace(/"/g, '&quot;');

// ─── Token Endpoint ───────────────────────────────────────
// Returns a JWT for the first user (dev convenience). In production, replace with real auth.
router.get('/token', async (req, res) => {
  try {
    const user = await db.user.findFirst({ orderBy: { id: 'asc' } });
    if (!user) {
      res.status(404).json({ error: 'No user found. Run seed first.' });
      return;
    }
    const token = generateToken({ userId: user.id, email: user.email });
    res.json({ token, user: { id: user.id, email: user.email, name: user.name } });
  } catch (error) {
    logger.error('Error generating token:', error);
    res.status(500).json({ error: 'Failed to generate token' });
  }
});

// ─── Gmail OAuth2 ─────────────────────────────────────────

// Step 1: Return Google consent screen URL to the frontend
router.get('/gmail/connect', (req, res) => {
  try {
    const googleOAuth2Client = createGoogleOAuth2Client();
    const authUrl = googleOAuth2Client.generateAuthUrl({
      access_type: 'offline',
      prompt: 'consent',
      scope: GMAIL_SCOPES,
    });
    res.json({ url: authUrl });
  } catch (error: any) {
    logger.error('Gmail connect URL generation error:', error);
    res.status(500).json({ error: 'Failed to generate Gmail connection URL' });
  }
});

// Step 2: Exchange authorization code for tokens (called by frontend callback page)
router.post('/gmail/connect', requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Missing authorization code.' });
      return;
    }

    const userId = req.user!.userId;

    // Exchange code for tokens
    const googleOAuth2Client = createGoogleOAuth2Client();
    const { tokens } = await googleOAuth2Client.getToken(code);
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
router.get('/outlook/connect', (req, res) => {
  try {
    const params = new URLSearchParams({
      client_id: process.env.OUTLOOK_CLIENT_ID || '',
      response_type: 'code',
      redirect_uri: process.env.OUTLOOK_REDIRECT_URI || '',
      response_mode: 'query',
      scope: OUTLOOK_SCOPES,
      prompt: 'consent',
    });
    const authUrl = `${OUTLOOK_AUTH_URL}?${params.toString()}`;
    res.json({ url: authUrl });
  } catch (error: any) {
    logger.error('Outlook connect URL generation error:', error);
    res.status(500).json({ error: 'Failed to generate Outlook connection URL' });
  }
});

// Step 2: Exchange authorization code for tokens (called by frontend callback page)
router.post('/outlook/connect', requireAuth, async (req, res) => {
  try {
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ error: 'Missing authorization code.' });
      return;
    }

    const userId = req.user!.userId;

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
