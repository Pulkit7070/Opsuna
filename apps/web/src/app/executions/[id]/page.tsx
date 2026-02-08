'use client';

import { useState, useEffect } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { motion } from 'framer-motion';
import { ArrowLeft, Play, FileText, Package, Share2, Clock, CheckCircle, XCircle, AlertCircle } from 'lucide-react';
import { useArtifacts, ReplayData } from '@/hooks/useArtifacts';
import { ExecutionReplay } from '@/components/ExecutionReplay';
import { ExecutionReport } from '@/components/ExecutionReport';
import { ArtifactList } from '@/components/ArtifactList';
import { ShareDialog } from '@/components/ShareDialog';
import { Spinner } from '@/components/ui/spinner';

type Tab = 'replay' | 'report' | 'artifacts';

export default function ExecutionDetailPage() {
  const params = useParams();
  const router = useRouter();
  const executionId = params.id as string;

  const { getReplayData, loading, error } = useArtifacts();
  const [replayData, setReplayData] = useState<ReplayData | null>(null);
  const [activeTab, setActiveTab] = useState<Tab>('replay');
  const [showShareDialog, setShowShareDialog] = useState(false);

  useEffect(() => {
    if (executionId) {
      loadReplayData();
    }
  }, [executionId]);

  const loadReplayData = async () => {
    const data = await getReplayData(executionId);
    setReplayData(data);
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-5 h-5 text-success" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-destructive" />;
      case 'executing':
        return <Clock className="w-5 h-5 text-warning animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-text-muted" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-success/20 text-success border-success/30';
      case 'failed':
        return 'bg-destructive/20 text-destructive border-destructive/30';
      case 'executing':
        return 'bg-warning/20 text-warning border-warning/30';
      default:
        return 'bg-text-muted/20 text-text-muted border-text-muted/30';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading && !replayData) {
    return (
      <div className="min-h-screen bg-bg-primary flex items-center justify-center">
        <Spinner size="lg" variant="primary" />
      </div>
    );
  }

  if (error || !replayData) {
    return (
      <div className="min-h-screen bg-bg-primary flex flex-col items-center justify-center gap-4">
        <XCircle className="w-12 h-12 text-destructive" />
        <p className="text-text-muted">{error || 'Execution not found'}</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-bg-elevated text-text-primary rounded-lg hover:bg-bg-surface transition-colors"
        >
          Go Home
        </button>
      </div>
    );
  }

  const tabs: { id: Tab; label: string; icon: React.ReactNode }[] = [
    { id: 'replay', label: 'Replay', icon: <Play className="w-4 h-4" /> },
    { id: 'report', label: 'Report', icon: <FileText className="w-4 h-4" /> },
    { id: 'artifacts', label: 'Artifacts', icon: <Package className="w-4 h-4" /> },
  ];

  return (
    <div className="min-h-screen bg-bg-primary">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-text-muted hover:text-text-primary transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {getStatusIcon(replayData.execution.status)}
                <h1 className="text-2xl font-bold text-text-primary">
                  Execution Details
                </h1>
              </div>
              <p className="text-text-secondary max-w-2xl">
                {replayData.plan.summary}
              </p>
              <div className="flex items-center gap-4 text-sm text-text-muted">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(replayData.execution.createdAt)}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(replayData.execution.status)}`}>
                  {replayData.execution.status.toUpperCase()}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  replayData.plan.riskLevel === 'HIGH'
                    ? 'bg-destructive/20 text-destructive'
                    : replayData.plan.riskLevel === 'MEDIUM'
                    ? 'bg-warning/20 text-warning'
                    : 'bg-success/20 text-success'
                }`}>
                  {replayData.plan.riskLevel} RISK
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowShareDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-accent/20 text-accent rounded-lg hover:bg-accent/30 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-border-subtle">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-accent'
                  : 'text-text-muted hover:text-text-primary'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-accent"
                />
              )}
            </button>
          ))}
        </div>

        {/* Tab Content */}
        <motion.div
          key={activeTab}
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          className="card p-6"
        >
          {activeTab === 'replay' && <ExecutionReplay data={replayData} />}
          {activeTab === 'report' && (
            <ExecutionReport
              executionId={executionId}
              onShare={() => setShowShareDialog(true)}
            />
          )}
          {activeTab === 'artifacts' && <ArtifactList executionId={executionId} />}
        </motion.div>
      </div>

      {/* Share Dialog */}
      <ShareDialog
        executionId={executionId}
        isOpen={showShareDialog}
        onClose={() => setShowShareDialog(false)}
      />
    </div>
  );
}
