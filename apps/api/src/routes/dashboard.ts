import { Router } from 'express';
import { z } from 'zod';
import { prisma as db } from '@repo/db';
import logger from '@repo/shared/logger';

const router = Router();

// ── Validation Schemas ─────────────────────────────────

const createFilterSchema = z.object({
  type: z.enum(['sender', 'keyword', 'priority_min']),
  value: z.string().min(1, 'Value is required').max(255),
});

const updateDigestSchema = z.object({
  enabled: z.boolean(),
  sendTime: z.string().regex(/^\d{2}:\d{2}$/, 'Must be HH:MM format'),
  timezone: z.string().min(1),
  minEmails: z.number().int().min(1).max(50),
});

// ── Profile ──────────────────────────────────────────

router.get('/profile', async (req, res) => {
  try {
    const userId = 1; // Assuming hardcoded for now
    const user = await db.user.findUnique({
      where: { id: userId },
      select: { id: true, email: true, name: true, whatsapp: true }
    });
    res.json(user);
  } catch (error) {
    logger.error('Error fetching profile:', error);
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// ── Stats ──────────────────────────────────────────────

router.get('/stats', async (req, res) => {
  try {
    const userId = 1;
    const count = await db.processedEmail.count({ where: { userId } });
    res.json({ totalProcessed: count });
  } catch (error) {
    logger.error('Error fetching stats:', error);
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ── Filter Rules ───────────────────────────────────────

router.get('/filters', async (req, res) => {
  try {
    const userId = 1;
    const filters = await db.filterRule.findMany({ where: { userId } });
    res.json(filters);
  } catch (error) {
    logger.error('Error fetching filters:', error);
    res.status(500).json({ error: 'Failed to fetch filters' });
  }
});

router.post('/filters', async (req, res) => {
  try {
    const userId = 1;
    const parsed = createFilterSchema.parse(req.body);
    await db.filterRule.create({ 
      data: { userId, ruleType: parsed.type, value: parsed.value } 
    });
    res.sendStatus(201);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    logger.error('Error creating filter:', error);
    res.status(500).json({ error: 'Failed to create filter' });
  }
});

router.delete('/filters/:id', async (req, res) => {
  try {
    const id = parseInt(req.params.id);
    if (isNaN(id)) {
      res.status(400).json({ error: 'Invalid filter ID' });
      return;
    }
    await db.filterRule.delete({ where: { id } });
    res.sendStatus(200);
  } catch (error) {
    logger.error('Error deleting filter:', error);
    res.status(500).json({ error: 'Failed to delete filter' });
  }
});

// ── Processed Emails (with pagination) ─────────────────

router.get('/emails', async (req, res) => {
  try {
    const userId = 1;
    const page = Math.max(1, parseInt(req.query.page as string) || 1);
    const limit = Math.min(50, Math.max(1, parseInt(req.query.limit as string) || 20));
    const skip = (page - 1) * limit;

    const [emails, total] = await Promise.all([
      db.processedEmail.findMany({
        where: { userId },
        orderBy: { processedAt: 'desc' },
        skip,
        take: limit,
        include: { emailAccount: { select: { provider: true, email: true } } }
      }),
      db.processedEmail.count({ where: { userId } }),
    ]);

    res.json({ data: emails, total, page, limit, totalPages: Math.ceil(total / limit) });
  } catch (error) {
    logger.error('Error fetching emails:', error);
    res.status(500).json({ error: 'Failed to fetch emails' });
  }
});

// ── Connected Accounts ─────────────────────────────────

router.get('/accounts', async (req, res) => {
  try {
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
  } catch (error) {
    logger.error('Error fetching accounts:', error);
    res.status(500).json({ error: 'Failed to fetch accounts' });
  }
});

// ── Digest Settings ────────────────────────────────────

router.get('/digest-settings', async (req, res) => {
  try {
    const userId = 1;
    let settings = await db.digestSetting.findUnique({ where: { userId } });
    if (!settings) {
      settings = await db.digestSetting.create({
        data: { userId, enabled: true, sendTime: '08:00', timezone: 'UTC', minEmails: 1 }
      });
    }
    res.json(settings);
  } catch (error) {
    logger.error('Error fetching digest settings:', error);
    res.status(500).json({ error: 'Failed to fetch digest settings' });
  }
});

router.put('/digest-settings', async (req, res) => {
  try {
    const userId = 1;
    const parsed = updateDigestSchema.parse(req.body);
    const settings = await db.digestSetting.upsert({
      where: { userId },
      create: { userId, ...parsed },
      update: parsed,
    });
    res.json(settings);
  } catch (error) {
    if (error instanceof z.ZodError) {
      res.status(400).json({ error: 'Invalid input', details: error.errors });
      return;
    }
    logger.error('Error updating digest settings:', error);
    res.status(500).json({ error: 'Failed to update digest settings' });
  }
});

export default router;
