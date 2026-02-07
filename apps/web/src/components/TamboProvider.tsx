'use client';

import React from 'react';

interface TamboWrapperProps {
  children: React.ReactNode;
}

// Simplified wrapper - uses our own backend API instead of Tambo cloud
export function TamboWrapper({ children }: TamboWrapperProps) {
  return <>{children}</>;
}
