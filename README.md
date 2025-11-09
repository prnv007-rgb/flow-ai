# FlowAI - Intelligent Invoice Analytics Platform

A full-stack AI-powered invoice management and analytics platform built with **Turborepo**, featuring natural language queries powered by **Vanna AI** and **Groq LLaMA**, with full Docker support for local development.

[![Deployed on Vercel](https://img.shields.io/badge/Deployed%20on-Vercel-black)](https://vercel.com)
[![Powered by Render](https://img.shields.io/badge/AI%20on-Render-46E3B7)](https://render.com)
[![Docker](https://img.shields.io/badge/Docker-Ready-2496ED?logo=docker)](https://www.docker.com/)

## 🚀 Live Demo
- **FULL-STACK**: [FlowBit-AI](https://flow-ai-web-front.vercel.app/)

## 📋 Table of Contents

- [Features](#features)
- [Tech Stack](#tech-stack)
- [Architecture](#architecture)
- [Getting Started](#getting-started)
  - [Docker Setup (Recommended)](#docker-setup-recommended)
  - [Manual Setup](#manual-setup)
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
- 📥 **CSV Export** - Export invoice data to CSV format for external analysis
- 🐳 **Docker Support** - Complete containerized development environment

### AI Capabilities
- Natural language to SQL conversion using **Groq LLaMA 3.3 70B**
- Automatic query optimization
- Context-aware data insights
- Real-time data querying

### DevOps Features
- 🐳 Full Docker Compose setup for all services
- 🔄 Automated database migrations
- 🌱 Database seeding with sample data
- 📦 Multi-stage Docker builds for optimized images
- 🚀 Production-ready containerization

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
- **Database**: PostgreSQL

### AI Service (`services/vanna`)
- **Framework**: FastAPI (Python)
- **LLM**: Groq LLaMA 3.3 70B Versatile
- **Database Adapter**: psycopg[binary], SQLAlchemy
- **Data Processing**: Pandas

### Infrastructure
- **Monorepo**: Turborepo
- **Package Manager**: Bun
- **Containerization**: Docker & Docker Compose
- **Frontend/Backend Hosting**: Vercel
- **AI Service Hosting**: Render
- **Database**: PostgreSQL (Neon for production, local for dev)

## 🏗️ Architecture

```
┌─────────────────────────────────────────────┐
│           Docker Compose Stack              │
│                                             │
│  ┌─────────────────┐                       │
│  │   Next.js Web   │ :3000                 │
│  │     Frontend    │                       │
│  └────────┬────────┘                       │
│           │                                 │
│           │ REST API                        │
│           ▼                                 │
│  ┌─────────────────┐                       │
│  │   Express API   │ :3001                 │
│  │    (Bun/Node)   │                       │
│  └────┬────────┬───┘                       │
│       │        │                            │
│       │        └──────────┐                │
│       │                   │                │
│       ▼                   ▼                │
│  ┌─────────┐      ┌──────────────┐        │
│  │Postgres │      │  Vanna AI    │ :8000  │
│  │  :5432  │      │  (FastAPI)   │        │
│  └─────────┘      └──────┬───────┘        │
│                           │                 │
└───────────────────────────┼─────────────────┘
                            │
                            ▼
                     ┌──────────────┐
                     │  Groq LLM    │
                     │   API        │
                     └──────────────┘
```

## 🚀 Getting Started

### Docker Setup (Recommended)

The easiest way to run FlowAI is using Docker Compose, which sets up all services automatically.

#### Prerequisites
- **Docker** >= 20.10
- **Docker Compose** >= 2.0
- **Groq API Key** (Get one at [console.groq.com](https://console.groq.com))

#### Quick Start

1. **Clone the repository**
   ```bash
   git clone https://github.com/prnv007-rgb/flow-ai.git
   cd flow-ai
   ```

2. **Create environment file**
   ```bash
   # Copy the example env file
   cp .env.example .env
   
   # Edit .env and add your Groq API key
   GROQ_API_KEY=your_groq_api_key_here
   ```

3. **Start all services**
   ```bash
   docker-compose up -d
   ```

4. **Wait for services to be ready** (first run may take 2-3 minutes)
   ```bash
   docker-compose logs -f
   ```

5. **Access the application**
   - 🌐 **Frontend**: http://localhost:3000
   - 🔌 **API**: http://localhost:3001
   - 🤖 **Vanna AI**: http://localhost:8000
   - 🗄️ **Database**: localhost:5445

#### Docker Commands

```bash
# Start all services
docker-compose up -d

# Stop all services
docker-compose down

# View logs
docker-compose logs -f

# View logs for specific service
docker-compose logs -f web
docker-compose logs -f api
docker-compose logs -f vanna

# Rebuild containers
docker-compose build --no-cache

# Restart a specific service
docker-compose restart api

# Stop and remove all containers and volumes
docker-compose down -v
```

#### Database Management in Docker

```bash
# Connect to PostgreSQL
docker exec -it flowbit-db-1 psql -U flowbit_user -d flowbit_db

# Inside psql:
\dt                           # List tables
SELECT COUNT(*) FROM "Invoice";  # Check data
\q                            # Exit

# Run migrations manually
docker-compose exec api bunx prisma migrate deploy

# Re-seed database
docker-compose exec api bunx prisma db seed
```

### Manual Setup

If you prefer to run services locally without Docker:

#### Prerequisites
- **Bun** >= 1.2.0
- **Node.js** >= 20
- **Python** >= 3.10
- **PostgreSQL** >= 15

#### Installation Steps

1. **Clone the repository**
   ```bash
   git clone https://github.com/prnv007-rgb/flow-ai.git
   cd flow-ai
   ```

2. **Install dependencies**
   ```bash
   bun install
   ```

3. **Set up PostgreSQL database**
   ```bash
   # Create database
   createdb flowbit_db
   ```

4. **Configure environment variables**

   **Root `.env`**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/flowbit_db
   VANNA_BASE_URL=http://localhost:8000
   GROQ_API_KEY=your_groq_api_key
   ```

   **`apps/api/.env`**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/flowbit_db
   NODE_ENV=development
   PORT=3001
   VANNA_BASE_URL=http://localhost:8000
   ```

   **`apps/web/.env.local`**
   ```env
   NEXT_PUBLIC_API_URL=http://localhost:3001
   ```

   **`services/vanna/.env`**
   ```env
   DATABASE_URL=postgresql://user:password@localhost:5432/flowbit_db
   GROQ_API_KEY=your_groq_api_key
   PORT=8000
   ```

5. **Set up Prisma**
   ```bash
   cd apps/api
   bunx prisma generate
   bunx prisma migrate deploy
   bunx prisma db seed
   cd ../..
   ```

6. **Run all services**

   **Terminal 1 - API:**
   ```bash
   cd apps/api
   bun run dev
   ```

   **Terminal 2 - Frontend:**
   ```bash
   cd apps/web
   bun run dev
   ```

   **Terminal 3 - Vanna AI:**
   ```bash
   cd services/vanna
   pip install -r requirements.txt
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
│   │   ├── Dockerfile         # API Docker config
│   │   ├── package.json
│   │   └── tsconfig.json
│   │
│   └── web/                   # Next.js frontend
│       ├── app/               # App router pages
│       ├── components/        # React components
│       ├── lib/              # Utilities and API client
│       ├── Dockerfile        # Web Docker config
│       ├── package.json
│       └── tsconfig.json
│
├── services/
│   └── vanna/                # Vanna AI service
│       ├── main.py           # FastAPI application
│       ├── Dockerfile        # Vanna Docker config
│       └── requirements.txt
│
├── docker-compose.yml        # Docker Compose configuration
├── turbo.json               # Turborepo config
├── package.json             # Root package.json
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
| `/invoices/export` | GET | Export invoices to CSV |
| `/chat-with-data` | POST | AI-powered natural language queries |

### Example Requests

**Get Statistics**
```bash
curl http://localhost:3001/stats
```

**Export Invoices to CSV**
```bash
curl http://localhost:3001/invoices/export -o invoices.csv
```

**Chat with Data**
```bash
curl -X POST http://localhost:3001/chat-with-data \
  -H "Content-Type: application/json" \
  -d '{"question": "Show me total spending this year"}'
```

**PowerShell (Windows):**
```powershell
Invoke-RestMethod -Uri "http://localhost:3001/stats"

Invoke-RestMethod -Uri "http://localhost:8000/api/v1/generate_sql" `
  -Method POST `
  -ContentType "application/json" `
  -Body '{"question": "Show me the total amount of all invoices"}'
```

## 🚢 Deployment

### Production Deployment with Docker

#### Docker Hub
```bash
# Build and tag images
docker build -t yourusername/flowai-web:latest -f apps/web/Dockerfile .
docker build -t yourusername/flowai-api:latest -f apps/api/Dockerfile .
docker build -t yourusername/flowai-vanna:latest -f services/vanna/Dockerfile .

# Push to Docker Hub
docker push yourusername/flowai-web:latest
docker push yourusername/flowai-api:latest
docker push yourusername/flowai-vanna:latest
```

#### Deploy to Cloud Platforms

**AWS ECS / Azure Container Instances / Google Cloud Run:**
- Use the production docker-compose.yml
- Set up managed PostgreSQL (RDS/Azure DB/Cloud SQL)
- Configure environment variables
- Deploy containers

### Backend API (Vercel)

1. Create a new Vercel project
2. Set **Root Directory** to `apps/api`
3. Set **Framework Preset** to `Other`
4. Add environment variables:
   - `DATABASE_URL`
   - `VANNA_BASE_URL`
   - `NODE_ENV=production`
5. Deploy!

### Frontend (Vercel)

1. Create a new Vercel project
2. Set **Root Directory** to `apps/web`
3. Set **Framework Preset** to `Next.js`
4. Add environment variables:
   - `NEXT_PUBLIC_API_URL=https://your-backend.vercel.app`
5. Deploy!

### Vanna AI Service (Render)

1. Create a new **Web Service** on Render
2. Connect your repository
3. Set **Root Directory** to `services/vanna`
4. Build Command: `pip install -r requirements.txt`
5. Start Command: `uvicorn main:app --host 0.0.0.0 --port $PORT`
6. Add environment variables:
   - `DATABASE_URL`
   - `GROQ_API_KEY`
7. Deploy!

## 🔐 Environment Variables

### Docker Compose (.env)
```env
# Database
POSTGRES_DB=flowbit_db
POSTGRES_USER=flowbit_user
POSTGRES_PASSWORD=flowbit_password

# Groq AI
GROQ_API_KEY=your_groq_api_key_here

# Service URLs (auto-configured in Docker)
DATABASE_URL=postgresql://flowbit_user:flowbit_password@db:5432/flowbit_db
VANNA_API_BASE_URL=http://vanna:8000
```

### Production Environment

**Backend API**
```env
DATABASE_URL=postgresql://...
VANNA_BASE_URL=https://your-vanna-service.onrender.com
NODE_ENV=production
```

**Frontend**
```env
NEXT_PUBLIC_API_URL=https://your-backend.vercel.app
```

**Vanna AI Service**
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
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt
}

model Invoice {
  id            String     @id @default(uuid())
  invoiceNumber String     @unique
  date          DateTime
  amount        Float
  status        String
  customerName  String?
  vendorId      String
  vendor        Vendor     @relation(fields: [vendorId], references: [id])
  lineItems     LineItem[]
  payment       Payment?
  createdAt     DateTime   @default(now())
  updatedAt     DateTime   @updatedAt
}

model LineItem {
  id          String   @id @default(uuid())
  description String
  quantity    Float
  unitPrice   Float
  totalPrice  Float
  category    String?
  invoiceId   String
  invoice     Invoice  @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  createdAt   DateTime @default(now())
  updatedAt   DateTime @updatedAt
}

model Payment {
  id        String    @id @default(uuid())
  date      DateTime?
  amount    Float
  invoiceId String    @unique
  invoice   Invoice   @relation(fields: [invoiceId], references: [id], onDelete: Cascade)
  createdAt DateTime  @default(now())
  updatedAt DateTime  @updatedAt
}
```

## 🧪 Testing

### Test Docker Services

```bash
# Check all containers are running
docker-compose ps

# Test API health
curl http://localhost:3001

# Test Vanna AI
curl http://localhost:8000

# Test database connection
docker exec -it flowbit-db-1 psql -U flowbit_user -d flowbit_db

# Run tests (if implemented)
docker-compose exec api bun test
docker-compose exec web bun test
```

## 🐛 Troubleshooting

### Docker Issues

**Services won't start:**
```bash
# Check logs
docker-compose logs -f

# Rebuild without cache
docker-compose build --no-cache
docker-compose up -d
```

**Database connection issues:**
```bash
# Check if database is healthy
docker-compose ps

# Restart database
docker-compose restart db

# Reset database (⚠️ destroys data)
docker-compose down -v
docker-compose up -d
```

**Port conflicts:**
```bash
# Check what's using the ports
# Windows:
netstat -ano | findstr :3000
netstat -ano | findstr :3001

# Mac/Linux:
lsof -i :3000
lsof -i :3001

# Change ports in docker-compose.yml if needed
```

## 🤝 Contributing

Contributions are welcome! Please follow these steps:

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request
- **DEMO VIDEO FOR LOCAL DEPLOYMENT AFTER CLONING**:https://drive.google.com/file/d/1hZR-PYeELMkDnSYQYSC6VXsaESjAXCR2/view?usp=sharing 

### Development Guidelines

- Follow the existing code style
- Add tests for new features
- Update documentation as needed
- Ensure Docker builds succeed
- Test locally before submitting PR

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
- [Docker](https://docker.com) for containerization
- [Turborepo](https://turbo.build) for monorepo management

## 📞 Support

For support:
- 📧 Email: your-email@example.com
- 🐛 Issues: [GitHub Issues](https://github.com/prnv007-rgb/flow-ai/issues)
- 💬 Discussions: [GitHub Discussions](https://github.com/prnv007-rgb/flow-ai/discussions)

## 🗺️ Roadmap

- [ ] Add authentication and user management
- [ ] Implement invoice upload functionality
- [ ] Add more export formats (Excel, PDF)
- [ ] Create mobile app version
- [ ] Add email notifications
- [ ] Implement invoice approval workflows
- [ ] Add multi-language support
- [ ] Create dashboard customization options

---

**Built with ❤️ using Turborepo, Next.js, Docker, and AI**

⭐ Star this repo if you find it useful!
