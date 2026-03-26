import { calculateTrajectoryStep, checkTerrainCollision } from '@engine/physics';
import { createPRNG } from '@shared/prng';

import { type AIContext, type AIController, type AIDecision, tankDistance } from './AIController';
import type { Tank } from '@shared/types/entities';

/**
 * Expert AI: simulates trajectories to find optimal shot.
 * Checks for terrain obstacles, picks best weapon.
 */
export class ExpertAI implements AIController {
  readonly difficulty = 'expert' as const;
  private readonly rng: () => number;

  constructor(seed: number) {
    this.rng = createPRNG(seed);
  }

  decideTurn(context: AIContext): AIDecision {
    const target = this.selectOptimalTarget(context);
    if (!target) return { action: 'skip' };

    const shot = this.findBestShot(context, target);
    if (!shot) return { action: 'skip' };

    return {
      action: 'fire',
      angle: Math.round(shot.angle),
      power: Math.round(shot.power),
      weaponType: this.selectWeapon(context, target),
    };
  }

  private selectOptimalTarget(context: AIContext): Tank | null {
    const alive = context.enemyTanks.filter((t) => t.state === 'alive');
    if (alive.length === 0) return null;

    // Score targets by: low health + proximity
    let best = alive[0] ?? null;
    let bestScore = -Infinity;

    for (const enemy of alive) {
      const healthScore = (100 - enemy.health) * 2;
      const distScore = 100 - Math.min(100, tankDistance(context.ownTank, enemy) * 0.1);
      const score = healthScore + distScore;
      if (score > bestScore) {
        bestScore = score;
        best = enemy;
      }
    }
    return best;
  }

  private findBestShot(context: AIContext, target: Tank): { angle: number; power: number } | null {
    let bestAngle = 45;
    let bestPower = 50;
    let bestDist = Infinity;

    // Brute-force search over angle/power combinations
    for (let angle = 20; angle <= 160; angle += 10) {
      for (let power = 30; power <= 100; power += 10) {
        const landingDist = this.simulateShot(context, angle, power, target);
        if (landingDist < bestDist) {
          bestDist = landingDist;
          bestAngle = angle;
          bestPower = power;
        }
      }
    }

    // Refine around best
    for (let angle = bestAngle - 5; angle <= bestAngle + 5; angle += 2) {
      for (let power = bestPower - 5; power <= bestPower + 5; power += 2) {
        const landingDist = this.simulateShot(context, angle, power, target);
        if (landingDist < bestDist) {
          bestDist = landingDist;
          bestAngle = angle;
          bestPower = power;
        }
      }
    }

    // Tiny noise so it's not perfect
    const noise = (this.rng() - 0.5) * 2;
    return { angle: bestAngle + noise, power: bestPower + noise };
  }

  private simulateShot(context: AIContext, angleDeg: number, power: number, target: Tank): number {
    const angleRad = (angleDeg * Math.PI) / 180;
    let pos = { ...context.ownTank.position };
    let vel = {
      x: power * Math.cos(angleRad) * (target.position.x > pos.x ? 1 : -1),
      y: -power * Math.sin(angleRad),
    };

    const dt = 1 / 30; // coarser for speed
    for (let step = 0; step < 300; step++) {
      const result = calculateTrajectoryStep(pos, vel, context.wind, context.gravity, dt);
      pos = result.position;
      vel = result.velocity;

      if (checkTerrainCollision(pos, context.terrain.heightMap)) {
        const dx = pos.x - target.position.x;
        const dy = pos.y - target.position.y;
        return Math.sqrt(dx * dx + dy * dy);
      }

      if (
        pos.y > context.terrain.config.height + 100 ||
        pos.x < -100 ||
        pos.x > context.terrain.config.width + 100
      ) {
        return Infinity;
      }
    }
    return Infinity;
  }

  private selectWeapon(context: AIContext, target: Tank): string {
    const distance = tankDistance(context.ownTank, target);
    if (target.health <= 20) return 'baby-missile';
    if (distance < 50) return 'baby-missile';
    return 'missile';
  }
}
