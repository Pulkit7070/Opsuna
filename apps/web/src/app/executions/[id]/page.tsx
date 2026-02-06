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
        return <CheckCircle className="w-5 h-5 text-green-400" />;
      case 'failed':
        return <XCircle className="w-5 h-5 text-red-400" />;
      case 'executing':
        return <Clock className="w-5 h-5 text-yellow-400 animate-pulse" />;
      default:
        return <AlertCircle className="w-5 h-5 text-neutral-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'bg-green-500/20 text-green-400 border-green-500/30';
      case 'failed':
        return 'bg-red-500/20 text-red-400 border-red-500/30';
      case 'executing':
        return 'bg-yellow-500/20 text-yellow-400 border-yellow-500/30';
      default:
        return 'bg-neutral-500/20 text-neutral-400 border-neutral-500/30';
    }
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleString();
  };

  if (loading && !replayData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex items-center justify-center">
        <div className="w-8 h-8 border-2 border-[#D4AF37] border-t-transparent rounded-full animate-spin" />
      </div>
    );
  }

  if (error || !replayData) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950 flex flex-col items-center justify-center gap-4">
        <XCircle className="w-12 h-12 text-red-400" />
        <p className="text-neutral-400">{error || 'Execution not found'}</p>
        <button
          onClick={() => router.push('/')}
          className="px-4 py-2 bg-neutral-800 text-neutral-200 rounded-lg hover:bg-neutral-700 transition-colors"
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
    <div className="min-h-screen bg-gradient-to-br from-neutral-950 via-neutral-900 to-neutral-950">
      <div className="max-w-6xl mx-auto px-6 py-8">
        {/* Header */}
        <div className="mb-8">
          <button
            onClick={() => router.push('/')}
            className="flex items-center gap-2 text-neutral-400 hover:text-neutral-200 transition-colors mb-4"
          >
            <ArrowLeft className="w-4 h-4" />
            Back to Dashboard
          </button>

          <div className="flex items-start justify-between">
            <div className="space-y-2">
              <div className="flex items-center gap-3">
                {getStatusIcon(replayData.execution.status)}
                <h1 className="text-2xl font-bold text-neutral-100">
                  Execution Details
                </h1>
              </div>
              <p className="text-neutral-400 max-w-2xl">
                {replayData.plan.summary}
              </p>
              <div className="flex items-center gap-4 text-sm text-neutral-500">
                <span className="flex items-center gap-1">
                  <Clock className="w-4 h-4" />
                  {formatDate(replayData.execution.createdAt)}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs border ${getStatusColor(replayData.execution.status)}`}>
                  {replayData.execution.status.toUpperCase()}
                </span>
                <span className={`px-2 py-0.5 rounded-full text-xs ${
                  replayData.plan.riskLevel === 'HIGH'
                    ? 'bg-red-500/20 text-red-400'
                    : replayData.plan.riskLevel === 'MEDIUM'
                    ? 'bg-yellow-500/20 text-yellow-400'
                    : 'bg-green-500/20 text-green-400'
                }`}>
                  {replayData.plan.riskLevel} RISK
                </span>
              </div>
            </div>

            <button
              onClick={() => setShowShareDialog(true)}
              className="flex items-center gap-2 px-4 py-2 bg-[#D4AF37]/20 text-[#D4AF37] rounded-lg hover:bg-[#D4AF37]/30 transition-colors"
            >
              <Share2 className="w-4 h-4" />
              Share
            </button>
          </div>
        </div>

        {/* Tabs */}
        <div className="flex items-center gap-2 mb-6 border-b border-neutral-800">
          {tabs.map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={`flex items-center gap-2 px-4 py-3 text-sm font-medium transition-colors relative ${
                activeTab === tab.id
                  ? 'text-[#D4AF37]'
                  : 'text-neutral-400 hover:text-neutral-200'
              }`}
            >
              {tab.icon}
              {tab.label}
              {activeTab === tab.id && (
                <motion.div
                  layoutId="activeTab"
                  className="absolute bottom-0 left-0 right-0 h-0.5 bg-[#D4AF37]"
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
          className="bg-neutral-900/50 border border-neutral-800 rounded-xl p-6"
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
