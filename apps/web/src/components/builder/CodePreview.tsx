'use client';

import { useMemo } from 'react';
import {
  SandpackProvider,
  SandpackPreview,
  useSandpack,
} from '@codesandbox/sandpack-react';
import { RefreshCw, Loader2 } from 'lucide-react';
import { useBuilderStore } from '@/store/builder';
import { opsunaDarkTheme } from './sandpack-theme';

// Transform builder files to Sandpack format
function transformFilesToSandpack(files: Record<string, string>) {
  const sandpackFiles: Record<string, { code: string }> = {};

  for (const [filename, content] of Object.entries(files)) {
    const path = filename.startsWith('/') ? filename : `/${filename}`;
    sandpackFiles[path] = { code: content };
  }

  // Ensure entry point exists
  if (!sandpackFiles['/index.tsx'] && !sandpackFiles['/index.jsx']) {
    sandpackFiles['/index.tsx'] = {
      code: `import React from 'react';
import ReactDOM from 'react-dom/client';
import App from './App';

const root = ReactDOM.createRoot(document.getElementById('root')!);
root.render(<App />);`,
    };
  }

  // Ensure CSS file exists
  if (!sandpackFiles['/index.css']) {
    sandpackFiles['/index.css'] = {
      code: `body { margin: 0; padding: 0; }`,
    };
  }

  return sandpackFiles;
}

// Extract dependencies from imports
function extractDependencies(files: Record<string, string>): Record<string, string> {
  const deps: Record<string, string> = {
    react: '^18.2.0',
    'react-dom': '^18.2.0',
  };

  const importRegex = /import\s+.*?\s+from\s+['"]([^'"./][^'"]*)['"]/g;

  for (const content of Object.values(files)) {
    let match;
    while ((match = importRegex.exec(content)) !== null) {
      const pkg = match[1].split('/')[0];
      if (!deps[pkg] && pkg !== 'react' && pkg !== 'react-dom') {
        deps[pkg] = 'latest';
      }
    }
  }

  // Common UI packages
  const allCode = Object.values(files).join('\n');
  if (allCode.includes('lucide-react')) {
    deps['lucide-react'] = '^0.312.0';
  }
  if (allCode.includes('framer-motion')) {
    deps['framer-motion'] = '^12.0.0';
  }
  if (allCode.includes('recharts')) {
    deps['recharts'] = '^2.12.0';
  }

  return deps;
}

// Inner component for refresh button (needs Sandpack context)
function RefreshButton() {
  const { sandpack } = useSandpack();

  return (
    <button
      onClick={() => sandpack.runSandpack()}
      className="p-1.5 text-zinc-500 hover:text-white rounded transition-colors"
      title="Refresh Preview"
    >
      <RefreshCw size={14} />
    </button>
  );
}

export function CodePreview() {
  const { files } = useBuilderStore();

  const sandpackFiles = useMemo(() => transformFilesToSandpack(files), [files]);
  const dependencies = useMemo(() => extractDependencies(files), [files]);

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      <SandpackProvider
        template="react-ts"
        theme={opsunaDarkTheme}
        files={sandpackFiles}
        customSetup={{
          dependencies,
          entry: '/index.tsx',
        }}
        options={{
          externalResources: ['https://cdn.tailwindcss.com'],
          classes: {
            'sp-wrapper': 'sp-wrapper-custom',
            'sp-preview-container': 'sp-preview-custom',
          },
        }}
      >
        {/* Toolbar */}
        <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-3 shrink-0">
          <span className="text-xs text-zinc-500">Live Preview</span>
          <RefreshButton />
        </div>

        {/* Preview */}
        <div className="flex-1 overflow-hidden">
          <SandpackPreview
            showOpenInCodeSandbox={false}
            showRefreshButton={false}
            showNavigator={false}
            style={{ height: '100%' }}
            actionsChildren={
              <div className="flex items-center gap-1 text-xs text-zinc-500">
                <Loader2 size={12} className="animate-spin" />
                Loading...
              </div>
            }
          />
        </div>
      </SandpackProvider>

      <style jsx global>{`
        .sp-wrapper-custom {
          height: 100% !important;
          display: flex !important;
          flex-direction: column !important;
        }
        .sp-preview-custom {
          flex: 1 !important;
          height: 100% !important;
        }
        .sp-preview-container {
          height: 100% !important;
        }
        .sp-preview-iframe {
          height: 100% !important;
        }
        .sp-preview-actions {
          background: #12181D !important;
          border-top: 1px solid #1F2A33 !important;
        }
        .sp-loading {
          background: #0B0F12 !important;
        }
      `}</style>
    </div>
  );
}
