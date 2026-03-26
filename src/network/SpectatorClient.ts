import type { GameState } from '@shared/types/game';
import type { NetworkClient } from './NetworkClient';

/**
 * Client for spectating a game in progress.
 * Receives state updates but cannot send turn actions.
 */
export class SpectatorClient {
  private _currentState: GameState | null = null;
  private _roomId: string | null = null;

  constructor(private readonly client: NetworkClient) {}

  get currentState(): GameState | null {
    return this._currentState;
  }
  get roomId(): string | null {
    return this._roomId;
  }
  get isSpectating(): boolean {
    return this._roomId !== null;
  }

  /** Request to spectate a room. */
  spectate(roomId: string): void {
    this._roomId = roomId;
    this.client.send({ type: 'spectate', roomId });
  }

  /** Handle incoming state update. */
  handleStateUpdate(state: GameState): void {
    this._currentState = state;
  }

  /** Stop spectating. */
  stop(): void {
    this._roomId = null;
    this._currentState = null;
  }
}
