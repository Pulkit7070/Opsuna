# Opsuna Tambo

AI-powered action orchestration system. Type natural language prompts, get structured execution plans with risk assessment, real-time monitoring, and rollback support.

## Monorepo Structure

```
opsuna_tambo/
├── apps/
│   ├── web/          # Next.js 14 frontend
│   └── server/       # Express.js backend API
├── packages/
│   └── shared/       # Shared TypeScript types & Zod schemas
└── docs/             # Documentation
```

## Tech Stack

| Layer | Tech |
|-------|------|
| Frontend | Next.js 14, React 18, Tailwind CSS, Zustand, Framer Motion, Radix UI |
| Backend | Express.js, Prisma, SQLite, WebSocket (ws) |
| AI | Google Gemini API (with mock fallback) |
| Shared | TypeScript, Zod |
| Monorepo | pnpm workspaces |

## Prerequisites

- Node.js >= 18
- pnpm >= 8.15.0

## Getting Started

```bash
# 1. Install dependencies
pnpm install

# 2. Set up environment variables
cp apps/server/.env.example apps/server/.env
# Edit apps/server/.env and add your GEMINI_API_KEY (optional - mock mode works without it)

# 3. Generate Prisma client & push DB schema
pnpm db:generate && pnpm db:push

# 4. Start development servers (web + server in parallel)
pnpm dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:3001
- Prisma Studio: `pnpm db:studio`

## Commands

### Root (all packages)

| Command | Description |
|---------|-------------|
| `pnpm install` | Install all dependencies |
| `pnpm dev` | Start web & server in parallel |
| `pnpm build` | Build all packages |
| `pnpm lint` | Lint all packages |
| `pnpm test` | Run all tests |
| `pnpm clean` | Clean build artifacts |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema to SQLite |
| `pnpm db:studio` | Open Prisma Studio GUI |

### Web (`apps/web`)

| Command | Description |
|---------|-------------|
| `pnpm --filter @opsuna/web dev` | Next.js dev server (port 3000) |
| `pnpm --filter @opsuna/web build` | Production build |
| `pnpm --filter @opsuna/web start` | Start production server |
| `pnpm --filter @opsuna/web lint` | Lint frontend |

### Server (`apps/server`)

| Command | Description |
|---------|-------------|
| `pnpm --filter @opsuna/server dev` | Express dev server with hot reload (port 3001) |
| `pnpm --filter @opsuna/server build` | Compile TypeScript |
| `pnpm --filter @opsuna/server start` | Run compiled server |
| `pnpm --filter @opsuna/server db:generate` | Generate Prisma client |
| `pnpm --filter @opsuna/server db:push` | Push DB schema |
| `pnpm --filter @opsuna/server db:studio` | Open Prisma Studio |

## Environment Variables

Create `apps/server/.env` from the example:

```env
PORT=3001
NODE_ENV=development
DATABASE_URL="file:./dev.db"
GEMINI_API_KEY=your_api_key_here    # Optional - mock mode works without it
CORS_ORIGIN=http://localhost:3000
```

## API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| POST | `/api/execute` | Generate execution plan from prompt |
| POST | `/api/confirm` | Confirm & start execution |
| GET | `/api/executions` | List execution history |
| POST | `/api/rollback` | Rollback a failed execution |
| GET | `/health` | Health check |
| WS | `/ws` | WebSocket for real-time updates |

## License

MIT
