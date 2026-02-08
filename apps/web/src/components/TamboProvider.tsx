'use client';

import React from 'react';

interface TamboWrapperProps {
  children: React.ReactNode;
}

// Simplified wrapper - Tambo integration is optional
// The main Opsuna functionality uses our own backend API
export function TamboWrapper({ children }: TamboWrapperProps) {
  return <>{children}</>;
}
