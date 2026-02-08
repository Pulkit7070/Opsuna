'use client';

import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import { Download, FileText, Archive, Trash2, ExternalLink } from 'lucide-react';
import { useArtifacts, Artifact } from '@/hooks/useArtifacts';
import { Spinner } from '@/components/ui/spinner';

interface ArtifactListProps {
  executionId: string;
  onArtifactClick?: (artifact: Artifact) => void;
}

export function ArtifactList({ executionId, onArtifactClick }: ArtifactListProps) {
  const { getArtifacts, downloadArtifact, deleteArtifact, loading, error } = useArtifacts();
  const [artifacts, setArtifacts] = useState<Artifact[]>([]);
  const [downloading, setDownloading] = useState<string | null>(null);

  useEffect(() => {
    loadArtifacts();
  }, [executionId]);

  const loadArtifacts = async () => {
    const data = await getArtifacts(executionId);
    setArtifacts(data);
  };

  const handleDownload = async (artifact: Artifact) => {
    setDownloading(artifact.id);
    try {
      const blob = await downloadArtifact(artifact.id);
      if (blob) {
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = artifact.name;
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
        URL.revokeObjectURL(url);
      }
    } finally {
      setDownloading(null);
    }
  };

  const handleDelete = async (artifact: Artifact) => {
    if (!confirm(`Delete ${artifact.name}?`)) return;

    const success = await deleteArtifact(artifact.id);
    if (success) {
      setArtifacts(artifacts.filter(a => a.id !== artifact.id));
    }
  };

  const getIcon = (type: string) => {
    switch (type) {
      case 'log_bundle':
        return <Archive className="w-4 h-4" />;
      case 'report':
        return <FileText className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const formatSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
  };

  if (loading && artifacts.length === 0) {
    return (
      <div className="flex items-center justify-center py-8">
        <Spinner size="sm" variant="primary" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="text-destructive text-sm py-4 text-center">
        {error}
      </div>
    );
  }

  if (artifacts.length === 0) {
    return (
      <div className="text-text-muted text-sm py-8 text-center">
        No artifacts available
      </div>
    );
  }

  return (
    <div className="space-y-2">
      {artifacts.map((artifact, index) => (
        <motion.div
          key={artifact.id}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: index * 0.05 }}
          className="flex items-center justify-between p-3 bg-bg-elevated rounded-lg border border-border-subtle hover:border-accent/30 transition-colors"
        >
          <div
            className="flex items-center gap-3 flex-1 cursor-pointer"
            onClick={() => onArtifactClick?.(artifact)}
          >
            <div className="p-2 bg-bg-surface rounded-lg text-accent">
              {getIcon(artifact.type)}
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm text-text-primary truncate">{artifact.name}</p>
              <div className="flex items-center gap-2 text-xs text-text-muted">
                <span>{artifact.type.replace('_', ' ')}</span>
                <span>-</span>
                <span>{formatSize(artifact.size)}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {artifact.publicUrl && (
              <a
                href={artifact.publicUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="p-2 text-text-muted hover:text-accent transition-colors"
              >
                <ExternalLink className="w-4 h-4" />
              </a>
            )}
            <button
              onClick={() => handleDownload(artifact)}
              disabled={downloading === artifact.id}
              className="p-2 text-text-muted hover:text-accent transition-colors disabled:opacity-50"
            >
              {downloading === artifact.id ? (
                <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              ) : (
                <Download className="w-4 h-4" />
              )}
            </button>
            <button
              onClick={() => handleDelete(artifact)}
              className="p-2 text-text-muted hover:text-destructive transition-colors"
            >
              <Trash2 className="w-4 h-4" />
            </button>
          </div>
        </motion.div>
      ))}
    </div>
  );
}
