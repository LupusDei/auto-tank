import type { Crate } from '@engine/crates/CrateSystem';
import { createCrate } from '@engine/crates/CrateSystem';

export type BetweenTurnEvent =
  | { readonly type: 'crate_drop'; readonly crate: Crate }
  | { readonly type: 'wind_shift'; readonly oldWind: number; readonly newWind: number }
  | { readonly type: 'sudden_death'; readonly turnsRemaining: number }
  | { readonly type: 'none' };

const DEFAULT_CANVAS_WIDTH = 800;
const DEFAULT_TERRAIN_HEIGHT = 300;
const CRATE_SPAWN_CHANCE = 0.3;

/**
 * Generate a between-turn event using deterministic PRNG.
 * Sudden death takes priority when turnNumber >= suddenDeathTurn.
 */
export function generateBetweenTurnEvent(
  turnNumber: number,
  random: () => number,
  suddenDeathTurn?: number,
): BetweenTurnEvent {
  // Sudden death takes priority
  if (suddenDeathTurn !== undefined && turnNumber >= suddenDeathTurn) {
    return {
      type: 'sudden_death',
      turnsRemaining: suddenDeathTurn - turnNumber,
    };
  }

  // Roll for crate drop (30% chance)
  const roll = random();
  if (roll < CRATE_SPAWN_CHANCE) {
    const crate = createCrate(
      DEFAULT_CANVAS_WIDTH / 2,
      DEFAULT_TERRAIN_HEIGHT,
      DEFAULT_CANVAS_WIDTH,
      random,
    );
    return { type: 'crate_drop', crate };
  }

  return { type: 'none' };
}
