'use client';

import { useState, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Download,
  Github,
  Copy,
  Check,
  FolderArchive,
  GitBranch,
  Loader2,
  ExternalLink,
  AlertCircle
} from 'lucide-react';
import { useBuilderStore } from '@/store/builder';
import { apiClient } from '@/lib/api/client';

interface ExportModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type ExportTab = 'download' | 'github' | 'clipboard';

export function ExportModal({ isOpen, onClose }: ExportModalProps) {
  const [activeTab, setActiveTab] = useState<ExportTab>('download');
  const [repoUrl, setRepoUrl] = useState('');
  const [branch, setBranch] = useState('main');
  const [commitMessage, setCommitMessage] = useState('Add UI components from Opsuna Builder');
  const [targetPath, setTargetPath] = useState('src/components/generated');
  const [isExporting, setIsExporting] = useState(false);
  const [exportResult, setExportResult] = useState<{ success: boolean; message: string; url?: string } | null>(null);
  const [copied, setCopied] = useState(false);

  const { files, currentProject } = useBuilderStore();

  const handleDownloadZip = useCallback(async () => {
    setIsExporting(true);
    try {
      const response = await apiClient('/api/builder/export/zip', {
        method: 'POST',
        body: JSON.stringify({
          files,
          projectName: currentProject?.name || 'opsuna-ui',
        }),
      }) as { downloadUrl?: string };

      if (response.downloadUrl) {
        // Trigger download
        const a = document.createElement('a');
        a.href = response.downloadUrl;
        a.download = `${currentProject?.name || 'opsuna-ui'}.zip`;
        a.click();
        setExportResult({ success: true, message: 'Download started!' });
      } else {
        // Fallback: create zip client-side
        const JSZip = (await import('jszip')).default;
        const zip = new JSZip();

        const srcFolder = zip.folder('src');
        Object.entries(files).forEach(([filename, content]) => {
          srcFolder?.file(filename, content);
        });

        // Add package.json
        zip.file('package.json', JSON.stringify({
          name: currentProject?.name || 'opsuna-ui',
          version: '1.0.0',
          dependencies: {
            'react': '^18.2.0',
            'react-dom': '^18.2.0',
          },
          devDependencies: {
            'tailwindcss': '^3.4.0',
            'typescript': '^5.0.0',
          }
        }, null, 2));

        const blob = await zip.generateAsync({ type: 'blob' });
        const url = URL.createObjectURL(blob);
        const a = document.createElement('a');
        a.href = url;
        a.download = `${currentProject?.name || 'opsuna-ui'}.zip`;
        a.click();
        URL.revokeObjectURL(url);

        setExportResult({ success: true, message: 'Download started!' });
      }
    } catch (error) {
      setExportResult({ success: false, message: 'Failed to create download' });
    } finally {
      setIsExporting(false);
    }
  }, [files, currentProject]);

  const handleGitHubCommit = useCallback(async () => {
    if (!repoUrl.trim()) {
      setExportResult({ success: false, message: 'Please enter a repository URL' });
      return;
    }

    setIsExporting(true);
    setExportResult(null);

    try {
      // Parse repo URL
      const repoMatch = repoUrl.match(/github\.com\/([^\/]+)\/([^\/]+)/);
      if (!repoMatch) {
        throw new Error('Invalid GitHub repository URL');
      }

      const [, owner, repo] = repoMatch;
      const repoName = repo.replace('.git', '');

      // Prepare files for commit
      const upserts = Object.entries(files).map(([filename, content]) => ({
        path: `${targetPath}/${filename}`,
        content,
      }));

      const response = await apiClient('/api/builder/export/github', {
        method: 'POST',
        body: JSON.stringify({
          owner,
          repo: repoName,
          branch,
          message: commitMessage,
          upserts,
        }),
      }) as { success?: boolean; commitUrl?: string; error?: string };

      if (response.success) {
        setExportResult({
          success: true,
          message: 'Successfully committed to GitHub!',
          url: response.commitUrl || `https://github.com/${owner}/${repoName}/tree/${branch}/${targetPath}`,
        });
      } else {
        throw new Error(response.error || 'Failed to commit');
      }
    } catch (error) {
      setExportResult({
        success: false,
        message: error instanceof Error ? error.message : 'Failed to commit to GitHub',
      });
    } finally {
      setIsExporting(false);
    }
  }, [repoUrl, branch, commitMessage, targetPath, files]);

  const handleCopyAll = useCallback(() => {
    const allCode = Object.entries(files)
      .map(([filename, content]) => `// ===== ${filename} =====\n\n${content}`)
      .join('\n\n');

    navigator.clipboard.writeText(allCode);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
    setExportResult({ success: true, message: 'Copied to clipboard!' });
  }, [files]);

  if (!isOpen) return null;

  return (
    <AnimatePresence>
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
        onClick={onClose}
      >
        <motion.div
          initial={{ scale: 0.95, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          exit={{ scale: 0.95, opacity: 0 }}
          className="bg-zinc-900 border border-zinc-800 rounded-2xl w-full max-w-lg overflow-hidden"
          onClick={(e) => e.stopPropagation()}
        >
          {/* Header */}
          <div className="flex items-center justify-between p-4 border-b border-zinc-800">
            <h2 className="text-lg font-semibold">Export Project</h2>
            <button
              onClick={onClose}
              className="p-2 hover:bg-zinc-800 rounded-lg transition-colors"
            >
              <X size={18} />
            </button>
          </div>

          {/* Tabs */}
          <div className="flex border-b border-zinc-800">
            {[
              { id: 'download' as const, icon: Download, label: 'Download' },
              { id: 'github' as const, icon: Github, label: 'GitHub' },
              { id: 'clipboard' as const, icon: Copy, label: 'Clipboard' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => {
                  setActiveTab(tab.id);
                  setExportResult(null);
                }}
                className={`flex-1 flex items-center justify-center gap-2 py-3 text-sm transition-colors ${
                  activeTab === tab.id
                    ? 'bg-zinc-800 text-white border-b-2 border-violet-500'
                    : 'text-zinc-400 hover:text-white hover:bg-zinc-800/50'
                }`}
              >
                <tab.icon size={16} />
                {tab.label}
              </button>
            ))}
          </div>

          {/* Content */}
          <div className="p-4 space-y-4">
            {activeTab === 'download' && (
              <div className="space-y-4">
                <div className="bg-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <FolderArchive className="text-violet-400" size={24} />
                    <div>
                      <h3 className="font-medium">Download as ZIP</h3>
                      <p className="text-sm text-zinc-500">
                        Get all files in a ready-to-use project structure
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 mb-3">
                    Includes: {Object.keys(files).length} files, package.json, tailwind config
                  </div>
                  <button
                    onClick={handleDownloadZip}
                    disabled={isExporting}
                    className="w-full py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {isExporting ? (
                      <Loader2 size={16} className="animate-spin" />
                    ) : (
                      <Download size={16} />
                    )}
                    Download ZIP
                  </button>
                </div>
              </div>
            )}

            {activeTab === 'github' && (
              <div className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Repository URL</label>
                    <input
                      type="text"
                      value={repoUrl}
                      onChange={(e) => setRepoUrl(e.target.value)}
                      placeholder="https://github.com/username/repo"
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-3">
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Branch</label>
                      <div className="relative">
                        <GitBranch size={14} className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-500" />
                        <input
                          type="text"
                          value={branch}
                          onChange={(e) => setBranch(e.target.value)}
                          className="w-full bg-zinc-800 border border-zinc-700 rounded-lg pl-9 pr-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                        />
                      </div>
                    </div>
                    <div>
                      <label className="block text-sm text-zinc-400 mb-1">Target Path</label>
                      <input
                        type="text"
                        value={targetPath}
                        onChange={(e) => setTargetPath(e.target.value)}
                        className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm text-zinc-400 mb-1">Commit Message</label>
                    <input
                      type="text"
                      value={commitMessage}
                      onChange={(e) => setCommitMessage(e.target.value)}
                      className="w-full bg-zinc-800 border border-zinc-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                    />
                  </div>
                </div>

                <button
                  onClick={handleGitHubCommit}
                  disabled={isExporting || !repoUrl.trim()}
                  className="w-full py-2 bg-violet-600 hover:bg-violet-500 disabled:bg-zinc-700 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                >
                  {isExporting ? (
                    <Loader2 size={16} className="animate-spin" />
                  ) : (
                    <Github size={16} />
                  )}
                  Commit to GitHub
                </button>

                <p className="text-xs text-zinc-500 text-center">
                  Make sure you've connected your GitHub account in the Tools page
                </p>
              </div>
            )}

            {activeTab === 'clipboard' && (
              <div className="space-y-4">
                <div className="bg-zinc-800/50 rounded-xl p-4">
                  <div className="flex items-center gap-3 mb-3">
                    <Copy className="text-violet-400" size={24} />
                    <div>
                      <h3 className="font-medium">Copy to Clipboard</h3>
                      <p className="text-sm text-zinc-500">
                        Copy all code files to paste anywhere
                      </p>
                    </div>
                  </div>
                  <div className="text-xs text-zinc-500 mb-3">
                    {Object.keys(files).length} files will be combined with file headers
                  </div>
                  <button
                    onClick={handleCopyAll}
                    className="w-full py-2 bg-violet-600 hover:bg-violet-500 rounded-lg font-medium transition-colors flex items-center justify-center gap-2"
                  >
                    {copied ? <Check size={16} /> : <Copy size={16} />}
                    {copied ? 'Copied!' : 'Copy All Code'}
                  </button>
                </div>
              </div>
            )}

            {/* Result Message */}
            {exportResult && (
              <motion.div
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`p-3 rounded-lg flex items-start gap-2 ${
                  exportResult.success
                    ? 'bg-green-500/10 border border-green-500/20'
                    : 'bg-red-500/10 border border-red-500/20'
                }`}
              >
                {exportResult.success ? (
                  <Check size={16} className="text-green-400 mt-0.5" />
                ) : (
                  <AlertCircle size={16} className="text-red-400 mt-0.5" />
                )}
                <div className="flex-1">
                  <p className={`text-sm ${exportResult.success ? 'text-green-400' : 'text-red-400'}`}>
                    {exportResult.message}
                  </p>
                  {exportResult.url && (
                    <a
                      href={exportResult.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-xs text-violet-400 hover:underline flex items-center gap-1 mt-1"
                    >
                      View on GitHub <ExternalLink size={10} />
                    </a>
                  )}
                </div>
              </motion.div>
            )}
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
