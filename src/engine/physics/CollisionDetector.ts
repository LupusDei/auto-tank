import type { Projectile } from '@shared/types/projectile';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';

const TANK_HIT_RADIUS = 15;

export type CollisionResult =
  | { readonly type: 'terrain'; readonly position: { readonly x: number; readonly y: number } }
  | {
      readonly type: 'tank';
      readonly tankId: string;
      readonly position: { readonly x: number; readonly y: number };
    }
  | {
      readonly type: 'out_of_bounds';
      readonly position: { readonly x: number; readonly y: number };
    };

/** Check if a projectile has hit the terrain surface. */
export function checkTerrainHit(projectile: Projectile, terrain: TerrainData): boolean {
  // Convert projectile canvas-Y to terrain-relative coordinates:
  // Canvas Y increases downward, heightMap stores height from bottom.
  // Terrain surface in canvas coords = config.height - heightMap[x].
  // Hit when projectile.y >= canvasHeight - heightMap[x],
  // i.e. heightMap[x] >= canvasHeight - projectile.y
  const { x, y } = projectile.position;
  if (terrain.heightMap.length === 0) return false;
  const idx = Math.min(Math.max(0, Math.round(x)), terrain.heightMap.length - 1);
  const terrainH = terrain.heightMap[idx];
  if (terrainH === undefined) return false;
  const surfaceY = terrain.config.height - terrainH;
  return y >= surfaceY;
}

/** Check if a projectile has hit any alive tank. Returns the hit tank or null. */
export function checkTankHit(projectile: Projectile, tanks: readonly Tank[]): Tank | null {
  let closest: Tank | null = null;
  let closestDist = Infinity;

  for (const tank of tanks) {
    if (tank.state === 'destroyed') continue;

    const dx = projectile.position.x - tank.position.x;
    const dy = projectile.position.y - tank.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist <= TANK_HIT_RADIUS && dist < closestDist) {
      closest = tank;
      closestDist = dist;
    }
  }

  return closest;
}

/** Detect collision of a projectile against terrain and tanks. Tank hits prioritized. */
export function detectCollision(
  projectile: Projectile,
  terrain: TerrainData,
  tanks: readonly Tank[],
): CollisionResult | null {
  // Check out of bounds
  const { x, y } = projectile.position;
  const width = terrain.config.width;
  if (x < -50 || x > width + 50 || y < -500 || y > terrain.config.height + 100) {
    return { type: 'out_of_bounds', position: projectile.position };
  }

  // Tank hit takes priority
  const hitTank = checkTankHit(projectile, tanks);
  if (hitTank) {
    return { type: 'tank', tankId: hitTank.id, position: projectile.position };
  }

  // Terrain hit
  if (checkTerrainHit(projectile, terrain)) {
    return { type: 'terrain', position: projectile.position };
  }

  return null;
}
