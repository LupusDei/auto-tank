import { PHYSICS } from '@shared/constants/physics';
import type { Vector2D } from '@shared/types/geometry';

/** Current wind conditions */
export interface WindState {
  readonly speed: number;
  readonly direction: Vector2D;
  readonly strength: number;
}

/** Configuration for wind behavior */
export interface WindConfig {
  readonly minStrength: number;
  readonly maxStrength: number;
  readonly variability: number;
  readonly changePerTurn: boolean;
}

/** Aggregate environment state (wind + future weather effects) */
export interface EnvironmentState {
  readonly wind: WindState;
}

/** Creates a WindState with computed strength from absolute speed. */
export function createWindState(speed: number, direction: Vector2D): WindState {
  return Object.freeze({
    speed,
    direction,
    strength: Math.abs(speed),
  });
}

/** Creates a default WindConfig using PHYSICS constants. */
export function createDefaultWindConfig(): WindConfig {
  return Object.freeze({
    minStrength: 0,
    maxStrength: PHYSICS.WIND_MAX,
    variability: 0.5,
    changePerTurn: true,
  });
}

/** Creates an EnvironmentState, defaulting to zero wind. */
export function createEnvironmentState(wind?: WindState): EnvironmentState {
  return Object.freeze({
    wind: wind ?? createWindState(0, { x: 0, y: 0 }),
  });
}
