'use client';

import { motion } from 'framer-motion';
import {
  LineChart,
  Line,
  BarChart,
  Bar,
  PieChart,
  Pie,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  Cell,
} from 'recharts';
import { BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

type ChartType = 'line' | 'bar' | 'pie' | 'area';

interface DataPoint {
  name: string;
  value: number;
}

interface DataChartProps {
  title: string;
  type: ChartType;
  data: DataPoint[];
  xAxisLabel?: string;
  yAxisLabel?: string;
}

const COLORS = [
  '#FF6B35', // accent-orange
  '#3B82F6', // accent-blue
  '#10B981', // accent-green
  '#F59E0B', // accent-gold
  '#EF4444', // accent-red
  '#8B5CF6', // purple
  '#EC4899', // pink
  '#06B6D4', // cyan
];

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-surface-elevated border border-border-subtle rounded-lg p-2 shadow-lg">
        <p className="text-sm text-text-primary">{label}</p>
        <p className="text-sm font-bold text-accent-blue">
          {payload[0].value.toLocaleString()}
        </p>
      </div>
    );
  }
  return null;
};

export function DataChart({
  title,
  type,
  data,
  xAxisLabel,
  yAxisLabel,
}: DataChartProps) {
  const renderChart = () => {
    switch (type) {
      case 'line':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Line
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                dot={{ fill: '#3B82F6', strokeWidth: 0, r: 4 }}
                activeDot={{ r: 6, stroke: '#3B82F6', strokeWidth: 2, fill: '#1A1A1A' }}
              />
            </LineChart>
          </ResponsiveContainer>
        );

      case 'bar':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <BarChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <Bar dataKey="value" radius={[4, 4, 0, 0]}>
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Bar>
            </BarChart>
          </ResponsiveContainer>
        );

      case 'pie':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <PieChart>
              <Pie
                data={data}
                cx="50%"
                cy="50%"
                innerRadius={40}
                outerRadius={80}
                paddingAngle={2}
                dataKey="value"
              >
                {data.map((_, index) => (
                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                ))}
              </Pie>
              <Tooltip content={<CustomTooltip />} />
            </PieChart>
          </ResponsiveContainer>
        );

      case 'area':
        return (
          <ResponsiveContainer width="100%" height={200}>
            <AreaChart data={data} margin={{ top: 5, right: 20, bottom: 5, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2D2D2D" />
              <XAxis
                dataKey="name"
                stroke="#6B7280"
                fontSize={12}
                tickLine={false}
              />
              <YAxis stroke="#6B7280" fontSize={12} tickLine={false} />
              <Tooltip content={<CustomTooltip />} />
              <defs>
                <linearGradient id="colorValue" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#3B82F6" stopOpacity={0.3} />
                  <stop offset="95%" stopColor="#3B82F6" stopOpacity={0} />
                </linearGradient>
              </defs>
              <Area
                type="monotone"
                dataKey="value"
                stroke="#3B82F6"
                strokeWidth={2}
                fill="url(#colorValue)"
              />
            </AreaChart>
          </ResponsiveContainer>
        );

      default:
        return null;
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle bg-surface-elevated p-5"
    >
      {/* Header */}
      <div className="flex items-center gap-2 mb-4">
        <div className="p-2 rounded-lg bg-accent-blue/20">
          <BarChart3 className="w-4 h-4 text-accent-blue" />
        </div>
        <h3 className="font-semibold text-text-primary">{title}</h3>
      </div>

      {/* Chart */}
      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ delay: 0.2 }}
      >
        {renderChart()}
      </motion.div>

      {/* Axis Labels */}
      {(xAxisLabel || yAxisLabel) && (
        <div className="flex justify-between mt-2 text-xs text-text-muted">
          {xAxisLabel && <span>{xAxisLabel}</span>}
          {yAxisLabel && <span>{yAxisLabel}</span>}
        </div>
      )}

      {/* Legend for pie chart */}
      {type === 'pie' && (
        <div className="flex flex-wrap gap-2 mt-4 justify-center">
          {data.map((entry, index) => (
            <div key={entry.name} className="flex items-center gap-1 text-xs">
              <div
                className="w-3 h-3 rounded-full"
                style={{ backgroundColor: COLORS[index % COLORS.length] }}
              />
              <span className="text-text-muted">{entry.name}</span>
            </div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
