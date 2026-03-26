export type RoomState = 'waiting' | 'playing' | 'finished';

export interface ServerPlayer {
  readonly id: string;
  readonly name: string;
  readonly ready: boolean;
  readonly connected: boolean;
}

export interface GameRoom {
  readonly id: string;
  readonly hostId: string;
  readonly players: ServerPlayer[];
  readonly maxPlayers: number;
  readonly state: RoomState;
  readonly spectators: string[];
}

export type ServerMessage =
  | { type: 'room_created'; roomId: string }
  | { type: 'room_joined'; roomId: string; players: readonly ServerPlayer[] }
  | { type: 'player_joined'; player: ServerPlayer }
  | { type: 'player_left'; playerId: string }
  | { type: 'player_ready'; playerId: string; ready: boolean }
  | { type: 'game_started'; roomId: string }
  | { type: 'state_update'; state: unknown }
  | { type: 'turn_action'; playerId: string; action: unknown }
  | { type: 'error'; message: string };

export type ClientMessage =
  | { type: 'create_room'; playerName: string; maxPlayers: number }
  | { type: 'join_room'; roomId: string; playerName: string }
  | { type: 'leave_room' }
  | { type: 'set_ready'; ready: boolean }
  | { type: 'start_game' }
  | { type: 'turn_action'; action: unknown }
  | { type: 'spectate'; roomId: string };

/**
 * In-memory game server managing rooms and players.
 * Designed for WebSocket transport (transport-agnostic for testability).
 */
export class GameServer {
  private readonly rooms = new Map<string, GameRoom>();
  private readonly playerRooms = new Map<string, string>();
  private roomCounter = 0;

  createRoom(hostId: string, hostName: string, maxPlayers = 4): GameRoom {
    this.roomCounter += 1;
    const roomId = `room-${this.roomCounter}`;
    const room: GameRoom = {
      id: roomId,
      hostId,
      players: [{ id: hostId, name: hostName, ready: false, connected: true }],
      maxPlayers,
      state: 'waiting',
      spectators: [],
    };
    this.rooms.set(roomId, room);
    this.playerRooms.set(hostId, roomId);
    return room;
  }

  joinRoom(roomId: string, playerId: string, playerName: string): GameRoom | null {
    const room = this.rooms.get(roomId);
    if (!room || room.state !== 'waiting') return null;
    if (room.players.length >= room.maxPlayers) return null;
    if (room.players.some((p) => p.id === playerId)) return null;

    const updatedRoom: GameRoom = {
      ...room,
      players: [...room.players, { id: playerId, name: playerName, ready: false, connected: true }],
    };
    this.rooms.set(roomId, updatedRoom);
    this.playerRooms.set(playerId, roomId);
    return updatedRoom;
  }

  leaveRoom(playerId: string): string | null {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return null;
    const room = this.rooms.get(roomId);
    if (!room) return null;

    const updatedPlayers = room.players.filter((p) => p.id !== playerId);
    this.playerRooms.delete(playerId);

    if (updatedPlayers.length === 0) {
      this.rooms.delete(roomId);
    } else {
      this.rooms.set(roomId, {
        ...room,
        players: updatedPlayers,
        hostId: updatedPlayers[0]?.id ?? room.hostId,
      });
    }
    return roomId;
  }

  setReady(playerId: string, ready: boolean): boolean {
    const roomId = this.playerRooms.get(playerId);
    if (!roomId) return false;
    const room = this.rooms.get(roomId);
    if (!room) return false;

    this.rooms.set(roomId, {
      ...room,
      players: room.players.map((p) => (p.id === playerId ? { ...p, ready } : p)),
    });
    return true;
  }

  startGame(hostId: string): boolean {
    const roomId = this.playerRooms.get(hostId);
    if (!roomId) return false;
    const room = this.rooms.get(roomId);
    if (!room || room.hostId !== hostId || room.state !== 'waiting') return false;
    if (room.players.length < 2) return false;
    if (!room.players.every((p) => p.ready)) return false;

    this.rooms.set(roomId, { ...room, state: 'playing' });
    return true;
  }

  addSpectator(roomId: string, spectatorId: string): boolean {
    const room = this.rooms.get(roomId);
    if (!room || room.state !== 'playing') return false;
    if (room.spectators.includes(spectatorId)) return false;

    this.rooms.set(roomId, {
      ...room,
      spectators: [...room.spectators, spectatorId],
    });
    return true;
  }

  getRoom(roomId: string): GameRoom | undefined {
    return this.rooms.get(roomId);
  }

  getRoomForPlayer(playerId: string): GameRoom | undefined {
    const roomId = this.playerRooms.get(playerId);
    return roomId ? this.rooms.get(roomId) : undefined;
  }

  get roomCount(): number {
    return this.rooms.size;
  }
}
