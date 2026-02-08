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
      <div className="h-10 border-b border-zinc-800 flex items-center justify-between px-3">
        <span className="text-xs font-medium text-zinc-400">Files</span>
        <button
          onClick={() => setIsAddingFile(true)}
          className="p-1 text-zinc-500 hover:text-white rounded transition-colors"
          title="Add file"
        >
          <FilePlus size={14} />
        </button>
      </div>

      {/* File List */}
      <div className="flex-1 overflow-auto py-2">
        {/* Virtual folder structure */}
        <div className="px-2">
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
            className="flex items-center gap-1 w-full py-1 px-2 text-xs text-zinc-400 hover:text-white transition-colors"
          >
            {expandedFolders.has('src') ? <ChevronDown size={12} /> : <ChevronRight size={12} />}
            <Folder size={12} className="text-yellow-500" />
            <span>src</span>
          </button>

          {expandedFolders.has('src') && (
            <div className="ml-4">
              {fileList.map((filename) => {
                const Icon = getFileIcon(filename);
                const isActive = activeFile === filename;

                return (
                  <div
                    key={filename}
                    className={`group flex items-center justify-between py-1 px-2 rounded cursor-pointer transition-colors ${
                      isActive
                        ? 'bg-violet-500/20 text-violet-300'
                        : 'text-zinc-400 hover:bg-zinc-800 hover:text-white'
                    }`}
                    onClick={() => setActiveFile(filename)}
                  >
                    <div className="flex items-center gap-2 min-w-0">
                      <Icon size={12} className={isActive ? 'text-violet-400' : 'text-zinc-500'} />
                      <span className="text-xs truncate">{filename}</span>
                    </div>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (confirm(`Delete ${filename}?`)) {
                          deleteFile(filename);
                        }
                      }}
                      className="p-1 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 transition-all"
                    >
                      <Trash2 size={10} />
                    </button>
                  </div>
                );
              })}

              {/* Add file input */}
              {isAddingFile && (
                <div className="py-1 px-2">
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
                    className="w-full bg-zinc-800 border border-zinc-700 rounded px-2 py-1 text-xs focus:outline-none focus:border-violet-500"
                    autoFocus
                  />
                </div>
              )}
            </div>
          )}
        </div>
      </div>

      {/* Footer */}
      <div className="border-t border-zinc-800 p-2">
        <div className="text-[10px] text-zinc-600 text-center">
          {fileList.length} file{fileList.length !== 1 ? 's' : ''}
        </div>
      </div>
    </div>
  );
}
