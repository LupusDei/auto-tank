import { getHeightAt } from '@engine/terrain';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';

const MOVE_SPEED = 2;
const BASE_FUEL_COST = 1;
const SLOPE_FUEL_MULTIPLIER = 3;

/** Check if a tank can move in the given direction. */
export function validateMove(tank: Tank, _direction: number): boolean {
  return tank.state === 'alive' && tank.fuel > 0;
}

/** Move a tank by one step in the given direction (-1 = left, 1 = right). */
export function moveTank(tank: Tank, direction: number, terrain: TerrainData): Tank {
  if (!validateMove(tank, direction)) {
    return tank;
  }

  const maxX = terrain.config.width - 1;
  const newX = Math.max(0, Math.min(maxX, tank.position.x + direction * MOVE_SPEED));

  // If we can't move (at boundary), return unchanged
  if (newX === tank.position.x) {
    return tank;
  }

  const newY = getHeightAt(terrain, newX);

  // Calculate slope-based fuel cost
  const heightDiff = Math.abs(newY - tank.position.y);
  const slopeCost = heightDiff * SLOPE_FUEL_MULTIPLIER;
  const fuelCost = BASE_FUEL_COST + slopeCost;
  const newFuel = Math.max(0, tank.fuel - fuelCost);

  return {
    ...tank,
    position: { x: newX, y: newY },
    fuel: newFuel,
  };
}
