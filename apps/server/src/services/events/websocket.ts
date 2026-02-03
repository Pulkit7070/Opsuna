import { WebSocket, WebSocketServer } from 'ws';
import { Server as HTTPServer } from 'http';
import { v4 as uuid } from 'uuid';
import {
  eventEmitter,
  ExecutionStatusEvent,
  ExecutionUIMessageEvent,
  ExecutionLogEvent,
  ExecutionStepUpdateEvent,
} from './emitter';

interface Client {
  id: string;
  ws: WebSocket;
  subscriptions: Set<string>;
}

class WebSocketManager {
  private wss: WebSocketServer | null = null;
  private clients: Map<string, Client> = new Map();

  initialize(server: HTTPServer) {
    this.wss = new WebSocketServer({ server, path: '/ws' });

    this.wss.on('connection', (ws: WebSocket) => {
      const clientId = uuid();
      const client: Client = {
        id: clientId,
        ws,
        subscriptions: new Set(),
      };

      this.clients.set(clientId, client);
      console.log(`[WebSocket] Client connected: ${clientId}`);

      // Send connection acknowledgment
      this.sendToClient(client, {
        type: 'connection',
        payload: { clientId, connectedAt: new Date() },
        timestamp: new Date(),
      });

      ws.on('message', (data: Buffer) => {
        try {
          const message = JSON.parse(data.toString());
          this.handleMessage(client, message);
        } catch (error) {
          console.error('[WebSocket] Failed to parse message:', error);
        }
      });

      ws.on('close', () => {
        this.clients.delete(clientId);
        console.log(`[WebSocket] Client disconnected: ${clientId}`);
      });

      ws.on('error', (error) => {
        console.error(`[WebSocket] Client error ${clientId}:`, error);
      });
    });

    // Subscribe to events
    eventEmitter.onStatus(this.broadcastToSubscribers.bind(this, 'execution_update'));
    eventEmitter.onUIMessage(this.broadcastUIMessage.bind(this));
    eventEmitter.onLog(this.broadcastLog.bind(this));
    eventEmitter.onStepUpdate(this.broadcastStepUpdate.bind(this));

    console.log('[WebSocket] Server initialized');
  }

  private handleMessage(client: Client, message: { type: string; payload: unknown }) {
    switch (message.type) {
      case 'subscribe': {
        const { executionId } = message.payload as { executionId: string };
        client.subscriptions.add(executionId);
        console.log(`[WebSocket] Client ${client.id} subscribed to ${executionId}`);
        break;
      }
      case 'unsubscribe': {
        const { executionId } = message.payload as { executionId: string };
        client.subscriptions.delete(executionId);
        console.log(`[WebSocket] Client ${client.id} unsubscribed from ${executionId}`);
        break;
      }
      case 'heartbeat': {
        this.sendToClient(client, {
          type: 'heartbeat',
          payload: { timestamp: new Date() },
          timestamp: new Date(),
        });
        break;
      }
    }
  }

  private sendToClient(client: Client, message: unknown) {
    if (client.ws.readyState === WebSocket.OPEN) {
      client.ws.send(JSON.stringify(message));
    }
  }

  private broadcastToSubscribers(type: string, event: ExecutionStatusEvent) {
    const message = {
      type,
      payload: event,
      timestamp: new Date(),
    };

    for (const client of this.clients.values()) {
      if (client.subscriptions.has(event.executionId)) {
        this.sendToClient(client, message);
      }
    }
  }

  private broadcastUIMessage(event: ExecutionUIMessageEvent) {
    const message = {
      type: 'ui_message',
      payload: { message: event.message },
      timestamp: new Date(),
    };

    for (const client of this.clients.values()) {
      if (client.subscriptions.has(event.executionId)) {
        this.sendToClient(client, message);
      }
    }
  }

  private broadcastLog(event: ExecutionLogEvent) {
    const message = {
      type: 'log_entry',
      payload: { executionId: event.executionId, entry: event.entry },
      timestamp: new Date(),
    };

    for (const client of this.clients.values()) {
      if (client.subscriptions.has(event.executionId)) {
        this.sendToClient(client, message);
      }
    }
  }

  private broadcastStepUpdate(event: ExecutionStepUpdateEvent) {
    const message = {
      type: 'step_update',
      payload: event,
      timestamp: new Date(),
    };

    for (const client of this.clients.values()) {
      if (client.subscriptions.has(event.executionId)) {
        this.sendToClient(client, message);
      }
    }
  }
}

export const wsManager = new WebSocketManager();
