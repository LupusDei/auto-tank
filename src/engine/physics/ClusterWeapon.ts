import type { Projectile } from '@shared/types/projectile';
import { spawnProjectile } from './ProjectileManager';
import type { Vector2D } from '@shared/types/geometry';
import type { WeaponDefinition } from '@shared/types/weapons';

/**
 * Spawn child projectiles when a cluster weapon (MIRV, banana bomb) explodes.
 * Children fan out from the parent's position with randomized velocities.
 */
export function spawnClusterChildren(
  parent: Projectile,
  weapon: WeaponDefinition,
  seed: number,
): Projectile[] {
  const count = weapon.clusterCount ?? 0;
  if (count === 0) return [];

  const children: Projectile[] = [];
  const baseSpeed = 40;

  for (let i = 0; i < count; i++) {
    // Fan children evenly across an arc
    const angleDegrees = 30 + (120 / (count - 1 || 1)) * i;
    const child = spawnProjectile(
      parent.position,
      angleDegrees,
      baseSpeed + ((seed + i * 7) % 20),
      weapon.type,
      parent.sourcePlayerId,
    );
    children.push(child);
  }

  return children;
}

/** Check if a weapon is a cluster type that spawns children on impact. */
export function isClusterWeapon(weapon: WeaponDefinition): boolean {
  return weapon.category === 'cluster' && (weapon.clusterCount ?? 0) > 0;
}

/**
 * Calculate napalm area damage positions.
 * Returns impact points spread along the terrain surface.
 */
export function calculateNapalmSpread(
  impactPoint: Vector2D,
  radius: number,
  pointCount: number,
): Vector2D[] {
  const points: Vector2D[] = [];
  const spacing = (radius * 2) / (pointCount - 1 || 1);

  for (let i = 0; i < pointCount; i++) {
    const x = impactPoint.x - radius + spacing * i;
    points.push({ x, y: impactPoint.y });
  }

  return points;
}
