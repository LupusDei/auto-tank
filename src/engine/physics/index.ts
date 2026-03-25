import type { Vector2D } from '@shared/types/geometry';
import type { WindState } from '@engine/environment/types';

/**
 * Advance a projectile by one time step, applying gravity and wind.
 * Gravity acts in the +y direction (downward), wind acts in the +x direction.
 */
export function calculateTrajectoryStep(
  position: Vector2D,
  velocity: Vector2D,
  wind: number,
  gravity: number,
  dt: number,
): { position: Vector2D; velocity: Vector2D } {
  const newVelocity: Vector2D = {
    x: velocity.x + wind * dt,
    y: velocity.y + gravity * dt,
  };

  const newPosition: Vector2D = {
    x: position.x + newVelocity.x * dt,
    y: position.y + newVelocity.y * dt,
  };

  return { position: newPosition, velocity: newVelocity };
}

/**
 * Return true when the projectile is at or below the terrain surface.
 * `position.x` is clamped to the bounds of the height map.
 */
export function checkTerrainCollision(position: Vector2D, heightMap: readonly number[]): boolean {
  if (heightMap.length === 0) return false;

  const index = Math.min(Math.max(0, Math.round(position.x)), heightMap.length - 1);

  const terrainHeight = heightMap[index];
  return terrainHeight !== undefined && position.y >= terrainHeight;
}

/**
 * Apply wind force to a velocity vector over a time step.
 * Returns the new velocity after wind acceleration.
 */
export function applyWindForce(velocity: Vector2D, wind: WindState, dt: number): Vector2D {
  return {
    x: velocity.x + wind.speed * dt,
    y: velocity.y,
  };
}

/**
 * Linear damage falloff from `maxDamage` at the centre to 0 at `explosionRadius`.
 * Returns 0 for distances beyond the radius.
 */
export function calculateDamage(
  distance: number,
  explosionRadius: number,
  maxDamage: number,
): number {
  if (distance >= explosionRadius || explosionRadius <= 0) return 0;
  if (distance <= 0) return maxDamage;

  return maxDamage * (1 - distance / explosionRadius);
}
