'use client';

import { useState, useEffect } from 'react';
import ReactMarkdown from 'react-markdown';
import remarkGfm from 'remark-gfm';
import { FileText, Download, Share2, Copy, Check } from 'lucide-react';
import { useArtifacts, Artifact } from '@/hooks/useArtifacts';

interface ExecutionReportProps {
  executionId: string;
  onShare?: () => void;
}

export function ExecutionReport({ executionId, onShare }: ExecutionReportProps) {
  const { getArtifacts, downloadArtifact, generateReport, loading, error } = useArtifacts();
  const [report, setReport] = useState<Artifact | null>(null);
  const [content, setContent] = useState<string>('');
  const [generating, setGenerating] = useState(false);
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    loadReport();
  }, [executionId]);

  const loadReport = async () => {
    const artifacts = await getArtifacts(executionId);
    const reportArtifact = artifacts.find(a => a.type === 'report');
    if (reportArtifact) {
      setReport(reportArtifact);
      const blob = await downloadArtifact(reportArtifact.id);
      if (blob) {
        const text = await blob.text();
        setContent(text);
      }
    }
  };

  const handleGenerateReport = async () => {
    setGenerating(true);
    const artifact = await generateReport(executionId);
    if (artifact) {
      setReport(artifact);
      const blob = await downloadArtifact(artifact.id);
      if (blob) {
        const text = await blob.text();
        setContent(text);
      }
    }
    setGenerating(false);
  };

  const handleDownload = async () => {
    if (!report) return;
    const blob = await downloadArtifact(report.id);
    if (blob) {
      const url = URL.createObjectURL(blob);
      const a = document.createElement('a');
      a.href = url;
      a.download = report.name;
      document.body.appendChild(a);
      a.click();
      document.body.removeChild(a);
      URL.revokeObjectURL(url);
    }
  };

  const handleCopy = async () => {
    await navigator.clipboard.writeText(content);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  if (loading && !report) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="w-6 h-6 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-red-400 text-sm py-4 text-center">
        {error}
      </div>
    );
  }

  if (!report && !generating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <FileText className="w-12 h-12 text-neutral-600" />
        <p className="text-neutral-500">No report available</p>
        <button
          onClick={handleGenerateReport}
          className="px-4 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/30 transition-colors"
        >
          Generate Report
        </button>
      </div>
    );
  }

  if (generating) {
    return (
      <div className="flex flex-col items-center justify-center py-12 space-y-4">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
        <p className="text-neutral-400">Generating report...</p>
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
