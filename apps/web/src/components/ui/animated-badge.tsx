'use client';

import Link from 'next/link';
import { ChevronRight } from 'lucide-react';
import { motion } from 'framer-motion';

type AnimatedBadgeProps = {
  text?: string;
  color?: string;
  href?: string;
};

function hexToRgba(hexColor: string, alpha: number): string {
  const hex = hexColor.replace('#', '');
  if (hex.length === 3) {
    const r = parseInt(hex[0] + hex[0], 16);
    const g = parseInt(hex[1] + hex[1], 16);
    const b = parseInt(hex[2] + hex[2], 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  if (hex.length === 6) {
    const r = parseInt(hex.substring(0, 2), 16);
    const g = parseInt(hex.substring(2, 4), 16);
    const b = parseInt(hex.substring(4, 6), 16);
    return `rgba(${r}, ${g}, ${b}, ${alpha})`;
  }
  return hexColor;
}

export function AnimatedBadge({
  text = 'AI-Powered DevOps',
  color = '#0FE3C2',
  href,
}: AnimatedBadgeProps) {
  const content = (
    <motion.div
      initial={{ opacity: 0, y: 10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, delay: 0.1, ease: 'easeOut' }}
      className="group relative flex max-w-fit items-center justify-center gap-2 rounded-full border border-border-subtle bg-bg-surface/80 px-4 py-1.5 text-text-secondary backdrop-blur-sm transition-all duration-300 hover:border-accent/30 hover:bg-bg-elevated/80"
    >
      {/* Pulsing dot */}
      <div
        className="relative flex h-1.5 w-1.5 items-center justify-center rounded-full"
        style={{ backgroundColor: hexToRgba(color, 0.4) }}
      >
        <span
          className="absolute flex h-2.5 w-2.5 animate-ping rounded-full"
          style={{ backgroundColor: color, opacity: 0.6 }}
        />
        <span
          className="absolute h-1.5 w-1.5 rounded-full"
          style={{ backgroundColor: color }}
        />
      </div>

      {/* Divider */}
      <div className="mx-1.5 h-4 w-px bg-border-subtle" />

      {/* Text */}
      <span className="text-xs font-medium" style={{ color }}>
        {text}
      </span>

      {/* Arrow */}
      <ChevronRight
        className="ml-0.5 h-3.5 w-3.5 transition-transform duration-200 group-hover:translate-x-0.5"
        style={{ color: hexToRgba(color, 0.7) }}
      />
    </motion.div>
  );

  return href ? (
    <Link href={href} className="inline-block">
      {content}
    </Link>
  ) : (
    content
  );
}
