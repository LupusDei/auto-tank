import type { Vector2D } from '@shared/types/geometry';
import type { WallMode } from '@shared/types/game';

export type { WallMode };

export interface WallResult {
  readonly position: Vector2D;
  readonly velocity: Vector2D;
}

/**
 * Apply wall boundary behavior to a projectile.
 *
 * - 'open': returns null — let OOB check in CollisionDetector handle removal.
 * - 'wrap': teleports projectile to the opposite side of the map.
 * - 'bounce': reflects horizontal velocity and clamps position to boundary.
 */
export function applyWallBehavior(
  position: Vector2D,
  velocity: Vector2D,
  worldWidth: number,
  mode: WallMode,
): WallResult | null {
  if (mode === 'open') {
    return null;
  }

  if (mode === 'wrap') {
    return applyWrap(position, velocity, worldWidth);
  }

  return applyBounce(position, velocity, worldWidth);
}

function applyWrap(position: Vector2D, velocity: Vector2D, worldWidth: number): WallResult | null {
  let x = position.x;
  let changed = false;

  if (x < 0) {
    x += worldWidth;
    changed = true;
  } else if (x > worldWidth) {
    x -= worldWidth;
    changed = true;
  }

  if (!changed) return null;

  return {
    position: { x, y: position.y },
    velocity,
  };
}

function applyBounce(
  position: Vector2D,
  velocity: Vector2D,
  worldWidth: number,
): WallResult | null {
  let x = position.x;
  let vx = velocity.x;
  let changed = false;

  if (x < 0) {
    x = -x;
    vx = Math.abs(vx);
    changed = true;
  } else if (x > worldWidth) {
    x = 2 * worldWidth - x;
    vx = -Math.abs(vx);
    changed = true;
  }

  if (!changed) return null;

  return {
    position: { x, y: position.y },
    velocity: { x: vx, y: velocity.y },
  };
}
