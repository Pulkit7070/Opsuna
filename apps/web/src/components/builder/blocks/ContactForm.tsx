'use client';

import React, { useState } from 'react';
import { Send, Mail, User, MessageSquare, Loader2 } from 'lucide-react';

interface ContactFormProps {
  title?: string;
  subtitle?: string;
  fields?: Array<'name' | 'email' | 'subject' | 'message'>;
  buttonText?: string;
  accentColor?: 'violet' | 'blue' | 'emerald' | 'rose';
}

const colorMap = {
  violet: {
    gradient: 'from-violet-600 to-fuchsia-600',
    hover: 'hover:from-violet-500 hover:to-fuchsia-500',
    focus: 'focus:border-violet-500 focus:ring-violet-500',
    text: 'text-violet-400',
  },
  blue: {
    gradient: 'from-blue-600 to-cyan-600',
    hover: 'hover:from-blue-500 hover:to-cyan-500',
    focus: 'focus:border-blue-500 focus:ring-blue-500',
    text: 'text-blue-400',
  },
  emerald: {
    gradient: 'from-emerald-600 to-teal-600',
    hover: 'hover:from-emerald-500 hover:to-teal-500',
    focus: 'focus:border-emerald-500 focus:ring-emerald-500',
    text: 'text-emerald-400',
  },
  rose: {
    gradient: 'from-rose-600 to-pink-600',
    hover: 'hover:from-rose-500 hover:to-pink-500',
    focus: 'focus:border-rose-500 focus:ring-rose-500',
    text: 'text-rose-400',
  },
};

export function ContactForm({
  title = 'Get in Touch',
  subtitle = "We'd love to hear from you. Send us a message!",
  fields = ['name', 'email', 'message'],
  buttonText = 'Send Message',
  accentColor = 'violet',
}: ContactFormProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: '',
    email: '',
    subject: '',
    message: '',
  });

  const colors = colorMap[accentColor];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    setTimeout(() => setIsSubmitting(false), 1500);
  };

  const handleChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  return (
    <div className="min-h-full bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-lg">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 bg-gradient-to-br ${colors.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <MessageSquare className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-zinc-400 mt-2">{subtitle}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 sm:p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            {fields.includes('name') && (
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Your Name</label>
                <div className="relative">
                  <User className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="text"
                    value={formData.name}
                    onChange={(e) => handleChange('name', e.target.value)}
                    placeholder="John Doe"
                    className={`w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none ${colors.focus} focus:ring-1 transition-colors`}
                  />
                </div>
              </div>
            )}

            {fields.includes('email') && (
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Email Address</label>
                <div className="relative">
                  <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => handleChange('email', e.target.value)}
                    placeholder="you@example.com"
                    className={`w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none ${colors.focus} focus:ring-1 transition-colors`}
                  />
                </div>
              </div>
            )}

            {fields.includes('subject') && (
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Subject</label>
                <input
                  type="text"
                  value={formData.subject}
                  onChange={(e) => handleChange('subject', e.target.value)}
                  placeholder="How can we help?"
                  className={`w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none ${colors.focus} focus:ring-1 transition-colors`}
                />
              </div>
            )}

            {fields.includes('message') && (
              <div>
                <label className="block text-sm font-medium mb-2 text-white">Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => handleChange('message', e.target.value)}
                  placeholder="Tell us what's on your mind..."
                  rows={4}
                  className={`w-full bg-zinc-800 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white focus:outline-none ${colors.focus} focus:ring-1 transition-colors resize-none`}
                />
              </div>
            )}

            <button
              type="submit"
              disabled={isSubmitting}
              className={`w-full bg-gradient-to-r ${colors.gradient} ${colors.hover} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 font-medium transition-all flex items-center justify-center gap-2 text-white`}
            >
              {isSubmitting ? (
                <Loader2 size={18} className="animate-spin" />
              ) : (
                <>
                  {buttonText}
                  <Send size={18} />
                </>
              )}
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
