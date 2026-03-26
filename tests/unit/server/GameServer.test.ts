import { describe, expect, it } from 'vitest';
import { GameServer } from '../../../server/GameServer';

describe('GameServer', () => {
  it('should create a room', () => {
    const server = new GameServer();
    const room = server.createRoom('host-1', 'Alice');
    expect(room.id).toContain('room-');
    expect(room.hostId).toBe('host-1');
    expect(room.players).toHaveLength(1);
    expect(room.state).toBe('waiting');
  });

  it('should join a room', () => {
    const server = new GameServer();
    server.createRoom('host-1', 'Alice');
    const roomId = server.getRoomForPlayer('host-1')?.id ?? '';
    const room = server.joinRoom(roomId, 'player-2', 'Bob');
    expect(room?.players).toHaveLength(2);
  });

  it('should reject joining a full room', () => {
    const server = new GameServer();
    const room = server.createRoom('host-1', 'Alice', 2);
    server.joinRoom(room.id, 'p2', 'Bob');
    expect(server.joinRoom(room.id, 'p3', 'Charlie')).toBeNull();
  });

  it('should leave a room', () => {
    const server = new GameServer();
    const room = server.createRoom('host-1', 'Alice');
    server.joinRoom(room.id, 'p2', 'Bob');
    server.leaveRoom('p2');
    expect(server.getRoom(room.id)?.players).toHaveLength(1);
  });

  it('should delete room when last player leaves', () => {
    const server = new GameServer();
    const room = server.createRoom('host-1', 'Alice');
    server.leaveRoom('host-1');
    expect(server.getRoom(room.id)).toBeUndefined();
    expect(server.roomCount).toBe(0);
  });

  it('should transfer host when host leaves', () => {
    const server = new GameServer();
    const room = server.createRoom('host-1', 'Alice');
    server.joinRoom(room.id, 'p2', 'Bob');
    server.leaveRoom('host-1');
    expect(server.getRoom(room.id)?.hostId).toBe('p2');
  });

  it('should set player ready', () => {
    const server = new GameServer();
    const room = server.createRoom('host-1', 'Alice');
    server.setReady('host-1', true);
    expect(server.getRoom(room.id)?.players[0]?.ready).toBe(true);
  });

  it('should start game when all ready', () => {
    const server = new GameServer();
    const room = server.createRoom('host-1', 'Alice');
    server.joinRoom(room.id, 'p2', 'Bob');
    server.setReady('host-1', true);
    server.setReady('p2', true);
    expect(server.startGame('host-1')).toBe(true);
    expect(server.getRoom(room.id)?.state).toBe('playing');
  });

  it('should reject start when not all ready', () => {
    const server = new GameServer();
    const room = server.createRoom('host-1', 'Alice');
    server.joinRoom(room.id, 'p2', 'Bob');
    server.setReady('host-1', true);
    expect(server.startGame('host-1')).toBe(false);
  });

  it('should reject start from non-host', () => {
    const server = new GameServer();
    const room = server.createRoom('host-1', 'Alice');
    server.joinRoom(room.id, 'p2', 'Bob');
    server.setReady('host-1', true);
    server.setReady('p2', true);
    expect(server.startGame('p2')).toBe(false);
  });

  it('should add spectator to playing room', () => {
    const server = new GameServer();
    const room = server.createRoom('host-1', 'Alice');
    server.joinRoom(room.id, 'p2', 'Bob');
    server.setReady('host-1', true);
    server.setReady('p2', true);
    server.startGame('host-1');
    expect(server.addSpectator(room.id, 'spec-1')).toBe(true);
    expect(server.getRoom(room.id)?.spectators).toContain('spec-1');
  });
});
