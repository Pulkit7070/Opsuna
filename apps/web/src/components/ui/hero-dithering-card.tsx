'use client';

import { ArrowRight } from 'lucide-react';
import { useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';

interface HeroDitheringCardProps {
  badge?: string;
  headline?: React.ReactNode;
  description?: string;
  buttonText?: string;
  buttonHref?: string;
  onButtonClick?: () => void;
}

export function HeroDitheringCard({
  badge = 'AI-Powered DevOps',
  headline,
  description = 'Transform natural language into safe, reviewable action chains. Every command is previewed. Every action is auditable.',
  buttonText = 'Start Automating',
  buttonHref = '/chat',
  onButtonClick,
}: HeroDitheringCardProps) {
  const [isHovered, setIsHovered] = useState(false);

  const defaultHeadline = (
    <>
      Describe your task.
      <br />
      <span className="text-text-primary/70">We execute it safely.</span>
    </>
  );

  return (
    <section className="py-12 w-full flex justify-center items-center px-4 md:px-6">
      <div
        className="w-full max-w-7xl relative"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => setIsHovered(false)}
      >
        <motion.div
          className="relative overflow-hidden rounded-[32px] md:rounded-[48px] border border-border-subtle bg-bg-surface shadow-sm min-h-[500px] md:min-h-[600px] flex flex-col items-center justify-center"
          whileHover={{ scale: 1.005 }}
          transition={{ duration: 0.3 }}
        >
          {/* Animated gradient background */}
          <div className="absolute inset-0 z-0 overflow-hidden">
            <motion.div
              className="absolute -top-1/2 -left-1/2 w-full h-full rounded-full blur-[100px]"
              style={{ background: 'radial-gradient(circle, rgba(15, 227, 194, 0.3) 0%, transparent 70%)' }}
              animate={{
                x: isHovered ? [0, 50, 0] : [0, 20, 0],
                y: isHovered ? [0, 30, 0] : [0, 10, 0],
                scale: isHovered ? [1, 1.2, 1] : [1, 1.05, 1],
              }}
              transition={{ duration: isHovered ? 3 : 8, repeat: Infinity, ease: 'easeInOut' }}
            />
            <motion.div
              className="absolute -bottom-1/2 -right-1/2 w-full h-full rounded-full blur-[100px]"
              style={{ background: 'radial-gradient(circle, rgba(15, 227, 194, 0.2) 0%, transparent 70%)' }}
              animate={{
                x: isHovered ? [0, -40, 0] : [0, -15, 0],
                y: isHovered ? [0, -25, 0] : [0, -8, 0],
                scale: isHovered ? [1.1, 1, 1.1] : [1.05, 1, 1.05],
              }}
              transition={{ duration: isHovered ? 4 : 10, repeat: Infinity, ease: 'easeInOut' }}
            />
            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage: `
                  linear-gradient(rgba(15, 227, 194, 0.5) 1px, transparent 1px),
                  linear-gradient(90deg, rgba(15, 227, 194, 0.5) 1px, transparent 1px)
                `,
                backgroundSize: '40px 40px',
              }}
            />
          </div>

          {/* Gradient overlay for better text readability */}
          <div className="absolute inset-0 z-[1] bg-gradient-to-t from-bg-surface/90 via-bg-surface/50 to-bg-surface/70 pointer-events-none" />

          <div className="relative z-10 px-6 max-w-4xl mx-auto text-center flex flex-col items-center">
            {/* Badge */}
            <motion.div
              className="mb-8 inline-flex items-center gap-2 rounded-full border border-accent/20 bg-accent/10 px-4 py-1.5 text-sm font-medium text-accent backdrop-blur-sm"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5 }}
            >
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-accent opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-accent"></span>
              </span>
              {badge}
            </motion.div>

            {/* Headline */}
            <motion.h2
              className="text-4xl md:text-6xl lg:text-7xl font-bold tracking-tight text-text-primary mb-8 leading-[1.1]"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.1 }}
            >
              {headline || defaultHeadline}
            </motion.h2>

            {/* Description */}
            <motion.p
              className="text-text-secondary text-lg md:text-xl max-w-2xl mb-12 leading-relaxed"
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              {description}
            </motion.p>

            {/* Button */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              {onButtonClick ? (
                <button
                  onClick={onButtonClick}
                  className="group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-accent px-10 md:px-12 text-base font-semibold text-bg-primary transition-all duration-300 hover:bg-accent-hover hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(15,227,194,0.4)]"
                >
                  <span className="relative z-10">{buttonText}</span>
                  <ArrowRight className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                </button>
              ) : (
                <Link
                  href={buttonHref}
                  className="group relative inline-flex h-14 items-center justify-center gap-3 overflow-hidden rounded-full bg-accent px-10 md:px-12 text-base font-semibold text-bg-primary transition-all duration-300 hover:bg-accent-hover hover:scale-105 active:scale-95 hover:shadow-[0_0_30px_rgba(15,227,194,0.4)]"
                >
                  <span className="relative z-10">{buttonText}</span>
                  <ArrowRight className="h-5 w-5 relative z-10 transition-transform duration-300 group-hover:translate-x-1" />
                </Link>
              )}
            </motion.div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}

// CTA Section variant with different default props
export function CTASection() {
  return (
    <HeroDitheringCard
      badge="Ready to automate?"
      headline={
        <>
          Stop context-switching.
          <br />
          <span className="text-text-primary/70">Start describing.</span>
        </>
      }
      description="Join teams who ship faster with AI-powered automation. Every action is safe, reviewable, and reversible."
      buttonText="Start a conversation"
      buttonHref="/chat"
    />
  );
}
