'use client';

import { motion } from 'framer-motion';
import { GitPullRequest, GitMerge, XCircle, Plus, Minus, FileText, ExternalLink } from 'lucide-react';
import { cn } from '@/lib/utils';

interface Author {
  login: string;
  avatarUrl: string;
}

interface Label {
  name: string;
  color: string;
}

interface GitHubPRCardProps {
  number: number;
  title: string;
  body: string;
  state: 'open' | 'closed' | 'merged';
  htmlUrl: string;
  author: Author;
  additions: number;
  deletions: number;
  changedFiles: number;
  labels?: Label[];
}

const stateConfig = {
  open: {
    icon: GitPullRequest,
    color: 'text-accent-green',
    bg: 'bg-accent-green/20',
    label: 'Open',
  },
  merged: {
    icon: GitMerge,
    color: 'text-purple-400',
    bg: 'bg-purple-400/20',
    label: 'Merged',
  },
  closed: {
    icon: XCircle,
    color: 'text-accent-red',
    bg: 'bg-accent-red/20',
    label: 'Closed',
  },
};

export function GitHubPRCard({
  number,
  title,
  body,
  state,
  htmlUrl,
  author,
  additions,
  deletions,
  changedFiles,
  labels = [],
}: GitHubPRCardProps) {
  const config = stateConfig[state];
  const StateIcon = config.icon;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className="rounded-xl border border-border-subtle bg-surface-elevated p-5"
    >
      {/* Header */}
      <div className="flex items-start gap-3 mb-3">
        <motion.div
          initial={{ scale: 0 }}
          animate={{ scale: 1 }}
          transition={{ type: 'spring', stiffness: 200 }}
          className={cn('p-2 rounded-lg', config.bg)}
        >
          <StateIcon className={cn('w-5 h-5', config.color)} />
        </motion.div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 mb-1">
            <a
              href={htmlUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-text-primary hover:text-accent-blue transition-colors truncate"
            >
              {title}
            </a>
            <ExternalLink className="w-3 h-3 text-text-muted flex-shrink-0" />
          </div>
          <div className="flex items-center gap-2 text-sm text-text-muted">
            <span className="font-mono">#{number}</span>
            <span className={cn('px-2 py-0.5 rounded-full text-xs', config.bg, config.color)}>
              {config.label}
            </span>
          </div>
        </div>
      </div>

      {/* Author */}
      <div className="flex items-center gap-2 mb-3 text-sm">
        <img
          src={author.avatarUrl}
          alt={author.login}
          className="w-5 h-5 rounded-full"
        />
        <span className="text-text-secondary">{author.login}</span>
      </div>

      {/* Body Preview */}
      {body && (
        <p className="text-sm text-text-muted mb-3 line-clamp-2">{body}</p>
      )}

      {/* Labels */}
      {labels.length > 0 && (
        <div className="flex flex-wrap gap-1 mb-3">
          {labels.map((label) => (
            <span
              key={label.name}
              className="px-2 py-0.5 rounded-full text-xs font-medium"
              style={{
                backgroundColor: `#${label.color}30`,
                color: `#${label.color}`,
              }}
            >
              {label.name}
            </span>
          ))}
        </div>
      )}

      {/* Stats */}
      <div className="flex items-center gap-4 pt-3 border-t border-border-subtle text-sm">
        <div className="flex items-center gap-1 text-accent-green">
          <Plus className="w-4 h-4" />
          <span>{additions.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-accent-red">
          <Minus className="w-4 h-4" />
          <span>{deletions.toLocaleString()}</span>
        </div>
        <div className="flex items-center gap-1 text-text-muted">
          <FileText className="w-4 h-4" />
          <span>{changedFiles} files</span>
        </div>
      </div>
    </motion.div>
  );
}
