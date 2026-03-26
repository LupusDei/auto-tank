import { type AIContext, tankDistance } from './AIController';
import { getHeightAt } from '@engine/terrain';
import type { Tank } from '@shared/types/entities';

/** Decide whether the AI should reposition and in which direction. */
export function shouldMove(context: AIContext): { shouldMove: boolean; direction: number } {
  const { ownTank, enemyTanks, terrain } = context;

  if (ownTank.fuel <= 0) return { shouldMove: false, direction: 0 };

  // Check if we're too close to an enemy
  const nearest = findNearestEnemy(ownTank, enemyTanks);
  if (!nearest) return { shouldMove: false, direction: 0 };

  const dist = tankDistance(ownTank, nearest);

  // Too close: move away
  if (dist < 40) {
    const awayDir = ownTank.position.x > nearest.position.x ? 1 : -1;
    return { shouldMove: true, direction: awayDir };
  }

  // Check if current position has bad elevation (lower than nearby terrain)
  const leftHeight = getHeightAt(terrain, ownTank.position.x - 20);
  const rightHeight = getHeightAt(terrain, ownTank.position.x + 20);
  const currentHeight = getHeightAt(terrain, ownTank.position.x);

  // Move to higher ground for better shot angle
  if (leftHeight < currentHeight && leftHeight < rightHeight) {
    return { shouldMove: true, direction: -1 };
  }
  if (rightHeight < currentHeight && rightHeight < leftHeight) {
    return { shouldMove: true, direction: 1 };
  }

  return { shouldMove: false, direction: 0 };
}

/** Calculate how many movement steps to take. */
export function calculateMoveSteps(fuel: number, urgency: number): number {
  const maxSteps = Math.min(10, Math.floor(fuel / 2));
  return Math.max(1, Math.round(maxSteps * urgency));
}

function findNearestEnemy(own: Tank, enemies: readonly Tank[]): Tank | null {
  const alive = enemies.filter((t) => t.state === 'alive');
  if (alive.length === 0) return null;

  let nearest = alive[0] ?? null;
  let minDist = nearest ? tankDistance(own, nearest) : Infinity;

  for (const enemy of alive) {
    const d = tankDistance(own, enemy);
    if (d < minDist) {
      minDist = d;
      nearest = enemy;
    }
  }
  return nearest;
}
