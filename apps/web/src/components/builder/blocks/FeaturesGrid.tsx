'use client';

import React from 'react';
import { Zap, Shield, Sparkles, Globe, Cpu, Lock, Rocket, Heart } from 'lucide-react';

interface Feature {
  title: string;
  description: string;
  icon?: string;
}

interface FeaturesGridProps {
  title?: string;
  subtitle?: string;
  features?: Feature[];
  columns?: 2 | 3 | 4;
  accentColor?: 'violet' | 'blue' | 'emerald' | 'rose';
}

const iconMap: Record<string, React.ElementType> = {
  zap: Zap,
  shield: Shield,
  sparkles: Sparkles,
  globe: Globe,
  cpu: Cpu,
  lock: Lock,
  rocket: Rocket,
  heart: Heart,
};

const colorMap = {
  violet: {
    gradient: 'from-violet-500 to-fuchsia-500',
    bg: 'bg-violet-500/10',
    border: 'border-violet-500/20',
    text: 'text-violet-400',
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    bg: 'bg-blue-500/10',
    border: 'border-blue-500/20',
    text: 'text-blue-400',
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-500',
    bg: 'bg-emerald-500/10',
    border: 'border-emerald-500/20',
    text: 'text-emerald-400',
  },
  rose: {
    gradient: 'from-rose-500 to-pink-500',
    bg: 'bg-rose-500/10',
    border: 'border-rose-500/20',
    text: 'text-rose-400',
  },
};

const defaultFeatures: Feature[] = [
  { title: 'Lightning Fast', description: 'Generate UIs in seconds with AI-powered speed', icon: 'zap' },
  { title: 'Secure by Default', description: 'Enterprise-grade security built into every component', icon: 'shield' },
  { title: 'AI-Powered', description: 'Smart component selection based on your description', icon: 'sparkles' },
  { title: 'Global Scale', description: 'Deploy worldwide with edge-optimized delivery', icon: 'globe' },
];

export function FeaturesGrid({
  title = 'Powerful Features',
  subtitle = 'Everything you need to build amazing interfaces',
  features = defaultFeatures,
  columns = 2,
  accentColor = 'violet',
}: FeaturesGridProps) {
  const colors = colorMap[accentColor];

  const gridCols = {
    2: 'sm:grid-cols-2',
    3: 'sm:grid-cols-2 lg:grid-cols-3',
    4: 'sm:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className="min-h-full bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{title}</h2>
          <p className="text-zinc-400 max-w-2xl mx-auto">{subtitle}</p>
        </div>

        <div className={`grid grid-cols-1 ${gridCols} gap-6`}>
          {features.map((feature, index) => {
            const IconComponent = iconMap[feature.icon || 'sparkles'] || Sparkles;
            return (
              <div
                key={`feature-${index}`}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-all hover:-translate-y-1"
              >
                <div className={`w-12 h-12 ${colors.bg} ${colors.border} border rounded-xl flex items-center justify-center mb-4`}>
                  <IconComponent className={colors.text} size={24} />
                </div>
                <h3 className="text-lg font-semibold text-white mb-2">{feature.title}</h3>
                <p className="text-zinc-400 text-sm leading-relaxed">{feature.description}</p>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
