'use client';

import { useState } from 'react';
import { ExecutionPlan } from '@opsuna/shared';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { RotateCcw, AlertTriangle } from 'lucide-react';
import { rollbackExecution } from '@/hooks/useApi';

interface RollbackPanelProps {
  executionId: string;
  plan: ExecutionPlan;
  onRollbackComplete?: () => void;
}

export function RollbackPanel({ executionId, plan, onRollbackComplete }: RollbackPanelProps) {
  const [isRollingBack, setIsRollingBack] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const hasRollbackSteps = plan.rollbackSteps && plan.rollbackSteps.length > 0;

  if (!hasRollbackSteps) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <RotateCcw className="h-5 w-5" />
            Rollback
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Alert>
            <AlertDescription>
              No rollback steps are available for this execution.
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    );
  }

  const handleRollback = async () => {
    setIsRollingBack(true);
    setError(null);

    try {
      const response = await rollbackExecution(executionId, 'Manual rollback requested');
      if (response.success) {
        onRollbackComplete?.();
      } else {
        setError(response.error?.message || 'Rollback failed');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Rollback failed');
    } finally {
      setIsRollingBack(false);
    }
  };

  return (
    <Card className="border-orange-200">
      <CardHeader>
        <CardTitle className="text-lg flex items-center gap-2 text-orange-700">
          <RotateCcw className="h-5 w-5" />
          Rollback Available
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Alert variant="warning">
          <AlertTriangle className="h-4 w-4" />
          <AlertTitle>Rollback Warning</AlertTitle>
          <AlertDescription>
            This will attempt to undo the changes made by this execution.
            Review the rollback steps before proceeding.
          </AlertDescription>
        </Alert>

        <div className="space-y-2">
          <h4 className="font-medium text-sm">Rollback Steps:</h4>
          {plan.rollbackSteps!.map((step, index) => (
            <div key={step.id} className="flex items-start gap-2 text-sm p-2 bg-orange-50 rounded">
              <span className="text-orange-600 font-medium">{index + 1}.</span>
              <div>
                <span className="font-medium">{step.toolName}</span>
                <p className="text-muted-foreground">{step.description}</p>
              </div>
            </div>
          ))}
        </div>

        {error && (
          <Alert variant="destructive">
            <AlertDescription>{error}</AlertDescription>
          </Alert>
        )}

        <Button
          variant="outline"
          className="w-full border-orange-300 text-orange-700 hover:bg-orange-50"
          onClick={handleRollback}
          disabled={isRollingBack}
        >
          {isRollingBack ? (
            <>
              <span className="animate-spin mr-2">...</span>
              Rolling back...
            </>
          ) : (
            <>
              <RotateCcw className="mr-2 h-4 w-4" />
              Start Rollback
            </>
          )}
        </Button>
      </CardContent>
    </Card>
  );
}
