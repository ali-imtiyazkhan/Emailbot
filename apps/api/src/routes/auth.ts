import { Router } from 'express';
import db from '../config/db.js';
import logger from '../utils/logger.js';

const router = Router();

router.get('/gmail/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const userId = 1; 

    // Use a composite unique to avoid duplicate accounts
    const existing = await db.emailAccount.findFirst({
      where: { userId, provider: 'gmail' }
    });

    if (existing) {
      await db.emailAccount.update({
        where: { id: existing.id },
        data: {
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          tokenExpiry: new Date(Date.now() + 3600000)
        }
      });
    } else {
      await db.emailAccount.create({
        data: {
          userId,
          provider: 'gmail',
          email: 'user@gmail.com',
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          tokenExpiry: new Date(Date.now() + 3600000)
        }
      });
    }

    res.send('Gmail connected! You can close this window.');
  } catch (error) {
    logger.error('Gmail callback error:', error);
    res.status(500).send('Failed to connect Gmail.');
  }
});

router.get('/outlook/callback', async (req, res) => {
  try {
    const { code } = req.query;
    const userId = 1;

    const existing = await db.emailAccount.findFirst({
      where: { userId, provider: 'outlook' }
    });

    if (existing) {
      await db.emailAccount.update({
        where: { id: existing.id },
        data: {
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          tokenExpiry: new Date(Date.now() + 3600000)
        }
      });
    } else {
      await db.emailAccount.create({
        data: {
          userId,
          provider: 'outlook',
          email: 'user@outlook.com',
          accessToken: 'mock_access_token',
          refreshToken: 'mock_refresh_token',
          tokenExpiry: new Date(Date.now() + 3600000)
        }
      });
    }

    res.send('Outlook connected! You can close this window.');
  } catch (error) {
    logger.error('Outlook callback error:', error);
    res.status(500).send('Failed to connect Outlook.');
  }
});

export default router;
