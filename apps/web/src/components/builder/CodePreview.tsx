'use client';

import { useState, useEffect, useMemo } from 'react';
import { AlertTriangle, RefreshCw, ExternalLink, Smartphone, Tablet, Monitor } from 'lucide-react';
import { useBuilderStore } from '@/store/builder';

type DeviceSize = 'mobile' | 'tablet' | 'desktop';

const DEVICE_SIZES: Record<DeviceSize, { width: string; icon: typeof Monitor }> = {
  mobile: { width: '375px', icon: Smartphone },
  tablet: { width: '768px', icon: Tablet },
  desktop: { width: '100%', icon: Monitor },
};

export function CodePreview() {
  const [deviceSize, setDeviceSize] = useState<DeviceSize>('desktop');
  const [iframeKey, setIframeKey] = useState(0);
  const { files, previewError, setPreviewError } = useBuilderStore();

  // Generate preview HTML
  const previewHtml = useMemo(() => {
    const appCode = files['App.tsx'] || files['App.jsx'] || '';
    const cssCode = files['index.css'] || '';

    // Transform JSX to something renderable
    // In production, you'd use Babel or a bundler
    const transformedCode = transformJSXToHTML(appCode);

    return `
<!DOCTYPE html>
<html lang="en" class="dark">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <script src="https://cdn.tailwindcss.com"></script>
  <script>
    tailwind.config = {
      darkMode: 'class',
      theme: {
        extend: {
          colors: {
            background: 'hsl(222.2 84% 4.9%)',
            foreground: 'hsl(210 40% 98%)',
          }
        }
      }
    }
  </script>
  <style>
    ${cssCode}
    body { margin: 0; background: hsl(222.2 84% 4.9%); }
  </style>
</head>
<body>
  <div id="root">${transformedCode}</div>
  <script>
    // Handle errors
    window.onerror = function(msg, url, lineNo, columnNo, error) {
      window.parent.postMessage({ type: 'preview-error', error: msg }, '*');
      return false;
    };
  </script>
</body>
</html>
    `;
  }, [files]);

  // Listen for errors from iframe
  useEffect(() => {
    const handleMessage = (event: MessageEvent) => {
      if (event.data?.type === 'preview-error') {
        setPreviewError(event.data.error);
      }
    };

    window.addEventListener('message', handleMessage);
    return () => window.removeEventListener('message', handleMessage);
  }, [setPreviewError]);

  const handleRefresh = () => {
    setIframeKey(prev => prev + 1);
    setPreviewError(null);
  };

  return (
    <div className="h-full flex flex-col bg-zinc-900">
      {/* Toolbar */}
      <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-3">
        <div className="flex items-center gap-1">
          {(Object.entries(DEVICE_SIZES) as [DeviceSize, typeof DEVICE_SIZES.mobile][]).map(([size, config]) => (
            <button
              key={size}
              onClick={() => setDeviceSize(size)}
              className={`p-1.5 rounded transition-colors ${
                deviceSize === size
                  ? 'bg-zinc-700 text-white'
                  : 'text-zinc-500 hover:text-white'
              }`}
              title={size.charAt(0).toUpperCase() + size.slice(1)}
            >
              <config.icon size={14} />
            </button>
          ))}
        </div>

        <div className="flex items-center gap-2">
          <span className="text-xs text-zinc-500">Preview</span>
          <button
            onClick={handleRefresh}
            className="p-1.5 text-zinc-500 hover:text-white rounded transition-colors"
            title="Refresh Preview"
          >
            <RefreshCw size={14} />
          </button>
        </div>
      </div>

      {/* Preview Area */}
      <div className="flex-1 overflow-auto p-4 bg-zinc-950">
        {previewError ? (
          <div className="h-full flex items-center justify-center">
            <div className="text-center p-6 bg-red-500/10 border border-red-500/20 rounded-xl max-w-md">
              <AlertTriangle className="w-10 h-10 text-red-400 mx-auto mb-3" />
              <h3 className="font-semibold text-red-400 mb-2">Preview Error</h3>
              <p className="text-sm text-zinc-400 mb-4">{previewError}</p>
              <button
                onClick={handleRefresh}
                className="px-4 py-2 bg-red-500/20 hover:bg-red-500/30 text-red-400 rounded-lg text-sm transition-colors"
              >
                Try Again
              </button>
            </div>
          </div>
        ) : (
          <div
            className={`mx-auto bg-zinc-900 rounded-lg overflow-hidden shadow-2xl transition-all duration-300 ${
              deviceSize !== 'desktop' ? 'border border-zinc-700' : ''
            }`}
            style={{
              width: DEVICE_SIZES[deviceSize].width,
              height: deviceSize === 'desktop' ? '100%' : '667px',
            }}
          >
            <iframe
              key={iframeKey}
              srcDoc={previewHtml}
              className="w-full h-full border-0"
              title="Preview"
              sandbox="allow-scripts"
            />
          </div>
        )}
      </div>
    </div>
  );
}

// Simple JSX to HTML transformer (for demo purposes)
// In production, use Babel or similar
function transformJSXToHTML(jsxCode: string): string {
  try {
    // Extract the return statement content
    const returnMatch = jsxCode.match(/return\s*\(\s*([\s\S]*?)\s*\);?\s*\}/);
    if (!returnMatch) {
      // Try simpler return
      const simpleReturn = jsxCode.match(/return\s+([\s\S]*?);?\s*\}/);
      if (!simpleReturn) return '<div class="p-8 text-center text-zinc-500">No component to preview</div>';
      return transformJSX(simpleReturn[1]);
    }

    return transformJSX(returnMatch[1]);
  } catch (error) {
    console.error('Transform error:', error);
    return '<div class="p-8 text-center text-red-400">Error parsing component</div>';
  }
}

function transformJSX(jsx: string): string {
  let html = jsx;

  // Replace className with class
  html = html.replace(/className=/g, 'class=');

  // Replace self-closing tags
  html = html.replace(/<(\w+)([^>]*?)\/>/g, '<$1$2></$1>');

  // Remove JSX expressions (simple ones)
  html = html.replace(/\{[^}]+\}/g, (match) => {
    // If it's a string literal, extract it
    const stringMatch = match.match(/['"]([^'"]+)['"]/);
    if (stringMatch) return stringMatch[1];
    // If it's a number, keep it
    if (/^\{\s*\d+\s*\}$/.test(match)) return match.slice(1, -1);
    return '';
  });

  // Handle common React patterns
  html = html.replace(/<Fragment>/g, '').replace(/<\/Fragment>/g, '');
  html = html.replace(/<>/g, '').replace(/<\/>/g, '');

  return html;
}
