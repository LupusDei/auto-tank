import type { Tank } from '@shared/types/entities';
import type { Vector2D } from '@shared/types/geometry';

const DEFAULT_MELEE_RANGE = 30;

export interface MeleeResult {
  readonly hit: boolean;
  readonly targetTankId?: string;
  readonly damage: number;
  readonly knockback: Vector2D;
}

/**
 * Perform a melee attack: check for tanks within range in the direction
 * the attacker faces, apply damage and knockback.
 */
export function performMelee(
  attackerPos: Vector2D,
  attackerAngle: number,
  tanks: readonly Tank[],
  range = DEFAULT_MELEE_RANGE,
  damage = 30,
  knockbackForce = 20,
): MeleeResult {
  const angleRad = (attackerAngle * Math.PI) / 180;
  const facingX = Math.cos(angleRad);
  const facingY = -Math.sin(angleRad);

  let closestTank: Tank | null = null;
  let closestDist = Infinity;

  for (const tank of tanks) {
    if (tank.state === 'destroyed') continue;

    const dx = tank.position.x - attackerPos.x;
    const dy = tank.position.y - attackerPos.y;
    const dist = Math.sqrt(dx * dx + dy * dy);

    if (dist > range || dist === 0) continue;

    // Check if the tank is in the direction the attacker faces
    // using dot product to determine if the tank is roughly in front
    const normDx = dx / dist;
    const normDy = dy / dist;
    const dot = normDx * facingX + normDy * facingY;

    // Must be within roughly 90 degrees of facing direction
    if (dot > 0 && dist < closestDist) {
      closestTank = tank;
      closestDist = dist;
    }
  }

  if (!closestTank) {
    return {
      hit: false,
      damage: 0,
      knockback: { x: 0, y: 0 },
    };
  }

  // Knockback direction: away from attacker
  const dx = closestTank.position.x - attackerPos.x;
  const dy = closestTank.position.y - attackerPos.y;
  const dist = Math.sqrt(dx * dx + dy * dy);
  const normX = dist > 0 ? dx / dist : facingX;
  const normY = dist > 0 ? dy / dist : facingY;

  return {
    hit: true,
    targetTankId: closestTank.id,
    damage,
    knockback: {
      x: normX * knockbackForce,
      y: normY * knockbackForce,
    },
  };
}
