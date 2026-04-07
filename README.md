# 📧 EmailBot — AI-Powered Email Intelligence on WhatsApp

> **Your inbox is noisy. EmailBot is your filter.**  
> It watches your Gmail and Outlook inbox, uses AI to score and summarize every email, and sends only the urgent ones straight to your WhatsApp. Reply directly from WhatsApp — the AI polishes your response before sending.

[![Built with](https://img.shields.io/badge/Built_with-TypeScript-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org/)
[![AI](https://img.shields.io/badge/AI-Google_Gemini-4285F4?logo=google&logoColor=white)](https://ai.google.dev/)
[![DB](https://img.shields.io/badge/DB-PostgreSQL-4169E1?logo=postgresql&logoColor=white)](https://www.postgresql.org/)
[![Queue](https://img.shields.io/badge/Queue-BullMQ_+_Redis-DC382D?logo=redis&logoColor=white)](https://docs.bullmq.io/)

---

## ✨ Key Features

| Feature | Description |
|---------|-------------|
| **🔗 Multi-Provider** | Connect both Gmail and Outlook via OAuth2 |
| **🤖 AI Summarization** | Every email is scored (1-10) and summarized by Google Gemini |
| **📲 WhatsApp Alerts** | Priority emails are instantly forwarded to WhatsApp |
| **✍️ Reply from WhatsApp** | Reply to email notifications → AI refines your message → sends via email |
| **📋 Daily Digest** | Morning summary of all unread emails (timezone-aware) |
| **🎯 Custom Rules** | Filter by sender, keyword, or minimum priority threshold |
| **📊 Premium Dashboard** | Sleek Next.js dashboard to manage everything |

---

## 🏗️ Architecture

```
┌─────────────────────────────────────────────────────────────────────┐
│                           TURBOREPO MONOREPO                        │
├─────────────┬──────────────┬───────────────┬───────────────┬────────┤
│   apps/api  │ apps/web     │ emailreceiver │ whatsappsender│        │
│  (Express)  │ (Next.js 15) │  (Cron Worker)│ (BullMQ      │        │
│             │              │               │  Consumer)    │        │
│ • OAuth     │ • Dashboard  │ • Poll Gmail  │ • AI Summary  │        │
│ • REST API  │ • Landing    │ • Poll Outlook│ • Score Email │        │
│ • WhatsApp  │ • Emails     │ • Queue Jobs  │ • Send to WA  │        │
│   Webhook   │ • Rules      │               │               │        │
│ • Health    │ • Settings   │               │               │        │
├─────────────┴──────────────┴───────────────┴───────────────┘        │
│                      SHARED PACKAGES                                │
├────────────────┬───────────────┬────────────────┬───────────────────┤
│  packages/db   │ packages/     │ packages/ui    │ packages/         │
│  (Prisma +     │ shared        │ (UI Components)│ typescript-config │
│   PostgreSQL)  │ (AI, Logger,  │                │ eslint-config     │
│                │  WhatsApp,    │                │                   │
│                │  Env)         │                │                   │
├────────────────┴───────────────┴────────────────┴───────────────────┤
│                      INFRASTRUCTURE                                 │
├──────────────────────────┬──────────────────────────────────────────┤
│  PostgreSQL (via Docker) │  Redis (via Docker) — BullMQ job queue   │
└──────────────────────────┴──────────────────────────────────────────┘
```

### Data Flow

```
Gmail/Outlook → [emailreceiver] polls every 60s
                        ↓
                 New email found?
                        ↓ Yes
              Push job to Redis Queue (BullMQ)
                        ↓
             [whatsappsender] picks up job
                        ↓
              AI Summary & Scoring (Gemini)
                        ↓
              Priority ≥ threshold? ──→ WhatsApp notification
                        ↓
              Save to PostgreSQL (ProcessedEmail)
```

---

## 🛠️ Tech Stack

| Layer | Technology |
|-------|-----------|
| **Monorepo** | Turborepo |
| **Frontend** | Next.js 15 (App Router), Tailwind CSS v4, Framer Motion |
| **Backend** | Node.js, Express, TypeScript |
| **Database** | PostgreSQL via Prisma ORM |
| **Job Queue** | BullMQ + Redis |
| **AI** | Google Gemini API (gemini-2.5-flash-lite) |
| **WhatsApp** | Meta WhatsApp Cloud API |
| **Email** | Gmail API (OAuth2) + Microsoft Graph API (OAuth2) |
| **Logging** | Winston with rotating file transport |

---

## 📂 Project Structure

```
emailbot/
├── apps/
│   ├── api/               # Express REST API + OAuth + WhatsApp webhook
│   ├── web/               # Next.js Dashboard + Landing page
│   ├── emailreceiver/     # Cron-based email polling worker (producer)
│   └── whatsappsender/    # BullMQ consumer — AI + WhatsApp delivery
├── packages/
│   ├── db/                # Prisma schema, client, seeds, migrations
│   ├── shared/            # AI, Logger, WhatsApp, Env utilities
│   ├── ui/                # Shared React UI components
│   ├── eslint-config/     # Shared ESLint configuration
│   └── typescript-config/ # Shared TypeScript configuration
├── docker-compose.yml     # PostgreSQL + Redis
└── turbo.json             # Turborepo pipeline config
```

---

## 🚀 Getting Started

### Prerequisites
- **Node.js 18+**
- **Docker** (for PostgreSQL + Redis)
- **Google Cloud Console** — Gmail OAuth credentials + Gemini API key
- **Microsoft Azure** — Outlook app registration (optional)
- **Meta Developer Dashboard** — WhatsApp Cloud API setup

### Installation

```bash
# Clone the repository
git clone <your-repo>
cd emailbot

# Install all dependencies
npm install

# Set up environment variables
cp .env.example .env
# Then edit .env with your credentials
```

### Database Setup

```bash
# Start PostgreSQL + Redis
docker compose up -d

# Generate Prisma client
npm run generate -w @repo/db

# Push schema to database
cd packages/db && npx prisma db push

# Seed example data
npx prisma db seed
```

### Running the Project

```bash
# Start all apps in development mode
npm run dev

# Or run individual services:
npm run dev -w api              # API server (port 3001)
npm run dev -w web              # Dashboard (port 3000)
npm run dev -w emailreceiver    # Email polling worker
npm run dev -w whatsappsender   # WhatsApp delivery worker
```

---

## 🔐 Security

- **OAuth2** for Gmail and Outlook — no passwords stored
- **Helmet.js** for HTTP security headers
- **Rate limiting** on all API endpoints (100 req/15min general, 20/15min auth)
- **HTML sanitization** in OAuth callback responses (XSS prevention)
- **Input validation** with Zod on all user-facing endpoints

---

## 📝 License
MIT
