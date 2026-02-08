import { Router, Request, Response } from 'express';
import { z } from 'zod';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { config } from '../lib/config';
import { executeComposioAction } from '../services/tools/composio';

const router = Router();

// Initialize Gemini
const genAI = new GoogleGenerativeAI(config.geminiApiKey || '');

// =====================
// Request Schemas
// =====================

const generateRequestSchema = z.object({
  prompt: z.string().min(1),
  framework: z.enum(['react', 'nextjs', 'vue']).default('react'),
  styling: z.enum(['tailwind', 'css', 'styled-components']).default('tailwind'),
  typescript: z.boolean().default(true),
  existingFiles: z.record(z.string()).optional(),
});

const githubExportSchema = z.object({
  owner: z.string(),
  repo: z.string(),
  branch: z.string().default('main'),
  message: z.string(),
  upserts: z.array(z.object({
    path: z.string(),
    content: z.string(),
  })),
});

// =====================
// Code Generation
// =====================

const SYSTEM_PROMPT = `You are an expert React/Next.js developer and UI designer. Your job is to generate production-ready React components based on user descriptions.

IMPORTANT RULES:
1. Generate COMPLETE, WORKING code - no placeholders or TODOs
2. Use Tailwind CSS for styling (dark theme by default)
3. Use TypeScript with proper types
4. Make components responsive
5. Include hover states and transitions
6. Use modern React patterns (hooks, functional components)
7. Add proper accessibility attributes
8. Use Lucide React for icons (import from 'lucide-react')

COLOR PALETTE (use these consistently):
- Background: zinc-900, zinc-950
- Cards: zinc-800, zinc-800/50
- Borders: zinc-700, zinc-800
- Text primary: white, zinc-100
- Text secondary: zinc-400, zinc-500
- Accent: violet-500, violet-600, fuchsia-500
- Success: green-500, emerald-500
- Error: red-500, rose-500
- Warning: yellow-500, amber-500

RESPONSE FORMAT:
You must respond with a JSON object containing:
{
  "message": "Brief description of what you generated",
  "files": {
    "ComponentName.tsx": "// Full component code here",
    "AnotherComponent.tsx": "// Another component if needed"
  }
}

Only respond with valid JSON. No markdown, no explanations outside the JSON.`;

router.post('/generate', async (req: Request, res: Response) => {
  try {
    const body = generateRequestSchema.parse(req.body);
    const { prompt, framework, styling, typescript, existingFiles } = body;

    // Build context from existing files
    let context = '';
    if (existingFiles && Object.keys(existingFiles).length > 0) {
      context = `\n\nEXISTING PROJECT FILES (for reference):\n${
        Object.entries(existingFiles)
          .map(([name, content]) => `--- ${name} ---\n${content}`)
          .join('\n\n')
      }`;
    }

    const userPrompt = `Generate React components for the following request:

${prompt}

Settings:
- Framework: ${framework}
- Styling: ${styling}
- TypeScript: ${typescript}
${context}

Remember to respond with ONLY valid JSON in the format specified.`;

    // Check if we have API key
    if (!config.geminiApiKey) {
      // Return mock response for demo
      return res.json(generateMockResponse(prompt));
    }

    // Call Gemini API (using latest model)
    const model = genAI.getGenerativeModel({ model: 'gemini-2.0-flash' });

    const result = await model.generateContent({
      contents: [
        { role: 'user', parts: [{ text: SYSTEM_PROMPT }] },
        { role: 'model', parts: [{ text: 'I understand. I will generate production-ready React components and respond only with valid JSON.' }] },
        { role: 'user', parts: [{ text: userPrompt }] },
      ],
      generationConfig: {
        temperature: 0.7,
        maxOutputTokens: 8192,
      },
    });

    const responseText = result.response.text();

    // Parse JSON from response
    try {
      // Try to extract JSON from response
      const jsonMatch = responseText.match(/\{[\s\S]*\}/);
      if (!jsonMatch) {
        throw new Error('No JSON found in response');
      }

      const parsed = JSON.parse(jsonMatch[0]);
      return res.json({
        message: parsed.message || 'Components generated successfully!',
        files: parsed.files || {},
      });
    } catch (parseError) {
      console.error('Failed to parse AI response:', parseError);
      // Return the raw response as a single file
      return res.json({
        message: 'Generated component (raw)',
        files: {
          'App.tsx': responseText,
        },
      });
    }
  } catch (error) {
    console.error('[Builder] Generate error:', error);

    // Fall back to mock response for better demo experience
    const prompt = req.body?.prompt || 'dashboard';
    console.log('[Builder] Falling back to mock response');
    return res.json(generateMockResponse(prompt));
  }
});

// =====================
// GitHub Export
// =====================

router.post('/export/github', async (req: Request, res: Response) => {
  try {
    const body = githubExportSchema.parse(req.body);
    const { owner, repo, branch, message, upserts } = body;

    const userId = (req as any).user?.id;
    if (!userId) {
      return res.status(401).json({ error: 'User not authenticated' });
    }

    // Use Composio to commit files
    const result = await executeComposioAction(
      `github-export-${Date.now()}`,
      'github_commit_multiple_files',
      {
        owner,
        repo,
        branch,
        base_branch: branch,
        message,
        upserts,
      },
      userId,
      (log) => console.log('[GitHub Export]', log.message)
    );

    if (result.success) {
      return res.json({
        success: true,
        message: 'Successfully committed to GitHub',
        commitUrl: `https://github.com/${owner}/${repo}/tree/${branch}`,
        data: result.data,
      });
    } else {
      return res.status(400).json({
        success: false,
        error: result.error?.message || 'Failed to commit to GitHub',
      });
    }
  } catch (error) {
    console.error('[Builder] GitHub export error:', error);
    res.status(500).json({
      error: error instanceof Error ? error.message : 'Failed to export to GitHub',
    });
  }
});

// =====================
// ZIP Export (placeholder - client-side handles this)
// =====================

router.post('/export/zip', async (req: Request, res: Response) => {
  // ZIP creation is handled client-side with JSZip
  // This endpoint could be used for server-side ZIP if needed
  res.json({
    message: 'Use client-side ZIP generation',
    downloadUrl: null,
  });
});

// =====================
// Mock Response Generator
// =====================

function generateMockResponse(prompt: string): { message: string; files: Record<string, string> } {
  const lowerPrompt = prompt.toLowerCase();

  // Dashboard
  if (lowerPrompt.includes('dashboard')) {
    return {
      message: 'Generated a modern analytics dashboard with sidebar, stats cards, and charts!',
      files: {
        'App.tsx': `import React, { useState } from 'react';
import {
  LayoutDashboard, Users, ShoppingCart, TrendingUp,
  Bell, Search, Menu, ChevronDown, MoreVertical,
  ArrowUpRight, ArrowDownRight
} from 'lucide-react';

const stats = [
  { label: 'Total Revenue', value: '$45,231', change: '+20.1%', trend: 'up', icon: TrendingUp },
  { label: 'Active Users', value: '2,350', change: '+15.2%', trend: 'up', icon: Users },
  { label: 'Orders', value: '1,247', change: '-4.5%', trend: 'down', icon: ShoppingCart },
  { label: 'Conversion', value: '3.24%', change: '+12.3%', trend: 'up', icon: LayoutDashboard },
];

const menuItems = [
  { icon: LayoutDashboard, label: 'Dashboard', active: true },
  { icon: Users, label: 'Users' },
  { icon: ShoppingCart, label: 'Orders' },
  { icon: TrendingUp, label: 'Analytics' },
];

export default function App() {
  const [sidebarOpen, setSidebarOpen] = useState(true);

  return (
    <div className="min-h-screen bg-zinc-950 flex">
      {/* Sidebar */}
      <aside className={\`\${sidebarOpen ? 'w-64' : 'w-20'} bg-zinc-900 border-r border-zinc-800 transition-all duration-300 flex flex-col\`}>
        <div className="p-4 border-b border-zinc-800">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-xl flex items-center justify-center">
              <LayoutDashboard size={20} className="text-white" />
            </div>
            {sidebarOpen && <span className="font-bold text-lg">Opsuna</span>}
          </div>
        </div>

        <nav className="flex-1 p-4">
          <ul className="space-y-2">
            {menuItems.map((item) => (
              <li key={item.label}>
                <a
                  href="#"
                  className={\`flex items-center gap-3 px-3 py-2.5 rounded-xl transition-colors \${
                    item.active
                      ? 'bg-violet-500/20 text-violet-400'
                      : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                  }\`}
                >
                  <item.icon size={20} />
                  {sidebarOpen && <span>{item.label}</span>}
                </a>
              </li>
            ))}
          </ul>
        </nav>
      </aside>

      {/* Main Content */}
      <div className="flex-1 flex flex-col">
        {/* Header */}
        <header className="h-16 border-b border-zinc-800 flex items-center justify-between px-6">
          <div className="flex items-center gap-4">
            <button
              onClick={() => setSidebarOpen(!sidebarOpen)}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <Menu size={20} />
            </button>
            <div className="relative">
              <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                placeholder="Search..."
                className="w-64 bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>
          </div>

          <div className="flex items-center gap-4">
            <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors relative">
              <Bell size={20} />
              <span className="absolute top-1 right-1 w-2 h-2 bg-violet-500 rounded-full" />
            </button>
            <div className="flex items-center gap-2 px-3 py-1.5 hover:bg-zinc-800 rounded-xl cursor-pointer transition-colors">
              <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full" />
              <span className="text-sm">John Doe</span>
              <ChevronDown size={16} className="text-zinc-500" />
            </div>
          </div>
        </header>

        {/* Dashboard Content */}
        <main className="flex-1 p-6 overflow-auto">
          <div className="mb-6">
            <h1 className="text-2xl font-bold">Dashboard</h1>
            <p className="text-zinc-500">Welcome back! Here's what's happening.</p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
            {stats.map((stat) => (
              <div key={stat.label} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
                <div className="flex items-center justify-between mb-3">
                  <div className="p-2 bg-zinc-800 rounded-lg">
                    <stat.icon size={20} className="text-violet-400" />
                  </div>
                  <button className="p-1 hover:bg-zinc-800 rounded-lg transition-colors">
                    <MoreVertical size={16} className="text-zinc-500" />
                  </button>
                </div>
                <p className="text-zinc-500 text-sm mb-1">{stat.label}</p>
                <div className="flex items-end justify-between">
                  <span className="text-2xl font-bold">{stat.value}</span>
                  <span className={\`flex items-center text-sm \${
                    stat.trend === 'up' ? 'text-green-400' : 'text-red-400'
                  }\`}>
                    {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {stat.change}
                  </span>
                </div>
              </div>
            ))}
          </div>

          {/* Chart Section */}
          <div className="grid grid-cols-1 lg:grid-cols-3 gap-4">
            <div className="lg:col-span-2 bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Revenue Overview</h3>
              <div className="h-64 flex items-end gap-2">
                {[40, 65, 45, 80, 55, 90, 70, 85, 60, 75, 95, 88].map((height, i) => (
                  <div key={i} className="flex-1 flex flex-col items-center gap-2">
                    <div
                      className="w-full bg-gradient-to-t from-violet-600 to-violet-400 rounded-t-lg transition-all hover:from-violet-500 hover:to-violet-300"
                      style={{ height: \`\${height}%\` }}
                    />
                    <span className="text-[10px] text-zinc-600">
                      {['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'][i]}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
              <h3 className="font-semibold mb-4">Top Products</h3>
              <div className="space-y-4">
                {['Product A', 'Product B', 'Product C', 'Product D'].map((product, i) => (
                  <div key={product} className="flex items-center gap-3">
                    <div className="w-10 h-10 bg-zinc-800 rounded-lg" />
                    <div className="flex-1">
                      <p className="text-sm font-medium">{product}</p>
                      <p className="text-xs text-zinc-500">{234 - i * 30} sales</p>
                    </div>
                    <span className="text-sm text-green-400">+{12 + i * 3}%</span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}`,
      },
    };
  }

  // Login / Sign In / Authentication
  if (lowerPrompt.includes('login') || lowerPrompt.includes('sign in') || lowerPrompt.includes('signin') || lowerPrompt.includes('auth')) {
    return {
      message: 'Generated a beautiful login form with social auth options!',
      files: {
        'App.tsx': `import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github, Chrome } from 'lucide-react';

export default function App() {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    // Simulate login
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="text-center mb-8">
          <div className="w-16 h-16 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center mx-auto mb-4">
            <Lock className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold">Welcome back</h1>
          <p className="text-zinc-400 mt-2">Sign in to your account to continue</p>
        </div>

        {/* Login Form */}
        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Field */}
            <div>
              <label className="block text-sm font-medium mb-2">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  required
                />
              </div>
            </div>

            {/* Password Field */}
            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium">Password</label>
                <a href="#" className="text-sm text-violet-400 hover:text-violet-300 transition-colors">
                  Forgot password?
                </a>
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-12 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {/* Remember Me */}
            <div className="flex items-center gap-2">
              <input
                type="checkbox"
                id="remember"
                className="w-4 h-4 bg-zinc-800 border-zinc-700 rounded focus:ring-violet-500 focus:ring-offset-0 text-violet-500"
              />
              <label htmlFor="remember" className="text-sm text-zinc-400">
                Remember me for 30 days
              </label>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              disabled={isLoading}
              className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 font-medium transition-all flex items-center justify-center gap-2"
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  Sign in
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {/* Divider */}
          <div className="relative my-6">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-zinc-800" />
            </div>
            <div className="relative flex justify-center">
              <span className="bg-zinc-900 px-4 text-sm text-zinc-500">Or continue with</span>
            </div>
          </div>

          {/* Social Buttons */}
          <div className="grid grid-cols-2 gap-3">
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-colors">
              <Github size={18} />
              <span className="text-sm font-medium">GitHub</span>
            </button>
            <button className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-colors">
              <Chrome size={18} />
              <span className="text-sm font-medium">Google</span>
            </button>
          </div>
        </div>

        {/* Sign Up Link */}
        <p className="text-center mt-6 text-zinc-400 text-sm">
          Don't have an account?{' '}
          <a href="#" className="text-violet-400 hover:text-violet-300 font-medium transition-colors">
            Sign up for free
          </a>
        </p>
      </div>
    </div>
  );
}`,
      },
    };
  }

  // Form / Contact / Signup
  if (lowerPrompt.includes('form') || lowerPrompt.includes('contact') || lowerPrompt.includes('signup') || lowerPrompt.includes('sign up') || lowerPrompt.includes('register')) {
    return {
      message: 'Generated a modern multi-field form with validation styling!',
      files: {
        'App.tsx': `import React, { useState } from 'react';
import { User, Mail, Phone, MessageSquare, Send, CheckCircle } from 'lucide-react';

export default function App() {
  const [submitted, setSubmitted] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    phone: '',
    message: '',
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setSubmitted(true);
  };

  if (submitted) {
    return (
      <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
        <div className="text-center">
          <div className="w-20 h-20 bg-emerald-500/20 rounded-full flex items-center justify-center mx-auto mb-6">
            <CheckCircle className="text-emerald-400" size={40} />
          </div>
          <h2 className="text-2xl font-bold mb-2">Thank you!</h2>
          <p className="text-zinc-400 mb-6">We'll get back to you soon.</p>
          <button
            onClick={() => setSubmitted(false)}
            className="px-6 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors"
          >
            Send another
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Get in Touch</h1>
          <p className="text-zinc-400">We'd love to hear from you. Fill out the form below.</p>
        </div>

        <form onSubmit={handleSubmit} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8 space-y-5">
          {/* Name */}
          <div>
            <label className="block text-sm font-medium mb-2">Full Name</label>
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                placeholder="John Doe"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Email */}
          <div>
            <label className="block text-sm font-medium mb-2">Email Address</label>
            <div className="relative">
              <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                placeholder="you@example.com"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
                required
              />
            </div>
          </div>

          {/* Phone */}
          <div>
            <label className="block text-sm font-medium mb-2">Phone (optional)</label>
            <div className="relative">
              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                placeholder="+1 (555) 000-0000"
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors"
              />
            </div>
          </div>

          {/* Message */}
          <div>
            <label className="block text-sm font-medium mb-2">Message</label>
            <div className="relative">
              <MessageSquare className="absolute left-3 top-3 text-zinc-500" size={18} />
              <textarea
                value={formData.message}
                onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                placeholder="How can we help you?"
                rows={4}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 focus:ring-1 focus:ring-violet-500 transition-colors resize-none"
                required
              />
            </div>
          </div>

          {/* Submit */}
          <button
            type="submit"
            className="w-full bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl py-3 font-medium transition-all flex items-center justify-center gap-2"
          >
            Send Message
            <Send size={18} />
          </button>
        </form>
      </div>
    </div>
  );
}`,
      },
    };
  }

  // Table / Data Grid
  if (lowerPrompt.includes('table') || lowerPrompt.includes('data') || lowerPrompt.includes('grid') || lowerPrompt.includes('list')) {
    return {
      message: 'Generated a data table with sorting, search, and pagination!',
      files: {
        'App.tsx': `import React, { useState } from 'react';
import { Search, ChevronUp, ChevronDown, ChevronLeft, ChevronRight, MoreHorizontal, User, Mail, Calendar } from 'lucide-react';

const users = [
  { id: 1, name: 'Alex Johnson', email: 'alex@example.com', role: 'Admin', status: 'Active', joined: '2024-01-15' },
  { id: 2, name: 'Sarah Williams', email: 'sarah@example.com', role: 'Editor', status: 'Active', joined: '2024-02-20' },
  { id: 3, name: 'Mike Chen', email: 'mike@example.com', role: 'Viewer', status: 'Inactive', joined: '2024-01-08' },
  { id: 4, name: 'Emma Davis', email: 'emma@example.com', role: 'Editor', status: 'Active', joined: '2024-03-10' },
  { id: 5, name: 'James Wilson', email: 'james@example.com', role: 'Admin', status: 'Active', joined: '2024-02-28' },
];

export default function App() {
  const [search, setSearch] = useState('');
  const [sortField, setSortField] = useState('name');
  const [sortDir, setSortDir] = useState<'asc' | 'desc'>('asc');

  const filtered = users
    .filter(u => u.name.toLowerCase().includes(search.toLowerCase()) || u.email.toLowerCase().includes(search.toLowerCase()))
    .sort((a, b) => {
      const aVal = a[sortField as keyof typeof a];
      const bVal = b[sortField as keyof typeof b];
      return sortDir === 'asc' ? String(aVal).localeCompare(String(bVal)) : String(bVal).localeCompare(String(aVal));
    });

  const handleSort = (field: string) => {
    if (sortField === field) {
      setSortDir(sortDir === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('asc');
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="flex items-center justify-between mb-6">
          <h1 className="text-2xl font-bold">Users</h1>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
            <input
              type="text"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Search users..."
              className="bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2 text-sm focus:outline-none focus:border-violet-500 w-64"
            />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl overflow-hidden">
          <table className="w-full">
            <thead>
              <tr className="border-b border-zinc-800">
                {['Name', 'Email', 'Role', 'Status', 'Joined'].map((col) => (
                  <th
                    key={col}
                    onClick={() => handleSort(col.toLowerCase())}
                    className="px-6 py-4 text-left text-sm font-medium text-zinc-400 cursor-pointer hover:text-white transition-colors"
                  >
                    <div className="flex items-center gap-1">
                      {col}
                      {sortField === col.toLowerCase() && (
                        sortDir === 'asc' ? <ChevronUp size={14} /> : <ChevronDown size={14} />
                      )}
                    </div>
                  </th>
                ))}
                <th className="px-6 py-4"></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map((user) => (
                <tr key={user.id} className="border-b border-zinc-800/50 hover:bg-zinc-800/30 transition-colors">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-8 h-8 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-full flex items-center justify-center text-sm font-medium">
                        {user.name.charAt(0)}
                      </div>
                      <span className="font-medium">{user.name}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{user.email}</td>
                  <td className="px-6 py-4">
                    <span className="px-2.5 py-1 bg-zinc-800 rounded-lg text-sm">{user.role}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className={\`px-2.5 py-1 rounded-lg text-sm \${
                      user.status === 'Active' ? 'bg-emerald-500/20 text-emerald-400' : 'bg-zinc-700 text-zinc-400'
                    }\`}>
                      {user.status}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-zinc-400">{user.joined}</td>
                  <td className="px-6 py-4">
                    <button className="p-1 hover:bg-zinc-800 rounded-lg transition-colors">
                      <MoreHorizontal size={18} className="text-zinc-500" />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>

          {/* Pagination */}
          <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between">
            <span className="text-sm text-zinc-500">Showing {filtered.length} of {users.length} users</span>
            <div className="flex items-center gap-2">
              <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors disabled:opacity-50" disabled>
                <ChevronLeft size={18} />
              </button>
              <button className="w-8 h-8 bg-violet-500 rounded-lg text-sm font-medium">1</button>
              <button className="w-8 h-8 hover:bg-zinc-800 rounded-lg text-sm text-zinc-400">2</button>
              <button className="p-2 hover:bg-zinc-800 rounded-lg transition-colors">
                <ChevronRight size={18} />
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}`,
      },
    };
  }

  // Profile / Settings / Account
  if (lowerPrompt.includes('profile') || lowerPrompt.includes('settings') || lowerPrompt.includes('account')) {
    return {
      message: 'Generated a user profile/settings page with avatar and form sections!',
      files: {
        'App.tsx': `import React, { useState } from 'react';
import { User, Mail, Phone, MapPin, Camera, Bell, Shield, Key, Save } from 'lucide-react';

export default function App() {
  const [activeTab, setActiveTab] = useState('profile');

  const tabs = [
    { id: 'profile', label: 'Profile', icon: User },
    { id: 'notifications', label: 'Notifications', icon: Bell },
    { id: 'security', label: 'Security', icon: Shield },
  ];

  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-4xl mx-auto">
        <h1 className="text-2xl font-bold mb-8">Account Settings</h1>

        <div className="flex gap-6">
          {/* Sidebar */}
          <div className="w-48 space-y-1">
            {tabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id)}
                className={\`w-full flex items-center gap-3 px-4 py-2.5 rounded-xl text-left transition-colors \${
                  activeTab === tab.id
                    ? 'bg-violet-500/20 text-violet-400'
                    : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                }\`}
              >
                <tab.icon size={18} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="flex-1 bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
            {/* Profile Header */}
            <div className="flex items-center gap-6 mb-8 pb-6 border-b border-zinc-800">
              <div className="relative">
                <div className="w-24 h-24 bg-gradient-to-br from-violet-500 to-fuchsia-500 rounded-2xl flex items-center justify-center text-3xl font-bold">
                  JD
                </div>
                <button className="absolute -bottom-2 -right-2 p-2 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-colors">
                  <Camera size={14} />
                </button>
              </div>
              <div>
                <h2 className="text-xl font-semibold">John Doe</h2>
                <p className="text-zinc-400">john.doe@example.com</p>
                <p className="text-sm text-zinc-500 mt-1">Member since January 2024</p>
              </div>
            </div>

            {/* Form */}
            <form className="space-y-5">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium mb-2">First Name</label>
                  <div className="relative">
                    <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                    <input
                      type="text"
                      defaultValue="John"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-sm font-medium mb-2">Last Name</label>
                  <input
                    type="text"
                    defaultValue="Doe"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Email</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="email"
                    defaultValue="john.doe@example.com"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Phone</label>
                <div className="relative">
                  <Phone className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="tel"
                    defaultValue="+1 (555) 123-4567"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Location</label>
                <div className="relative">
                  <MapPin className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="text"
                    defaultValue="San Francisco, CA"
                    className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium mb-2">Bio</label>
                <textarea
                  rows={3}
                  defaultValue="Product designer and developer building tools for the modern web."
                  className="w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm focus:outline-none focus:border-violet-500 transition-colors resize-none"
                />
              </div>

              <div className="pt-4 flex justify-end gap-3">
                <button type="button" className="px-4 py-2 bg-zinc-800 hover:bg-zinc-700 rounded-xl transition-colors">
                  Cancel
                </button>
                <button type="submit" className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-xl transition-colors flex items-center gap-2">
                  <Save size={16} />
                  Save Changes
                </button>
              </div>
            </form>
          </div>
        </div>
      </div>
    </div>
  );
}`,
      },
    };
  }

  // Pricing
  if (lowerPrompt.includes('pricing') || lowerPrompt.includes('plans') || lowerPrompt.includes('subscription')) {
    return {
      message: 'Generated a beautiful pricing page with feature comparison!',
      files: {
        'App.tsx': `import React, { useState } from 'react';
import { Check, X, Zap, Star } from 'lucide-react';

const plans = [
  {
    name: 'Starter',
    price: { monthly: 9, yearly: 7 },
    description: 'Perfect for individuals',
    features: ['5 projects', '1GB storage', 'Basic analytics', 'Email support'],
    notIncluded: ['API access', 'Custom domains', 'Priority support'],
  },
  {
    name: 'Pro',
    price: { monthly: 29, yearly: 24 },
    description: 'Best for growing teams',
    features: ['Unlimited projects', '10GB storage', 'Advanced analytics', 'API access', 'Custom domains'],
    notIncluded: ['Priority support'],
    popular: true,
  },
  {
    name: 'Enterprise',
    price: { monthly: 99, yearly: 79 },
    description: 'For large organizations',
    features: ['Unlimited projects', 'Unlimited storage', 'Advanced analytics', 'API access', 'Custom domains', 'Priority support', 'SSO'],
    notIncluded: [],
  },
];

export default function App() {
  const [yearly, setYearly] = useState(false);

  return (
    <div className="min-h-screen bg-zinc-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4">Simple, transparent pricing</h1>
          <p className="text-zinc-400 text-lg mb-8">Choose the plan that's right for you</p>

          {/* Toggle */}
          <div className="inline-flex items-center gap-3 bg-zinc-900 p-1 rounded-xl">
            <button
              onClick={() => setYearly(false)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors \${!yearly ? 'bg-violet-500 text-white' : 'text-zinc-400 hover:text-white'}\`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={\`px-4 py-2 rounded-lg text-sm font-medium transition-colors \${yearly ? 'bg-violet-500 text-white' : 'text-zinc-400 hover:text-white'}\`}
            >
              Yearly <span className="text-emerald-400 text-xs">Save 20%</span>
            </button>
          </div>
        </div>

        <div className="grid md:grid-cols-3 gap-6">
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={\`bg-zinc-900 border rounded-2xl p-6 relative \${
                plan.popular ? 'border-violet-500 ring-1 ring-violet-500' : 'border-zinc-800'
              }\`}
            >
              {plan.popular && (
                <div className="absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 bg-violet-500 rounded-full text-xs font-medium flex items-center gap-1">
                  <Star size={12} />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2">{plan.name}</h3>
                <p className="text-zinc-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold">\${yearly ? plan.price.yearly : plan.price.monthly}</span>
                <span className="text-zinc-500">/month</span>
              </div>

              <button className={\`w-full py-3 rounded-xl font-medium transition-colors mb-6 \${
                plan.popular
                  ? 'bg-violet-600 hover:bg-violet-500'
                  : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700'
              }\`}>
                Get started
              </button>

              <div className="space-y-3">
                {plan.features.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-emerald-400" />
                    <span>{feature}</span>
                  </div>
                ))}
                {plan.notIncluded.map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm text-zinc-500">
                    <X size={16} />
                    <span>{feature}</span>
                  </div>
                ))}
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
      },
    };
  }

  // Stats Cards
  if (lowerPrompt.includes('stats') || lowerPrompt.includes('cards') || lowerPrompt.includes('kpi')) {
    return {
      message: 'Generated beautiful stats cards with trends and icons!',
      files: {
        'App.tsx': `import React from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight } from 'lucide-react';

const stats = [
  {
    label: 'Total Revenue',
    value: '$45,231.89',
    change: '+20.1%',
    trend: 'up',
    icon: DollarSign,
    color: 'violet'
  },
  {
    label: 'Subscriptions',
    value: '+2,350',
    change: '+15.2%',
    trend: 'up',
    icon: Users,
    color: 'blue'
  },
  {
    label: 'Sales',
    value: '+12,234',
    change: '-4.5%',
    trend: 'down',
    icon: ShoppingCart,
    color: 'emerald'
  },
  {
    label: 'Active Now',
    value: '+573',
    change: '+12.3%',
    trend: 'up',
    icon: TrendingUp,
    color: 'orange'
  },
];

const colorMap: Record<string, string> = {
  violet: 'from-violet-500 to-purple-500',
  blue: 'from-blue-500 to-cyan-500',
  emerald: 'from-emerald-500 to-teal-500',
  orange: 'from-orange-500 to-amber-500',
};

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <h1 className="text-2xl font-bold mb-6">Dashboard Overview</h1>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {stats.map((stat) => (
            <div
              key={stat.label}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors"
            >
              <div className="flex items-center justify-between mb-4">
                <div className={\`p-3 rounded-xl bg-gradient-to-br \${colorMap[stat.color]} bg-opacity-20\`}>
                  <stat.icon size={22} className="text-white" />
                </div>
                <span className={\`flex items-center gap-1 text-sm font-medium \${
                  stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                }\`}>
                  {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                  {stat.change}
                </span>
              </div>

              <h3 className="text-zinc-400 text-sm mb-1">{stat.label}</h3>
              <p className="text-2xl font-bold">{stat.value}</p>

              <div className="mt-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
                <div
                  className={\`h-full bg-gradient-to-r \${colorMap[stat.color]} rounded-full\`}
                  style={{ width: \`\${Math.random() * 40 + 60}%\` }}
                />
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}`,
      },
    };
  }

  // Default: Landing Page
  return {
    message: 'Generated a modern landing page with hero section!',
    files: {
      'App.tsx': `import React from 'react';
import { ArrowRight, Check, Star, Sparkles, Zap, Shield, Globe } from 'lucide-react';

const features = [
  { icon: Zap, title: 'Lightning Fast', description: 'Built for speed and performance' },
  { icon: Shield, title: 'Secure by Default', description: 'Enterprise-grade security built in' },
  { icon: Globe, title: 'Global Scale', description: 'Deploy anywhere in the world' },
];

export default function App() {
  return (
    <div className="min-h-screen bg-zinc-950">
      {/* Navigation */}
      <nav className="border-b border-zinc-800">
        <div className="max-w-6xl mx-auto px-4 h-16 flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Sparkles className="text-violet-500" size={24} />
            <span className="font-bold text-xl">Opsuna</span>
          </div>
          <div className="hidden md:flex items-center gap-8">
            <a href="#" className="text-zinc-400 hover:text-white transition-colors">Features</a>
            <a href="#" className="text-zinc-400 hover:text-white transition-colors">Pricing</a>
            <a href="#" className="text-zinc-400 hover:text-white transition-colors">Docs</a>
          </div>
          <button className="px-4 py-2 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors">
            Get Started
          </button>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="inline-flex items-center gap-2 px-3 py-1 bg-violet-500/10 border border-violet-500/20 rounded-full text-violet-400 text-sm mb-6">
            <Star size={14} />
            <span>Now in Public Beta</span>
          </div>

          <h1 className="text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
            Build Beautiful UIs with AI
          </h1>

          <p className="text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
            Describe what you want, and watch as AI generates production-ready React components in seconds.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <button className="w-full sm:w-auto px-8 py-3 bg-gradient-to-r from-violet-600 to-fuchsia-600 hover:from-violet-500 hover:to-fuchsia-500 rounded-xl font-medium transition-colors flex items-center justify-center gap-2">
              Start Building Free
              <ArrowRight size={18} />
            </button>
            <button className="w-full sm:w-auto px-8 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-medium transition-colors">
              View Demo
            </button>
          </div>

          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-zinc-500">
            <span className="flex items-center gap-1"><Check size={16} className="text-green-500" /> No credit card</span>
            <span className="flex items-center gap-1"><Check size={16} className="text-green-500" /> 14-day trial</span>
            <span className="flex items-center gap-1"><Check size={16} className="text-green-500" /> Cancel anytime</span>
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="py-20 px-4 bg-zinc-900/50">
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl font-bold mb-4">Everything you need to build faster</h2>
            <p className="text-zinc-400">Powerful features to supercharge your development workflow</p>
          </div>

          <div className="grid md:grid-cols-3 gap-6">
            {features.map((feature) => (
              <div key={feature.title} className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-violet-500/50 transition-colors group">
                <div className="w-12 h-12 bg-violet-500/10 rounded-xl flex items-center justify-center mb-4 group-hover:bg-violet-500/20 transition-colors">
                  <feature.icon className="text-violet-400" size={24} />
                </div>
                <h3 className="text-xl font-semibold mb-2">{feature.title}</h3>
                <p className="text-zinc-400">{feature.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>
    </div>
  );
}`,
    },
  };
}

export default router;
