'use client';

import { useCallback, useState } from 'react';
import { Copy, Check, Download } from 'lucide-react';
import { useBuilderStore } from '@/store/builder';

// Simple syntax highlighting
function highlightCode(code: string, language: string): string {
  let highlighted = code
    // Escape HTML
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;');

  if (language === 'tsx' || language === 'jsx' || language === 'ts' || language === 'js') {
    // Keywords
    highlighted = highlighted.replace(
      /\b(import|export|from|const|let|var|function|return|if|else|for|while|class|extends|new|this|async|await|try|catch|throw|typeof|interface|type|default|as)\b/g,
      '<span class="text-purple-400">$1</span>'
    );

    // Strings
    highlighted = highlighted.replace(
      /(["'`])(?:(?!\1)[^\\]|\\.)*\1/g,
      '<span class="text-green-400">$&</span>'
    );

    // Comments
    highlighted = highlighted.replace(
      /(\/\/.*$|\/\*[\s\S]*?\*\/)/gm,
      '<span class="text-zinc-500">$1</span>'
    );

    // JSX tags
    highlighted = highlighted.replace(
      /(&lt;\/?)([\w]+)/g,
      '$1<span class="text-blue-400">$2</span>'
    );

    // Numbers
    highlighted = highlighted.replace(
      /\b(\d+)\b/g,
      '<span class="text-orange-400">$1</span>'
    );

    // Function names
    highlighted = highlighted.replace(
      /\b([a-zA-Z_]\w*)\s*\(/g,
      '<span class="text-yellow-300">$1</span>('
    );
  } else if (language === 'css') {
    // Selectors
    highlighted = highlighted.replace(
      /([.#]?[\w-]+)\s*\{/g,
      '<span class="text-blue-400">$1</span> {'
    );

    // Properties
    highlighted = highlighted.replace(
      /([\w-]+)\s*:/g,
      '<span class="text-purple-400">$1</span>:'
    );

    // Values
    highlighted = highlighted.replace(
      /:\s*([^;]+);/g,
      ': <span class="text-green-400">$1</span>;'
    );
  }

  return highlighted;
}

export function CodeEditor() {
  const { files, activeFile, updateFile } = useBuilderStore();
  const [copied, setCopied] = useState(false);

  const code = activeFile ? files[activeFile] || '' : '';
  const language = activeFile?.split('.').pop() || 'tsx';

  const handleCopy = useCallback(() => {
    navigator.clipboard.writeText(code);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  }, [code]);

  const handleDownload = useCallback(() => {
    if (!activeFile) return;
    const blob = new Blob([code], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = activeFile;
    a.click();
    URL.revokeObjectURL(url);
  }, [activeFile, code]);

  const lineNumbers = code.split('\n').length;

  if (!activeFile) {
    return (
      <div className="h-full flex items-center justify-center text-zinc-500">
        <p>Select a file to edit</p>
      </div>
    );
  }

  return (
    <div className="h-full flex flex-col bg-zinc-950">
      {/* Header */}
      <div className="h-11 border-b border-zinc-800/80 flex items-center justify-between px-4 bg-zinc-900/50">
        <div className="flex items-center gap-3">
          <span className="text-sm text-zinc-300 font-medium">{activeFile}</span>
          <span className="text-[10px] text-zinc-500 px-2 py-1 bg-zinc-800/80 rounded-md border border-zinc-700/30">
            {language.toUpperCase()}
          </span>
        </div>
        <div className="flex items-center gap-1">
          <button
            onClick={handleCopy}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            title="Copy code"
          >
            {copied ? <Check size={15} className="text-green-400" /> : <Copy size={15} />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
            title="Download file"
          >
            <Download size={15} />
          </button>
        </div>
      </div>

      {/* Editor */}
      <div className="flex-1 overflow-auto font-mono text-sm">
        <div className="flex min-h-full">
          {/* Line numbers */}
          <div className="sticky left-0 bg-zinc-950/80 text-right pr-6 pl-6 py-6 select-none text-zinc-600 border-r border-zinc-800/50">
            {Array.from({ length: lineNumbers }, (_, i) => (
              <div key={i + 1} className="leading-7 hover:text-zinc-400 transition-colors">
                {i + 1}
              </div>
            ))}
          </div>

          {/* Code content */}
          <div className="flex-1 relative">
            <pre
              className="absolute inset-0 p-6 leading-7 overflow-auto pointer-events-none selection:bg-violet-500/30"
              dangerouslySetInnerHTML={{
                __html: highlightCode(code, language),
              }}
            />
            <textarea
              value={code}
              onChange={(e) => updateFile(activeFile, e.target.value)}
              className="w-full h-full p-6 leading-7 bg-transparent text-transparent caret-violet-400 resize-none focus:outline-none font-mono selection:bg-violet-500/30"
              spellCheck={false}
              style={{ minHeight: `${lineNumbers * 28 + 48}px` }}
            />
          </div>
        </div>
      </div>
    </div>
  );
}
