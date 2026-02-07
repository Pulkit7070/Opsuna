# Opsuna Tambo

AI-powered action orchestration platform. Transform natural language prompts into safe, reviewable execution plans with real-time monitoring, custom agents, semantic memory, and comprehensive audit trails.

## Features

- **Natural Language to Actions** - Describe what you want, get structured execution plans
- **Risk Assessment** - Every action previewed with LOW/MEDIUM/HIGH risk levels
- **Custom AI Agents** - Create agents with scoped tools and isolated memory
- **Semantic Memory** - AI learns from past executions using pgvector
- **Composio Integration** - Connect 100+ real tools (GitHub, Slack, etc.)
- **Real-time Updates** - WebSocket-based live execution monitoring
- **Shareable Reports** - Generate and share execution reports via public links
- **Production Security** - Rate limiting, intent tokens, input sanitization

## Tech Stack

| Layer | Technology |
|-------|------------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Zustand, Framer Motion |
| Backend | Express.js, Prisma, PostgreSQL (Supabase) |
| Auth | Supabase Auth (JWT, OAuth) |
| AI | Google Gemini API |
| Memory | pgvector for semantic search |
| Tools | Composio SDK for external integrations |
| Real-time | WebSocket (ws) |
| Monorepo | pnpm workspaces |

## Monorepo Structure

```
opsuna_tambo/
├── apps/
│   ├── web/              # Next.js 14 frontend
│   └── server/           # Express.js backend API
├── packages/
│   └── shared/           # Shared TypeScript types & Zod schemas
└── docs/                 # Documentation
```

## Prerequisites

- **Node.js** >= 18
- **pnpm** >= 8.15.0
- **Supabase Account** - [Create free account](https://supabase.com)
- **Google AI API Key** - [Get API key](https://makersuite.google.com/app/apikey)
- **Composio Account** (optional) - [Sign up](https://composio.dev) for real tool integrations

## Local Setup

### 1. Clone and Install

```bash
git clone https://github.com/Pulkit7070/Opsuna.git
cd opsuna_tambo
pnpm install
```

### 2. Supabase Project Setup

1. Go to [Supabase Dashboard](https://supabase.com/dashboard) and create a new project
2. Wait for the project to be ready
3. Go to **Settings > Database** and copy your database credentials
4. Go to **Settings > API** and copy your API keys

#### Enable pgvector Extension

In Supabase SQL Editor, run:

```sql
CREATE EXTENSION IF NOT EXISTS vector;
```

#### Create Storage Bucket (for artifacts)

1. Go to **Storage** in Supabase Dashboard
2. Click **New bucket**
3. Name it `execution-artifacts`
4. Set it as **Public** (or configure RLS policies)

### 3. Environment Variables

#### Server (`apps/server/.env`)

```bash
cp apps/server/.env.example apps/server/.env
```

Edit `apps/server/.env`:

```env
# Server
PORT=3001
NODE_ENV=development
CORS_ORIGIN=http://localhost:3000

# Database (Supabase PostgreSQL)
DATABASE_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:6543/postgres?pgbouncer=true"
DIRECT_URL="postgresql://postgres.[PROJECT-REF]:[PASSWORD]@aws-0-[REGION].pooler.supabase.com:5432/postgres"

# Supabase
SUPABASE_URL=https://[PROJECT-REF].supabase.co
SUPABASE_ANON_KEY=eyJ...
SUPABASE_SERVICE_ROLE_KEY=eyJ...

# AI
GEMINI_API_KEY=your_gemini_api_key

# Composio (optional - for real tool integrations)
COMPOSIO_API_KEY=your_composio_api_key
```

#### Web (`apps/web/.env.local`)

```bash
cp apps/web/.env.local.example apps/web/.env.local
```

Edit `apps/web/.env.local`:

```env
NEXT_PUBLIC_API_URL=http://localhost:3001
NEXT_PUBLIC_WS_URL=ws://localhost:3001
NEXT_PUBLIC_SUPABASE_URL=https://[PROJECT-REF].supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...
```

### 4. Database Setup

```bash
# Generate Prisma client
pnpm db:generate

# Push schema to database
pnpm db:push
```

After pushing, create the vector index in Supabase SQL Editor:

```sql
CREATE INDEX IF NOT EXISTS memory_embedding_idx
ON "Memory" USING ivfflat (embedding vector_cosine_ops)
WITH (lists = 100);
```

### 5. Start Development

```bash
pnpm dev
```

This starts both servers in parallel:
- **Frontend**: http://localhost:3000
- **Backend**: http://localhost:3001

### 6. Login

Visit http://localhost:3000/login to authenticate via Supabase Auth.

## Development Mode

If you don't have all the API keys configured, the app runs in **dev mode** with:
- Mock AI responses (no Gemini key needed)
- Mock user authentication
- Local tool execution only

Set `NODE_ENV=development` in `apps/server/.env` for dev mode fallbacks.

## Commands

### Root (all packages)

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start web & server in parallel |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm clean` | Clean build artifacts |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to database |
| `pnpm db:studio` | Open Prisma Studio GUI |

### Web (`apps/web`)

| Command | Description |
|---------|-------------|
| `pnpm --filter @opsuna/web dev` | Next.js dev server (port 3000) |
| `pnpm --filter @opsuna/web build` | Production build |
| `pnpm --filter @opsuna/web start` | Start production server |

### Server (`apps/server`)

| Command | Description |
|---------|-------------|
| `pnpm --filter @opsuna/server dev` | Express dev server (port 3001) |
| `pnpm --filter @opsuna/server build` | Compile TypeScript |
| `pnpm --filter @opsuna/server start` | Run compiled server |

## API Endpoints

### Executions

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/execute` | Generate execution plan from prompt |
| POST | `/api/confirm/:id` | Confirm & start execution |
| GET | `/api/executions` | List execution history |
| GET | `/api/executions/:id` | Get execution details |
| POST | `/api/rollback/:id` | Rollback a failed execution |

### Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/agents` | List all agents |
| POST | `/api/agents` | Create custom agent |
| GET | `/api/agents/:id` | Get agent details |
| PUT | `/api/agents/:id` | Update agent |
| DELETE | `/api/agents/:id` | Delete agent |

### Tools

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/tools` | List all available tools |
| GET | `/api/tools/composio/catalog` | Browse Composio tool catalog |
| POST | `/api/tools/composio/connect` | Connect external tool via OAuth |
| GET | `/api/tools/composio/connections` | List user's tool connections |

### Memory

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/memory/search` | Semantic search past executions |
| GET | `/api/memory/history` | Get conversation history |
| GET | `/api/memory/patterns` | Get tool usage patterns |

### Artifacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/api/executions/:id/artifacts` | List execution artifacts |
| GET | `/api/executions/:id/replay` | Get execution replay data |
| GET | `/api/executions/:id/report` | Get execution report |
| POST | `/api/executions/:id/share` | Create shareable report link |
| GET | `/api/shared/:token` | View shared report (public) |

### Other

| Method | Endpoint | Description |
|--------|----------|-------------|
| GET | `/health` | Health check |
| WS | `/ws?token=JWT` | WebSocket for real-time updates |

## Project Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│   Next.js Web   │────▶│  Express API    │────▶│   Supabase DB   │
│   (React UI)    │     │  (Business)     │     │  (PostgreSQL)   │
└─────────────────┘     └─────────────────┘     └─────────────────┘
        │                       │                       │
        │ WebSocket             │ Gemini AI             │ pgvector
        ▼                       ▼                       ▼
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Real-time      │     │  AI Orchestrator│     │  Semantic       │
│  Updates        │     │  + Agents       │     │  Memory         │
└─────────────────┘     └─────────────────┘     └─────────────────┘
                                │
                                ▼
                        ┌─────────────────┐
                        │  Composio Tools │
                        │  (GitHub, etc.) │
                        └─────────────────┘
```

## Troubleshooting

### "EPERM: operation not permitted" on Windows

Stop any running server before running `prisma generate`:

```bash
# Find and kill process on port 3001
netstat -ano | findstr :3001
taskkill /PID <PID> /F
```

### Database connection issues

1. Ensure your Supabase project is active (not paused)
2. Check that DATABASE_URL uses the pooler connection (port 6543)
3. Check that DIRECT_URL uses the direct connection (port 5432)

### WebSocket not connecting

1. Ensure the backend is running on port 3001
2. Check that `NEXT_PUBLIC_WS_URL` is set correctly
3. Verify JWT token is being passed in the URL

### Composio tools not showing

1. Ensure `COMPOSIO_API_KEY` is set in `apps/server/.env`
2. Tools require OAuth connection - click "Connect" in the Tools page

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

MIT
