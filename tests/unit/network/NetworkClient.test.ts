import { describe, expect, it, vi } from 'vitest';
import { NetworkClient } from '@network/NetworkClient';

describe('NetworkClient', () => {
  it('should start disconnected', () => {
    const client = new NetworkClient();
    expect(client.state).toBe('disconnected');
  });

  it('should transition to connecting', () => {
    const client = new NetworkClient();
    client.connect();
    expect(client.state).toBe('connecting');
  });

  it('should transition to connected', () => {
    const client = new NetworkClient();
    client.connect();
    client.handleConnected();
    expect(client.state).toBe('connected');
  });

  it('should queue messages when not connected', () => {
    const client = new NetworkClient();
    client.send({ type: 'set_ready', ready: true });
    expect(client.pendingMessages).toBe(1);
  });

  it('should flush messages on connect', () => {
    const client = new NetworkClient();
    client.send({ type: 'set_ready', ready: true });
    const flushed = vi.fn();
    const origFlush = client.flush.bind(client);
    client.flush = (): ReturnType<typeof origFlush> => {
      flushed();
      return origFlush();
    };
    client.handleConnected();
    expect(flushed).toHaveBeenCalled();
  });

  it('should dispatch incoming messages to handlers', () => {
    const client = new NetworkClient();
    const handler = vi.fn();
    client.onMessage(handler);
    client.handleMessage({ type: 'game_started', roomId: 'room-1' });
    expect(handler).toHaveBeenCalledWith({ type: 'game_started', roomId: 'room-1' });
  });

  it('should unsubscribe handler', () => {
    const client = new NetworkClient();
    const handler = vi.fn();
    const unsub = client.onMessage(handler);
    unsub();
    client.handleMessage({ type: 'game_started', roomId: 'room-1' });
    expect(handler).not.toHaveBeenCalled();
  });

  it('should attempt reconnection on disconnect', () => {
    const client = new NetworkClient(3);
    client.connect();
    client.handleConnected();
    client.handleDisconnected();
    expect(client.state).toBe('reconnecting');
    expect(client.reconnectAttempts).toBe(1);
  });

  it('should give up after max reconnect attempts', () => {
    const client = new NetworkClient(1);
    client.connect();
    client.handleConnected();
    client.handleDisconnected(); // attempt 1 → reconnecting
    expect(client.state).toBe('reconnecting');
    client.handleDisconnected(); // attempt 2 → exceeds max → disconnected
    expect(client.state).toBe('disconnected');
  });

  it('should clear state on disconnect', () => {
    const client = new NetworkClient();
    client.send({ type: 'set_ready', ready: true });
    client.disconnect();
    expect(client.pendingMessages).toBe(0);
    expect(client.state).toBe('disconnected');
  });
});
