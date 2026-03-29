import { Router } from 'express';
import { google } from 'googleapis';
import axios from 'axios';
import { prisma as db } from '@repo/db';
import logger from '@repo/shared/logger';
import { createGoogleOAuth2Client, GMAIL_SCOPES } from '../config/google.js';
import { OUTLOOK_AUTH_URL, OUTLOOK_TOKEN_URL, OUTLOOK_SCOPES } from '../config/outlook.js';

const router = Router();

// ─── Gmail OAuth2 

// Step 1: Redirect user to Google consent screen
router.get('/gmail/connect', (req, res) => {
  const googleOAuth2Client = createGoogleOAuth2Client();
  const authUrl = googleOAuth2Client.generateAuthUrl({
    access_type: 'offline',
    prompt: 'consent', // Force consent to ensure refresh_token is provided
    scope: GMAIL_SCOPES,
  });
  res.redirect(authUrl);
});

// Step 2: Exchange authorization code for tokens
router.get('/gmail/callback', async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      res.status(400).send('Missing authorization code.');
      return;
    }

    // Exchange code for tokens
    const googleOAuth2Client = createGoogleOAuth2Client();
    const { tokens } = await googleOAuth2Client.getToken(code);
    googleOAuth2Client.setCredentials(tokens);

    // Get the user's email address from Google
    const oauth2 = google.oauth2({ version: 'v2', auth: googleOAuth2Client });
    const userInfo = await oauth2.userinfo.get();
    const gmailAddress = userInfo.data.email;

    if (!gmailAddress) {
      res.status(400).send('Could not retrieve email address from Google.');
      return;
    }

    const userId = 1; // TODO: In a real app, use the session user's ID

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
    res.send(`
      <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc;">
          <div style="text-align: center; padding: 2rem; border-radius: 1rem; background: #1e293b; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
            <h1 style="color: #4ade80; margin-bottom: 1rem;">✓ Gmail Connected</h1>
            <p style="color: #94a3b8; font-size: 1.1rem;">Your account <strong>${gmailAddress}</strong> is now linked.</p>
            <p style="color: #64748b; font-size: 0.9rem; margin-top: 2rem;">You can safely close this window.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    logger.error('Gmail callback error:', error);
    res.status(500).send(`
      <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc;">
          <div style="text-align: center; padding: 2rem; border-radius: 1rem; background: #1e293b; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
            <h1 style="color: #f87171; margin-bottom: 1rem;">✗ Connection Failed</h1>
            <p style="color: #94a3b8;">${error.message || 'Verification timed out or failed.'}</p>
          </div>
        </body>
      </html>
    `);
  }
});

// ─── Outlook OAuth2

// Step 1: Redirect user to Microsoft consent screen
router.get('/outlook/connect', (req, res) => {
  const params = new URLSearchParams({
    client_id: process.env.OUTLOOK_CLIENT_ID || '',
    response_type: 'code',
    redirect_uri: process.env.OUTLOOK_REDIRECT_URI || '',
    response_mode: 'query',
    scope: OUTLOOK_SCOPES,
    prompt: 'consent',
  });
  res.redirect(`${OUTLOOK_AUTH_URL}?${params.toString()}`);
});

// Step 2: Exchange authorization code for tokens
router.get('/outlook/callback', async (req, res) => {
  try {
    const code = req.query.code as string;
    if (!code) {
      res.status(400).send('Missing authorization code.');
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

    // Get the user's identity from Microsoft Graph API
    const profileResponse = await axios.get('https://graph.microsoft.com/v1.0/me', {
      headers: { Authorization: `Bearer ${access_token}` },
    });
    const outlookEmail = profileResponse.data.mail || profileResponse.data.userPrincipalName;

    const userId = 1; // TODO: Use actual session user

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
    res.send(`
      <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc;">
          <div style="text-align: center; padding: 2rem; border-radius: 1rem; background: #1e293b; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
            <h1 style="color: #60a5fa; margin-bottom: 1rem;">✓ Outlook Connected</h1>
            <p style="color: #94a3b8; font-size: 1.1rem;">Your account <strong>${outlookEmail}</strong> is now linked.</p>
            <p style="color: #64748b; font-size: 0.9rem; margin-top: 2rem;">You can safely close this window.</p>
          </div>
        </body>
      </html>
    `);
  } catch (error: any) {
    logger.error('Outlook callback error:', error.response?.data || error);
    res.status(500).send(`
      <html>
        <body style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #0f172a; color: #f8fafc;">
          <div style="text-align: center; padding: 2rem; border-radius: 1rem; background: #1e293b; box-shadow: 0 10px 25px -5px rgba(0, 0, 0, 0.3);">
            <h1 style="color: #f87171; margin-bottom: 1rem;">✗ Connection Failed</h1>
            <p style="color: #94a3b8;">Authentication with Microsoft failed.</p>
          </div>
        </body>
      </html>
    `);
  }
});

export default router;
