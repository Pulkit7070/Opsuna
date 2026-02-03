'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useExecutionStore } from '@/store/execution';

const WS_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout>();
  const subscribedExecutionRef = useRef<string | null>(null);

  const { updateStatus, addLog, addUIMessage, updateStepResult } = useExecutionStore();

  const connect = useCallback(() => {
    if (wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    try {
      const ws = new WebSocket(WS_URL);

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);

        // Re-subscribe if we have an execution
        if (subscribedExecutionRef.current) {
          ws.send(JSON.stringify({
            type: 'subscribe',
            payload: { executionId: subscribedExecutionRef.current },
          }));
        }
      };

      ws.onmessage = (event) => {
        try {
          const message = JSON.parse(event.data);
          handleMessage(message);
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };

      ws.onclose = () => {
        console.log('[WebSocket] Disconnected');
        setIsConnected(false);

        // Attempt to reconnect after 3 seconds
        reconnectTimeoutRef.current = setTimeout(() => {
          console.log('[WebSocket] Attempting to reconnect...');
          connect();
        }, 3000);
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WebSocket] Failed to connect:', err);
    }
  }, []);

  const handleMessage = useCallback((message: { type: string; payload: unknown }) => {
    switch (message.type) {
      case 'connection':
        console.log('[WebSocket] Connection acknowledged:', message.payload);
        break;

      case 'execution_update': {
        const { status, progress } = message.payload as {
          status: string;
          progress?: { currentStep: number; totalSteps: number };
        };
        updateStatus(status as Parameters<typeof updateStatus>[0], progress);
        break;
      }

      case 'ui_message': {
        const { message: uiMessage } = message.payload as { message: Parameters<typeof addUIMessage>[0] };
        addUIMessage(uiMessage);
        break;
      }

      case 'log_entry': {
        const { entry } = message.payload as { entry: Parameters<typeof addLog>[0] };
        addLog(entry);
        break;
      }

      case 'step_update': {
        const { stepId, result } = message.payload as {
          stepId: string;
          result: Parameters<typeof updateStepResult>[1];
        };
        updateStepResult(stepId, result);
        break;
      }

      case 'heartbeat':
        // Respond to heartbeat
        wsRef.current?.send(JSON.stringify({
          type: 'heartbeat',
          payload: { timestamp: new Date() },
        }));
        break;

      default:
        console.log('[WebSocket] Unknown message type:', message.type);
    }
  }, [updateStatus, addLog, addUIMessage, updateStepResult]);

  const subscribe = useCallback((executionId: string) => {
    subscribedExecutionRef.current = executionId;

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'subscribe',
        payload: { executionId },
      }));
      console.log('[WebSocket] Subscribed to execution:', executionId);
    }
  }, []);

  const unsubscribe = useCallback((executionId: string) => {
    if (subscribedExecutionRef.current === executionId) {
      subscribedExecutionRef.current = null;
    }

    if (wsRef.current?.readyState === WebSocket.OPEN) {
      wsRef.current.send(JSON.stringify({
        type: 'unsubscribe',
        payload: { executionId },
      }));
      console.log('[WebSocket] Unsubscribed from execution:', executionId);
    }
  }, []);

  const disconnect = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
    }
    if (wsRef.current) {
      wsRef.current.close();
      wsRef.current = null;
    }
    setIsConnected(false);
  }, []);

  useEffect(() => {
    connect();

    return () => {
      disconnect();
    };
  }, [connect, disconnect]);

  return {
    isConnected,
    subscribe,
    unsubscribe,
    connect,
    disconnect,
  };
}
