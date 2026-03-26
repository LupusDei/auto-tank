import type { ClientMessage, ServerMessage } from '../../server/GameServer';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting';
export type MessageHandler = (message: ServerMessage) => void;

/**
 * Browser WebSocket client with reconnection and message queuing.
 * Transport-agnostic core for testability.
 */
export class NetworkClient {
  private _state: ConnectionState = 'disconnected';
  private readonly handlers = new Set<MessageHandler>();
  private readonly outbox: ClientMessage[] = [];
  private _reconnectAttempts = 0;
  readonly maxReconnectAttempts: number;

  constructor(maxReconnectAttempts = 5) {
    this.maxReconnectAttempts = maxReconnectAttempts;
  }

  get state(): ConnectionState {
    return this._state;
  }

  get reconnectAttempts(): number {
    return this._reconnectAttempts;
  }

  get pendingMessages(): number {
    return this.outbox.length;
  }

  /** Register a handler for incoming server messages. */
  onMessage(handler: MessageHandler): () => void {
    this.handlers.add(handler);
    return (): void => {
      this.handlers.delete(handler);
    };
  }

  /** Queue a message to send. Sends immediately if connected. */
  send(message: ClientMessage): void {
    this.outbox.push(message);
    if (this._state === 'connected') {
      this.flush();
    }
  }

  /** Simulate connection established (for testing / transport integration). */
  handleConnected(): void {
    this._state = 'connected';
    this._reconnectAttempts = 0;
    this.flush();
  }

  /** Simulate connection lost. */
  handleDisconnected(): void {
    if (this._reconnectAttempts < this.maxReconnectAttempts) {
      this._state = 'reconnecting';
      this._reconnectAttempts += 1;
    } else {
      this._state = 'disconnected';
    }
  }

  /** Simulate receiving a server message. */
  handleMessage(message: ServerMessage): void {
    for (const handler of this.handlers) {
      handler(message);
    }
  }

  /** Start connecting. */
  connect(): void {
    this._state = 'connecting';
  }

  /** Disconnect and clear state. */
  disconnect(): void {
    this._state = 'disconnected';
    this._reconnectAttempts = 0;
    this.outbox.length = 0;
  }

  /** Flush the outbox. Returns flushed messages. */
  flush(): ClientMessage[] {
    const messages = [...this.outbox];
    this.outbox.length = 0;
    return messages;
  }
}
