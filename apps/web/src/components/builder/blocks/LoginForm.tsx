'use client';

import React, { useState } from 'react';
import { Mail, Lock, Eye, EyeOff, ArrowRight, Github } from 'lucide-react';

interface LoginFormProps {
  title?: string;
  subtitle?: string;
  showSocialLogin?: boolean;
  showForgotPassword?: boolean;
  showRememberMe?: boolean;
  buttonText?: string;
  accentColor?: 'violet' | 'blue' | 'emerald' | 'rose';
}

const colorMap = {
  violet: {
    gradient: 'from-violet-600 to-fuchsia-600',
    hover: 'hover:from-violet-500 hover:to-fuchsia-500',
    focus: 'focus:border-violet-500 focus:ring-violet-500',
    text: 'text-violet-400',
    bg: 'bg-violet-500',
  },
  blue: {
    gradient: 'from-blue-600 to-cyan-600',
    hover: 'hover:from-blue-500 hover:to-cyan-500',
    focus: 'focus:border-blue-500 focus:ring-blue-500',
    text: 'text-blue-400',
    bg: 'bg-blue-500',
  },
  emerald: {
    gradient: 'from-emerald-600 to-teal-600',
    hover: 'hover:from-emerald-500 hover:to-teal-500',
    focus: 'focus:border-emerald-500 focus:ring-emerald-500',
    text: 'text-emerald-400',
    bg: 'bg-emerald-500',
  },
  rose: {
    gradient: 'from-rose-600 to-pink-600',
    hover: 'hover:from-rose-500 hover:to-pink-500',
    focus: 'focus:border-rose-500 focus:ring-rose-500',
    text: 'text-rose-400',
    bg: 'bg-rose-500',
  },
};

export function LoginForm({
  title = 'Welcome back',
  subtitle = 'Sign in to your account to continue',
  showSocialLogin = true,
  showForgotPassword = true,
  showRememberMe = true,
  buttonText = 'Sign in',
  accentColor = 'violet',
}: LoginFormProps) {
  const [showPassword, setShowPassword] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);

  const colors = colorMap[accentColor];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setIsLoading(true);
    setTimeout(() => setIsLoading(false), 1500);
  };

  return (
    <div className="min-h-full bg-zinc-950 flex items-center justify-center p-4">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <div className={`w-16 h-16 bg-gradient-to-br ${colors.gradient} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
            <Lock className="text-white" size={28} />
          </div>
          <h1 className="text-2xl font-bold text-white">{title}</h1>
          <p className="text-zinc-400 mt-2">{subtitle}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-8">
          <form onSubmit={handleSubmit} className="space-y-5">
            <div>
              <label className="block text-sm font-medium mb-2 text-white">Email address</label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="you@example.com"
                  className={`w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-4 py-3 text-sm text-white focus:outline-none ${colors.focus} focus:ring-1 transition-colors`}
                  required
                />
              </div>
            </div>

            <div>
              <div className="flex items-center justify-between mb-2">
                <label className="text-sm font-medium text-white">Password</label>
                {showForgotPassword && (
                  <a href="#" className={`text-sm ${colors.text} hover:opacity-80 transition-colors`}>
                    Forgot password?
                  </a>
                )}
              </div>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" size={18} />
                <input
                  type={showPassword ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  className={`w-full bg-zinc-800 border border-zinc-700 rounded-xl pl-10 pr-12 py-3 text-sm text-white focus:outline-none ${colors.focus} focus:ring-1 transition-colors`}
                  required
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition-colors"
                >
                  {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
                </button>
              </div>
            </div>

            {showRememberMe && (
              <div className="flex items-center gap-2">
                <input
                  type="checkbox"
                  id="remember"
                  className={`w-4 h-4 bg-zinc-800 border-zinc-700 rounded ${colors.text}`}
                />
                <label htmlFor="remember" className="text-sm text-zinc-400">
                  Remember me for 30 days
                </label>
              </div>
            )}

            <button
              type="submit"
              disabled={isLoading}
              className={`w-full bg-gradient-to-r ${colors.gradient} ${colors.hover} disabled:opacity-50 disabled:cursor-not-allowed rounded-xl py-3 font-medium transition-all flex items-center justify-center gap-2 text-white`}
            >
              {isLoading ? (
                <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin" />
              ) : (
                <>
                  {buttonText}
                  <ArrowRight size={18} />
                </>
              )}
            </button>
          </form>

          {showSocialLogin && (
            <>
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-zinc-800" />
                </div>
                <div className="relative flex justify-center">
                  <span className="bg-zinc-900 px-4 text-sm text-zinc-500">Or continue with</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3">
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-colors text-white">
                  <Github size={18} />
                  <span className="text-sm font-medium">GitHub</span>
                </button>
                <button className="flex items-center justify-center gap-2 px-4 py-3 bg-zinc-800 hover:bg-zinc-700 border border-zinc-700 rounded-xl transition-colors text-white">
                  <svg className="w-[18px] h-[18px]" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  <span className="text-sm font-medium">Google</span>
                </button>
              </div>
            </>
          )}
        </div>

        <p className="text-center mt-6 text-zinc-400 text-sm">
          Don't have an account?{' '}
          <a href="#" className={`${colors.text} hover:opacity-80 font-medium transition-colors`}>
            Sign up for free
          </a>
        </p>
      </div>
    </div>
  );
}
