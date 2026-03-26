import { describe, expect, it } from 'vitest';
import { LobbyManager } from '@network/LobbyManager';
import { NetworkClient } from '@network/NetworkClient';

describe('LobbyManager', () => {
  it('should start idle', () => {
    const client = new NetworkClient();
    const lobby = new LobbyManager(client);
    expect(lobby.state).toBe('idle');
    expect(lobby.roomId).toBeNull();
  });

  it('should handle room creation', () => {
    const client = new NetworkClient();
    const lobby = new LobbyManager(client);
    lobby.createRoom('Alice');
    lobby.handleServerMessage({ type: 'room_created', roomId: 'room-1' });
    expect(lobby.roomId).toBe('room-1');
    expect(lobby.state).toBe('in_lobby');
    expect(lobby.isHost).toBe(true);
  });

  it('should handle joining a room', () => {
    const client = new NetworkClient();
    const lobby = new LobbyManager(client);
    lobby.joinRoom('room-1', 'Bob');
    lobby.handleServerMessage({
      type: 'room_joined',
      roomId: 'room-1',
      players: [
        { id: 'p1', name: 'Alice', ready: false, connected: true },
        { id: 'p2', name: 'Bob', ready: false, connected: true },
      ],
    });
    expect(lobby.playerCount).toBe(2);
    expect(lobby.isHost).toBe(false);
  });

  it('should track player joins and leaves', () => {
    const client = new NetworkClient();
    const lobby = new LobbyManager(client);
    lobby.handleServerMessage({ type: 'room_created', roomId: 'room-1' });
    lobby.handleServerMessage({
      type: 'player_joined',
      player: { id: 'p2', name: 'Bob', ready: false, connected: true },
    });
    expect(lobby.playerCount).toBe(1);

    lobby.handleServerMessage({ type: 'player_left', playerId: 'p2' });
    expect(lobby.playerCount).toBe(0);
  });

  it('should track ready state', () => {
    const client = new NetworkClient();
    const lobby = new LobbyManager(client);
    lobby.handleServerMessage({
      type: 'room_joined',
      roomId: 'room-1',
      players: [
        { id: 'p1', name: 'Alice', ready: false, connected: true },
        { id: 'p2', name: 'Bob', ready: false, connected: true },
      ],
    });

    lobby.handleServerMessage({ type: 'player_ready', playerId: 'p1', ready: true });
    lobby.handleServerMessage({ type: 'player_ready', playerId: 'p2', ready: true });
    expect(lobby.allReady).toBe(true);
  });

  it('should reset on leave', () => {
    const client = new NetworkClient();
    const lobby = new LobbyManager(client);
    lobby.handleServerMessage({ type: 'room_created', roomId: 'room-1' });
    lobby.leaveRoom();
    expect(lobby.state).toBe('idle');
    expect(lobby.roomId).toBeNull();
  });
});
