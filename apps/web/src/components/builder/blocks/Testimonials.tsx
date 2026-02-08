'use client';

import React from 'react';
import { Star, Quote } from 'lucide-react';

interface Testimonial {
  name: string;
  role: string;
  company?: string;
  content: string;
  rating?: number;
  avatar?: string;
}

interface TestimonialsProps {
  title?: string;
  subtitle?: string;
  testimonials?: Testimonial[];
  accentColor?: 'violet' | 'blue' | 'emerald' | 'rose';
}

const colorMap = {
  violet: {
    gradient: 'from-violet-500 to-fuchsia-500',
    text: 'text-violet-400',
    bg: 'bg-violet-500',
  },
  blue: {
    gradient: 'from-blue-500 to-cyan-500',
    text: 'text-blue-400',
    bg: 'bg-blue-500',
  },
  emerald: {
    gradient: 'from-emerald-500 to-teal-500',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500',
  },
  rose: {
    gradient: 'from-rose-500 to-pink-500',
    text: 'text-rose-400',
    bg: 'bg-rose-500',
  },
};

const defaultTestimonials: Testimonial[] = [
  {
    name: 'Sarah Chen',
    role: 'Product Manager',
    company: 'TechCorp',
    content: 'This tool has completely transformed how our team works. The AI understands exactly what we need.',
    rating: 5,
  },
  {
    name: 'Marcus Johnson',
    role: 'Engineering Lead',
    company: 'StartupXYZ',
    content: 'Incredible speed and accuracy. We build prototypes 10x faster than before.',
    rating: 5,
  },
  {
    name: 'Emily Rodriguez',
    role: 'Designer',
    company: 'Creative Studio',
    content: 'The generated UIs are beautiful and exactly match what I describe. Game changer!',
    rating: 4,
  },
];

export function Testimonials({
  title = 'What Our Users Say',
  subtitle = 'Trusted by thousands of developers and teams worldwide',
  testimonials = defaultTestimonials,
  accentColor = 'violet',
}: TestimonialsProps) {
  const colors = colorMap[accentColor];

  return (
    <div className="min-h-full bg-zinc-950 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-12">
          <h2 className="text-2xl sm:text-3xl font-bold text-white mb-3">{title}</h2>
          <p className="text-zinc-400">{subtitle}</p>
        </div>

        <div className="flex flex-wrap justify-center gap-6">
          {testimonials.map((testimonial, index) => (
            <div
              key={`testimonial-${index}`}
              className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 flex-1 min-w-[280px] max-w-[380px] hover:border-zinc-700 transition-colors"
            >
              <Quote className={`${colors.text} mb-4`} size={24} />

              <p className="text-zinc-300 mb-6 leading-relaxed">
                "{testimonial.content}"
              </p>

              {testimonial.rating && (
                <div className="flex gap-1 mb-4">
                  {Array.from({ length: 5 }).map((_, i) => (
                    <Star
                      key={i}
                      size={16}
                      className={i < testimonial.rating! ? 'text-yellow-400 fill-yellow-400' : 'text-zinc-600'}
                    />
                  ))}
                </div>
              )}

              <div className="flex items-center gap-3">
                <div className={`w-10 h-10 rounded-full bg-gradient-to-br ${colors.gradient} flex items-center justify-center text-white font-semibold`}>
                  {testimonial.name.charAt(0)}
                </div>
                <div>
                  <p className="font-medium text-white">{testimonial.name}</p>
                  <p className="text-sm text-zinc-500">
                    {testimonial.role}
                    {testimonial.company && ` at ${testimonial.company}`}
                  </p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
