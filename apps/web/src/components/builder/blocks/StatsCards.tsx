'use client';

import React from 'react';
import { TrendingUp, Users, ShoppingCart, DollarSign, ArrowUpRight, ArrowDownRight, LucideIcon } from 'lucide-react';

interface StatItem {
  label: string;
  value: string;
  change: string;
  trend: 'up' | 'down';
}

interface StatsCardsProps {
  title?: string;
  stats: StatItem[];
  columns?: 2 | 3 | 4;
  accentColor?: 'violet' | 'blue' | 'emerald' | 'orange';
}

const colorMap = {
  violet: 'from-violet-500 to-purple-500',
  blue: 'from-blue-500 to-cyan-500',
  emerald: 'from-emerald-500 to-teal-500',
  orange: 'from-orange-500 to-amber-500',
};

const iconMap: Record<string, LucideIcon> = {
  revenue: DollarSign,
  users: Users,
  sales: ShoppingCart,
  growth: TrendingUp,
};

const defaultStats: StatItem[] = [
  { label: 'Total Revenue', value: '$45,231', change: '+20.1%', trend: 'up' },
  { label: 'Active Users', value: '2,350', change: '+15.2%', trend: 'up' },
  { label: 'Sales', value: '1,247', change: '+8.4%', trend: 'up' },
  { label: 'Growth', value: '23.5%', change: '-2.1%', trend: 'down' },
];

export function StatsCards({
  title = 'Dashboard Overview',
  stats = defaultStats,
  columns = 4,
  accentColor = 'violet',
}: StatsCardsProps) {
  const colClass = {
    2: 'md:grid-cols-2',
    3: 'md:grid-cols-3',
    4: 'md:grid-cols-2 lg:grid-cols-4',
  }[columns];

  return (
    <div className="min-h-full bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        {title && <h1 className="text-2xl font-bold mb-6 text-white">{title}</h1>}

        <div className={`grid grid-cols-1 ${colClass} gap-4`}>
          {stats.map((stat, index) => {
            const Icon = Object.values(iconMap)[index % 4];
            return (
              <div
                key={stat.label}
                className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 hover:border-zinc-700 transition-colors"
              >
                <div className="flex items-center justify-between mb-4">
                  <div className={`p-3 rounded-xl bg-gradient-to-br ${colorMap[accentColor]} bg-opacity-20`}>
                    <Icon size={22} className="text-white" />
                  </div>
                  <span className={`flex items-center gap-1 text-sm font-medium ${
                    stat.trend === 'up' ? 'text-emerald-400' : 'text-red-400'
                  }`}>
                    {stat.trend === 'up' ? <ArrowUpRight size={16} /> : <ArrowDownRight size={16} />}
                    {stat.change}
                  </span>
                </div>

                <h3 className="text-zinc-400 text-sm mb-1">{stat.label}</h3>
                <p className="text-2xl font-bold text-white">{stat.value}</p>

                <div className="mt-4 h-1 bg-zinc-800 rounded-full overflow-hidden">
                  <div
                    className={`h-full bg-gradient-to-r ${colorMap[accentColor]} rounded-full`}
                    style={{ width: `${Math.random() * 40 + 60}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
