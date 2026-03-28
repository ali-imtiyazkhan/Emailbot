import './config/env.js';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import webhookRoutes from './routes/webhook.js';
import dashboardRoutes from './routes/dashboard.js';
import { initScheduler } from './services/scheduler.js';
import { initWorker } from './services/queueService.js';
import { redisConnection } from './config/redis.js';
import db from './config/db.js';
import logger from './utils/logger.js';

const app = express();
const PORT = process.env.API_PORT || 3001;

app.use(helmet());
app.use(cors());
app.use(morgan('dev'));
app.use(express.json());

// Routes
app.get('/health', async (req, res) => {
  try {
    // Verify DB connectivity
    await db.$queryRaw`SELECT 1`;
    // Verify Redis connectivity
    const redisPing = await redisConnection.ping();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      services: {
        database: 'connected',
        redis: redisPing === 'PONG' ? 'connected' : 'disconnected',
      }
    });
  } catch (error: any) {
    res.status(503).json({
      status: 'degraded',
      timestamp: new Date().toISOString(),
      error: error.message,
    });
  }
});

app.use('/auth', authRoutes);
app.use('/whatsapp', webhookRoutes);
app.use('/api', dashboardRoutes);

// Initialize Services
initScheduler();
initWorker();

// Global error handler (must be last middleware)
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start server
app.listen(PORT, () => {
  logger.info(`EmailBot API running on port ${PORT}`);
});

export default app;
