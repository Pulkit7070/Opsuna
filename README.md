# MCP Toolchain Composer

> **Safe Action UI** — A production-ready AI agent system with Claude-style MCP protocol

[![TypeScript](https://img.shields.io/badge/TypeScript-5.0-blue?logo=typescript)](https://www.typescriptlang.org/)
[![Next.js](https://img.shields.io/badge/Next.js-14-black?logo=next.js)](https://nextjs.org/)
[![Node.js](https://img.shields.io/badge/Node.js-20+-green?logo=node.js)](https://nodejs.org/)
[![License](https://img.shields.io/badge/License-MIT-yellow)](LICENSE)

---

## Overview

MCP Toolchain Composer is an **Action Composer UI** that transforms natural language into executable action chains with:

- **Intelligent Planning** - AI analyzes intent and generates execution plans
- **Safety Gates** - Preview, Approve, Execute workflow for risky actions
- **Real-time Streaming** - Live logs and status updates via WebSocket
- **First-class Rollback** - Automatic and manual rollback capabilities
- **Audit Trail** - Complete history of all executions

**This is NOT a chatbot** — it's a structured action orchestration system.

---

## Architecture

```
┌─────────────────────────────────────────────────────────────────┐
│                        Frontend (Next.js)                        │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ Tambo UI     │  │ State        │  │ WebSocket Client     │   │
│  │ Renderer     │  │ Manager      │  │ (Real-time Events)   │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
                              │
                              ▼
┌─────────────────────────────────────────────────────────────────┐
│                       Backend (Node/Express)                     │
│  ┌──────────────┐  ┌──────────────┐  ┌──────────────────────┐   │
│  │ API Routes   │  │ AI           │  │ Event Emitter        │   │
│  │              │  │ Orchestrator │  │ (SSE/WebSocket)      │   │
│  └──────────────┘  └──────────────┘  └──────────────────────┘   │
│                              │                                   │
│                    ┌─────────▼─────────┐                        │
│                    │   Tool Router     │                        │
│                    │  ┌─────┬─────┐   │                        │
│                    │  │Valid│Exec │   │                        │
│                    │  │ate  │ute  │   │                        │
│                    │  └─────┴─────┘   │                        │
│                    └──────────────────┘                        │
└─────────────────────────────────────────────────────────────────┘
                              │
         ┌────────────────────┼────────────────────┐
         ▼                    ▼                    ▼
┌──────────────┐     ┌──────────────┐     ┌──────────────┐
│   Database   │     │    Cache     │     │   Tools      │
│   (SQLite/   │     │   (Redis)    │     │   Registry   │
│   Postgres)  │     │              │     │              │
└──────────────┘     └──────────────┘     └──────────────┘
```

---

## Key Features

### MCP UI Protocol

Structured JSON messages from AI containing:

```json
{
  "intent": "Deploy to staging and validate",
  "risk_level": "HIGH",
  "plan": [
    { "step": 1, "action": "Deploy commit to staging", "tool": "deploy_staging" },
    { "step": 2, "action": "Run smoke tests", "tool": "run_smoke_tests" }
  ],
  "ui_blocks": ["ActionPreviewCard", "DangerZoneConfirm", "LiveLogsViewer"],
  "tool_calls": [...],
  "rollback_plan": [{ "action": "Revert to previous deployment" }],
  "success_criteria": ["Deployment successful", "All tests pass"]
}
```

### Dynamic Tambo UI Components

| Component | Purpose |
|-----------|---------|
| `ActionPreviewCard` | Display planned actions before execution |
| `ConfirmActionModal` | Standard approval for MEDIUM risk |
| `DangerZoneConfirm` | Type-to-confirm for HIGH risk |
| `LiveLogsViewer` | Real-time log streaming |
| `ProgressStepper` | Multi-step execution progress |
| `ParameterForm` | Dynamic input collection |
| `ToolResultSummary` | Execution results display |
| `RollbackPanel` | Rollback options and controls |

### Execution State Machine

```
IDLE → PLANNING → AWAITING_APPROVAL → EXECUTING → SUCCESS
                                   ↘ FAILED → ROLLING_BACK → ROLLED_BACK
```

---

## Tool Registry

| Tool | Parameters | Risk | Description |
|------|------------|------|-------------|
| `deploy_staging` | `env`, `commit_sha` | HIGH | Deploy to staging environment |
| `run_smoke_tests` | `env` | LOW | Execute smoke test suite |
| `create_github_pr` | `title`, `branch` | MEDIUM | Create pull request |
| `post_slack_message` | `channel`, `text` | LOW | Send Slack notification |
| `rollback_deploy` | `env`, `deployment_id` | HIGH | Revert deployment |

---

## Project Structure

```
mcp-toolchain-composer/
├── apps/
│   ├── web/                    # Next.js Frontend
│   │   ├── src/
│   │   │   ├── app/            # App Router
│   │   │   ├── components/     # UI Components
│   │   │   │   ├── tambo/      # Dynamic MCP Components
│   │   │   │   └── ui/         # Base Components
│   │   │   ├── hooks/          # React Hooks
│   │   │   ├── lib/            # Utilities
│   │   │   └── store/          # State Management
│   │   └── public/
│   │
│   └── server/                 # Node.js Backend
│       ├── src/
│       │   ├── routes/         # API Endpoints
│       │   ├── services/       # Business Logic
│       │   │   ├── ai/         # AI Orchestration
│       │   │   ├── tools/      # Tool Implementations
│       │   │   └── events/     # Event Streaming
│       │   ├── middleware/     # Auth, Rate Limiting
│       │   └── models/         # Database Models
│       └── prisma/             # Schema
│
├── packages/
│   └── shared/                 # Shared Types & Schemas
│       ├── types/
│       └── schemas/
│
└── docs/                       # Documentation
```

---

## Quick Start

### Prerequisites

- Node.js 20+
- pnpm 8+
- Docker (optional, for database)

### Installation

```bash
# Clone the repository
git clone https://github.com/your-org/mcp-toolchain-composer.git
cd mcp-toolchain-composer

# Install dependencies
pnpm install

# Setup environment
cp apps/web/.env.example apps/web/.env.local
cp apps/server/.env.example apps/server/.env

# Initialize database
pnpm db:push

# Start development servers
pnpm dev
```

### Access

- **Frontend**: http://localhost:3000
- **API**: http://localhost:4000
- **API Docs**: http://localhost:4000/docs

---

## Demo Scenarios

Try these pre-built prompts:

| Prompt | Risk | Actions |
|--------|------|---------|
| "Deploy staging and run smoke tests" | HIGH | deploy, test |
| "Create PR and notify Slack" | MEDIUM | PR, message |
| "Restart service safely" | HIGH | restart with approval |
| "Rollback latest deploy" | HIGH | find, rollback |
| "Generate release notes + post to Slack" | LOW | generate, post |

---

## Security & Guardrails

- Production deploys require admin role
- HIGH risk tools require explicit approval
- All tool calls visible in preview (no hidden actions)
- Schema validation prevents prompt injection
- Rate limiting per user/session
- Session-based authentication
- Complete audit trail

---

## Execution Flow

```
1. User Request      → Natural language input
2. AI Planning       → Generate structured plan + UI schema
3. Preview UI        → Render ActionPreviewCard
4. User Confirmation → ConfirmModal / DangerZoneConfirm
5. Tool Execution    → ToolRouter processes calls
6. Live Streaming    → Real-time logs via WebSocket
7. Result Display    → ToolResultSummary
8. Rollback Option   → RollbackPanel (on failure)
9. Audit Storage     → Persist execution history
```

---

## API Reference

### POST `/api/execute`

Execute an action plan.

```bash
curl -X POST http://localhost:4000/api/execute \
  -H "Content-Type: application/json" \
  -d '{"prompt": "Deploy staging and run tests"}'
```

### GET `/api/executions`

List execution history.

### GET `/api/executions/:id`

Get execution details.

### POST `/api/rollback/:executionId`

Trigger rollback.

### WebSocket `/ws/events`

Real-time event stream.

---

## Screenshots

> *Screenshots will be added after implementation*

- [ ] Main dashboard
- [ ] Action preview card
- [ ] Danger zone confirmation
- [ ] Live logs viewer
- [ ] Execution history
- [ ] Rollback panel

---

## Testing

```bash
# Run all tests
pnpm test

# Unit tests
pnpm test:unit

# E2E tests
pnpm test:e2e

# Coverage report
pnpm test:coverage
```

---

## License

MIT © 2024

---

## Acknowledgments

- Inspired by [Claude MCP Protocol](https://www.anthropic.com/)
- UI patterns from [Composio](https://composio.dev/)
- Built with [Tambo](https://tambo.dev/) components
