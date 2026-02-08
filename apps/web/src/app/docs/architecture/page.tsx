'use client';

import { motion } from 'framer-motion';

const fadeInUp = {
  initial: { opacity: 0, y: 20 },
  animate: { opacity: 1, y: 0 },
  transition: { duration: 0.5 }
};

function ArchitectureBox({
  children,
  className = '',
  glowing = false,
  delay = 0
}: {
  children: React.ReactNode;
  className?: string;
  glowing?: boolean;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay }}
      className={`
        relative px-4 py-3 rounded-xl border text-center
        ${glowing
          ? 'border-accent bg-accent/10 shadow-[0_0_20px_rgba(15,227,194,0.15)]'
          : 'border-border-subtle bg-bg-surface/80'
        }
        ${className}
      `}
    >
      {children}
    </motion.div>
  );
}

function Arrow({ direction = 'right', className = '' }: { direction?: 'right' | 'down' | 'both'; className?: string }) {
  if (direction === 'down') {
    return (
      <div className={`flex flex-col items-center justify-center py-2 ${className}`}>
        <div className="w-0.5 h-4 bg-gradient-to-b from-accent/50 to-accent" />
        <div className="w-0 h-0 border-l-[6px] border-l-transparent border-r-[6px] border-r-transparent border-t-[8px] border-t-accent" />
      </div>
    );
  }

  if (direction === 'both') {
    return (
      <div className={`flex items-center justify-center px-2 ${className}`}>
        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-r-[6px] border-r-accent/50" />
        <div className="h-0.5 w-8 bg-gradient-to-r from-accent/50 via-accent to-accent/50" />
        <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-accent/50" />
      </div>
    );
  }

  return (
    <div className={`flex items-center justify-center px-2 ${className}`}>
      <div className="h-0.5 w-8 bg-gradient-to-r from-accent/50 to-accent" />
      <div className="w-0 h-0 border-t-[5px] border-t-transparent border-b-[5px] border-b-transparent border-l-[6px] border-l-accent" />
    </div>
  );
}

function ConnectionLabel({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return (
    <span className={`text-[10px] font-medium text-accent/70 uppercase tracking-wider ${className}`}>
      {children}
    </span>
  );
}

export default function ArchitecturePage() {
  return (
    <div>
      <motion.h1
        {...fadeInUp}
        className="text-4xl font-bold text-text-primary mb-4"
      >
        Architecture
      </motion.h1>
      <motion.p
        {...fadeInUp}
        transition={{ delay: 0.1 }}
        className="text-xl text-text-secondary mb-8 leading-relaxed"
      >
        Understanding how Opsuna and Tambo work together to create Generative UI.
      </motion.p>

      <motion.h2
        {...fadeInUp}
        transition={{ delay: 0.2 }}
        className="text-2xl font-bold text-text-primary mt-8 mb-6"
      >
        System Overview
      </motion.h2>

      {/* Visual Architecture Diagram */}
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ duration: 0.6, delay: 0.3 }}
        className="rounded-2xl border border-border-subtle bg-gradient-to-br from-bg-surface via-bg-primary to-bg-surface p-8 mb-8 overflow-x-auto"
      >
        <div className="min-w-[600px]">
          {/* Platform Header */}
          <div className="text-center mb-6">
            <motion.div
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.4 }}
              className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-accent/30 bg-accent/5"
            >
              <div className="w-2 h-2 rounded-full bg-accent animate-pulse" />
              <span className="text-sm font-semibold text-accent tracking-wide">OPSUNA PLATFORM</span>
            </motion.div>
          </div>

          {/* Main Architecture Row */}
          <div className="flex items-center justify-center gap-2 mb-6">
            <ArchitectureBox glowing delay={0.5}>
              <div className="text-accent font-bold text-sm">Next.js</div>
              <div className="text-text-secondary text-xs">Frontend</div>
              <div className="mt-1 px-2 py-0.5 rounded-full bg-accent/20 text-accent text-[10px] font-medium">
                + Tambo SDK
              </div>
            </ArchitectureBox>

            <Arrow direction="both" />

            <ArchitectureBox delay={0.6}>
              <div className="text-text-primary font-bold text-sm">Express</div>
              <div className="text-text-secondary text-xs">Backend API</div>
              <div className="mt-1 px-2 py-0.5 rounded-full bg-blue-500/20 text-blue-400 text-[10px] font-medium">
                REST + WS
              </div>
            </ArchitectureBox>

            <Arrow direction="both" />

            <ArchitectureBox delay={0.7}>
              <div className="text-text-primary font-bold text-sm">Supabase</div>
              <div className="text-text-secondary text-xs">PostgreSQL</div>
              <div className="mt-1 px-2 py-0.5 rounded-full bg-green-500/20 text-green-400 text-[10px] font-medium">
                + pgvector
              </div>
            </ArchitectureBox>
          </div>

          {/* Connection Labels */}
          <div className="flex justify-center gap-24 mb-2">
            <ConnectionLabel>WebSocket</ConnectionLabel>
            <ConnectionLabel>Gemini API</ConnectionLabel>
            <ConnectionLabel>Embeddings</ConnectionLabel>
          </div>

          {/* Arrows Down */}
          <div className="flex justify-center gap-32 mb-2">
            <Arrow direction="down" />
            <Arrow direction="down" />
            <Arrow direction="down" />
          </div>

          {/* Services Row */}
          <div className="flex items-center justify-center gap-6">
            <ArchitectureBox delay={0.8} className="min-w-[120px]">
              <div className="absolute -top-2 left-1/2 -translate-x-1/2 w-4 h-4 rounded-full bg-accent/20 border border-accent/30 flex items-center justify-center">
                <div className="w-1.5 h-1.5 rounded-full bg-accent animate-ping" />
              </div>
              <div className="text-text-primary font-semibold text-sm">Real-time</div>
              <div className="text-text-muted text-xs">Live Updates</div>
            </ArchitectureBox>

            <ArchitectureBox glowing delay={0.9} className="min-w-[140px]">
              <div className="text-accent font-bold text-sm">AI Orchestrator</div>
              <div className="text-text-secondary text-xs">Plan & Execute</div>
            </ArchitectureBox>

            <ArchitectureBox delay={1.0} className="min-w-[120px]">
              <div className="text-text-primary font-semibold text-sm">Semantic</div>
              <div className="text-text-muted text-xs">Memory Layer</div>
            </ArchitectureBox>
          </div>

          {/* Bottom Integration Row */}
          <div className="mt-6 pt-6 border-t border-border-subtle/50">
            <div className="flex justify-center gap-4 flex-wrap">
              {['Composio Tools', 'Custom Agents', 'Artifacts', 'Audit Logs'].map((item, i) => (
                <motion.div
                  key={item}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 1.1 + i * 0.1 }}
                  className="px-3 py-1.5 rounded-lg border border-border-subtle bg-bg-elevated/50 text-xs text-text-muted"
                >
                  {item}
                </motion.div>
              ))}
            </div>
          </div>
        </div>
      </motion.div>

      <motion.h2
        {...fadeInUp}
        transition={{ delay: 0.3 }}
        className="text-2xl font-bold text-text-primary mt-10 mb-4"
      >
        Technology Stack
      </motion.h2>
      <div className="grid md:grid-cols-2 gap-4 mb-8">
        {[
          { label: 'Frontend', value: 'Next.js 16, React, Tailwind CSS, Zustand', color: 'accent' },
          { label: 'Backend', value: 'Express.js, Prisma ORM, TypeScript', color: 'blue' },
          { label: 'Database', value: 'PostgreSQL (Supabase) with pgvector', color: 'green' },
          { label: 'AI Engine', value: 'Google Gemini API', color: 'purple' },
          { label: 'Memory', value: 'pgvector for semantic similarity search', color: 'pink' },
          { label: 'Tools', value: 'Composio SDK for 300+ integrations', color: 'orange' },
          { label: 'Real-time', value: 'WebSocket (ws library)', color: 'cyan' },
          { label: 'Generative UI', value: 'Tambo SDK', color: 'accent' },
        ].map((item, i) => (
          <motion.div
            key={item.label}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.4 + i * 0.05 }}
            className="group p-4 rounded-xl border border-border-subtle bg-bg-surface hover:border-accent/30 transition-all"
          >
            <p className="text-sm text-text-muted mb-1">{item.label}</p>
            <p className="text-text-primary font-medium">{item.value}</p>
          </motion.div>
        ))}
      </div>

      <motion.h2
        {...fadeInUp}
        transition={{ delay: 0.4 }}
        className="text-2xl font-bold text-text-primary mt-10 mb-4"
      >
        How Tambo Works
      </motion.h2>
      <div className="space-y-4 mb-8">
        {[
          { step: 1, title: 'Register Components', desc: 'React components are registered with Tambo, including descriptions of when to use them.' },
          { step: 2, title: 'User Input', desc: 'Users describe what they want in natural language through the chat interface.' },
          { step: 3, title: 'AI Processing', desc: 'Tambo analyzes the intent and decides which registered components to render.' },
          { step: 4, title: 'Dynamic Rendering', desc: 'The selected components are rendered with appropriate data from the conversation context.' },
        ].map((item, i) => (
          <motion.div
            key={item.step}
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5 + i * 0.1 }}
            className="flex gap-4 p-4 rounded-xl border border-border-subtle bg-bg-surface hover:border-accent/30 transition-all group"
          >
            <span className="flex-shrink-0 w-10 h-10 rounded-xl bg-accent/10 border border-accent/20 flex items-center justify-center text-accent font-bold group-hover:bg-accent/20 transition-colors">
              {item.step}
            </span>
            <div>
              <strong className="text-text-primary">{item.title}</strong>
              <p className="text-text-secondary text-sm mt-1">{item.desc}</p>
            </div>
          </motion.div>
        ))}
      </div>

      <motion.h2
        {...fadeInUp}
        transition={{ delay: 0.5 }}
        className="text-2xl font-bold text-text-primary mt-10 mb-4"
      >
        Project Structure
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.6 }}
        className="rounded-xl border border-border-subtle bg-bg-surface overflow-hidden"
      >
        <div className="px-4 py-2 border-b border-border-subtle bg-bg-elevated/50 flex items-center gap-2">
          <div className="flex gap-1.5">
            <div className="w-3 h-3 rounded-full bg-red-500/50" />
            <div className="w-3 h-3 rounded-full bg-yellow-500/50" />
            <div className="w-3 h-3 rounded-full bg-green-500/50" />
          </div>
          <span className="text-xs text-text-muted font-mono ml-2">Project Structure</span>
        </div>
        <pre className="p-6 overflow-x-auto text-sm font-mono">
          <code className="text-text-secondary">{`opsuna_tambo/
├── apps/
│   ├── `}<span className="text-accent">web/</span>{`                    # Next.js frontend
│   │   ├── src/
│   │   │   ├── `}<span className="text-blue-400">app/</span>{`            # App Router pages
│   │   │   ├── `}<span className="text-blue-400">components/</span>{`     # React components
│   │   │   ├── `}<span className="text-blue-400">hooks/</span>{`          # Custom hooks
│   │   │   └── `}<span className="text-blue-400">store/</span>{`          # Zustand state
│   │   └── public/
│   │
│   └── `}<span className="text-green-400">server/</span>{`                 # Express.js backend
│       ├── src/
│       │   ├── `}<span className="text-purple-400">routes/</span>{`         # API routes
│       │   ├── `}<span className="text-purple-400">services/</span>{`       # Business logic
│       │   │   ├── ai/         # AI orchestration
│       │   │   ├── tools/      # Tool implementations
│       │   │   ├── memory/     # Semantic memory
│       │   │   └── agents/     # Agent management
│       │   └── middleware/
│       └── prisma/             # Database schema
│
└── packages/
    └── `}<span className="text-yellow-400">shared/</span>{`                 # Shared types & schemas`}</code>
        </pre>
      </motion.div>

      {/* Data Flow Section */}
      <motion.h2
        {...fadeInUp}
        transition={{ delay: 0.6 }}
        className="text-2xl font-bold text-text-primary mt-10 mb-4"
      >
        Data Flow
      </motion.h2>
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.7 }}
        className="rounded-xl border border-border-subtle bg-bg-surface p-6"
      >
        <div className="flex flex-col gap-3">
          {[
            { from: 'User', to: 'Frontend', action: 'Natural language prompt', color: 'accent' },
            { from: 'Frontend', to: 'Backend', action: 'POST /api/execute', color: 'blue' },
            { from: 'Backend', to: 'Gemini AI', action: 'Generate execution plan', color: 'purple' },
            { from: 'Backend', to: 'Memory', action: 'Fetch relevant context', color: 'pink' },
            { from: 'Backend', to: 'Tools', action: 'Execute actions', color: 'orange' },
            { from: 'Backend', to: 'Frontend', action: 'Real-time WebSocket updates', color: 'green' },
            { from: 'Tambo', to: 'User', action: 'Render appropriate UI components', color: 'accent' },
          ].map((flow, i) => (
            <div key={i} className="flex items-center gap-3 text-sm">
              <span className="px-2 py-1 rounded bg-bg-elevated text-text-muted min-w-[80px] text-center">{flow.from}</span>
              <div className="flex-1 flex items-center gap-2">
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
                <span className="text-xs text-text-muted px-2">{flow.action}</span>
                <div className="h-px flex-1 bg-gradient-to-r from-transparent via-border-subtle to-transparent" />
              </div>
              <span className="px-2 py-1 rounded bg-bg-elevated text-text-muted min-w-[80px] text-center">{flow.to}</span>
            </div>
          ))}
        </div>
      </motion.div>
    </div>
  );
}
