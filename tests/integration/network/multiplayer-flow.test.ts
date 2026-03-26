import { describe, expect, it } from 'vitest';
import { sendTurnAction, validateTurnAction } from '@network/TurnRelay';
import { GameServer } from '../../../server/GameServer';
import { LobbyManager } from '@network/LobbyManager';
import { NetworkClient } from '@network/NetworkClient';

describe('Multiplayer Flow Integration', () => {
  it('should run full lobby → game start flow', () => {
    const server = new GameServer();

    // Two clients
    const client1 = new NetworkClient();
    const client2 = new NetworkClient();
    const lobby1 = new LobbyManager(client1);
    const lobby2 = new LobbyManager(client2);

    // Host creates room
    const room = server.createRoom('p1', 'Alice');

    // Client 1 receives room_created
    lobby1.handleServerMessage({ type: 'room_created', roomId: room.id });
    expect(lobby1.roomId).toBe(room.id);

    // Client 2 joins
    server.joinRoom(room.id, 'p2', 'Bob');
    lobby2.handleServerMessage({
      type: 'room_joined',
      roomId: room.id,
      players: server.getRoom(room.id)?.players ?? [],
    });
    expect(lobby2.playerCount).toBe(2);

    // Both ready
    server.setReady('p1', true);
    server.setReady('p2', true);

    // Host starts game
    expect(server.startGame('p1')).toBe(true);
    expect(server.getRoom(room.id)?.state).toBe('playing');
  });

  it('should validate and send turn actions', () => {
    const client = new NetworkClient();
    const action = {
      playerId: 'p1',
      tankId: 't1',
      weaponType: 'missile' as const,
      angle: 45,
      power: 80,
    };

    const validation = validateTurnAction(action, 'p1');
    expect(validation.valid).toBe(true);

    expect(sendTurnAction(client, action)).toBe(true);
    expect(client.pendingMessages).toBe(1);
  });

  it('should handle player disconnect and rejoin', () => {
    const server = new GameServer();
    const room = server.createRoom('p1', 'Alice');
    server.joinRoom(room.id, 'p2', 'Bob');

    // Player 2 disconnects
    server.leaveRoom('p2');
    expect(server.getRoom(room.id)?.players).toHaveLength(1);

    // Player 2 rejoins
    server.joinRoom(room.id, 'p2', 'Bob');
    expect(server.getRoom(room.id)?.players).toHaveLength(2);
  });
});
