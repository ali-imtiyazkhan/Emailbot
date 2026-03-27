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

export default router;
