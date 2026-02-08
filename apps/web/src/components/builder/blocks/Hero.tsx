'use client';

import React from 'react';
import { ArrowRight, Check, Star, Sparkles } from 'lucide-react';

interface HeroProps {
  badge?: string;
  title?: string;
  subtitle?: string;
  primaryButtonText?: string;
  secondaryButtonText?: string;
  features?: string[];
  accentColor?: 'violet' | 'blue' | 'emerald' | 'rose';
}

const colorMap = {
  violet: {
    gradient: 'from-violet-600 to-fuchsia-600',
    hover: 'hover:from-violet-500 hover:to-fuchsia-500',
    badge: 'bg-violet-500/10 border-violet-500/20 text-violet-400',
  },
  blue: {
    gradient: 'from-blue-600 to-cyan-600',
    hover: 'hover:from-blue-500 hover:to-cyan-500',
    badge: 'bg-blue-500/10 border-blue-500/20 text-blue-400',
  },
  emerald: {
    gradient: 'from-emerald-600 to-teal-600',
    hover: 'hover:from-emerald-500 hover:to-teal-500',
    badge: 'bg-emerald-500/10 border-emerald-500/20 text-emerald-400',
  },
  rose: {
    gradient: 'from-rose-600 to-pink-600',
    hover: 'hover:from-rose-500 hover:to-pink-500',
    badge: 'bg-rose-500/10 border-rose-500/20 text-rose-400',
  },
};

export function Hero({
  badge = 'New Release',
  title = 'Build amazing products faster',
  subtitle = 'The all-in-one platform for building, deploying, and scaling your applications with ease.',
  primaryButtonText = 'Get Started',
  secondaryButtonText = 'Learn More',
  features = ['Free to start', 'No credit card required', 'Cancel anytime'],
  accentColor = 'violet',
}: HeroProps) {
  const colors = colorMap[accentColor];

  return (
    <div className="min-h-full bg-zinc-950 flex items-center justify-center px-4 py-20">
      <div className="max-w-4xl mx-auto text-center">
        {badge && (
          <div className={`inline-flex items-center gap-2 px-3 py-1 ${colors.badge} border rounded-full text-sm mb-6`}>
            <Star size={14} />
            <span>{badge}</span>
          </div>
        )}

        <h1 className="text-3xl sm:text-5xl md:text-6xl font-bold mb-6 bg-gradient-to-r from-white via-zinc-300 to-zinc-500 bg-clip-text text-transparent">
          {title}
        </h1>

        <p className="text-base sm:text-xl text-zinc-400 mb-8 max-w-2xl mx-auto">
          {subtitle}
        </p>

        <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
          <button className={`w-full sm:w-auto px-8 py-3 bg-gradient-to-r ${colors.gradient} ${colors.hover} rounded-xl font-medium transition-colors flex items-center justify-center gap-2 text-white`}>
            {primaryButtonText}
            <ArrowRight size={18} />
          </button>
          <button className="w-full sm:w-auto px-8 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl font-medium transition-colors text-white">
            {secondaryButtonText}
          </button>
        </div>

        {features && features.length > 0 && (
          <div className="flex items-center justify-center gap-6 mt-8 text-sm text-zinc-500 flex-wrap">
            {features.map((feature, index) => (
              <span key={`feature-${index}`} className="flex items-center gap-1">
                <Check size={16} className="text-green-500" />
                {feature}
              </span>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
