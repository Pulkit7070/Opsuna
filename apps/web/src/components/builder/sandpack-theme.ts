import type { SandpackTheme } from '@codesandbox/sandpack-react';

export const opsunaDarkTheme: SandpackTheme = {
  colors: {
    surface1: '#0B0F12',
    surface2: '#12181D',
    surface3: '#182028',
    clickable: '#9FB0C0',
    base: '#F5F7FA',
    disabled: '#6B7C8F',
    hover: '#0FE3C2',
    accent: '#0FE3C2',
    error: '#F87171',
    errorSurface: 'rgba(248, 113, 113, 0.1)',
  },
  syntax: {
    plain: '#F5F7FA',
    comment: { color: '#6B7C8F', fontStyle: 'italic' },
    keyword: '#C792EA',
    tag: '#60A5FA',
    punctuation: '#9FB0C0',
    definition: '#0FE3C2',
    property: '#82AAFF',
    static: '#FBBF24',
    string: '#34D399',
  },
  font: {
    body: 'Inter, system-ui, sans-serif',
    mono: 'JetBrains Mono, Consolas, monospace',
    size: '14px',
    lineHeight: '1.6',
  },
};
