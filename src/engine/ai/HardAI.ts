import { createPRNG } from '@shared/prng';

import { type AIContext, type AIController, type AIDecision, tankDistance } from './AIController';
import type { Tank } from '@shared/types/entities';

/**
 * Hard AI: compensates for wind, selects weakest target.
 */
export class HardAI implements AIController {
  readonly difficulty = 'hard' as const;
  private readonly rng: () => number;

  constructor(seed: number) {
    this.rng = createPRNG(seed);
  }

  decideTurn(context: AIContext): AIDecision {
    const target = this.selectBestTarget(context);
    if (!target) return { action: 'skip' };

    const { angle, power } = this.calculateTrajectory(context, target);

    return {
      action: 'fire',
      angle: Math.round(angle),
      power: Math.round(power),
      weaponType: 'missile',
    };
  }

  private selectBestTarget(context: AIContext): Tank | null {
    const alive = context.enemyTanks.filter((t) => t.state === 'alive');
    if (alive.length === 0) return null;

    // Prefer weakest enemy, break ties by proximity
    let best = alive[0] ?? null;
    for (const enemy of alive) {
      if (!best) {
        best = enemy;
        continue;
      }
      if (enemy.health < best.health) {
        best = enemy;
      } else if (enemy.health === best.health) {
        if (tankDistance(context.ownTank, enemy) < tankDistance(context.ownTank, best)) {
          best = enemy;
        }
      }
    }
    return best;
  }

  private calculateTrajectory(context: AIContext, target: Tank): { angle: number; power: number } {
    const dx = target.position.x - context.ownTank.position.x;
    const dy = target.position.y - context.ownTank.position.y;
    const distance = Math.abs(dx);

    // Compensate for wind: adjust angle
    const windCompensation = -context.wind * 0.5;

    const baseAngle = Math.atan2(-dy, distance) * (180 / Math.PI);
    const angle = Math.max(10, Math.min(170, baseAngle + windCompensation));

    // Power based on distance with gravity compensation
    const basePower = distance * 0.6;
    const gravityFactor = 1 + context.gravity * 0.01;
    const power = Math.min(100, Math.max(25, basePower * gravityFactor));

    // Small noise for imperfection
    const noise = (this.rng() - 0.5) * 5;

    return { angle: angle + noise, power: power + noise };
  }
}
