import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';

export type AIDifficulty = 'easy' | 'medium' | 'hard' | 'expert';

export interface AIContext {
  readonly ownTank: Tank;
  readonly enemyTanks: readonly Tank[];
  readonly terrain: TerrainData;
  readonly wind: number;
  readonly gravity: number;
}

/** Interface all AI controllers must implement. */
export interface AIController {
  readonly difficulty: AIDifficulty;
  decideTurn(context: AIContext): AIDecision;
}

export interface AIDecision {
  readonly action: 'fire' | 'move' | 'skip';
  readonly angle?: number;
  readonly power?: number;
  readonly weaponType?: string;
  readonly moveDirection?: number;
}

/** Pick a random alive enemy tank. */
export function pickRandomTarget(enemies: readonly Tank[], seed: number): Tank | null {
  const alive = enemies.filter((t) => t.state === 'alive');
  if (alive.length === 0) return null;
  const idx = seed % alive.length;
  return alive[idx] ?? null;
}

/** Calculate distance between two tanks. */
export function tankDistance(a: Tank, b: Tank): number {
  const dx = a.position.x - b.position.x;
  const dy = a.position.y - b.position.y;
  return Math.sqrt(dx * dx + dy * dy);
}
