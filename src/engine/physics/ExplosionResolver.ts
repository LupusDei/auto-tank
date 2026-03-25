import type { DamageResult, WeaponDefinition } from '@shared/types/weapons';
import { calculateDamage } from './index';
import { calculateExplosion } from '@engine/weapons';
import { deformTerrain } from '@engine/terrain';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';
import type { Vector2D } from '@shared/types/geometry';

export interface ResolutionResult {
  readonly terrain: TerrainData;
  readonly damages: readonly DamageResult[];
}

/** Resolve an explosion: deform terrain and calculate damage to tanks. */
export function resolveExplosion(
  impactPoint: Vector2D,
  weapon: WeaponDefinition,
  terrain: TerrainData,
  tanks: readonly Tank[],
): ResolutionResult {
  const explosion = calculateExplosion(impactPoint, weapon);

  // Deform terrain
  const newTerrain = deformTerrain(terrain, impactPoint.x, explosion.radius, explosion.craterDepth);

  // Calculate damage to each alive tank in range
  const damages: DamageResult[] = [];

  for (const tank of tanks) {
    if (tank.state === 'destroyed') continue;

    const dx = tank.position.x - impactPoint.x;
    const dy = tank.position.y - impactPoint.y;
    const distance = Math.sqrt(dx * dx + dy * dy);

    const damageDealt = calculateDamage(distance, explosion.radius, explosion.damage);

    if (damageDealt > 0) {
      const newHealth = tank.health - damageDealt;
      const direction = distance > 0 ? { x: dx / distance, y: dy / distance } : { x: 0, y: -1 };
      const knockbackStrength = (1 - distance / explosion.radius) * 20;

      damages.push({
        tankId: tank.id,
        damageDealt,
        killed: newHealth <= 0,
        knockback: {
          x: direction.x * knockbackStrength,
          y: direction.y * knockbackStrength,
        },
      });
    }
  }

  return { terrain: newTerrain, damages };
}
