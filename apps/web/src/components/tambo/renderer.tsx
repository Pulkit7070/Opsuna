'use client';

import { MCPUIMessage, UIBlockType } from '@opsuna/shared';
import { ActionPreviewCard } from './ActionPreviewCard';
import { ProgressStepper } from './ProgressStepper';
import { LiveLogsViewer } from './LiveLogsViewer';
import { ToolResultSummary } from './ToolResultSummary';
import { RollbackPanel } from './RollbackPanel';
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle2, AlertTriangle, XCircle } from 'lucide-react';

interface UIRendererProps {
  messages: MCPUIMessage[];
  executionId: string;
}

export function UIRenderer({ messages }: UIRendererProps) {
  if (messages.length === 0) {
    return null;
  }

  return (
    <div className="space-y-4">
      {messages.map((message) => (
        <UIBlock key={message.id} message={message} />
      ))}
    </div>
  );
}

function UIBlock({ message }: { message: MCPUIMessage }) {
  const { type, payload } = message;

  switch (type) {
    case 'action_preview':
      if (payload.type === 'action_preview') {
        return (
          <ActionPreviewCard
            plan={{
              summary: payload.summary,
              riskLevel: payload.riskLevel,
              riskReason: payload.riskReason,
              steps: payload.steps.map((s) => ({
                ...s,
                parameters: s.parameters,
              })),
            }}
          />
        );
      }
      return null;

    case 'progress_stepper':
      if (payload.type === 'progress_stepper') {
        return (
          <Card>
            <CardContent className="pt-6">
              <div className="space-y-4">
                {payload.steps.map((step, index) => (
                  <div key={step.id} className="flex items-center gap-3">
                    <StepStatusIcon status={step.status} />
                    <span className={step.status === 'running' ? 'font-medium' : ''}>
                      {step.title}
                    </span>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        );
      }
      return null;

    case 'live_logs':
      if (payload.type === 'live_logs') {
        return (
          <LiveLogsViewer
            logs={payload.logs.map((l) => ({
              timestamp: new Date(l.timestamp),
              level: l.level,
              message: l.message,
            }))}
            isStreaming={payload.isStreaming}
          />
        );
      }
      return null;

    case 'tool_result':
      if (payload.type === 'tool_result') {
        return (
          <Alert variant={payload.status === 'success' ? 'success' : 'destructive'}>
            {payload.status === 'success' ? (
              <CheckCircle2 className="h-4 w-4" />
            ) : (
              <XCircle className="h-4 w-4" />
            )}
            <AlertTitle>{payload.toolName}</AlertTitle>
            <AlertDescription>{payload.summary}</AlertDescription>
          </Alert>
        );
      }
      return null;

    case 'error_display':
      if (payload.type === 'error_display') {
        return (
          <Alert variant="destructive">
            <XCircle className="h-4 w-4" />
            <AlertTitle>{payload.title}</AlertTitle>
            <AlertDescription>
              <p>{payload.message}</p>
              {payload.suggestedActions && payload.suggestedActions.length > 0 && (
                <ul className="mt-2 list-disc list-inside">
                  {payload.suggestedActions.map((action, i) => (
                    <li key={i}>{action}</li>
                  ))}
                </ul>
              )}
            </AlertDescription>
          </Alert>
        );
      }
      return null;

    case 'success_summary':
      if (payload.type === 'success_summary') {
        return (
          <Card className="border-green-200 bg-green-50">
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-green-700">
                <CheckCircle2 className="h-5 w-5" />
                {payload.title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-green-700">{payload.message}</p>
              {payload.results.length > 0 && (
                <div className="mt-4 space-y-2">
                  {payload.results.map((result, i) => (
                    <div key={i} className="flex items-center gap-2 text-sm">
                      <span className="font-medium">{result.label}:</span>
                      {result.link ? (
                        <a
                          href={result.link}
                          className="text-primary hover:underline"
                          target="_blank"
                          rel="noopener noreferrer"
                        >
                          {result.value}
                        </a>
                      ) : (
                        <span>{result.value}</span>
                      )}
                    </div>
                  ))}
                </div>
              )}
            </CardContent>
          </Card>
        );
      }
      return null;

    default:
      return null;
  }
}

function StepStatusIcon({ status }: { status: string }) {
  switch (status) {
    case 'success':
      return <CheckCircle2 className="h-5 w-5 text-green-500" />;
    case 'failed':
      return <XCircle className="h-5 w-5 text-red-500" />;
    case 'running':
      return <div className="h-5 w-5 border-2 border-blue-500 border-t-transparent rounded-full animate-spin" />;
    default:
      return <div className="h-5 w-5 border-2 border-muted rounded-full" />;
  }
}
