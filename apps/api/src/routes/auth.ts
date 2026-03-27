import { Router } from 'express';
import db from '../config/db.js';

const router = Router();

router.get('/gmail/callback', async (req, res) => {
  const { code } = req.query;
  const userId = 1; 

  await db.emailAccount.upsert({
    where: { id: -1 },
    create: {
      userId,
      provider: 'gmail',
      email: 'user@gmail.com',
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      tokenExpiry: new Date(Date.now() + 3600000)
    },
    update: {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      tokenExpiry: new Date(Date.now() + 3600000)
    }
  });
  res.send('Gmail connected! You can close this window.');
});

router.get('/outlook/callback', async (req, res) => {
  const { code } = req.query;
  const userId = 1;

  await db.emailAccount.upsert({
    where: { id: -1 },
    create: {
      userId,
      provider: 'outlook',
      email: 'user@outlook.com',
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      tokenExpiry: new Date(Date.now() + 3600000)
    },
    update: {
      accessToken: 'mock_access_token',
      refreshToken: 'mock_refresh_token',
      tokenExpiry: new Date(Date.now() + 3600000)
    }
  });
  res.send('Outlook connected! You can close this window.');
});

export default router;
