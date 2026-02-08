<p align="center">
  <img src="apps/web/public/logo.svg" alt="Promptoria Logo" width="80" height="80" />
</p>

<h1 align="center">Promptoria</h1>

<p align="center">
  <strong>Generative UI Platform powered by Tambo</strong>
</p>

<p align="center">
  Build React interfaces and automate workflows through natural language.<br/>
  Describe what you want. Watch AI render it instantly.
</p>

<p align="center">
  <a href="#tambo-integration">Tambo Integration</a> •
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#quick-start">Quick Start</a> •
  <a href="#architecture">Architecture</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tambo-Generative_UI-cyan?style=flat-square" alt="Tambo" />
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Supabase-Auth_&_DB-3ECF8E?style=flat-square&logo=supabase" alt="Supabase" />
  <img src="https://img.shields.io/badge/Hackathon-UI_Strikes_Back-purple?style=flat-square" alt="Hackathon" />
</p>

---

## The UI Strikes Back

> *"A long time ago in a galaxy far, far away... developers struggled with static UIs that couldn't adapt to their users."*

**Promptoria** is our submission for the [UI Strikes Back Hackathon](https://wemakedevs.org/events/ui-strikes-back) — a Generative UI platform that combines **Tambo SDK** for dynamic component rendering with **AI-powered workflow automation**.

**Team:** Promptoria
**Built with:** [Tambo SDK](https://tambo.co) for Generative UI

---

## Tambo Integration

Promptoria leverages **Tambo's Generative UI SDK** as its core engine. The AI analyzes natural language and dynamically renders React components with the right props.

### How We Use Tambo

```typescript
// TamboProvider wraps the app with registered components
import { TamboProvider } from '@tambo-ai/react';
import { tamboComponents } from '@/lib/tambo-components';

<TamboProvider apiKey={apiKey} components={tamboComponents}>
  {children}
</TamboProvider>
```

### 8 Registered UI Components (with Zod Schemas)

| Component | Description | Use Case |
|-----------|-------------|----------|
| `LoginForm` | Authentication form with social login | Login pages, sign-in interfaces |
| `StatsCards` | Dashboard metrics with trend indicators | Analytics, KPI dashboards |
| `DataTable` | Interactive table with search/pagination | User lists, product catalogs |
| `PricingCards` | Pricing tiers with monthly/yearly toggle | SaaS pricing, subscriptions |
| `Hero` | Landing page hero with badges & CTAs | Product launches, marketing |
| `Testimonials` | Customer quotes with ratings & avatars | Social proof sections |
| `FeaturesGrid` | Feature showcase with icons | Product features, capabilities |
| `ContactForm` | Customizable lead capture forms | Contact pages, inquiries |

Each component uses **Zod schemas** for type-safe AI generation:

```typescript
{
  name: 'PricingCards',
  description: 'Pricing tier cards with monthly/yearly toggle...',
  component: PricingCards,
  propsSchema: z.object({
    plans: z.array(z.object({
      name: z.string(),
      monthlyPrice: z.number(),
      features: z.array(z.string()),
      popular: z.boolean().optional(),
    })),
    accentColor: z.enum(['violet', 'blue', 'emerald', 'rose']),
  }),
}
```

### Tambo Hooks Used

- `useTamboThread()` — Manages conversation state and generated components
- `useTamboThreadInput()` — Handles user input with pending states
- `defineTool()` — 9 custom tools connecting Tambo to our backend APIs

### Generative UI in Action

1. **User says:** "Create pricing cards for Basic at $9, Pro at $29, and Enterprise at $99"
2. **Tambo AI analyzes** the request and selects `PricingCards` component
3. **Props are generated** matching the Zod schema
4. **Component renders** instantly with the generated data

---

## Features

### Generative UI Builder
Describe your UI in plain English, and Tambo generates the perfect component:

```
"Create a login form with email and password, blue theme"
→ Renders LoginForm with accentColor: 'blue'

"Show stats for revenue $45k up 20%, users 1.2k up 15%"
→ Renders StatsCards with trend data

"Build a testimonials section with 3 customer reviews"
→ Renders Testimonials with ratings and avatars
```

### AI Agents
Three specialized agents with scoped tools and memory:

| Agent | Specialty | Quick Prompts |
|-------|-----------|---------------|
| **Deep Research** | Research & analysis | Document viewers, research dashboards |
| **Data Analyst** | Data visualization | Charts, query results, analytics |
| **DevOps Engineer** | Infrastructure | System status, deployment panels |

### Semantic Memory
- **pgvector embeddings** for semantic search across conversations
- AI remembers past executions and learns from context
- Memory-enhanced prompts for better responses

### 800+ Tool Integrations
Connect to external services via **Composio**:
- GitHub, Slack, Jira, Linear
- Google Workspace, Notion, Airtable
- And 800+ more via OAuth

### Artifacts & Reports
- **Auto-generated execution reports** in Markdown
- **Shareable public links** for team collaboration
- **Execution replay** to review step-by-step actions

### Production Security
- **Intent tokens** with 5-minute expiry
- **Per-user rate limiting** (60 req/min)
- **Input sanitization** and output limits
- **Sandboxed tool execution** with 30s timeout

### Real-Time Updates
- **WebSocket streaming** for live execution status
- Device preview modes (Desktop, Tablet, Mobile)
- Smooth Framer Motion animations

---

## Demo

### Try These Prompts

| Prompt | Result |
|--------|--------|
| "Create a modern login form with GitHub and Google" | Beautiful auth form with social buttons |
| "Show me stats: Revenue $45k +20%, Users 1.2k +15%" | Dashboard cards with trend arrows |
| "Create pricing for Starter $0, Pro $29, Enterprise custom" | Pricing tiers with feature lists |
| "Hero section for AI product launch with 'Get Started' button" | Landing page hero with badges |
| "Data table with users: John Admin Active, Jane Editor Pending" | Interactive sortable table |
| "Testimonials from 3 happy customers with 5-star ratings" | Customer quotes with avatars |
| "Features grid showing Speed, Security, and Scalability" | Icon-based feature showcase |

---

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15
- [Tambo API Key](https://tambo.co) (required)
- [Supabase Project](https://supabase.com) (for auth & database)

### Installation

```bash
# Clone the repository
git clone https://github.com/Pulkit7070/Opsuna.git
cd opsuna_tambo

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.local.example apps/web/.env.local
cp apps/server/.env.example apps/server/.env
# Add your API keys

# Start development server
pnpm dev
```

Visit **http://localhost:3000** → Click **Builder** → Start creating!

### Environment Variables

#### Frontend (`apps/web/.env.local`)
| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_TAMBO_API_KEY` | Tambo API key from tambo.co | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Yes |
| `NEXT_PUBLIC_SUPABASE_URL` | Supabase project URL | Yes |
| `NEXT_PUBLIC_SUPABASE_ANON_KEY` | Supabase anon key | Yes |

#### Backend (`apps/server/.env`)
| Variable | Description | Required |
|----------|-------------|----------|
| `DATABASE_URL` | Supabase PostgreSQL connection | Yes |
| `GEMINI_API_KEY` | Google Gemini API key | Yes |
| `COMPOSIO_API_KEY` | Composio for tool integrations | Optional |
| `SUPABASE_URL` | Supabase project URL | Yes |
| `SUPABASE_KEY` | Supabase service role key | Yes |

---

## Architecture

```
promptoria/
├── apps/
│   ├── web/                          # Next.js 14 Frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   ├── builder/          # Tambo Generative UI Builder
│   │   │   │   ├── chat/             # Conversational interface
│   │   │   │   ├── agents/           # Agent gallery & creation
│   │   │   │   ├── tools/            # Tool catalog & connections
│   │   │   │   ├── executions/       # Execution history & replay
│   │   │   │   └── docs/             # Documentation pages
│   │   │   ├── components/
│   │   │   │   ├── builder/
│   │   │   │   │   ├── TamboBuilder.tsx    # Main Generative UI
│   │   │   │   │   └── blocks/             # 8 Tambo components
│   │   │   │   └── TamboProvider.tsx       # SDK wrapper
│   │   │   └── lib/
│   │   │       ├── tambo-components.ts     # Component registry
│   │   │       └── tambo/tools.ts          # 9 backend tools
│   │   └── public/
│   │
│   └── server/                       # Express Backend
│       ├── src/
│       │   ├── routes/               # API endpoints
│       │   ├── services/
│       │   │   ├── ai/               # Gemini orchestration
│       │   │   ├── agents/           # Agent system
│       │   │   ├── memory/           # Semantic memory
│       │   │   ├── tools/            # Tool registry + Composio
│       │   │   └── artifacts/        # Reports & storage
│       │   └── middleware/           # Auth, rate limit, security
│       └── prisma/                   # Database schema
│
└── packages/
    └── shared/                       # Shared TypeScript types
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Generative UI** | Tambo SDK (`@tambo-ai/react` v0.74.1) |
| **Frontend** | Next.js 14, React 18, TypeScript 5.3 |
| **Styling** | Tailwind CSS 3.4, Framer Motion 12 |
| **Validation** | Zod (component schemas) |
| **State** | Zustand |
| **Backend** | Express 4.18, Node.js |
| **Database** | PostgreSQL (Supabase), Prisma ORM |
| **Auth** | Supabase Auth (OAuth, JWT) |
| **AI** | Google Gemini, pgvector embeddings |
| **Integrations** | Composio (800+ tools) |
| **Charts** | Recharts |
| **Diagrams** | Mermaid |
| **Real-time** | WebSocket (ws) |

---

## Key Implementation

### TamboProvider Setup
```typescript
export function TamboWrapper({ children }: TamboWrapperProps) {
  return (
    <TamboProvider
      apiKey={process.env.NEXT_PUBLIC_TAMBO_API_KEY}
      components={tamboComponents}
    >
      {children}
    </TamboProvider>
  );
}
```

### Component Registry
```typescript
export const tamboComponents = [
  {
    name: 'LoginForm',
    description: 'Authentication form with email, password, social login...',
    component: LoginForm,
    propsSchema: z.object({
      title: z.string().optional(),
      showSocialLogin: z.boolean().optional(),
      accentColor: z.enum(['violet', 'blue', 'emerald', 'rose']),
    }),
  },
  // ... 7 more components
];
```

### Tambo Builder
```typescript
const { thread } = useTamboThread();
const { value, setValue, submit, isPending } = useTamboThreadInput();

// AI generates components which appear in thread.messages
const lastMessage = thread?.messages?.[thread.messages.length - 1];
const generatedComponent = lastMessage?.renderedComponent;
```

---

## Hackathon Submission

**Event:** [The UI Strikes Back](https://wemakedevs.org/events/ui-strikes-back)
**Team:** Promptoria
**Submitted by:** Pulkit Saraf

### What We Built
A Generative UI platform where users describe interfaces in natural language and Tambo AI renders the appropriate React components. Beyond UI generation, we integrated:
- AI workflow orchestration with Gemini
- 3 specialized agents with scoped memory
- 800+ tool integrations via Composio
- Production-ready security and real-time updates

### Tambo Features Used
- `TamboProvider` for component registration
- `useTamboThread` for conversation state
- `useTamboThreadInput` for input handling
- `defineTool` for backend API integration
- Zod schemas for type-safe prop generation
- Component selection based on natural language intent

### Learning & Growth
- First time using Generative UI SDK
- Learned how AI can select and configure React components dynamically
- Explored Zod schemas for AI-friendly component definitions
- Integrated real-time WebSocket updates for execution streaming
- Built production security from day one

---

## Documentation

Visit `/docs` in the app for comprehensive guides:
- [Installation](/docs/installation) — Get started in 5 minutes
- [Architecture](/docs/architecture) — How Tambo and Promptoria work together
- [Agents](/docs/agents) — Create specialized AI agents
- [Tools](/docs/tools) — Connect 800+ integrations
- [API Reference](/docs/api) — Backend endpoints

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built for <strong>The UI Strikes Back</strong> hackathon<br/>
  <sub>May the components be with you</sub>
</p>
