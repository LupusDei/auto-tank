import { createPRNG } from '@shared/prng';
import { PHYSICS } from '@shared/constants/physics';

import {
  type AIContext,
  type AIController,
  type AIDecision,
  pickRandomTarget,
} from './AIController';

/**
 * Easy AI: fires at random angles with random power.
 * No trajectory calculation, no wind compensation.
 */
export class EasyAI implements AIController {
  readonly difficulty = 'easy' as const;
  private readonly rng: () => number;

  constructor(seed: number) {
    this.rng = createPRNG(seed);
  }

  decideTurn(context: AIContext): AIDecision {
    const target = pickRandomTarget(context.enemyTanks, Math.floor(this.rng() * 10000));
    if (!target) return { action: 'skip' };

    const angle = PHYSICS.MIN_ANGLE + this.rng() * (PHYSICS.MAX_ANGLE - PHYSICS.MIN_ANGLE);
    const power = 20 + this.rng() * 80;

    return {
      action: 'fire',
      angle: Math.round(angle),
      power: Math.round(power),
      weaponType: 'baby-missile',
    };
  }
}
