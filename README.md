# FlowAI - Intelligent Invoice Analytics Platform

A full-stack AI-powered invoice management and analytics platform built with **Turborepo**, featuring natural language queries powered by **Vanna AI** and **Groq LLaMA**.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
[![Powered by Render](https://img.shields.io/badge/AI%20on-Render-46E3B7)](https://render.com)

## 🚀 Live Demo

- **Frontend**: [https://your-frontend.vercel.app](https://your-frontend.vercel.app)
- **Backend API**: [https://flow-ai-backend-theta.vercel.app](https://flow-ai-backend-theta.vercel.app)
- **Vanna AI Service**: [https://flow-ai-0mfx.onrender.com](https://flow-ai-0mfx.onrender.com)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
- [Project Structure](#project-structure)
- [API Endpoints](#api-endpoints)
- [Deployment](#deployment)
- [Environment Variables](#environment-variables)
- [Contributing](#contributing)

## ✨ Features

### Core Functionality
- 📊 **Real-time Analytics Dashboard** - View spending trends, top vendors, and category breakdowns
- 🤖 **AI-Powered Chat** - Ask questions in natural language about your invoice data
- 📈 **Invoice Trends Analysis** - Monthly spending patterns and volume tracking
- 💰 **Cash Flow Monitoring** - Track daily cash outflows
- 🔍 **Invoice Search** - Find invoices by number or vendor name
- 📑 **Vendor Management** - Track top 10 vendors by spending

### AI Capabilities
- Natural language to SQL conversion using **Groq LLaMA 3.3 70B**
- Automatic query optimization
- Context-aware data insights

## 🛠️ Tech Stack

### Frontend (`apps/web`)
- **Framework**: Next.js 15 with App Router
- **Language**: TypeScript
- **Styling**: Tailwind CSS
- **UI Components**: Shadcn/ui
- **Charts**: Recharts
- **State Management**: React Hooks

### Backend API (`apps/api`)
- **Runtime**: Bun
- **Framework**: Express.js
- **Language**: TypeScript
- **Database ORM**: Prisma
- **Database**: PostgreSQL (Neon)

### AI Service (Vanna AI)
- **Framework**: FastAPI (Python)
- **LLM**: Groq LLaMA 3.3 70B Versatile
- **Database Adapter**: psycopg2, SQLAlchemy
- **Data Processing**: Pandas

### Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: Bun
- **Frontend/Backend Hosting**: Vercel
- **AI Service Hosting**: Render
- **Database**: Neon PostgreSQL

## 🏗️ Architecture

```
┌─────────────────┐
│   Next.js Web   │ (Vercel)
│     Frontend    │
└────────┬────────┘
         │
         │ REST API
         ▼
┌─────────────────┐
│   Express API   │ (Vercel)
│    (Node.js)    │
└────┬────────┬───┘
     │        │
     │        └──────────┐
     │                   │
     ▼                   ▼
┌─────────┐      ┌──────────────┐
│  Neon   │      │  Vanna AI    │ (Render)
│Postgres │      │  (FastAPI)   │
└─────────┘      └──────┬───────┘
                        │
                        ▼
                 ┌──────────────┐
                 │  Groq LLM    │
                 │   API        │
                 └──────────────┘
```

## 🚀 Getting Started

### Prerequisites

- **Bun** >= 1.2.0
- **Node.js** >= 18
- **Python** >= 3.10 (for Vanna AI service)
- **PostgreSQL** database (or Neon account)

### Installation

1. **Clone the repository**
   ```bash
   git clone https://github.com/prnv007-rgb/flow-ai.git
   cd flow-ai
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up environment variables**

   Create `.env` files in the respective directories:

   **Root `.env`** (for Turbo)
   ```env
   DATABASE_URL=your_database_url
   VANNA_BASE_URL=http://localhost:8000
   GROQ_API_KEY=your_groq_api_key
   ```

   **`apps/api/.env`**
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   NODE_ENV=development
   PORT=3001
   VANNA_BASE_URL=http://localhost:8000
   ```

   **`apps/web/.env.local`**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

   **Vanna AI Service `.env`**
   ```env
   DATABASE_URL=postgresql://user:password@host:5432/dbname
   GROQ_API_KEY=your_groq_api_key
   PORT=8000
   ```

4. **Generate Prisma Client**
   ```bash
   cd apps/api
   bunx prisma generate
   bunx prisma db push
   ```

5. **Seed the database (optional)**
   ```bash
   bun run seed
   ```

### Running Locally

**Option 1: Run all services with Turbo**
```bash
bun run dev
```

**Option 2: Run services individually**

Terminal 1 (API):
```bash
cd apps/api
bun run dev
```

Terminal 2 (Frontend):
```bash
cd apps/web
bun run dev
```

Terminal 3 (Vanna AI):
```bash
cd vanna-service  # Your Vanna AI directory
python main.py
```

Visit:
- Frontend: http://localhost:3000
- API: http://localhost:3001
- Vanna AI: http://localhost:8000

## 📁 Project Structure

```
flow-ai/
├── apps/
│   ├── api/                    # Express backend
│   │   ├── src/
│   │   │   └── index.ts       # Main API routes
│   │   ├── prisma/
│   │   │   ├── schema.prisma  # Database schema
│   │   │   └── seed.ts        # Seed data
│   │   ├── package.json
│   │   ├── tsconfig.json
│   │   └── vercel.json        # Vercel config
│   │
│   └── web/                   # Next.js frontend
│       ├── app/               # App router pages
│       ├── components/        # React components
│       ├── lib/              # Utilities and API client
│       ├── package.json
│       ├── tsconfig.json
│       └── vercel.json       # Vercel config
│
├── packages/                  # Shared packages (if any)
├── turbo.json                # Turborepo config
├── package.json              # Root package.json
└── README.md
```

## 🔌 API Endpoints

### Core Endpoints

| Endpoint | Method | Description |
|----------|--------|-------------|
| `/` | GET | API health and info |
| `/stats` | GET | Get overview statistics |
| `/invoice-trends` | GET | Monthly invoice trends |
| `/vendors/top10` | GET | Top 10 vendors by spending |
| `/category-spend` | GET | Spending by category |
| `/cash-outflow` | GET | Daily cash outflow data |
| `/invoices` | GET | List all invoices (supports search) |
| `/chat-with-data` | POST | AI-powered natural language queries |

### Example Requests

**Get Statistics**
```bash
curl https://flow-ai-backend-theta.vercel.app/stats
```

**Chat with Data**
```bash
curl -X POST https://flow-ai-backend-theta.vercel.app/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"question": "Show me total spending this year"}'
```

## 🚢 Deployment

### Backend API (Vercel)

1. Create a new Vercel project
2. Set **Root Directory** to `apps/api`
3. Set **Framework Preset** to `Other`
4. Add environment variables:
   - `DATABASE_URL`
   - `VANNA_BASE_URL`
   - `NODE_ENV=production`
5. Deploy!

**`apps/api/vercel.json`:**
```json
{
  "$schema": "https://vercel.com/schema.json",
  "version": 2,
  "buildCommand": "cd ../.. && bun install && bunx turbo run build --filter=api",
  "outputDirectory": "dist",
  "installCommand": "cd ../.. && bun install",
  "builds": [
    {
      "src": "dist/index.js",
      "use": "@vercel/node"
    }
  ],
  "routes": [
    {
      "src": "/(.*)",
      "dest": "dist/index.js"
    }
  ]
}
```

### Frontend (Vercel)

1. Create a new Vercel project
2. Set **Root Directory** to `apps/web`
3. Set **Framework Preset** to `Next.js`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend.vercel.app`
5. Deploy!

**`apps/web/vercel.json`:**
```json
{
  "$schema": "https://vercel.com/schema.json",
  "buildCommand": "cd ../.. && bun install --filter=web && bunx turbo run build --filter=web",
  "installCommand": "cd ../.. && bun install --filter=web"
}
```

### Vanna AI Service (Render)

1. Create a new **Web Service** on Render
2. Connect your repository
3. Set **Root Directory** to your Vanna AI folder
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `python main.py`
6. Add environment variables:
   - `DATABASE_URL`
   - `GROQ_API_KEY`
   - `PORT=8000`
7. Deploy!

## 🔐 Environment Variables

### Backend API
```env
DATABASE_URL=postgresql://...
VANNA_BASE_URL=https://your-vanna-service.onrender.com
NODE_ENV=production
```

### Frontend
```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

### Vanna AI Service
```env
DATABASE_URL=postgresql://...
GROQ_API_KEY=gsk_...
PORT=8000
```

## 🗃️ Database Schema

```prisma
model Vendor {
  id       String    @id @default(uuid())
  name     String
  invoices Invoice[]
}

model Invoice {
  id            String     @id @default(uuid())
  invoiceNumber String
  date          DateTime
  amount        Float
  status        String
  customerName  String?
  vendorId      String
  vendor        Vendor     @relation(fields: [vendorId], references: [id])
  lineItems     LineItem[]
  payment       Payment?
}

model LineItem {
  id         String   @id @default(uuid())
  description String
  quantity   Float
  unitPrice  Float
  totalPrice Float
  category   String?
  invoiceId  String
  invoice    Invoice  @relation(fields: [invoiceId], references: [id])
}

model Payment {
  id        String    @id @default(uuid())
  date      DateTime?
  amount    Float
  invoiceId String    @unique
  invoice   Invoice   @relation(fields: [invoiceId], references: [id])
}
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## 📝 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 👥 Authors

- **Pranav** - [@prnv007-rgb](https://github.com/prnv007-rgb)

## 🙏 Acknowledgments

- [Vercel](https://vercel.com) for hosting
- [Render](https://render.com) for AI service hosting
- [Neon](https://neon.tech) for PostgreSQL database
- [Groq](https://groq.com) for LLM API
- [Vanna AI](https://vanna.ai) for SQL generation framework

## 📞 Support

For support, email your-email@example.com or open an issue in the repository.

---

**Built with ❤️ using Turborepo, Next.js, and AI**
