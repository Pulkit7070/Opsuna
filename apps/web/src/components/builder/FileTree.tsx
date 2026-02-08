'use client';

import { useState } from 'react';
import { File, FileCode, FilePlus, Trash2, ChevronRight, ChevronDown, Folder } from 'lucide-react';
import { useBuilderStore } from '@/store/builder';

const FILE_ICONS: Record<string, typeof FileCode> = {
  tsx: FileCode,
  jsx: FileCode,
  ts: FileCode,
  js: FileCode,
  css: File,
  json: File,
};

export function FileTree() {
  const { files, activeFile, setActiveFile, addFile, deleteFile } = useBuilderStore();
  const [isAddingFile, setIsAddingFile] = useState(false);
  const [newFileName, setNewFileName] = useState('');
  const [expandedFolders, setExpandedFolders] = useState<Set<string>>(new Set(['src']));

  const fileList = Object.keys(files).sort();

  const handleAddFile = () => {
    if (newFileName.trim()) {
      const fileName = newFileName.includes('.') ? newFileName : `${newFileName}.tsx`;
      addFile(fileName, `// ${fileName}\n\nexport default function Component() {\n  return <div>New Component</div>;\n}\n`);
      setNewFileName('');
      setIsAddingFile(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleAddFile();
    } else if (e.key === 'Escape') {
      setIsAddingFile(false);
      setNewFileName('');
    }
  };

  const getFileIcon = (filename: string) => {
    const ext = filename.split('.').pop() || '';
    const Icon = FILE_ICONS[ext] || File;
    return Icon;
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="h-11 border-b border-zinc-800/80 flex items-center justify-between px-4 bg-zinc-900/50">
        <span className="text-sm font-medium text-zinc-300">Files</span>
        <button
          onClick={() => setIsAddingFile(true)}
          className="p-1.5 text-zinc-500 hover:text-white hover:bg-zinc-800 rounded-lg transition-all"
          title="Add file"
        >
          <FilePlus size={15} />
        </button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto py-3">
        {/* Virtual folder structure */}
        <div className="px-3">
          <button
            onClick={() => {
              const newSet = new Set(expandedFolders);
              if (newSet.has('src')) {
                newSet.delete('src');
              } else {
                newSet.add('src');
              }
              setExpandedFolders(newSet);
            }}
            className="flex items-center gap-2 w-full py-2 px-3 text-sm text-zinc-300 hover:text-white hover:bg-zinc-800/50 rounded-lg transition-all"
          >
            {expandedFolders.has('src') ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
            <Folder size={14} className="text-yellow-500" />
            <span className="font-medium">src</span>
          </button>

          {expandedFolders.has('src') && (
            <div className="ml-3 mt-1 space-y-0.5">
              {fileList.map((filename) => {
                const Icon = getFileIcon(filename);
                const isActive = activeFile === filename;

                return (
                  <div
                    key={filename}
                    className={`group flex items-center justify-between py-2 px-3 rounded-lg cursor-pointer transition-all ${
                      isActive
                        ? 'bg-violet-500/20 text-violet-200 ring-1 ring-violet-500/40'
                        : 'text-zinc-400 hover:bg-zinc-800/70 hover:text-white'
                    }`}
                    onClick={() => setActiveFile(filename)}
                  >
                    <div className="flex items-center gap-2.5 min-w-0">
                      <Icon size={14} className={isActive ? 'text-violet-400' : 'text-zinc-500'} />
                      <span className="text-sm truncate">{filename}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete ${filename}?`)) {
                          deleteFile(filename);
                        }
                      }}
                      className="p-1.5 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
                    >
                      <Trash2 size={12} />
                    </button>
                  </div>
                );
              })}

              {/* Add file input */}
              {isAddingFile && (
                <div className="py-1 px-3">
                  <input
                    type="text"
                    value={newFileName}
                    onChange={(e) => setNewFileName(e.target.value)}
                    onKeyDown={handleKeyDown}
                    onBlur={() => {
                      if (!newFileName.trim()) {
                        setIsAddingFile(false);
                      }
                    }}
                    placeholder="filename.tsx"
                    className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800/80 p-3 bg-zinc-900/30">
        <div className="text-xs text-zinc-500 text-center">
          {fileList.length} file{fileList.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
