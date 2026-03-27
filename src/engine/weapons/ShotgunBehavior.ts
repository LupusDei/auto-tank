import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';
import type { Vector2D } from '@shared/types/geometry';

const DEFAULT_MAX_RANGE = 200;
const DEFAULT_PELLET_COUNT = 2;
const DEFAULT_SPREAD_DEG = 5;
const TANK_HIT_RADIUS = 15;

export interface ShotgunHit {
  readonly position: Vector2D;
  readonly tankId?: string;
  readonly damage: number;
}

export interface ShotgunResult {
  readonly hits: readonly ShotgunHit[];
  readonly rays: readonly { start: Vector2D; end: Vector2D }[];
}

/** Get terrain surface Y at a given X coordinate. */
function getTerrainSurfaceY(x: number, terrain: TerrainData): number {
  if (terrain.heightMap.length === 0) return terrain.config.height;
  const idx = Math.min(Math.max(0, Math.round(x)), terrain.heightMap.length - 1);
  const terrainH = terrain.heightMap[idx];
  if (terrainH === undefined) return terrain.config.height;
  return terrain.config.height - terrainH;
}

/** Check if a point is inside any alive tank's hit radius. */
function findTankAtPoint(point: Vector2D, tanks: readonly Tank[]): Tank | null {
  for (const tank of tanks) {
    if (tank.state === 'destroyed') continue;
    const dx = point.x - tank.position.x;
    const dy = point.y - tank.position.y;
    const dist = Math.sqrt(dx * dx + dy * dy);
    if (dist <= TANK_HIT_RADIUS) {
      return tank;
    }
  }
  return null;
}

/** Fire a shotgun: cast pellet rays and check for hits. */
export function fireShotgun(
  origin: Vector2D,
  angleDeg: number,
  terrain: TerrainData,
  tanks: readonly Tank[],
  maxRange: number = DEFAULT_MAX_RANGE,
  pelletCount: number = DEFAULT_PELLET_COUNT,
): ShotgunResult {
  const baseDamage = 25;
  const hits: ShotgunHit[] = [];
  const rays: { start: Vector2D; end: Vector2D }[] = [];

  for (let i = 0; i < pelletCount; i++) {
    // Spread pellets evenly around center angle
    const offset = (i - (pelletCount - 1) / 2) * DEFAULT_SPREAD_DEG;
    const pelletAngleDeg = angleDeg + offset;
    const pelletAngleRad = (pelletAngleDeg * Math.PI) / 180;

    const dx = Math.cos(pelletAngleRad);
    const dy = -Math.sin(pelletAngleRad);

    let endPos: Vector2D = origin;
    let hitTank: Tank | null = null;
    let hitTerrain = false;

    // March pixel-by-pixel
    for (let step = 1; step <= maxRange; step++) {
      const px = origin.x + dx * step;
      const py = origin.y + dy * step;
      const point: Vector2D = { x: px, y: py };

      // Check out of bounds
      if (px < 0 || px >= terrain.config.width || py < 0 || py >= terrain.config.height) {
        endPos = point;
        break;
      }

      // Check terrain
      const surfaceY = getTerrainSurfaceY(px, terrain);
      if (py >= surfaceY) {
        endPos = point;
        hitTerrain = true;
        break;
      }

      // Check tank
      const tank = findTankAtPoint(point, tanks);
      if (tank) {
        endPos = point;
        hitTank = tank;
        break;
      }

      endPos = point;
    }

    rays.push({ start: origin, end: endPos });

    if (hitTank) {
      hits.push({
        position: endPos,
        tankId: hitTank.id,
        damage: baseDamage,
      });
    } else if (hitTerrain) {
      hits.push({
        position: endPos,
        damage: 0,
      });
    }
  }

  return { hits, rays };
}
