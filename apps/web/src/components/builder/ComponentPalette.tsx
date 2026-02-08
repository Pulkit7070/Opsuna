'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Search,
  Layout,
  BarChart3,
  Table2,
  FormInput,
  CreditCard,
  Navigation,
  Bell,
  User,
  Menu,
  Calendar,
  Image,
  List,
  Grid3X3,
  MessageSquare,
  Settings,
  FileText,
  PieChart,
  LineChart,
  Share2,
  ShoppingCart,
  Heart,
  Star,
  MapPin,
  Mail,
  Phone
} from 'lucide-react';
import { useBuilderStore } from '@/store/builder';

interface ComponentPaletteProps {
  isOpen: boolean;
  onClose: () => void;
}

interface ComponentTemplate {
  id: string;
  name: string;
  description: string;
  icon: typeof Layout;
  category: string;
  prompt: string;
}

const COMPONENT_TEMPLATES: ComponentTemplate[] = [
  // Layout
  {
    id: 'dashboard',
    name: 'Dashboard Layout',
    description: 'Full dashboard with sidebar, header, and content area',
    icon: Layout,
    category: 'Layout',
    prompt: 'Create a modern dashboard layout with a collapsible sidebar navigation, top header with search and user menu, and a main content area with grid layout for widgets'
  },
  {
    id: 'landing',
    name: 'Landing Page',
    description: 'Hero section with CTA and features',
    icon: FileText,
    category: 'Layout',
    prompt: 'Create a modern landing page with a hero section featuring a headline, subtext, and CTA buttons, followed by a features grid and testimonials section'
  },
  {
    id: 'navbar',
    name: 'Navigation Bar',
    description: 'Responsive navbar with mobile menu',
    icon: Navigation,
    category: 'Layout',
    prompt: 'Create a responsive navigation bar with logo, nav links, and a mobile hamburger menu that expands into a full-screen overlay'
  },

  // Data Display
  {
    id: 'stats-cards',
    name: 'Stats Cards',
    description: 'KPI cards with icons and trends',
    icon: CreditCard,
    category: 'Data Display',
    prompt: 'Create a row of 4 stats cards showing key metrics with icons, values, and percentage change indicators (up/down trends)'
  },
  {
    id: 'data-table',
    name: 'Data Table',
    description: 'Sortable table with pagination',
    icon: Table2,
    category: 'Data Display',
    prompt: 'Create a data table component with sortable columns, row selection, search filter, and pagination. Include sample user data'
  },
  {
    id: 'list-view',
    name: 'List View',
    description: 'Scrollable list with actions',
    icon: List,
    category: 'Data Display',
    prompt: 'Create a scrollable list view with items showing title, description, status badge, and action buttons (edit, delete)'
  },

  // Charts
  {
    id: 'line-chart',
    name: 'Line Chart',
    description: 'Time series line chart',
    icon: LineChart,
    category: 'Charts',
    prompt: 'Create a line chart showing revenue over the past 12 months with a gradient fill, tooltips, and axis labels'
  },
  {
    id: 'bar-chart',
    name: 'Bar Chart',
    description: 'Vertical bar chart',
    icon: BarChart3,
    category: 'Charts',
    prompt: 'Create a vertical bar chart comparing sales data across different product categories with hover tooltips'
  },
  {
    id: 'pie-chart',
    name: 'Pie Chart',
    description: 'Donut/pie chart with legend',
    icon: PieChart,
    category: 'Charts',
    prompt: 'Create a donut chart showing traffic sources distribution with a legend and percentage labels'
  },

  // Forms
  {
    id: 'login-form',
    name: 'Login Form',
    description: 'Auth form with social login',
    icon: User,
    category: 'Forms',
    prompt: 'Create a login form with email and password fields, remember me checkbox, forgot password link, and social login buttons (Google, GitHub)'
  },
  {
    id: 'contact-form',
    name: 'Contact Form',
    description: 'Multi-field contact form',
    icon: Mail,
    category: 'Forms',
    prompt: 'Create a contact form with name, email, subject dropdown, message textarea, and submit button with validation'
  },
  {
    id: 'multi-step-form',
    name: 'Multi-Step Form',
    description: 'Wizard form with progress',
    icon: FormInput,
    category: 'Forms',
    prompt: 'Create a 3-step form wizard with progress indicator, personal info step, address step, and confirmation step'
  },

  // Cards
  {
    id: 'product-card',
    name: 'Product Card',
    description: 'E-commerce product display',
    icon: ShoppingCart,
    category: 'Cards',
    prompt: 'Create a product card with image, title, price, rating stars, and add to cart button with hover effects'
  },
  {
    id: 'profile-card',
    name: 'Profile Card',
    description: 'User profile with stats',
    icon: User,
    category: 'Cards',
    prompt: 'Create a user profile card with avatar, name, bio, follow/message buttons, and stats (posts, followers, following)'
  },
  {
    id: 'pricing-card',
    name: 'Pricing Card',
    description: 'Pricing tier display',
    icon: CreditCard,
    category: 'Cards',
    prompt: 'Create a pricing card for a SaaS plan with plan name, price, feature list with checkmarks, and CTA button'
  },

  // UI Elements
  {
    id: 'notification',
    name: 'Notification Toast',
    description: 'Alert/toast component',
    icon: Bell,
    category: 'UI Elements',
    prompt: 'Create notification toast components for success, error, warning, and info states with dismiss button and auto-close'
  },
  {
    id: 'modal',
    name: 'Modal Dialog',
    description: 'Popup modal with overlay',
    icon: MessageSquare,
    category: 'UI Elements',
    prompt: 'Create a modal dialog component with backdrop, header, content area, and footer with cancel/confirm buttons'
  },
  {
    id: 'calendar',
    name: 'Calendar Widget',
    description: 'Date picker calendar',
    icon: Calendar,
    category: 'UI Elements',
    prompt: 'Create a calendar widget showing a month view with selectable dates, navigation arrows, and highlighted today'
  },
];

const CATEGORIES = Array.from(new Set(COMPONENT_TEMPLATES.map(t => t.category)));

export function ComponentPalette({ isOpen, onClose }: ComponentPaletteProps) {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState<string | null>(null);
  const { addMessage, setGenerating } = useBuilderStore();

  const filteredTemplates = COMPONENT_TEMPLATES.filter(template => {
    const matchesSearch = template.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      template.description.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = !selectedCategory || template.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const handleSelectTemplate = async (template: ComponentTemplate) => {
    onClose();

    // Create project if needed
    const store = useBuilderStore.getState();
    if (!store.currentProject) {
      store.createProject(template.name);
    }

    // Add user message
    addMessage({ role: 'user', content: template.prompt });
    setGenerating(true);

    try {
      const response = await fetch('/api/builder/generate', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          prompt: template.prompt,
          framework: store.settings.framework,
          styling: store.settings.styling,
          typescript: store.settings.typescript,
          existingFiles: store.files,
        }),
      });

      const data = await response.json();

      if (data.files) {
        addMessage({
          role: 'assistant',
          content: data.message || `Generated ${template.name}!`,
          codeGenerated: true,
          files: Object.keys(data.files),
        });
        store.setGeneratedCode(data.files);
      }
    } catch (error) {
      addMessage({
        role: 'assistant',
        content: 'Sorry, failed to generate component. Please try again.',
      });
    } finally {
      setGenerating(false);
    }
  };

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0, y: 10 }}
          animate={{ scale: 1, opacity: 1, y: 0 }}
          exit={{ scale: 0.95, opacity: 0, y: 10 }}
          transition={{ type: 'spring', damping: 25, stiffness: 300 }}
          className="bg-gradient-to-b from-zinc-900 to-zinc-950 border border-zinc-800/80 rounded-2xl w-full max-w-4xl max-h-[80vh] overflow-hidden flex flex-col shadow-2xl shadow-black/50"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="p-4 border-b border-zinc-800">
            <div className="flex items-center justify-between mb-4">
              <div>
                <h2 className="text-lg font-semibold">Component Library</h2>
                <p className="text-sm text-zinc-500">Choose a template to get started quickly</p>
              </div>
              <button
                onClick={onClose}
                className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
              >
                <X size={18} />
              </button>
            </div>

            {/* Search */}
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Search components..."
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-2.5 text-sm focus:outline-none focus:border-violet-500"
              />
            </div>

            {/* Category Filters */}
            <div className="flex gap-2 mt-3 overflow-x-auto pb-1">
              <button
                onClick={() => setSelectedCategory(null)}
                className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors ${
                  !selectedCategory
                    ? 'bg-violet-500 text-white'
                    : 'bg-zinc-800 text-zinc-400 hover:text-white'
                }`}
              >
                All
              </button>
              {CATEGORIES.map(category => (
                <button
                  key={category}
                  onClick={() => setSelectedCategory(category)}
                  className={`px-3 py-1.5 text-xs rounded-full whitespace-nowrap transition-colors ${
                    selectedCategory === category
                      ? 'bg-violet-500 text-white'
                      : 'bg-zinc-800 text-zinc-400 hover:text-white'
                  }`}
                >
                  {category}
                </button>
              ))}
            </div>
          </div>

          {/* Templates Grid */}
          <div className="flex-1 overflow-auto p-4">
            <div className="grid grid-cols-2 md:grid-cols-3 gap-3">
              {filteredTemplates.map((template) => (
                <motion.button
                  key={template.id}
                  whileHover={{ scale: 1.03, y: -2 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => handleSelectTemplate(template)}
                  className="p-4 bg-zinc-800/50 hover:bg-zinc-800 border border-zinc-700/50 hover:border-violet-500/50 rounded-xl text-left transition-all group hover:shadow-xl hover:shadow-violet-500/10"
                >
                  <div className="w-11 h-11 bg-gradient-to-br from-violet-500/20 to-violet-600/10 rounded-xl flex items-center justify-center mb-3 group-hover:from-violet-500/30 group-hover:to-violet-600/20 transition-all">
                    <template.icon size={22} className="text-violet-400" />
                  </div>
                  <h3 className="font-medium text-sm mb-1.5">{template.name}</h3>
                  <p className="text-xs text-zinc-500 line-clamp-2">{template.description}</p>
                  <div className="mt-3">
                    <span className="text-[10px] px-2.5 py-1 bg-zinc-700/80 rounded-full text-zinc-400">
                      {template.category}
                    </span>
                  </div>
                </motion.button>
              ))}
            </div>

            {filteredTemplates.length === 0 && (
              <div className="text-center py-12 text-zinc-500">
                <p>No components found</p>
                <p className="text-sm mt-1">Try a different search term</p>
              </div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
