<p align="center">
  <img src="apps/web/public/logo.svg" alt="Promptoria Logo" width="80" height="80" />
</p>

<h1 align="center">Promptoria</h1>

<p align="center">
  <strong>Generative UI Platform powered by Tambo</strong>
</p>

<p align="center">
  Build React interfaces through natural language.<br/>
  Describe what you want. Watch AI render it instantly.
</p>

<p align="center">
  <a href="#tambo-integration">Tambo Integration</a> •
  <a href="#features">Features</a> •
  <a href="#demo">Demo</a> •
  <a href="#quick-start">Quick Start</a>
</p>

<p align="center">
  <img src="https://img.shields.io/badge/Tambo-Generative_UI-cyan?style=flat-square" alt="Tambo" />
  <img src="https://img.shields.io/badge/Next.js-14-black?style=flat-square&logo=next.js" alt="Next.js" />
  <img src="https://img.shields.io/badge/React-18-61DAFB?style=flat-square&logo=react" alt="React" />
  <img src="https://img.shields.io/badge/TypeScript-5.3-blue?style=flat-square&logo=typescript" alt="TypeScript" />
  <img src="https://img.shields.io/badge/Hackathon-UI_Strikes_Back-purple?style=flat-square" alt="Hackathon" />
</p>

---

## The UI Strikes Back

> *"A long time ago in a galaxy far, far away... developers struggled with static UIs that couldn't adapt to their users."*

**Promptoria** is our submission for the [UI Strikes Back Hackathon](https://wemakedevs.org/events/ui-strikes-back) — a Generative UI platform that transforms natural language into fully functional React components.

**Team:** Promptoria
**Built with:** [Tambo SDK](https://tambo.co) for Generative UI

---

## Tambo Integration

Promptoria leverages **Tambo's Generative UI SDK** to create interfaces where the AI decides which components to render based on natural language conversations.

### How We Use Tambo

```typescript
// TamboProvider wraps the app with registered components
import { TamboProvider } from '@tambo-ai/react';
import { tamboComponents } from '@/lib/tambo-components';

<TamboProvider apiKey={apiKey} components={tamboComponents}>
  {children}
</TamboProvider>
```

### Registered Components (with Zod Schemas)

We've registered **5 fully customizable components** with Tambo:

| Component | Description | Use Case |
|-----------|-------------|----------|
| `LoginForm` | Authentication form with social login | Login pages, sign-in interfaces |
| `StatsCards` | Dashboard metrics with trends | Analytics, KPI dashboards |
| `DataTable` | Interactive table with search/sort | User lists, product catalogs |
| `PricingCards` | Pricing tiers with toggle | SaaS pricing, subscription plans |
| `Hero` | Landing page hero section | Product launches, marketing |

Each component has a **Zod schema** that Tambo uses to understand and generate the right props:

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

### Generative UI in Action

1. **User says:** "Create pricing cards for Basic at $9, Pro at $29, and Enterprise at $99"
2. **Tambo AI analyzes** the request and selects `PricingCards` component
3. **Props are generated** matching the Zod schema
4. **Component renders** instantly with the generated data

---

## Features

### AI-Powered UI Builder
Describe your UI in plain English, and Tambo generates the perfect component with the right props.

```
"Create a login form with email and password, blue theme"
→ Renders LoginForm with accentColor: 'blue'

"Show stats for revenue $45k up 20%, users 1.2k up 15%"
→ Renders StatsCards with trend data

"Create a data table showing name, email, and status columns"
→ Renders DataTable with sortable columns
```

### Agent-Specific Templates
Select from specialized AI agents that provide contextual quick prompts:
- **Deep Research** — Research dashboards, document viewers
- **Data Analyst** — Analytics dashboards, query results
- **DevOps Engineer** — System status, deployment panels

### Responsive Design
All components are built with responsive Tailwind CSS:
- Mobile-first with `flex-wrap` and `min-width` constraints
- Device preview modes (Desktop, Tablet, Mobile)
- Container-responsive layouts

### Real-Time Generation
- Live preview as you type
- Streaming responses from Tambo AI
- Chat history showing generated UIs

---

## Demo

### Quick Start Examples

Try these prompts in the Tambo Builder:

| Prompt | Result |
|--------|--------|
| "Create a modern login form with GitHub and Google" | Beautiful auth form |
| "Show me stats: Revenue $45k +20%, Users 1.2k +15%, Orders 340 -5%" | Dashboard cards |
| "Create pricing for Starter $0, Pro $29, Enterprise custom" | Pricing tiers |
| "Hero section for AI product launch with 'Get Started' button" | Landing page hero |
| "Data table with users: John Admin Active, Jane Editor Pending" | Interactive table |

---

## Quick Start

### Prerequisites

- Node.js >= 18
- pnpm >= 8.15
- [Tambo API Key](https://tambo.co) (required for Generative UI)

### Installation

```bash
# Clone the repository
git clone https://github.com/Pulkit7070/Opsuna.git
cd opsuna_tambo

# Install dependencies
pnpm install

# Set up environment variables
cp apps/web/.env.local.example apps/web/.env.local
# Add your NEXT_PUBLIC_TAMBO_API_KEY

# Start development server
pnpm dev
```

Visit **http://localhost:3000** → Click **Builder** → Start creating!

### Environment Variables

| Variable | Description | Required |
|----------|-------------|----------|
| `NEXT_PUBLIC_TAMBO_API_KEY` | Tambo API key from tambo.co | Yes |
| `NEXT_PUBLIC_API_URL` | Backend API URL | Optional |
| `NEXT_PUBLIC_WS_URL` | WebSocket URL | Optional |

---

## Project Structure

```
promptoria/
├── apps/
│   ├── web/                       # Next.js frontend
│   │   ├── src/
│   │   │   ├── app/
│   │   │   │   └── builder/       # Tambo Builder page
│   │   │   ├── components/
│   │   │   │   ├── builder/
│   │   │   │   │   ├── TamboBuilder.tsx    # Main Generative UI interface
│   │   │   │   │   └── blocks/             # Tambo-registered components
│   │   │   │   │       ├── LoginForm.tsx
│   │   │   │   │       ├── StatsCards.tsx
│   │   │   │   │       ├── DataTable.tsx
│   │   │   │   │       ├── PricingCards.tsx
│   │   │   │   │       └── Hero.tsx
│   │   │   │   └── TamboProvider.tsx       # Tambo SDK wrapper
│   │   │   └── lib/
│   │   │       └── tambo-components.ts     # Component + Zod schema registry
│   │   └── public/
│   └── server/                    # Express backend (optional features)
└── packages/
    └── shared/                    # Shared TypeScript types
```

---

## Key Implementation Files

### Tambo Provider (`TamboProvider.tsx`)
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

### Component Registry (`tambo-components.ts`)
```typescript
export const tamboComponents = [
  {
    name: 'LoginForm',
    description: 'A beautiful login form with email, password...',
    component: LoginForm,
    propsSchema: z.object({
      title: z.string().optional(),
      showSocialLogin: z.boolean().optional(),
      accentColor: z.enum(['violet', 'blue', 'emerald', 'rose']),
    }),
  },
  // ... more components
];
```

### Tambo Builder (`TamboBuilder.tsx`)
```typescript
const { thread } = useTamboThread();
const { value, setValue, submit, isPending } = useTamboThreadInput();

// AI generates components which appear in thread.messages
const lastMessage = thread?.messages?.[thread.messages.length - 1];
const generatedComponent = lastMessage?.renderedComponent;
```

---

## Technology Stack

| Layer | Technology |
|-------|------------|
| **Generative UI** | Tambo SDK (`@tambo-ai/react`) |
| **Frontend** | Next.js 14, React 18, TypeScript |
| **Styling** | Tailwind CSS, Framer Motion |
| **Validation** | Zod (for component schemas) |
| **State** | Zustand |
| **Icons** | Lucide React |

---

## Hackathon Submission

**Event:** [The UI Strikes Back](https://wemakedevs.org/events/ui-strikes-back)
**Team:** Promptoria
**Submitted by:** Pulkit Saraf

### What We Built
A Generative UI platform where users describe interfaces in natural language and Tambo AI renders the appropriate React components with the correct props.

### Tambo Features Used
- `TamboProvider` for component registration
- `useTamboThread` for conversation state
- `useTamboThreadInput` for input handling
- Zod schemas for type-safe prop generation
- Component selection based on natural language intent

### Learning & Growth
- First time using Generative UI SDK
- Learned how AI can select and configure React components
- Explored Zod schemas for AI-friendly component definitions

---

## License

MIT License — see [LICENSE](LICENSE) for details.

---

<p align="center">
  Built for <strong>The UI Strikes Back</strong> hackathon<br/>
  <sub>May the components be with you</sub>
</p>
