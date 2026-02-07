'use client';

import { motion } from 'framer-motion';
import { ToolCallResult } from '@opsuna/shared';
import { CheckCircle2, XCircle, Clock, BarChart3, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';
import Link from 'next/link';

interface ToolResultSummaryProps {
  results: ToolCallResult[];
  executionId?: string;
}

export function ToolResultSummary({ results, executionId }: ToolResultSummaryProps) {
  const succeeded = results.filter((r) => r.status === 'success').length;
  const failed = results.filter((r) => r.status === 'failed').length;
  const skipped = results.filter((r) => r.status === 'skipped').length;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="glass-card overflow-hidden"
    >
      <div className="p-5 border-b border-border-subtle">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-serif font-medium text-text-primary flex items-center gap-2">
            <BarChart3 className="h-5 w-5 text-accent-orange" />
            Execution <span className="italic text-gradient">Results</span>
          </h3>
          <div className="flex gap-2">
            {succeeded > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-emerald-500/10 text-emerald-400 border border-emerald-500/30">
                {succeeded} Succeeded
              </span>
            )}
            {failed > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-red-500/10 text-red-400 border border-red-500/30">
                {failed} Failed
              </span>
            )}
            {skipped > 0 && (
              <span className="text-xs px-2.5 py-1 rounded-full font-mono bg-white/5 text-text-muted border border-white/10">
                {skipped} Skipped
              </span>
            )}
          </div>
        </div>
      </div>
      <div className="p-5 space-y-3">
        {results.map((result, index) => (
          <ResultCard key={result.stepId} result={result} index={index} />
        ))}
      </div>

      {/* Action Buttons */}
      {executionId && (
        <div className="px-5 pb-5 flex items-center gap-3">
          <Link
            href={`/executions/${executionId}`}
            className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/10 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/20 transition-colors text-sm"
          >
            <FileText className="h-4 w-4" />
            View Report
          </Link>
          <Link
            href={`/executions/${executionId}`}
            className="flex items-center gap-2 px-4 py-2 text-neutral-400 hover:text-neutral-200 transition-colors text-sm"
          >
            <ExternalLink className="h-4 w-4" />
            Full Details
          </Link>
        </div>
      )}
    </motion.div>
  );
}

function ResultCard({ result, index }: { result: ToolCallResult; index: number }) {
  const duration = result.startedAt && result.completedAt
    ? new Date(result.completedAt).getTime() - new Date(result.startedAt).getTime()
    : null;

  const summary = getToolSummary(result);
  const highlights = getHighlightFields(result);

  return (
    <motion.div
      initial={{ opacity: 0, x: -10 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ delay: index * 0.05 }}
      className={cn(
        'p-4 rounded-lg border',
        result.status === 'success' && 'bg-emerald-500/5 border-emerald-500/20',
        result.status === 'failed' && 'bg-red-500/5 border-red-500/20',
        result.status === 'skipped' && 'bg-white/5 border-white/10'
      )}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2">
          {result.status === 'success' ? (
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
          ) : result.status === 'failed' ? (
            <XCircle className="h-5 w-5 text-red-400" />
          ) : (
            <Clock className="h-5 w-5 text-text-muted" />
          )}
          <span className="font-mono font-medium text-text-primary">{result.toolName}</span>
        </div>
        {duration !== null && (
          <span className="text-xs font-mono text-text-muted">
            {formatDuration(duration)}
          </span>
        )}
      </div>

      {/* Tool-specific summary */}
      {summary && (
        <p className="text-sm text-text-secondary mt-2 ml-7">{summary}</p>
      )}

      {result.error && (
        <p className="text-sm text-red-400 mt-2 ml-7">{result.error}</p>
      )}

      {result.result != null && typeof result.result === 'object' && (
        <div className="mt-3 ml-7 space-y-2">
          {/* Show highlight fields prominently */}
          {highlights.length > 0 && (
            <div className="flex flex-wrap gap-2 mb-2">
              {highlights.map((h, i) => (
                <span key={i} className="text-xs px-2 py-1 rounded bg-[#D4AF37]/10 text-[#D4AF37] font-mono">
                  {h.label}: {h.value}
                </span>
              ))}
            </div>
          )}
          {/* Show key results inline */}
          <div className="grid grid-cols-2 gap-2 text-sm">
            {Object.entries(result.result as Record<string, unknown>).slice(0, 6).map(([key, value]) => (
              <div key={key} className="flex items-start gap-2">
                <span className="text-text-muted">{formatKey(key)}:</span>
                <span className="text-text-secondary font-mono truncate">
                  {formatValue(value)}
                </span>
              </div>
            ))}
          </div>
          {/* Full JSON in collapsible */}
          <details className="text-sm">
            <summary className="cursor-pointer text-accent-orange hover:text-accent-orange-bright transition-colors text-xs">
              View full response
            </summary>
            <pre className="mt-2 p-3 bg-black/30 rounded-lg text-xs text-text-secondary overflow-auto font-mono max-h-48">
              {JSON.stringify(result.result, null, 2)}
            </pre>
          </details>
        </div>
      )}
    </motion.div>
  );
}

function getToolSummary(result: ToolCallResult): string | null {
  const data = result.result as Record<string, unknown> | null;
  if (!data) return null;

  switch (result.toolName) {
    case 'post_slack_message':
      return `Posted message to #${data.channelName || 'channel'}`;
    case 'create_github_pr':
      return `Created PR #${data.number}: "${data.title}"`;
    case 'run_smoke_tests':
    case 'run_unit_tests': {
      const summary = data.summary as Record<string, number> | undefined;
      if (summary) {
        return `${summary.passed}/${summary.total} tests passed on ${data.environment}`;
      }
      return `Tests completed on ${data.environment}`;
    }
    case 'deploy_production':
    case 'deploy_staging':
      return `Deployed v${data.version} to ${data.environment}`;
    case 'send_email':
      return `Email sent to ${data.recipients || data.to}`;
    case 'create_jira_ticket':
      return `Created ticket ${data.key}: "${data.summary}"`;
    case 'check_ci_status':
      return `CI ${data.status}: ${data.totalPassed || 0} passed, ${data.totalFailed || 0} failed`;
    case 'run_database_migration':
      return `Applied ${data.appliedMigrations || 0} migrations to ${data.database}`;
    default:
      return null;
  }
}

function getHighlightFields(result: ToolCallResult): Array<{ label: string; value: string }> {
  const data = result.result as Record<string, unknown> | null;
  if (!data) return [];

  switch (result.toolName) {
    case 'post_slack_message':
      return [
        { label: 'Channel', value: String(data.channelName || 'unknown') },
      ];
    case 'create_github_pr':
      return [
        { label: 'PR', value: `#${data.number}` },
        { label: 'Files', value: `${data.changed_files || 0} changed` },
        { label: 'Diff', value: `+${data.additions || 0}/-${data.deletions || 0}` },
      ];
    case 'run_smoke_tests':
    case 'run_unit_tests': {
      const summary = data.summary as Record<string, number> | undefined;
      const coverage = data.coverage as Record<string, number> | undefined;
      const highlights = [];
      if (summary) {
        highlights.push({ label: 'Passed', value: String(summary.passed) });
        highlights.push({ label: 'Failed', value: String(summary.failed) });
      }
      if (coverage) {
        highlights.push({ label: 'Coverage', value: `${coverage.lines || coverage.statements || 0}%` });
      }
      return highlights;
    }
    case 'deploy_production':
    case 'deploy_staging':
      return [
        { label: 'Version', value: String(data.version) },
        { label: 'Environment', value: String(data.environment) },
      ];
    case 'check_ci_status':
      return [
        { label: 'Status', value: String(data.status) },
        { label: 'Duration', value: String(data.totalDuration || '-') },
      ];
    default:
      return [];
  }
}

function formatDuration(ms: number): string {
  if (ms < 1000) return `${ms}ms`;
  const seconds = Math.floor(ms / 1000);
  if (seconds < 60) return `${seconds}s`;
  const minutes = Math.floor(seconds / 60);
  return `${minutes}m ${seconds % 60}s`;
}

function formatKey(key: string): string {
  return key
    .replace(/([A-Z])/g, ' $1')
    .replace(/_/g, ' ')
    .replace(/^./, str => str.toUpperCase())
    .trim();
}

function formatValue(value: unknown): string {
  if (value === null || value === undefined) return '-';
  if (typeof value === 'boolean') return value ? '✓ Yes' : '✗ No';
  if (typeof value === 'number') return value.toLocaleString();
  if (typeof value === 'string') {
    if (value.startsWith('http')) return value;
    if (value.length > 50) return value.substring(0, 50) + '...';
    return value;
  }
  if (Array.isArray(value)) return `${value.length} items`;
  if (typeof value === 'object') return JSON.stringify(value).substring(0, 30) + '...';
  return String(value);
}
