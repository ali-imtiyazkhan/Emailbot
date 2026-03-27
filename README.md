# 📧 EmailBot — Get Emails on WhatsApp

Most people's email inboxes are overflowing with spam and newsletters, which makes it easy to miss truly important messages. **EmailBot** acts as a personal assistant that watches your inbox for you. It uses AI to read your incoming mail, summarizes only the most critical messages, and sends those summaries directly to your WhatsApp. This way, you stay on top of your important business without ever having to open your cluttered inbox throughout the day.

---

## ✨ Features

- **Multi-Service Support**: Connect both Gmail and Outlook via OAuth2.
- **AI-Powered Summaries**: Important emails are summarized and scored (1–10) by Anthropic Claude.
- **Multi-User Architecture**: Built to handle multiple users with isolated accounts and rules.
- **Premium Dashboard**: Manage your connections and filters through a sleek Next.js dashboard.
- **WhatsApp Alerts**: Real-time notifications for high-priority emails.
- **Daily Digest**: Summarized morning reports of your daily inbox.

---

## 🛠️ Tech Stack

- **Monorepo**: [Turborepo](https://turbo.build/)
- **Frontend**: [Next.js 15+](https://nextjs.org/) (App Router) + Tailwind CSS
- **Backend**: [Node.js](https://nodejs.org/) + [Express](https://expressjs.com/)
- **Database**: [PostgreSQL](https://www.postgresql.org/) via [Prisma ORM](https://www.prisma.io/)
- **AI**: [Anthropic Claude API](https://www.anthropic.com/)
- **WhatsApp**: [Meta WhatsApp Cloud API](https://developers.facebook.com/docs/whatsapp/cloud-api)
- **Email**: Gmail API & Microsoft Graph API

---

## 📂 Project Structure

```text
emailbot/
├── apps/
│   ├── api/          # Node.js/Express Backend
│   └── web/          # Next.js Frontend Dashboard
├── packages/
│   ├── db/           # Shared Prisma client & Schema (PostgreSQL)
│   ├── ui/           # Shared UI components
│   └── typescript-config/ # Shared TS configurations
├── data/             # Local data storage (logs/backups)
└── turbo.json        # Turborepo configuration
```

---

## 🚀 Getting Started

### 1. Prerequisites
- Node.js 18+
- Docker (for PostgreSQL) or a local Postgres instance
- Meta WhatsApp Cloud API credentials
- Anthropic API Key

### 2. Installation
```bash
# Clone the repository
git clone <your-repo>
cd emailbot

# Install dependencies
npm install

# Set up environment variables
cp .env.example .env
```

### 3. Database Setup
```bash
# Generate Prisma client
npm run generate -w @repo/db

# Push schema to database
cd packages/db
npx prisma db push
```

### 4. Running the Project
```bash
# Start all apps (api + web) in dev mode
npm run dev

# Build the entire monorepo
npm run build
```

---

## 📝 License
MIT
