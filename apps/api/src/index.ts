import '@repo/shared/env';
import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import morgan from 'morgan';
import logger from '@repo/shared/logger';

import authRoutes from './routes/auth.js';
import webhookRoutes from './routes/webhook.js';
import dashboardRoutes from './routes/dashboard.js';
import { redisConnection } from './config/redis.js';
import { prisma as db } from '@repo/db';
import { authLimiter, apiLimiter, webhookLimiter } from './middleware/rateLimiter.js';
import { verifyWebhookSignature } from './middleware/webhookAuth.js';

// ── Startup Environment Validation ────────────────────────
const REQUIRED_ENV_VARS = ['JWT_SECRET', 'DATABASE_URL'] as const;
const OPTIONAL_BUT_CRITICAL: { key: string; label: string }[] = [
  { key: 'GMAIL_CLIENT_ID', label: 'Gmail OAuth' },
  { key: 'GMAIL_CLIENT_SECRET', label: 'Gmail OAuth' },
  { key: 'GMAIL_REDIRECT_URI', label: 'Gmail OAuth' },
  { key: 'OUTLOOK_CLIENT_ID', label: 'Outlook OAuth' },
  { key: 'OUTLOOK_CLIENT_SECRET', label: 'Outlook OAuth' },
  { key: 'OUTLOOK_TENANT_ID', label: 'Outlook OAuth' },
  { key: 'OUTLOOK_REDIRECT_URI', label: 'Outlook OAuth' },
];

for (const key of REQUIRED_ENV_VARS) {
  if (!process.env[key]) {
    logger.error('CRITICAL: %s is not set. Authentication/database will not work.', key);
  }
}

for (const { key, label } of OPTIONAL_BUT_CRITICAL) {
  if (!process.env[key]) {
    logger.warn('MISSING: %s is not set. %s flow will not work.', key, label);
  }
}

if (!process.env.AUTH_TOKEN_SECRET && process.env.NODE_ENV === 'production') {
  logger.warn('SECURITY: AUTH_TOKEN_SECRET is not set. Anyone can call /auth/token to get a JWT. Set this in production.');
}
// ──────────────────────────────────────────────────────────

const app = express();
const PORT = process.env.PORT || 3001;

// Security & Middleware
app.set('trust proxy', 1);
app.use(helmet());
const allowedOrigins = [
  'http://localhost:3000',
  'https://emailbot-web.vercel.app',
  ...(process.env.FRONTEND_URL ? [process.env.FRONTEND_URL] : []),
];

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin)) {
      callback(null, true);
    } else {
      callback(new Error('Not allowed by CORS'));
    }
  },
  credentials: true,
}));
app.use(morgan('dev'));

// Parse JSON and capture raw body for webhook signature verification
app.use(express.json({
  verify: (req: any, _res, buf) => {
    req.rawBody = buf;
  },
}));

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

app.use('/auth', authLimiter, authRoutes);
app.use('/api', apiLimiter, dashboardRoutes);
app.use('/whatsapp', webhookLimiter, verifyWebhookSignature, webhookRoutes);


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
