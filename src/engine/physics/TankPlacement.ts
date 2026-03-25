import { getHeightAt } from '@engine/terrain';
import type { TerrainData } from '@shared/types/terrain';
import type { Vector2D } from '@shared/types/geometry';

/** Place a tank at x, snapped to terrain height. X is clamped to bounds. */
export function placeTankOnTerrain(x: number, terrain: TerrainData): Vector2D {
  const maxX = terrain.config.width - 1;
  const clampedX = Math.max(0, Math.min(maxX, x));
  const y = getHeightAt(terrain, clampedX);

  return { x: clampedX, y };
}

/** Distribute tanks evenly across terrain with margins. Returns sorted positions. */
export function placeAllTanks(playerCount: number, terrain: TerrainData): Vector2D[] {
  const width = terrain.config.width;
  const margin = width * 0.1;
  const usableWidth = width - 2 * margin;

  if (playerCount === 1) {
    return [placeTankOnTerrain(width / 2, terrain)];
  }

  const spacing = usableWidth / (playerCount - 1);
  const positions: Vector2D[] = [];

  for (let i = 0; i < playerCount; i++) {
    const x = margin + i * spacing;
    positions.push(placeTankOnTerrain(x, terrain));
  }

  return positions;
}

/** Calculate terrain slope angle (radians) at a given x position using finite differences. */
export function getTerrainAngleAtPosition(x: number, terrain: TerrainData): number {
  const dx = 1;
  const maxX = terrain.config.width - 1;
  const clampedX = Math.max(dx, Math.min(maxX - dx, x));

  const heightLeft = getHeightAt(terrain, clampedX - dx);
  const heightRight = getHeightAt(terrain, clampedX + dx);
  const slope = (heightRight - heightLeft) / (2 * dx);

  return Math.atan(slope);
}
