import { Router } from 'express';
import db from '../config/db.js';

const router = Router();

router.get('/stats', async (req, res) => {
  const userId = 1;
  const count = await db.processedEmail.count({ where: { userId } });
  res.json({ totalProcessed: count });
});

router.get('/filters', async (req, res) => {
  const userId = 1;
  const filters = await db.filterRule.findMany({ where: { userId } });
  res.json(filters);
});

router.post('/filters', async (req, res) => {
  const userId = 1;
  const { type, value } = req.body;
  await db.filterRule.create({ 
    data: { userId, ruleType: type, value } 
  });
  res.sendStatus(201);
});

router.delete('/filters/:id', async (req, res) => {
  const { id } = req.params;
  await db.filterRule.delete({
    where: { id: parseInt(id) }
  });
  res.sendStatus(200);
});

// Processed Emails
router.get('/emails', async (req, res) => {
  const userId = 1;
  const emails = await db.processedEmail.findMany({
    where: { userId },
    orderBy: { processedAt: 'desc' },
    take: 50,
    include: { emailAccount: { select: { provider: true, email: true } } }
  });
  res.json(emails);
});

// Connected Accounts
router.get('/accounts', async (req, res) => {
  const userId = 1;
  const accounts = await db.emailAccount.findMany({
    where: { userId },
    select: {
      id: true,
      provider: true,
      email: true,
      isActive: true,
      lastSynced: true,
      createdAt: true,
    }
  });
  res.json(accounts);
});

// Digest Settings
router.get('/digest-settings', async (req, res) => {
  const userId = 1;
  let settings = await db.digestSetting.findUnique({ where: { userId } });
  if (!settings) {
    settings = await db.digestSetting.create({
      data: { userId, enabled: true, sendTime: '08:00', timezone: 'UTC', minEmails: 1 }
    });
  }
  res.json(settings);
});

router.put('/digest-settings', async (req, res) => {
  const userId = 1;
  const { enabled, sendTime, timezone, minEmails } = req.body;
  const settings = await db.digestSetting.upsert({
    where: { userId },
    create: { userId, enabled, sendTime, timezone, minEmails },
    update: { enabled, sendTime, timezone, minEmails }
  });
  res.json(settings);
});

export default router;
