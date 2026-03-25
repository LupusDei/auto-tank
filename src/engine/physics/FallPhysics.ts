import { getHeightAt } from '@engine/terrain';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';

const FALL_SPEED = 200;
const FALL_DAMAGE_THRESHOLD = 20;
const FALL_DAMAGE_PER_UNIT = 0.5;
const MAX_FALL_DAMAGE = 100;

/** Check if a tank needs to fall (terrain height is below tank position, y-axis increases downward). */
export function checkFalling(tank: Tank, terrain: TerrainData): boolean {
  const terrainY = getHeightAt(terrain, tank.position.x);
  return tank.position.y < terrainY;
}

/** Simulate one step of falling. Moves tank toward terrain surface. */
export function simulateFall(tank: Tank, terrain: TerrainData, dt: number): Tank {
  const terrainY = getHeightAt(terrain, tank.position.x);

  if (tank.position.y >= terrainY) {
    return tank;
  }

  const newY = Math.min(terrainY, tank.position.y + FALL_SPEED * dt);

  return {
    ...tank,
    position: { x: tank.position.x, y: newY },
    state: newY < terrainY ? 'falling' : tank.state === 'falling' ? 'alive' : tank.state,
  };
}

/** Calculate fall damage from distance fallen. No damage below threshold. */
export function calculateFallDamage(fallDistance: number): number {
  if (fallDistance <= FALL_DAMAGE_THRESHOLD) {
    return 0;
  }

  const damage = (fallDistance - FALL_DAMAGE_THRESHOLD) * FALL_DAMAGE_PER_UNIT;
  return Math.min(MAX_FALL_DAMAGE, Math.round(damage));
}
