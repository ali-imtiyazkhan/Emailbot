import { Router } from 'express';
import db from '../config/db.js';
import { sendTextMessage } from '../services/whatsappService.js';
import logger from '../utils/logger.js';
const router = Router();

// Webhook verification
router.get('/webhook', (req, res) => {
  const mode = req.query['hub.mode'];
  const token = req.query['hub.verify_token'];
  const challenge = req.query['hub.challenge'];

  if (mode === 'subscribe' && token === process.env.WHATSAPP_VERIFY_TOKEN) {
    res.status(200).send(challenge);
  } else {
    res.sendStatus(403);
  }
});

// Incoming message handler
router.post('/webhook', async (req, res) => {
  const entry = req.body.entry?.[0];
  const changes = entry?.changes?.[0];
  const value = changes?.value;
  const message = value?.messages?.[0];

  if (message) {
    const text = message.text?.body?.toUpperCase();
    const from = message.from;
    logger.info('Received WhatsApp command:', { text, from });
    
    // Find the user by WhatsApp number
    const user = await db.user.findFirst({ where: { whatsapp: from } });
    if (!user) return res.sendStatus(200);

    if (text === 'FULL') {
      const lastEmail = await db.processedEmail.findFirst({
        where: { userId: user.id },
        orderBy: { processedAt: 'desc' }
      });
      if (lastEmail) {
        await sendTextMessage(from, `📄 *Full Email Subject*: ${lastEmail.subject}\n\n${lastEmail.summary}\n\n_Full content feature coming soon (requires fetching body by ID)_`);
      }
    } else if (text === 'PAUSE') {
      await db.emailAccount.updateMany({
        where: { userId: user.id },
        data: { isActive: false }
      });
      await sendTextMessage(from, '⏸️ Notifications paused. Reply "RESUME" to start again.');
    } else if (text === 'RESUME') {
      await db.emailAccount.updateMany({
        where: { userId: user.id },
        data: { isActive: true }
      });
      await sendTextMessage(from, '▶️ Notifications resumed!');
    } else if (text === 'SKIP') {
      await sendTextMessage(from, '⏭️ Current alert skipped.');
    }
  }

  res.sendStatus(200);
});

export default router;
