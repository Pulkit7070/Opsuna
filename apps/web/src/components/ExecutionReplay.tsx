'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { ReplayData, ReplayEvent } from '@/hooks/useArtifacts';

interface ExecutionReplayProps {
  data: ReplayData;
}

export function ExecutionReplay({ data }: ExecutionReplayProps) {
  const [currentEventIndex, setCurrentEventIndex] = useState(0);
  const [isPlaying, setIsPlaying] = useState(false);
  const [playbackSpeed, setPlaybackSpeed] = useState(1);

  const totalEvents = data.events.length;
  const currentEvent = data.events[currentEventIndex];
  const progress = totalEvents > 0 ? ((currentEventIndex + 1) / totalEvents) * 100 : 0;

  useEffect(() => {
    if (!isPlaying || currentEventIndex >= totalEvents - 1) {
      if (currentEventIndex >= totalEvents - 1) {
        setIsPlaying(false);
      }
      return;
    }

    const timer = setTimeout(() => {
      setCurrentEventIndex((prev) => Math.min(prev + 1, totalEvents - 1));
    }, 1000 / playbackSpeed);

    return () => clearTimeout(timer);
  }, [isPlaying, currentEventIndex, totalEvents, playbackSpeed]);

  const handlePlayPause = () => {
    if (currentEventIndex >= totalEvents - 1) {
      setCurrentEventIndex(0);
    }
    setIsPlaying(!isPlaying);
  };

  const handleReset = () => {
    setIsPlaying(false);
    setCurrentEventIndex(0);
  };

  const handleSliderChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setIsPlaying(false);
    setCurrentEventIndex(Number(e.target.value));
  };

  const getEventIcon = (event: ReplayEvent) => {
    switch (event.type) {
      case 'EXECUTION_STARTED':
        return <Play className="w-4 h-4 text-blue-400" />;
      case 'EXECUTION_COMPLETED':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'EXECUTION_FAILED':
        return <XCircle className="w-4 h-4 text-red-400" />;
      case 'STEP_RESULT':
        const details = event.details;
        return details?.status === 'success' ? (
          <CheckCircle className="w-4 h-4 text-green-400" />
        ) : (
          <XCircle className="w-4 h-4 text-red-400" />
        );
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  const formatTimestamp = (timestamp: string) => {
    return new Date(timestamp).toLocaleTimeString();
  };

  const getStepStatus = useCallback((stepIndex: number) => {
    const result = data.results[stepIndex];
    if (!result) return 'pending';
    return result.status;
  }, [data.results]);

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-neutral-200">Execution Replay</h3>
          <p className="text-sm text-neutral-500">{data.plan.summary}</p>
        </div>
        <div className={`px-3 py-1 rounded-full text-xs font-medium ${
          data.execution.status === 'completed'
            ? 'bg-green-500/20 text-green-400'
            : data.execution.status === 'failed'
            ? 'bg-red-500/20 text-red-400'
            : 'bg-yellow-500/20 text-yellow-400'
        }`}>
          {data.execution.status.toUpperCase()}
        </div>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-4 p-4 bg-neutral-800/50 rounded-lg border border-neutral-700/50">
        <button
          onClick={handlePlayPause}
          className="p-2 bg-[#D4AF37]/20 rounded-lg text-[#D4AF37] hover:bg-[#D4AF37]/30 transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={handleReset}
          className="p-2 text-neutral-400 hover:text-neutral-200 transition-colors"
        >
          <RotateCcw className="w-5 h-5" />
        </button>

        {/* Progress Slider */}
        <div className="flex-1 flex items-center gap-3">
          <input
            type="range"
            min={0}
            max={totalEvents - 1}
            value={currentEventIndex}
            onChange={handleSliderChange}
            className="flex-1 h-2 bg-neutral-700 rounded-lg appearance-none cursor-pointer accent-[#D4AF37]"
          />
          <span className="text-xs text-neutral-500 min-w-[60px]">
            {currentEventIndex + 1} / {totalEvents}
          </span>
        </div>

        {/* Speed Control */}
        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="px-2 py-1 bg-neutral-700 rounded text-sm text-neutral-200 border-none"
        >
          <option value={0.5}>0.5x</option>
          <option value={1}>1x</option>
          <option value={2}>2x</option>
          <option value={4}>4x</option>
        </select>
      </div>

      {/* Steps Timeline */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Steps */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">Steps</h4>
          {data.plan.steps.map((step, index) => {
            const status = getStepStatus(index);
            const isActive = data.results[index]?.stepId === currentEvent?.details?.stepId;

            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0.5 }}
                animate={{ opacity: isActive ? 1 : 0.7 }}
                className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${
                  isActive
                    ? 'bg-[#D4AF37]/10 border-[#D4AF37]/50'
                    : 'bg-neutral-800/30 border-neutral-700/30'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  status === 'success'
                    ? 'bg-green-500/20 text-green-400'
                    : status === 'failed'
                    ? 'bg-red-500/20 text-red-400'
                    : 'bg-neutral-700/50 text-neutral-400'
                }`}>
                  {status === 'success' ? (
                    <CheckCircle className="w-4 h-4" />
                  ) : status === 'failed' ? (
                    <XCircle className="w-4 h-4" />
                  ) : (
                    <span className="text-xs">{index + 1}</span>
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-neutral-200 truncate">{step.toolName}</p>
                  <p className="text-xs text-neutral-500 truncate">{step.description}</p>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-[#D4AF37]" />}
              </motion.div>
            );
          })}
        </div>

        {/* Event Log */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-neutral-400 uppercase tracking-wide">Event Log</h4>
          <div className="h-[400px] overflow-y-auto space-y-2 pr-2">
            {data.events.slice(0, currentEventIndex + 1).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-start gap-3 p-2 rounded-lg ${
                  index === currentEventIndex
                    ? 'bg-[#D4AF37]/10 border border-[#D4AF37]/30'
                    : 'bg-neutral-800/30'
                }`}
              >
                <div className="mt-0.5">{getEventIcon(event)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-neutral-300">
                      {event.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-neutral-500">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  {event.details && (
                    <p className="text-xs text-neutral-500 mt-1 truncate">
                      {event.details.toolName != null && `Tool: ${String(event.details.toolName)}`}
                      {event.details.error != null && ` - Error: ${String(event.details.error)}`}
                    </p>
                  )}
                </div>
              </motion.div>
            ))}
          </div>
        </div>
      </div>

      {/* Progress Bar */}
      <div className="h-1 bg-neutral-700/50 rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-[#D4AF37]"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </div>
  );
}
