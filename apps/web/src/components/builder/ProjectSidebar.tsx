'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  Plus,
  FolderOpen,
  Trash2,
  Clock,
  Settings,
  ChevronDown,
  ChevronRight,
  Sparkles,
  Search
} from 'lucide-react';
import { useBuilderStore, BuilderProject } from '@/store/builder';

export function ProjectSidebar() {
  const [isCreating, setIsCreating] = useState(false);
  const [newProjectName, setNewProjectName] = useState('');
  const [showSettings, setShowSettings] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');

  const {
    currentProject,
    savedProjects,
    settings,
    createProject,
    loadProject,
    deleteProject,
    updateSettings
  } = useBuilderStore();

  const filteredProjects = savedProjects.filter(p =>
    p.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const handleCreateProject = () => {
    if (newProjectName.trim()) {
      createProject(newProjectName.trim());
      setNewProjectName('');
      setIsCreating(false);
    }
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      handleCreateProject();
    } else if (e.key === 'Escape') {
      setIsCreating(false);
      setNewProjectName('');
    }
  };

  return (
    <div className="h-full flex flex-col">
      {/* Header */}
      <div className="p-3 border-b border-zinc-800">
        <div className="flex items-center justify-between mb-3">
          <h3 className="text-sm font-medium text-zinc-300">Projects</h3>
          <button
            onClick={() => setIsCreating(true)}
            className="p-1.5 hover:bg-zinc-800 rounded-lg transition-colors text-zinc-400 hover:text-white"
            title="New Project"
          >
            <Plus size={14} />
          </button>
        </div>

        {/* Search */}
        <div className="relative">
          <Search size={14} className="absolute left-2.5 top-1/2 -translate-y-1/2 text-zinc-500" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search projects..."
            className="w-full bg-zinc-800/50 border border-zinc-700/50 rounded-lg pl-8 pr-3 py-1.5 text-xs focus:outline-none focus:border-zinc-600 placeholder-zinc-600"
          />
        </div>
      </div>

      {/* Projects List */}
      <div className="flex-1 overflow-auto p-2 space-y-1">
        {/* New Project Input */}
        <AnimatePresence>
          {isCreating && (
            <motion.div
              initial={{ opacity: 0, height: 0 }}
              animate={{ opacity: 1, height: 'auto' }}
              exit={{ opacity: 0, height: 0 }}
              className="p-2"
            >
              <input
                type="text"
                value={newProjectName}
                onChange={(e) => setNewProjectName(e.target.value)}
                onKeyDown={handleKeyDown}
                onBlur={() => {
                  if (!newProjectName.trim()) {
                    setIsCreating(false);
                  }
                }}
                placeholder="Project name..."
                className="w-full bg-zinc-800 border border-violet-500/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500"
                autoFocus
              />
            </motion.div>
          )}
        </AnimatePresence>

        {/* Current Project */}
        {currentProject && !savedProjects.find(p => p.id === currentProject.id) && (
          <div className="mb-2">
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider px-2 py-1">
              Current
            </div>
            <ProjectCard
              project={currentProject}
              isActive={true}
              onSelect={() => {}}
              onDelete={() => {}}
            />
          </div>
        )}

        {/* Saved Projects */}
        {filteredProjects.length > 0 ? (
          <>
            <div className="text-[10px] text-zinc-600 uppercase tracking-wider px-2 py-1">
              Saved ({filteredProjects.length})
            </div>
            {filteredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                project={project}
                isActive={currentProject?.id === project.id}
                onSelect={() => loadProject(project)}
                onDelete={() => {
                  if (confirm(`Delete "${project.name}"?`)) {
                    deleteProject(project.id);
                  }
                }}
              />
            ))}
          </>
        ) : searchQuery ? (
          <div className="text-center py-8 text-zinc-600">
            <p className="text-sm">No projects found</p>
          </div>
        ) : (
          <div className="text-center py-8 text-zinc-600">
            <Sparkles className="w-8 h-8 mx-auto mb-2 opacity-50" />
            <p className="text-sm">No saved projects yet</p>
            <p className="text-xs mt-1">Create one to get started</p>
          </div>
        )}
      </div>

      {/* Settings Section */}
      <div className="border-t border-zinc-800">
        <button
          onClick={() => setShowSettings(!showSettings)}
          className="w-full flex items-center justify-between p-3 text-sm text-zinc-400 hover:text-white transition-colors"
        >
          <div className="flex items-center gap-2">
            <Settings size={14} />
            <span>Settings</span>
          </div>
          {showSettings ? <ChevronDown size={14} /> : <ChevronRight size={14} />}
        </button>

        <AnimatePresence>
          {showSettings && (
            <motion.div
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              className="overflow-hidden"
            >
              <div className="px-4 pb-4 space-y-4">
                {/* Framework */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Framework</label>
                  <select
                    value={settings.framework}
                    onChange={(e) => updateSettings({ framework: e.target.value as any })}
                    className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  >
                    <option value="react">React</option>
                    <option value="nextjs">Next.js</option>
                    <option value="vue">Vue (Coming Soon)</option>
                  </select>
                </div>

                {/* Styling */}
                <div>
                  <label className="block text-xs font-medium text-zinc-400 mb-2">Styling</label>
                  <select
                    value={settings.styling}
                    onChange={(e) => updateSettings({ styling: e.target.value as any })}
                    className="w-full bg-zinc-800/80 border border-zinc-700/50 rounded-lg px-3 py-2 text-sm focus:outline-none focus:border-violet-500/50 focus:ring-2 focus:ring-violet-500/20 transition-all"
                  >
                    <option value="tailwind">Tailwind CSS</option>
                    <option value="css">Plain CSS</option>
                    <option value="styled-components">Styled Components</option>
                  </select>
                </div>

                {/* TypeScript */}
                <label className="flex items-center gap-3 cursor-pointer p-2 -mx-2 rounded-lg hover:bg-zinc-800/50 transition-colors">
                  <input
                    type="checkbox"
                    checked={settings.typescript}
                    onChange={(e) => updateSettings({ typescript: e.target.checked })}
                    className="w-4 h-4 rounded bg-zinc-800 border-zinc-700 text-violet-500 focus:ring-violet-500/50"
                  />
                  <span className="text-sm text-zinc-300">TypeScript</span>
                </label>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}

function ProjectCard({
  project,
  isActive,
  onSelect,
  onDelete
}: {
  project: BuilderProject;
  isActive: boolean;
  onSelect: () => void;
  onDelete: () => void;
}) {
  return (
    <motion.div
      layout
      whileHover={{ scale: 1.01 }}
      className={`group p-3 rounded-xl cursor-pointer transition-all ${
        isActive
          ? 'bg-violet-500/20 border border-violet-500/40 shadow-lg shadow-violet-500/10'
          : 'hover:bg-zinc-800/70 border border-zinc-800/50 hover:border-zinc-700/50'
      }`}
      onClick={onSelect}
    >
      <div className="flex items-start justify-between">
        <div className="flex items-center gap-2.5 min-w-0">
          <div className={`p-1.5 rounded-lg ${isActive ? 'bg-violet-500/20' : 'bg-zinc-800'}`}>
            <FolderOpen size={14} className={isActive ? 'text-violet-400' : 'text-zinc-500'} />
          </div>
          <span className="text-sm font-medium truncate">{project.name}</span>
        </div>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onDelete();
          }}
          className="p-1.5 opacity-0 group-hover:opacity-100 text-zinc-500 hover:text-red-400 hover:bg-red-500/10 rounded-md transition-all"
        >
          <Trash2 size={12} />
        </button>
      </div>
      <div className="flex items-center gap-2 mt-2 ml-8 text-xs text-zinc-500">
        <Clock size={11} />
        <span>{new Date(project.updatedAt).toLocaleDateString()}</span>
        <span>•</span>
        <span>{Object.keys(project.files).length} files</span>
      </div>
    </motion.div>
  );
}
