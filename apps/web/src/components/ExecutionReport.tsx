'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Download, Share2, Copy, Check, RefreshCw } from 'lucide-react';
import { useArtifacts } from '@/hooks/useArtifacts';

interface ExecutionReportProps {
  executionId: string;
  onShare?: () => void;
}

export function ExecutionReport({ executionId, onShare }: ExecutionReportProps) {
  const { getInlineReport, loading, error } = useArtifacts();
  const [content, setContent] = useState<string>('');
  const [loadingReport, setLoadingReport] = useState(true);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReport();
  }, [executionId]);

  const loadReport = async () => {
    setLoadingReport(true);
    try {
      // Use inline report endpoint - no storage required
      const reportContent = await getInlineReport(executionId);
      if (reportContent) {
        setContent(reportContent);
      }
    } catch (err) {
      console.error('Failed to load report:', err);
    } finally {
      setLoadingReport(false);
    }
  };

  const handleDownload = () => {
    if (!content) return;
    const blob = new Blob([content], { type: 'text/markdown' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `report-${executionId.slice(0, 8)}.md`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loadingReport || loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error && !content) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FileText className="w-12 h-12 text-red-400" />
        <p className="text-red-400 text-sm">{error}</p>
        <button
          onClick={loadReport}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/30 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Retry
        </button>
      </div>
    );
  }

  if (!content) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FileText className="w-12 h-12 text-neutral-600" />
        <p className="text-neutral-500">No report available</p>
        <button
          onClick={loadReport}
          className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/30 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          Generate Report
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Actions */}
      <div className="flex items-center justify-end gap-2">
        <button
          onClick={handleCopy}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          {copied ? <Check className="w-4 h-4" /> : <Copy className="w-4 h-4" />}
          {copied ? 'Copied' : 'Copy'}
        </button>
        <button
          onClick={handleDownload}
          className="flex items-center gap-2 px-3 py-1.5 text-sm text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <Download className="w-4 h-4" />
          Download
        </button>
        {onShare && (
          <button
            onClick={onShare}
            className="flex items-center gap-2 px-3 py-1.5 text-sm bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/30 transition-colors"
          >
            <Share2 className="w-4 h-4" />
            Share
          </button>
        )}
      </div>

      {/* Markdown Content */}
      <div className="prose prose-invert prose-sm max-w-none p-6 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
        <ReactMarkdown remarkPlugins={[remarkGfm]}>
          {content}
        </ReactMarkdown>
      </div>
    </div>
  );
}
