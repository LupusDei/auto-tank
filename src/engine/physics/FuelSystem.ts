import { getHeightAt } from '@engine/terrain';
import type { TerrainData } from '@shared/types/terrain';

export interface FuelState {
  readonly current: number;
  readonly max: number;
}

/** Create initial fuel state. */
export function createFuelState(max = 100): FuelState {
  return { current: max, max };
}

/** Get fuel percentage (0-100). */
export function getFuelPercentage(fuel: FuelState): number {
  return fuel.max > 0 ? (fuel.current / fuel.max) * 100 : 0;
}

/** Get fuel bar color based on percentage. */
export function getFuelColor(fuel: FuelState): string {
  const pct = getFuelPercentage(fuel);
  if (pct > 60) return '#4caf50';
  if (pct > 30) return '#ff9800';
  return '#f44336';
}

/** Calculate terrain-aware movement cost for a direction. */
export function calculateMoveCost(
  currentX: number,
  direction: number,
  stepSize: number,
  terrain: TerrainData,
): number {
  const targetX = currentX + direction * stepSize;
  const currentHeight = getHeightAt(terrain, currentX);
  const targetHeight = getHeightAt(terrain, targetX);
  const heightDiff = Math.abs(targetHeight - currentHeight);
  const baseCost = 1;
  const slopeCost = heightDiff * 0.3;
  return baseCost + slopeCost;
}

/** Preview how far a tank can move with current fuel. */
export function previewMoveRange(
  currentX: number,
  fuel: FuelState,
  stepSize: number,
  terrain: TerrainData,
): { leftRange: number; rightRange: number } {
  let leftFuel = fuel.current;
  let leftX = currentX;
  while (leftFuel > 0 && leftX > 0) {
    const cost = calculateMoveCost(leftX, -1, stepSize, terrain);
    if (cost > leftFuel) break;
    leftFuel -= cost;
    leftX -= stepSize;
  }

  let rightFuel = fuel.current;
  let rightX = currentX;
  while (rightFuel > 0 && rightX < terrain.config.width) {
    const cost = calculateMoveCost(rightX, 1, stepSize, terrain);
    if (cost > rightFuel) break;
    rightFuel -= cost;
    rightX += stepSize;
  }

  return { leftRange: currentX - leftX, rightRange: rightX - currentX };
}

/** Consume fuel for a move. Returns updated state or null if insufficient. */
export function consumeFuel(fuel: FuelState, cost: number): FuelState | null {
  if (cost > fuel.current) return null;
  return { ...fuel, current: fuel.current - cost };
}
