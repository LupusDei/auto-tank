import { type AIContext, type AIController, type AIDecision, tankDistance } from './AIController';
import { createPRNG } from '@shared/prng';
import type { Tank } from '@shared/types/entities';

/**
 * Medium AI: calculates basic trajectory toward nearest target.
 * Uses simple ballistic math, no wind compensation.
 */
export class MediumAI implements AIController {
  readonly difficulty = 'medium' as const;
  private readonly rng: () => number;

  constructor(seed: number) {
    this.rng = createPRNG(seed);
  }

  decideTurn(context: AIContext): AIDecision {
    const target = this.pickNearestTarget(context);
    if (!target) return { action: 'skip' };

    const dx = target.position.x - context.ownTank.position.x;
    const dy = target.position.y - context.ownTank.position.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    // Simple angle: aim toward target with some noise
    const baseAngle = Math.atan2(-dy, Math.abs(dx)) * (180 / Math.PI);
    const noise = (this.rng() - 0.5) * 20;
    const angle = Math.max(0, Math.min(180, baseAngle + noise));

    // Power proportional to distance
    const power = Math.min(100, Math.max(20, distance * 0.5 + (this.rng() - 0.5) * 20));

    return {
      action: 'fire',
      angle: Math.round(angle),
      power: Math.round(power),
      weaponType: 'missile',
    };
  }

  private pickNearestTarget(context: AIContext): Tank | null {
    const alive = context.enemyTanks.filter((t) => t.state === 'alive');
    if (alive.length === 0) return null;

    let nearest = alive[0] ?? null;
    let nearestDist = nearest ? tankDistance(context.ownTank, nearest) : Infinity;

    for (const enemy of alive) {
      const dist = tankDistance(context.ownTank, enemy);
      if (dist < nearestDist) {
        nearest = enemy;
        nearestDist = dist;
      }
    }
    return nearest;
  }
}
