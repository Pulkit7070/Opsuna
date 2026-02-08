<p align="center">
  <img src="apps/web/public/logo.svg" alt="Opsuna Logo" width="80" height="80" />
</p>

<h1 align="center">Opsuna</h1>

<p align="center">
  <strong>AI-Powered DevOps Automation Platform</strong>
</p>

<p align="center">
  Transform natural language into safe, reviewable, and reversible action chains.<br/>
  Every command previewed. Every action auditable. Every deployment stress-free.
</p>

<p align="center">
  <a href="https://docs.opsuna.dev">Documentation</a> •
  <a href="#features">Features</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a> •
  <a href="#api-reference">API Reference</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Next.js-16-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-PostgreSQL-green?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/AI-Gemini-yellow?style=flat-square&logo=google" alt="Gemini AI" />
  <img src="https://img.shields.io/badge/License-MIT-purple?style=flat-square" alt="MIT License" />
</p>

---

## Why Opsuna?

Modern DevOps teams spend countless hours on repetitive tasks: deploying services, running tests, managing pull requests, and coordinating notifications. These tasks are error-prone when done manually and often require context-switching between multiple tools.

**Opsuna solves this by:**

- **Reducing context switching** — One interface for all your DevOps tools
- **Preventing mistakes** — Every action is previewed before execution
- **Building confidence** — Full audit trails and instant rollbacks
- **Saving time** — Natural language commands instead of complex CLI scripts

---

## Features

### Natural Language to Actions
Describe what you want in plain English. Opsuna's AI understands your intent and generates a structured execution plan with risk assessments.

```
"Deploy the staging environment, run smoke tests, and notify the team on Slack"
```

### Safe Execution Model
Every action goes through a preview → confirm → execute pipeline:
- **Risk Assessment** — Actions are classified as LOW, MEDIUM, or HIGH risk
- **Intent Tokens** — Confirmations expire after 5 minutes to prevent stale approvals
- **Typed Confirmation** — High-risk actions require typing the action name to confirm

### Custom AI Agents
Create specialized agents for different workflows:
- **Deep Research** — Web search, data synthesis, and report generation
- **Data Analyst** — Query databases, generate visualizations, and analyze trends
- **DevOps Engineer** — Deployments, CI/CD, infrastructure management
- Build your own with custom tool sets and memory scopes

### Semantic Memory
Opsuna learns from your past executions using pgvector:
- Remembers successful patterns and common workflows
- Suggests relevant actions based on context
- Isolated memory scopes per agent for data separation

### Tool Ecosystem
Connect 300+ tools via Composio or use built-in integrations:
- **Version Control** — GitHub, GitLab, Bitbucket
- **Communication** — Slack, Discord, Email
- **Project Management** — Jira, Linear, Asana, Trello
- **Infrastructure** — AWS, GCP, Kubernetes
- **Monitoring** — Datadog, Sentry, PagerDuty

### Real-Time Monitoring
WebSocket-powered live updates show:
- Execution progress with step-by-step logs
- Tool outputs as they complete
- Error handling with recovery suggestions

### Audit & Compliance
Every execution is fully logged:
- User attribution and timestamps
- Input/output capture for each tool
- Shareable reports via public links
- IP address and user agent tracking

---

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15
- [Supabase](https://supabase.com) account (free tier works)
- [Google AI API Key](https://makersuite.google.com/app/apikey) for Gemini

### Installation

```bash
# Clone the repository
git clone https://github.com/Pulkit7070/Opsuna.git
cd opsuna_tambo

# Install dependencies
pnpm install

# Set up environment variables
cp apps/server/.env.example apps/server/.env
cp apps/web/.env.local.example apps/web/.env.local
# Edit both files with your credentials

# Initialize database
pnpm db:generate
pnpm db:push

# Start development servers
pnpm dev
```

Visit **http://localhost:3000** to get started.

### Environment Variables

#### Server (`apps/server/.env`)

| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase PostgreSQL connection (pooler) | Yes |
| `DIRECT_URL` | Supabase PostgreSQL direct connection | Yes |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |
| `SUPABASE_SERVICE_ROLE_KEY` | Supabase service role key | Yes |
| `GEMINI_API_KEY` | Google AI API key | Yes |
| `COMPOSIO_API_KEY` | Composio API key for external tools | No |

#### Web (`apps/web/.env.local`)

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anonymous key | Yes |

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────────────────┐
│                              OPSUNA PLATFORM                                 │
├─────────────────────────────────────────────────────────────────────────────┤
│                                                                             │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌────────────┐  │
│  │   Next.js   │───▶│   Express    │───▶│  Supabase   │    │  Composio  │  │
│  │   Frontend  │    │   Backend    │    │  PostgreSQL │    │   Tools    │  │
│  │             │◀───│              │◀───│  + pgvector │    │            │  │
│  └─────────────┘    └──────────────┘    └─────────────┘    └────────────┘  │
│        │                   │                   │                  │        │
│        │ WebSocket         │ Gemini AI         │ Embeddings       │ OAuth  │
│        ▼                   ▼                   ▼                  ▼        │
│  ┌─────────────┐    ┌──────────────┐    ┌─────────────┐    ┌────────────┐  │
│  │  Real-time  │    │     AI       │    │  Semantic   │    │  GitHub    │  │
│  │   Updates   │    │ Orchestrator │    │   Memory    │    │  Slack     │  │
│  │             │    │   + Agents   │    │             │    │  Jira ...  │  │
│  └─────────────┘    └──────────────┘    └─────────────┘    └────────────┘  │
│                                                                             │
└─────────────────────────────────────────────────────────────────────────────┘
```

### Technology Stack

| Layer | Technology |
|-------|------------|
| **Frontend** | Next.js 16, React 18, Tailwind CSS, Zustand, Framer Motion |
| **Backend** | Express.js, Prisma ORM, TypeScript |
| **Database** | PostgreSQL (Supabase) with pgvector |
| **Authentication** | Supabase Auth (JWT, OAuth providers) |
| **AI Engine** | Google Gemini API |
| **Memory** | pgvector for semantic similarity search |
| **Tools** | Composio SDK for 300+ integrations |
| **Real-time** | WebSocket (ws library) |
| **Monorepo** | pnpm workspaces |

### Project Structure

```
opsuna_tambo/
├── apps/
│   ├── web/                    # Next.js frontend application
│   │   ├── src/
│   │   │   ├── app/            # Next.js App Router pages
│   │   │   ├── components/     # React components
│   │   │   ├── hooks/          # Custom React hooks
│   │   │   ├── store/          # Zustand state management
│   │   │   └── lib/            # Utilities and helpers
│   │   └── public/             # Static assets
│   │
│   └── server/                 # Express.js backend API
│       ├── src/
│       │   ├── routes/         # API route handlers
│       │   ├── services/       # Business logic
│       │   │   ├── ai/         # AI orchestration
│       │   │   ├── tools/      # Tool implementations
│       │   │   ├── memory/     # Semantic memory
│       │   │   ├── agents/     # Agent management
│       │   │   └── artifacts/  # Execution artifacts
│       │   └── middleware/     # Express middleware
│       └── prisma/             # Database schema
│
└── packages/
    └── shared/                 # Shared TypeScript types & Zod schemas
```

---

## API Reference

### Executions

| Method | Endpoint | Description |
|--------|----------|-------------|
| `POST` | `/api/execute` | Generate execution plan from natural language |
| `POST` | `/api/confirm/:id` | Confirm and start execution |
| `GET` | `/api/executions` | List execution history |
| `GET` | `/api/executions/:id` | Get execution details |
| `POST` | `/api/rollback/:id` | Rollback a failed execution |

### Agents

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/agents` | List all agents (built-in + custom) |
| `POST` | `/api/agents` | Create custom agent |
| `GET` | `/api/agents/:id` | Get agent details |
| `PUT` | `/api/agents/:id` | Update agent |
| `DELETE` | `/api/agents/:id` | Delete custom agent |

### Tools

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/tools` | List all available tools |
| `GET` | `/api/tools/composio/catalog` | Browse Composio tool catalog |
| `POST` | `/api/tools/composio/connect` | Initiate OAuth connection |
| `GET` | `/api/tools/composio/connections` | List user's tool connections |

### Memory

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/memory/search` | Semantic search past executions |
| `GET` | `/api/memory/history` | Get conversation history |
| `GET` | `/api/memory/patterns` | Get tool usage patterns |

### Artifacts

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/executions/:id/artifacts` | List execution artifacts |
| `GET` | `/api/executions/:id/replay` | Get execution replay data |
| `GET` | `/api/executions/:id/report` | Generate execution report |
| `POST` | `/api/executions/:id/share` | Create shareable report link |
| `GET` | `/api/shared/:token` | View shared report (public) |

---

## Security

Opsuna is built with security as a core principle:

- **Per-user rate limiting** — 60 requests/minute by default
- **Intent tokens** — Confirmations expire after 5 minutes
- **Input sanitization** — HTML stripping, length limits on all inputs
- **Tool sandboxing** — 30-second timeout, 1MB output limits
- **Audit logging** — Every action logged with IP, user agent, and severity
- **Row-level security** — Supabase RLS ensures data isolation

---

## Development

### Commands

| Command | Description |
|---------|-------------|
| `pnpm dev` | Start all services in development mode |
| `pnpm build` | Build all packages for production |
| `pnpm lint` | Run ESLint across all packages |
| `pnpm db:generate` | Generate Prisma client |
| `pnpm db:push` | Push schema changes to database |
| `pnpm db:studio` | Open Prisma Studio GUI |

### Development Mode

Without API keys configured, Opsuna runs in **dev mode** with:
- Mock AI responses (no Gemini key needed)
- Mock user authentication
- Local tool execution only

---

## Roadmap

- [ ] **v0.2** — Workflow templates and scheduling
- [ ] **v0.3** — Team collaboration and shared workspaces
- [ ] **v0.4** — Custom tool builder (no-code)
- [ ] **v0.5** — Enterprise SSO and RBAC
- [ ] **v1.0** — Self-hosted and cloud versions

---

## Contributing

We welcome contributions! Please see our [Contributing Guide](CONTRIBUTING.md) for details.

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

---

## Support

- **Documentation** — [docs.opsuna.dev](https://docs.opsuna.dev)
- **Issues** — [GitHub Issues](https://github.com/Pulkit7070/Opsuna/issues)
- **Discussions** — [GitHub Discussions](https://github.com/Pulkit7070/Opsuna/discussions)

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built with care by the Opsuna team<br/>
  <sub>Making DevOps accessible through AI</sub>
</p>
