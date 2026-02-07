'use client';

import { motion } from 'framer-motion';
import { CheckCircle2, XCircle, MinusCircle, Clock, BarChart3 } from 'lucide-react';
import { cn } from '@/lib/utils';

interface TestCase {
  name: string;
  status: 'passed' | 'failed' | 'skipped';
  duration: number;
}

interface Coverage {
  lines: number;
  branches: number;
  functions: number;
}

interface TestResultsCardProps {
  environment: string;
  passed: number;
  failed: number;
  skipped: number;
  coverage?: Coverage;
  tests?: TestCase[];
}

export function TestResultsCard({
  environment,
  passed,
  failed,
  skipped,
  coverage,
  tests = [],
}: TestResultsCardProps) {
  const total = passed + failed + skipped;
  const passRate = total > 0 ? Math.round((passed / total) * 100) : 0;
  const allPassed = failed === 0;

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      className={cn(
        'rounded-xl border bg-surface-elevated p-5',
        allPassed ? 'border-accent-green/30' : 'border-accent-red/30'
      )}
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <motion.div
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ type: 'spring', stiffness: 200 }}
            className={cn(
              'p-2 rounded-lg',
              allPassed ? 'bg-accent-green/20' : 'bg-accent-red/20'
            )}
          >
            {allPassed ? (
              <CheckCircle2 className="w-5 h-5 text-accent-green" />
            ) : (
              <XCircle className="w-5 h-5 text-accent-red" />
            )}
          </motion.div>
          <div>
            <h3 className="font-semibold text-text-primary">Test Results</h3>
            <p className="text-sm text-text-muted">{environment} environment</p>
          </div>
        </div>
        <div
          className={cn(
            'text-2xl font-bold',
            allPassed ? 'text-accent-green' : 'text-accent-red'
          )}
        >
          {passRate}%
        </div>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-3 gap-3 mb-4">
        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.1 }}
          className="p-3 rounded-lg bg-accent-green/10 text-center"
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <CheckCircle2 className="w-4 h-4 text-accent-green" />
            <span className="text-lg font-bold text-accent-green">{passed}</span>
          </div>
          <span className="text-xs text-text-muted">Passed</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.2 }}
          className="p-3 rounded-lg bg-accent-red/10 text-center"
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <XCircle className="w-4 h-4 text-accent-red" />
            <span className="text-lg font-bold text-accent-red">{failed}</span>
          </div>
          <span className="text-xs text-text-muted">Failed</span>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ delay: 0.3 }}
          className="p-3 rounded-lg bg-surface-base text-center"
        >
          <div className="flex items-center justify-center gap-1 mb-1">
            <MinusCircle className="w-4 h-4 text-text-muted" />
            <span className="text-lg font-bold text-text-muted">{skipped}</span>
          </div>
          <span className="text-xs text-text-muted">Skipped</span>
        </motion.div>
      </div>

      {/* Coverage */}
      {coverage && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
          className="mb-4 p-3 rounded-lg bg-surface-base"
        >
          <div className="flex items-center gap-2 mb-2">
            <BarChart3 className="w-4 h-4 text-accent-blue" />
            <span className="text-sm font-medium text-text-primary">Coverage</span>
          </div>
          <div className="grid grid-cols-3 gap-2 text-center text-xs">
            <div>
              <div className="font-bold text-accent-blue">{coverage.lines}%</div>
              <div className="text-text-muted">Lines</div>
            </div>
            <div>
              <div className="font-bold text-accent-blue">{coverage.branches}%</div>
              <div className="text-text-muted">Branches</div>
            </div>
            <div>
              <div className="font-bold text-accent-blue">{coverage.functions}%</div>
              <div className="text-text-muted">Functions</div>
            </div>
          </div>
        </motion.div>
      )}

      {/* Test List */}
      {tests.length > 0 && (
        <div className="space-y-1 max-h-32 overflow-y-auto">
          {tests.map((test, index) => (
            <motion.div
              key={test.name}
              initial={{ opacity: 0, x: -10 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: 0.5 + index * 0.05 }}
              className="flex items-center gap-2 text-xs p-2 rounded bg-surface-base"
            >
              {test.status === 'passed' && (
                <CheckCircle2 className="w-3 h-3 text-accent-green flex-shrink-0" />
              )}
              {test.status === 'failed' && (
                <XCircle className="w-3 h-3 text-accent-red flex-shrink-0" />
              )}
              {test.status === 'skipped' && (
                <MinusCircle className="w-3 h-3 text-text-muted flex-shrink-0" />
              )}
              <span className="text-text-secondary truncate flex-1">{test.name}</span>
              <div className="flex items-center gap-1 text-text-muted">
                <Clock className="w-3 h-3" />
                <span>{test.duration}ms</span>
              </div>
            </motion.div>
          ))}
        </div>
      )}
    </motion.div>
  );
}
