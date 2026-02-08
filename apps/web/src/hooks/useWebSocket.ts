'use client';

import { useEffect, useRef, useCallback, useState } from 'react';
import { useExecutionStore } from '@/store/execution';
import { createClient } from '@/lib/supabase/client';

const WS_BASE_URL = process.env.NEXT_PUBLIC_WS_URL || 'ws://localhost:3001/ws';
const RECONNECT_DELAY = 3000;
const MAX_RECONNECT_ATTEMPTS = 5;

export function useWebSocket() {
  const wsRef = useRef<WebSocket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const reconnectTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const reconnectAttemptsRef = useRef(0);
  const subscribedExecutionRef = useRef<string | null>(null);
  const isConnectingRef = useRef(false);

  const { updateStatus, addLog, addUIMessage, updateStepResult } = useExecutionStore();

  // Use ref for message handler to avoid circular dependency
  const handleMessageRef = useRef<(message: { type: string; payload: unknown }) => void>();

  const clearReconnectTimeout = useCallback(() => {
    if (reconnectTimeoutRef.current) {
      clearTimeout(reconnectTimeoutRef.current);
      reconnectTimeoutRef.current = null;
    }
  }, []);

  // Use ref for connect to avoid circular dependency in scheduleReconnect
  const connectRef = useRef<() => Promise<void>>();

  const scheduleReconnect = useCallback(() => {
    clearReconnectTimeout();

    if (reconnectAttemptsRef.current >= MAX_RECONNECT_ATTEMPTS) {
      console.warn('[WebSocket] Max reconnect attempts reached');
      return;
    }

    const delay = RECONNECT_DELAY * Math.pow(1.5, reconnectAttemptsRef.current);
    console.log(`[WebSocket] Reconnecting in ${delay / 1000}s (attempt ${reconnectAttemptsRef.current + 1}/${MAX_RECONNECT_ATTEMPTS})`);

    reconnectTimeoutRef.current = setTimeout(() => {
      reconnectAttemptsRef.current++;
      connectRef.current?.();
    }, delay);
  }, [clearReconnectTimeout]);

  const connect = useCallback(async () => {
    // Prevent multiple simultaneous connection attempts
    if (isConnectingRef.current || wsRef.current?.readyState === WebSocket.OPEN) {
      return;
    }

    isConnectingRef.current = true;
    clearReconnectTimeout();

    try {
      // Get auth token for WebSocket connection
      let wsUrl = WS_BASE_URL;
      try {
        const supabase = createClient();
        const { data: { session } } = await supabase.auth.getSession();
        if (session?.access_token) {
          wsUrl = `${WS_BASE_URL}?token=${session.access_token}`;
        }
      } catch {
        // Continue without auth token
      }

      const ws = new WebSocket(wsUrl);

      ws.onopen = () => {
        console.log('[WebSocket] Connected');
        setIsConnected(true);
        reconnectAttemptsRef.current = 0; // Reset on successful connection
        isConnectingRef.current = false;

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
          handleMessageRef.current?.(message);
        } catch (err) {
          console.error('[WebSocket] Failed to parse message:', err);
        }
      };

      ws.onclose = (event) => {
        console.log('[WebSocket] Disconnected', event.code, event.reason);
        setIsConnected(false);
        isConnectingRef.current = false;
        wsRef.current = null;

        // Only reconnect if not a clean close (code 1000)
        if (event.code !== 1000) {
          scheduleReconnect();
        }
      };

      ws.onerror = (error) => {
        console.error('[WebSocket] Error:', error);
        isConnectingRef.current = false;
        // Error will trigger onclose, which handles reconnection
      };

      wsRef.current = ws;
    } catch (err) {
      console.error('[WebSocket] Failed to connect:', err);
      isConnectingRef.current = false;
      scheduleReconnect();
    }
  }, [clearReconnectTimeout, scheduleReconnect]);

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
    clearReconnectTimeout();
    reconnectAttemptsRef.current = 0;
    isConnectingRef.current = false;

    if (wsRef.current) {
      wsRef.current.close(1000, 'Client disconnect'); // Clean close
      wsRef.current = null;
    }
    setIsConnected(false);
  }, [clearReconnectTimeout]);

  // Keep refs in sync with their callbacks
  useEffect(() => {
    handleMessageRef.current = handleMessage;
  }, [handleMessage]);

  useEffect(() => {
    connectRef.current = connect;
  }, [connect]);

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
