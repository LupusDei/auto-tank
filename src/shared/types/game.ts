import type { Player } from './entities';
import type { TerrainData } from './terrain';
import type { Vector2D } from './geometry';
import type { WeaponType } from './weapons';

export type GamePhase =
  | 'lobby'
  | 'setup'
  | 'playing'
  | 'turn'
  | 'firing'
  | 'resolution'
  | 'shop'
  | 'next-round'
  | 'victory';

export interface GameConfig {
  readonly maxRounds: number;
  readonly turnTimeSeconds: number;
  readonly startingMoney: number;
  readonly windStrength: number;
  readonly gravity: number;
  readonly suddenDeathEnabled: boolean;
  readonly suddenDeathTurns: number;
}

export interface GameState {
  readonly phase: GamePhase;
  readonly players: readonly Player[];
  readonly terrain: TerrainData | null;
  readonly currentPlayerIndex: number;
  readonly currentRound: number;
  readonly wind: number;
  readonly config: GameConfig;
  readonly turnTimer: number;
}

export interface TurnAction {
  readonly playerId: string;
  readonly tankId: string;
  readonly weaponType: WeaponType;
  readonly angle: number;
  readonly power: number;
  readonly target?: Vector2D;
}

export interface RoundResult {
  readonly roundNumber: number;
  readonly winnerId: string | null;
  readonly playerScores: ReadonlyMap<string, number>;
}
