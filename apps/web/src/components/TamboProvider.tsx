'use client';

import React from 'react';
import { TamboProvider } from '@tambo-ai/react';
import { tamboComponents } from '@/lib/tambo-components';

interface TamboWrapperProps {
  children: React.ReactNode;
}

/**
 * Tambo AI Provider wrapper
 * Registers UI components for AI-powered generative UI
 *
 * The API key should be set in NEXT_PUBLIC_TAMBO_API_KEY environment variable
 * Get your key at https://tambo.co
 */
export function TamboWrapper({ children }: TamboWrapperProps) {
  const apiKey = process.env.NEXT_PUBLIC_TAMBO_API_KEY;

  // If no API key, just render children without Tambo
  if (!apiKey) {
    console.warn('[Tambo] No API key found. Set NEXT_PUBLIC_TAMBO_API_KEY for AI-powered UI generation.');
    return <>{children}</>;
  }

  return (
    <TamboProvider
      apiKey={apiKey}
      components={tamboComponents}
    >
      {children}
    </TamboProvider>
  );
}
