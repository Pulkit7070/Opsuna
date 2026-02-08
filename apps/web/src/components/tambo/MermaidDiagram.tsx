'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { GitBranch, Copy, Check, Download, ZoomIn, ZoomOut } from 'lucide-react';

interface MermaidDiagramProps {
  title: string;
  diagram: string;
  diagramType?: 'flowchart' | 'sequence' | 'class' | 'er' | 'state';
}

export function MermaidDiagram({ title, diagram, diagramType = 'flowchart' }: MermaidDiagramProps) {
  const containerRef = useRef<HTMLDivElement>(null);
  const [svg, setSvg] = useState<string>('');
  const [error, setError] = useState<string | null>(null);
  const [copied, setCopied] = useState(false);
  const [zoom, setZoom] = useState(1);
  const [isInitialized, setIsInitialized] = useState(false);

  // Initialize mermaid only on client-side
  useEffect(() => {
    const initMermaid = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        mermaid.initialize({
          startOnLoad: false,
          theme: 'dark',
          themeVariables: {
            primaryColor: '#3B82F6',
            primaryTextColor: '#E5E7EB',
            primaryBorderColor: '#4B5563',
            lineColor: '#6B7280',
            secondaryColor: '#1F2937',
            tertiaryColor: '#111827',
            background: '#0A0A0A',
            mainBkg: '#1F2937',
            nodeBorder: '#4B5563',
            clusterBkg: '#1F2937',
            clusterBorder: '#374151',
            titleColor: '#F9FAFB',
            edgeLabelBackground: '#1F2937',
          },
          flowchart: {
            htmlLabels: true,
            curve: 'basis',
            padding: 15,
          },
          securityLevel: 'loose',
        });
        setIsInitialized(true);
      } catch (err) {
        console.error('Failed to initialize mermaid:', err);
        setError('Failed to load diagram library');
      }
    };

    initMermaid();
  }, []);

  // Render diagram when initialized and diagram changes
  useEffect(() => {
    if (!isInitialized || !diagram) return;

    const renderDiagram = async () => {
      try {
        const mermaid = (await import('mermaid')).default;
        const id = `mermaid-${Date.now()}`;
        const { svg: renderedSvg } = await mermaid.render(id, diagram);
        setSvg(renderedSvg);
        setError(null);
      } catch (err) {
        console.error('Mermaid rendering error:', err);
        setError('Failed to render diagram');
      }
    };

    renderDiagram();
  }, [diagram, isInitialized]);

  const handleCopy = () => {
    navigator.clipboard.writeText(diagram);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  const handleDownload = () => {
    if (!svg) return;
    const blob = new Blob([svg], { type: 'image/svg+xml' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${title.toLowerCase().replace(/\s+/g, '-')}.svg`;
    a.click();
    URL.revokeObjectURL(url);
  };

  const handleZoomIn = () => setZoom(z => Math.min(z + 0.25, 2));
  const handleZoomOut = () => setZoom(z => Math.max(z - 0.25, 0.5));

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle bg-bg-elevated overflow-hidden"
    >
      {/* Header */}
      <div className="flex items-center justify-between p-4 border-b border-border-subtle bg-bg-surface/50">
        <div className="flex items-center gap-2">
          <div className="p-2 rounded-lg bg-violet-500/20">
            <GitBranch className="w-4 h-4 text-violet-400" />
          </div>
          <div>
            <h3 className="font-semibold text-text-primary">{title}</h3>
            <p className="text-xs text-text-muted capitalize">{diagramType} diagram</p>
          </div>
        </div>

        <div className="flex items-center gap-1">
          <button
            onClick={handleZoomOut}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
            title="Zoom out"
          >
            <ZoomOut className="w-4 h-4" />
          </button>
          <span className="text-xs text-text-muted w-12 text-center">{Math.round(zoom * 100)}%</span>
          <button
            onClick={handleZoomIn}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
            title="Zoom in"
          >
            <ZoomIn className="w-4 h-4" />
          </button>
          <div className="w-px h-6 bg-border-subtle mx-1" />
          <button
            onClick={handleCopy}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
            title="Copy diagram code"
          >
            {copied ? <Check className="w-4 h-4 text-green-400" /> : <Copy className="w-4 h-4" />}
          </button>
          <button
            onClick={handleDownload}
            className="p-2 text-text-muted hover:text-text-primary hover:bg-bg-elevated rounded-lg transition-colors"
            title="Download SVG"
          >
            <Download className="w-4 h-4" />
          </button>
        </div>
      </div>

      {/* Diagram */}
      <div
        ref={containerRef}
        className="p-6 overflow-auto bg-[#0A0A0A] min-h-[300px] flex items-center justify-center"
        style={{ maxHeight: '500px' }}
      >
        {error ? (
          <div className="text-red-400 text-sm">{error}</div>
        ) : svg ? (
          <div
            style={{ transform: `scale(${zoom})`, transformOrigin: 'center center', transition: 'transform 0.2s' }}
            dangerouslySetInnerHTML={{ __html: svg }}
          />
        ) : (
          <div className="text-text-muted text-sm">Loading diagram...</div>
        )}
      </div>

      {/* Code Preview */}
      <details className="border-t border-border-subtle">
        <summary className="px-4 py-2 text-xs text-text-muted cursor-pointer hover:text-text-secondary">
          View diagram source
        </summary>
        <pre className="p-4 bg-black/30 text-xs text-text-secondary overflow-auto max-h-48 font-mono">
          {diagram}
        </pre>
      </details>
    </motion.div>
  );
}
