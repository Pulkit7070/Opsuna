'use client';

import React, { useState } from 'react';
import { Check, X, Star } from 'lucide-react';

interface PricingPlan {
  name: string;
  description: string;
  monthlyPrice: number;
  yearlyPrice: number;
  features: string[];
  notIncluded?: string[];
  popular?: boolean;
}

interface PricingCardsProps {
  title?: string;
  subtitle?: string;
  plans: PricingPlan[];
  accentColor?: 'violet' | 'blue' | 'emerald' | 'rose';
}

const colorMap = {
  violet: {
    border: 'border-violet-500 ring-1 ring-violet-500',
    bg: 'bg-violet-600 hover:bg-violet-500',
    badge: 'bg-violet-500',
  },
  blue: {
    border: 'border-blue-500 ring-1 ring-blue-500',
    bg: 'bg-blue-600 hover:bg-blue-500',
    badge: 'bg-blue-500',
  },
  emerald: {
    border: 'border-emerald-500 ring-1 ring-emerald-500',
    bg: 'bg-emerald-600 hover:bg-emerald-500',
    badge: 'bg-emerald-500',
  },
  rose: {
    border: 'border-rose-500 ring-1 ring-rose-500',
    bg: 'bg-rose-600 hover:bg-rose-500',
    badge: 'bg-rose-500',
  },
};

const defaultPlans: PricingPlan[] = [
  {
    name: 'Starter',
    description: 'Perfect for getting started',
    monthlyPrice: 9,
    yearlyPrice: 7,
    features: ['5 projects', '10GB storage', 'Basic support'],
    notIncluded: ['API access', 'Custom domain'],
  },
  {
    name: 'Pro',
    description: 'Best for professionals',
    monthlyPrice: 29,
    yearlyPrice: 23,
    features: ['Unlimited projects', '100GB storage', 'Priority support', 'API access'],
    notIncluded: ['Custom domain'],
    popular: true,
  },
  {
    name: 'Enterprise',
    description: 'For large organizations',
    monthlyPrice: 99,
    yearlyPrice: 79,
    features: ['Unlimited everything', '1TB storage', '24/7 support', 'API access', 'Custom domain'],
  },
];

export function PricingCards({
  title = 'Simple, transparent pricing',
  subtitle = 'Choose the plan that\'s right for you',
  plans = defaultPlans,
  accentColor = 'violet',
}: PricingCardsProps) {
  const [yearly, setYearly] = useState(false);
  const colors = colorMap[accentColor];

  return (
    <div className="min-h-full bg-zinc-950 py-20 px-4">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h1 className="text-4xl font-bold mb-4 text-white">{title}</h1>
          <p className="text-zinc-400 text-lg mb-8">{subtitle}</p>

          <div className="inline-flex items-center gap-3 bg-zinc-900 p-1 rounded-xl">
            <button
              onClick={() => setYearly(false)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                !yearly ? colors.bg + ' text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Monthly
            </button>
            <button
              onClick={() => setYearly(true)}
              className={`px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
                yearly ? colors.bg + ' text-white' : 'text-zinc-400 hover:text-white'
              }`}
            >
              Yearly <span className="text-emerald-400 text-xs">Save 20%</span>
            </button>
          </div>
        </div>

        <div className={`grid gap-6 ${
          plans.length === 2 ? 'md:grid-cols-2 max-w-3xl mx-auto' :
          plans.length === 3 ? 'md:grid-cols-3' :
          'md:grid-cols-2 lg:grid-cols-4'
        }`}>
          {plans.map((plan) => (
            <div
              key={plan.name}
              className={`bg-zinc-900 border rounded-2xl p-6 relative ${
                plan.popular ? colors.border : 'border-zinc-800'
              }`}
            >
              {plan.popular && (
                <div className={`absolute -top-3 left-1/2 -translate-x-1/2 px-3 py-1 ${colors.badge} rounded-full text-xs font-medium flex items-center gap-1 text-white`}>
                  <Star size={12} />
                  Most Popular
                </div>
              )}

              <div className="mb-6">
                <h3 className="text-xl font-semibold mb-2 text-white">{plan.name}</h3>
                <p className="text-zinc-400 text-sm">{plan.description}</p>
              </div>

              <div className="mb-6">
                <span className="text-4xl font-bold text-white">
                  ${yearly ? plan.yearlyPrice : plan.monthlyPrice}
                </span>
                <span className="text-zinc-500">/month</span>
              </div>

              <button className={`w-full py-3 rounded-xl font-medium transition-colors mb-6 ${
                plan.popular
                  ? colors.bg + ' text-white'
                  : 'bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 text-white'
              }`}>
                Get started
              </button>

              <div className="space-y-3">
                {(plan.features || []).map((feature) => (
                  <div key={feature} className="flex items-center gap-2 text-sm">
                    <Check size={16} className="text-emerald-400" />
                    <span className="text-white">{feature}</span>
                  </div>
                ))}
                {(plan.notIncluded || []).map((feature) => (
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
}
