# EmailBot — Project Overview for LLMs

## What This Project Does

EmailBot is an **AI-powered email triage system** that connects to Gmail/Outlook, uses Google Gemini to score and summarize emails, and forwards important messages to WhatsApp. Users can reply on WhatsApp and the AI polishes the response back into a proper email.

---

## Monorepo Architecture (Turborepo)

```
EmailBot/
├── apps/
│   ├── api/              # Express server — OAuth, REST dashboard, WhatsApp webhooks
│   ├── web/              # Next.js 15 — landing page + dashboard UI
│   ├── emailreceiver/    # Cron worker — polls Gmail/Outlook inboxes, enqueues jobs to Redis
│   └── whatsappsender/   # BullMQ consumer — AI summarize + WhatsApp notification + persist to DB
├── packages/
│   ├── db/               # Prisma schema, migrations, seed script
│   ├── shared/           # AI client (`ai.ts`), WhatsApp client (`whatsapp.ts`), logger, env loader
│   ├── ui/               # Shared React UI components
│   ├── eslint-config/    # Shared ESLint config
│   └── typescript-config/ # Shared TS configs
├── docker-compose.yml    # PostgreSQL 15 + Redis 7
└── turbo.json
```

## Tech Stack

| Layer | Technology |
|-------|------------|
| Monorepo | Turborepo + npm workspaces |
| Frontend | Next.js 15, Tailwind CSS v4, Framer Motion |
| Backend | Express, TypeScript (ESM) |
| Database | PostgreSQL 15 + Prisma ORM |
| Queue | BullMQ + Redis 7 |
| AI | Google Gemini (`gemini-2.5-flash-lite` for worker, `gemini-1.5-flash` for polish) |
| WhatsApp | Meta Cloud API v22 |
| Email | Gmail API + Microsoft Graph API |
| Auth | JWT (manual, no sessions/SSO) |

## Data Flow

### 1. Email → WhatsApp Alert
```
Gmail/Outlook → emailreceiver (polls every 60s) → Redis BullMQ → whatsappsender → Gemini summarize → WhatsApp notification
```

### 2. WhatsApp Reply → Email (core loop)
```
User replies in WhatsApp thread → Meta webhook → API matches context.id to ProcessedEmail.whatsappMessageId → Gemini polishes reply → Send email via Gmail/Outlook API → WhatsApp confirmation
```

## Database Schema (Prisma — PostgreSQL)

5 models:
- **User** — credentials, whatsapp number, aiReplyImprovement flag
- **EmailAccount** — OAuth tokens per provider (gmail/outlook), linked to user
- **FilterRule** — sender/keyword/priority_min rules per user
- **ProcessedEmail** — each email's metadata: summary, priority (1-10), category, whatsappMessageId, notified/digest flags
- **DigestSetting** — per-user daily digest config (time, timezone, min emails)

## Key Source Files

| File | Purpose |
|------|---------|
| `apps/api/src/index.ts` | Express entry — routes, middleware, health check, graceful shutdown |
| `apps/api/src/routes/auth.ts` | JWT token generation, Gmail/Outlook OAuth2 connect flows |
| `apps/api/src/routes/webhook.ts` | WhatsApp webhook verify + incoming message handler (reply threading, commands: PAUSE/RESUME/SKIP/SNOOZE) |
| `apps/api/src/routes/dashboard.ts` | Protected REST endpoints: profile, stats, filters, emails, accounts, digest, analytics, reply |
| `apps/api/src/services/gmailService.ts` | Gmail API: fetch unread, refresh tokens, send replies with threading |
| `apps/api/src/services/outlookService.ts` | Outlook/Graph API: fetch unread, refresh tokens, createReply/send |
| `apps/emailreceiver/src/index.ts` | Email receiver entry — validates env, starts cron scheduler |
| `apps/emailreceiver/src/services/scheduler.ts` | Cron: polls inboxes every 60s + daily digest checker (every minute, timezone-aware) |
| `apps/emailreceiver/src/services/emailProcessor.ts` | Fetches emails from all user accounts, deduplicates, enqueues to BullMQ |
| `apps/whatsappsender/src/index.ts` | WhatsApp sender entry — validates env, starts BullMQ worker |
| `apps/whatsappsender/src/services/emailWorkerHandler.ts` | Worker: AI summarize → filter rules → send notification → persist ProcessedEmail |
| `packages/shared/src/ai.ts` | Gemini client — summarizeEmail (with retry + JSON parse fallback) |
| `packages/shared/src/whatsapp.ts` | WhatsApp API client — text messages, template messages, sendNotification |

## Commands

```bash
npm run dev              # Run all apps via Turborepo
npm run dev -w api       # Run API only
npm run dev -w web       # Run web only
npm run build            # Build all apps
npm run generate -w @repo/db  # Generate Prisma client
cd packages/db && npx prisma db push && npx prisma db seed  # Setup DB
```

## Current Status

- **Working**: Full pipeline — email polling, AI summarization, WhatsApp notifications, WhatsApp reply → email, OAuth for Gmail/Outlook, filter rules, daily digest, dashboard CRUD, analytics
- **Known gaps** (from README):
  - Session-based multi-user auth (currently uses fixed demo `userId` in places)
  - No automated test suite
  - Production hardening: idempotency, dead-letter queue, observability
- **Deployment**: Render-ready (`render.yaml`) — web service + managed PostgreSQL
- **CI**: Relies on Turborepo build pipeline; no CI config present

## Environment Variables

See `.env.example` for all 20+ variables covering:
- Server config (PORT, DATABASE_URL, REDIS_URL, JWT_SECRET)
- Gmail OAuth (GMAIL_CLIENT_ID/SECRET/REDIRECT_URI)
- Outlook OAuth (OUTLOOK_CLIENT_ID/SECRET/TENANT_ID/REDIRECT_URI)
- WhatsApp (WHATSAPP_VERIFY_TOKEN/PHONE_NUMBER_ID/ACCESS_TOKEN/APP_SECRET)
- AI (GOOGLE_API_KEY)
- Frontend URL (for CORS)

## Known Issues & Fixes Applied

| Issue | Status | Details |
|-------|--------|---------|
| Duplicate WhatsApp webhook | ✅ Fixed | Removed `routes/whatsappWebhook.ts` — kept `routes/webhook.ts` as the single handler |
| Token refresh not persisted in emailReplyService | ✅ Fixed | `refreshGmailToken()` and `sendOutlookReply()` now save refreshed tokens to DB |
| OAuth state empty string always rejected | ✅ Fixed | `verifyOAuthState()` used `!storedUserId` which treated `''` (unbound state) as falsy. Changed to `storedUserId === null` |
| Logger `%s` not interpolated in console | ✅ Fixed | Added `winston.format.splat()` to console transport |
| Dashboard auto-logged anyone as first user | ⚠️ Known | Single-user design — anyone visiting gets the first DB user's token. Dashboard shows "Connect your email" empty state when no accounts exist |
| Frontend 401 never recovered | ✅ Fixed | `apiFetch()` now clears stale token, fetches new one, and retries once on 401 |
| NaN priority from AI (`Math.round(NaN)`) | ❌ Open | `packages/shared/src/ai.ts:54` — `Math.round()` on non-numeric AI output produces `NaN`, making `NaN >= threshold` always `false` |
| Showcase CSS hardcoded values | ✅ Fixed | `email_ai_feature_showcase.html` now uses CSS variables and site design tokens |

## Important Notes for LLMs

### Architecture Gotchas
- The Next.js app (`apps/web`) uses **Next.js 15** with breaking changes. Check `node_modules/next/dist/docs/` before writing code.
- The API app has **dead duplicate service files** in `apps/api/src/services/` — the real implementations are in `apps/emailreceiver/` and `apps/whatsappsender/`.
- Two logger instances exist: `apps/api/src/utils/logger.ts` and `packages/shared/src/logger.ts`. The shared one is preferred.
- AI models differ: worker uses `gemini-2.5-flash-lite` (`@repo/shared/ai.ts`), API reply polish uses `gemini-1.5-flash` (`apps/api/src/services/aiService.ts`).

### Auth / Security
- `GET /auth/token` returns a JWT for the **first DB user** with no authentication. Anyone visiting gets the first user's token. Dashboard shows "Connect your email" empty state when no accounts exist.
- JWT tokens expire in **7 days**. Frontend auto-refreshes on 401 with one retry.
- OAuth state is stored in Redis with `oauth_state:<state>` key, 600s TTL, deleted after verification.

### Design System (Frontend)
- CSS variables: `--bg: #050505`, `--surface: #0f0f0f`, `--border: #1c1c1c`, `--border-light: #2a2a2a`, `--text-1/2/3`, `--r-xs/sm/md/lg/xl` (2px–8px)
- Card treatment: `liquid-glass` class — `rgba(255,255,255,0.01)` bg, `backdrop-filter: blur(4px)`, inset border glow via `::before`
- Italic text emphasis uses `var(--font-serif)` (Instrument Serif)
- Icons: Tabler Icons via `@tabler/icons-webfont`

### Prisma / DB
- Schema uses `env("DATABASE_URL")` — reads from `.env` file, falls back to process env
- `ProcessedEmail` has `@@unique([userId, messageId])` for deduplication
- Seed creates `admin@gmail.com` with mock tokens — run `db push` + `db seed` for fresh setup

### Key Files Reference
- Worker pipeline: `apps/emailreceiver/src/services/emailProcessor.ts` (fetch → queue) → `apps/whatsappsender/src/services/emailWorkerHandler.ts` (AI → filter → notify)
- Webhook handler: `apps/api/src/routes/webhook.ts` (reply threading, PAUSE/RESUME/SKIP/SNOOZE commands)
- Dashboard layout with auth gate: `apps/web/src/app/(dashboard)/layout.tsx`
- AI summarization: `packages/shared/src/ai.ts` (Gemini, 3 retries, JSON parse fallback)
- AI reply polish: `apps/api/src/services/aiService.ts` (Gemini, single call, returns original on failure)
