'use client';

import { useState, useEffect, useCallback } from 'react';
import { motion } from 'framer-motion';
import { Play, Pause, RotateCcw, CheckCircle, XCircle, Clock, ChevronRight } from 'lucide-react';
import { ReplayData, ReplayEvent } from '@/hooks/useArtifacts';
import { Badge } from '@/components/ui/badge';

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
        return <Play className="w-4 h-4 text-info" />;
      case 'EXECUTION_COMPLETED':
        return <CheckCircle className="w-4 h-4 text-success" />;
      case 'EXECUTION_FAILED':
        return <XCircle className="w-4 h-4 text-destructive" />;
      case 'STEP_RESULT':
        const details = event.details;
        return details?.status === 'success' ? (
          <CheckCircle className="w-4 h-4 text-success" />
        ) : (
          <XCircle className="w-4 h-4 text-destructive" />
        );
      default:
        return <Clock className="w-4 h-4 text-text-muted" />;
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

  const statusVariant = data.execution.status === 'completed'
    ? 'success'
    : data.execution.status === 'failed'
    ? 'destructive'
    : 'warning';

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h3 className="text-lg font-medium text-text-primary">Execution Replay</h3>
          <p className="text-sm text-text-muted">{data.plan.summary}</p>
        </div>
        <Badge variant={statusVariant}>
          {data.execution.status.toUpperCase()}
        </Badge>
      </div>

      {/* Playback Controls */}
      <div className="flex items-center gap-4 p-4 bg-bg-elevated rounded-lg border border-border-subtle">
        <button
          onClick={handlePlayPause}
          className="p-2 bg-accent/20 rounded-lg text-accent hover:bg-accent/30 transition-colors"
        >
          {isPlaying ? <Pause className="w-5 h-5" /> : <Play className="w-5 h-5" />}
        </button>
        <button
          onClick={handleReset}
          className="p-2 text-text-muted hover:text-text-primary transition-colors"
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
            className="flex-1 h-2 bg-bg-surface rounded-lg appearance-none cursor-pointer accent-accent"
          />
          <span className="text-xs text-text-muted min-w-[60px]">
            {currentEventIndex + 1} / {totalEvents}
          </span>
        </div>

        {/* Speed Control */}
        <select
          value={playbackSpeed}
          onChange={(e) => setPlaybackSpeed(Number(e.target.value))}
          className="px-2 py-1 bg-bg-surface rounded text-sm text-text-primary border border-border-subtle"
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
          <h4 className="text-sm font-medium text-text-muted uppercase tracking-wide">Steps</h4>
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
                    ? 'bg-accent/10 border-accent/50'
                    : 'bg-bg-elevated border-border-subtle'
                }`}
              >
                <div className={`w-8 h-8 rounded-full flex items-center justify-center ${
                  status === 'success'
                    ? 'bg-success/20 text-success'
                    : status === 'failed'
                    ? 'bg-destructive/20 text-destructive'
                    : 'bg-bg-surface text-text-muted'
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
                  <p className="text-sm text-text-primary truncate">{step.toolName}</p>
                  <p className="text-xs text-text-muted truncate">{step.description}</p>
                </div>
                {isActive && <ChevronRight className="w-4 h-4 text-accent" />}
              </motion.div>
            );
          })}
        </div>

        {/* Event Log */}
        <div className="space-y-3">
          <h4 className="text-sm font-medium text-text-muted uppercase tracking-wide">Event Log</h4>
          <div className="h-[400px] overflow-y-auto space-y-2 pr-2">
            {data.events.slice(0, currentEventIndex + 1).map((event, index) => (
              <motion.div
                key={event.id}
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                className={`flex items-start gap-3 p-2 rounded-lg ${
                  index === currentEventIndex
                    ? 'bg-accent/10 border border-accent/30'
                    : 'bg-bg-elevated'
                }`}
              >
                <div className="mt-0.5">{getEventIcon(event)}</div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <span className="text-xs font-medium text-text-secondary">
                      {event.type.replace(/_/g, ' ')}
                    </span>
                    <span className="text-xs text-text-muted">
                      {formatTimestamp(event.timestamp)}
                    </span>
                  </div>
                  {event.details && (
                    <p className="text-xs text-text-muted mt-1 truncate">
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
      <div className="h-1 bg-bg-surface rounded-full overflow-hidden">
        <motion.div
          className="h-full bg-accent"
          initial={{ width: 0 }}
          animate={{ width: `${progress}%` }}
          transition={{ duration: 0.2 }}
        />
      </div>
    </div>
  );
}
