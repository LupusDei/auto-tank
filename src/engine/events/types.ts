import type { GamePhase } from '@shared/types/game';
import type { Vector2D } from '@shared/types/geometry';
import type { WeaponType } from '@shared/types/weapons';

/** All game event type identifiers */
export const EventType = {
  PROJECTILE_FIRED: 'projectile_fired',
  TERRAIN_DEFORMED: 'terrain_deformed',
  TANK_DAMAGED: 'tank_damaged',
  TURN_STARTED: 'turn_started',
  TURN_ENDED: 'turn_ended',
  PHASE_CHANGED: 'phase_changed',
  WIND_CHANGED: 'wind_changed',
  EXPLOSION: 'explosion',
  TANK_MOVED: 'tank_moved',
  WEAPON_SELECTED: 'weapon_selected',
  TANK_DESTROYED: 'tank_destroyed',
  PLAYER_ELIMINATED: 'player_eliminated',
  ROUND_STARTED: 'round_started',
  ROUND_ENDED: 'round_ended',
  TANK_FALLING: 'tank_falling',
} as const;

export type EventTypeValue = (typeof EventType)[keyof typeof EventType];

// --- Payload interfaces ---

export interface ProjectileFiredPayload {
  readonly projectileId: string;
  readonly tankId: string;
  readonly weaponType: WeaponType;
  readonly position: Vector2D;
  readonly velocity: Vector2D;
}

export interface TerrainDeformedPayload {
  readonly position: Vector2D;
  readonly radius: number;
  readonly craterDepth: number;
}

export interface TankDamagedPayload {
  readonly tankId: string;
  readonly damage: number;
  readonly newHealth: number;
  readonly sourcePlayerId: string;
}

export interface TurnStartedPayload {
  readonly playerId: string;
  readonly tankId: string;
  readonly turnNumber: number;
}

export interface TurnEndedPayload {
  readonly playerId: string;
  readonly tankId: string;
  readonly turnNumber: number;
  readonly reason: 'fired' | 'timeout' | 'skipped';
}

export interface PhaseChangedPayload {
  readonly previousPhase: GamePhase;
  readonly newPhase: GamePhase;
}

export interface WindChangedPayload {
  readonly previousWind: number;
  readonly newWind: number;
}

export interface ExplosionPayload {
  readonly position: Vector2D;
  readonly radius: number;
  readonly damage: number;
  readonly weaponType: WeaponType;
}

export interface TankMovedPayload {
  readonly tankId: string;
  readonly previousPosition: Vector2D;
  readonly newPosition: Vector2D;
  readonly fuelUsed: number;
}

export interface WeaponSelectedPayload {
  readonly tankId: string;
  readonly previousWeapon: WeaponType | null;
  readonly newWeapon: WeaponType;
}

export interface TankDestroyedPayload {
  readonly tankId: string;
  readonly killerPlayerId: string | null;
  readonly position: Vector2D;
}

export interface PlayerEliminatedPayload {
  readonly playerId: string;
  readonly rank: number;
}

export interface RoundStartedPayload {
  readonly roundNumber: number;
  readonly playerIds: readonly string[];
}

export interface RoundEndedPayload {
  readonly roundNumber: number;
  readonly winnerId: string | null;
}

export interface TankFallingPayload {
  readonly tankId: string;
  readonly startPosition: Vector2D;
  readonly fallDistance: number;
}

// --- Payload map: connects each EventType to its typed payload ---

export interface EventPayloadMap {
  readonly [EventType.PROJECTILE_FIRED]: ProjectileFiredPayload;
  readonly [EventType.TERRAIN_DEFORMED]: TerrainDeformedPayload;
  readonly [EventType.TANK_DAMAGED]: TankDamagedPayload;
  readonly [EventType.TURN_STARTED]: TurnStartedPayload;
  readonly [EventType.TURN_ENDED]: TurnEndedPayload;
  readonly [EventType.PHASE_CHANGED]: PhaseChangedPayload;
  readonly [EventType.WIND_CHANGED]: WindChangedPayload;
  readonly [EventType.EXPLOSION]: ExplosionPayload;
  readonly [EventType.TANK_MOVED]: TankMovedPayload;
  readonly [EventType.WEAPON_SELECTED]: WeaponSelectedPayload;
  readonly [EventType.TANK_DESTROYED]: TankDestroyedPayload;
  readonly [EventType.PLAYER_ELIMINATED]: PlayerEliminatedPayload;
  readonly [EventType.ROUND_STARTED]: RoundStartedPayload;
  readonly [EventType.ROUND_ENDED]: RoundEndedPayload;
  readonly [EventType.TANK_FALLING]: TankFallingPayload;
}

// --- GameEvent wrapper ---

export interface GameEvent<T extends EventTypeValue = EventTypeValue> {
  readonly type: T;
  readonly payload: T extends keyof EventPayloadMap ? EventPayloadMap[T] : never;
  readonly timestamp: number;
  readonly source: string;
}

/** Creates a frozen GameEvent with auto-generated timestamp */
export function createGameEvent<T extends EventTypeValue>(
  type: T,
  payload: T extends keyof EventPayloadMap ? EventPayloadMap[T] : never,
  source = 'system',
): GameEvent<T> {
  const event: GameEvent<T> = {
    type,
    payload: Object.freeze(payload) as GameEvent<T>['payload'],
    timestamp: performance.now(),
    source,
  };
  return Object.freeze(event);
}

/** Type guard: checks if a value is a valid GameEvent structure */
export function isGameEvent(value: unknown): value is GameEvent {
  if (value === null || value === undefined || typeof value !== 'object') {
    return false;
  }
  const candidate = value as Record<string, unknown>;
  return (
    typeof candidate['type'] === 'string' &&
    typeof candidate['payload'] === 'object' &&
    candidate['payload'] !== null &&
    typeof candidate['timestamp'] === 'number' &&
    typeof candidate['source'] === 'string'
  );
}
