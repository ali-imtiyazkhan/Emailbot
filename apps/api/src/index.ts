import '@repo/shared/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';

import authRoutes from './routes/auth.js';
import webhookRoutes from './routes/webhook.js';
import whatsappWebhookRouter from './routes/whatsappWebhook.js';
import dashboardRoutes from './routes/dashboard.js';
import { redisConnection } from './config/redis.js';
import { prisma as db } from '@repo/db';
import logger from '@repo/shared/logger';

const app = express();
const PORT = process.env.API_PORT || 3001;

// Security & Middleware
app.use(helmet());
app.use(cors({
  origin: process.env.FRONTEND_URL || 'http://localhost:3000',
  credentials: true,
}));
app.use(morgan('dev'));
app.use(express.json());

// Routes 
app.get('/health', async (req, res) => {
  try {
    await db.$queryRaw`SELECT 1`;
    const redisPing = await redisConnection.ping();

    res.json({
      status: 'ok',
      timestamp: new Date().toISOString(),
      uptime: process.uptime(),
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
app.use('/', whatsappWebhookRouter);
app.use('/api', dashboardRoutes);

// Global Error Handler
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
  logger.error('Unhandled error:', err);
  res.status(500).json({ error: 'Internal server error' });
});

// Start Server
const server = app.listen(PORT, () => {
  logger.info(`EmailBot API running on port ${PORT}`);
});

// Graceful Shutdown
const gracefulShutdown = async (signal: string) => {
  logger.info(`${signal} received — shutting down gracefully...`);
  
  server.close(() => {
    logger.info('HTTP server closed');
  });

  try {
    await redisConnection.quit();
    logger.info('Redis connection closed');
  } catch { /* Redis may already be disconnected */ }

  try {
    await db.$disconnect();
    logger.info('Database connection closed');
  } catch { /* Prisma may already be disconnected */ }

  process.exit(0);
};

process.on('SIGTERM', () => gracefulShutdown('SIGTERM'));
process.on('SIGINT', () => gracefulShutdown('SIGINT'));

export default app;
