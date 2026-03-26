import type { NetworkClient } from './NetworkClient';
import type { ServerPlayer } from '../../server/GameServer';

export type LobbyState = 'idle' | 'in_lobby' | 'ready' | 'starting';

/**
 * Client-side lobby management.
 * Tracks room state, player list, and ready status.
 */
export class LobbyManager {
  private _state: LobbyState = 'idle';
  private _roomId: string | null = null;
  private _players: ServerPlayer[] = [];
  private _isHost = false;

  constructor(private readonly client: NetworkClient) {}

  get state(): LobbyState {
    return this._state;
  }
  get roomId(): string | null {
    return this._roomId;
  }
  get players(): readonly ServerPlayer[] {
    return this._players;
  }
  get isHost(): boolean {
    return this._isHost;
  }
  get playerCount(): number {
    return this._players.length;
  }

  get allReady(): boolean {
    return this._players.length >= 2 && this._players.every((p) => p.ready);
  }

  createRoom(playerName: string, maxPlayers = 4): void {
    this._isHost = true;
    this.client.send({ type: 'create_room', playerName, maxPlayers });
  }

  joinRoom(roomId: string, playerName: string): void {
    this._isHost = false;
    this.client.send({ type: 'join_room', roomId, playerName });
  }

  leaveRoom(): void {
    this.client.send({ type: 'leave_room' });
    this.reset();
  }

  setReady(ready: boolean): void {
    this._state = ready ? 'ready' : 'in_lobby';
    this.client.send({ type: 'set_ready', ready });
  }

  requestStart(): void {
    if (!this._isHost || !this.allReady) return;
    this._state = 'starting';
    this.client.send({ type: 'start_game' });
  }

  /** Handle server messages related to lobby. */
  handleServerMessage(msg: {
    type: string;
    roomId?: string;
    players?: readonly ServerPlayer[];
    player?: ServerPlayer;
    playerId?: string;
    ready?: boolean;
  }): void {
    switch (msg.type) {
      case 'room_created':
        this._roomId = msg.roomId ?? null;
        this._state = 'in_lobby';
        break;
      case 'room_joined':
        this._roomId = msg.roomId ?? null;
        this._players = [...(msg.players ?? [])];
        this._state = 'in_lobby';
        break;
      case 'player_joined':
        if (msg.player) this._players.push(msg.player);
        break;
      case 'player_left':
        this._players = this._players.filter((p) => p.id !== msg.playerId);
        break;
      case 'player_ready':
        this._players = this._players.map((p) =>
          p.id === msg.playerId ? { ...p, ready: msg.ready ?? false } : p,
        );
        break;
      case 'game_started':
        this._state = 'starting';
        break;
    }
  }

  private reset(): void {
    this._state = 'idle';
    this._roomId = null;
    this._players = [];
    this._isHost = false;
  }
}
