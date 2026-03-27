import type { WeaponBehavior, WeaponBehaviorContext, WeaponBehaviorResult } from './WeaponBehavior';
import { getHeightAt } from '@engine/terrain';
import type { Projectile } from '@shared/types/projectile';

const AIR_STRIKE_COUNT = 5;
const AIR_STRIKE_SPREAD = 40; // ±40px from target
const AIR_STRIKE_SPAWN_Y = -50;
const AIR_STRIKE_FALL_SPEED = 200; // initial downward velocity

let airStrikeIdCounter = 0;

function generateAirStrikeChildId(): string {
  airStrikeIdCounter += 1;
  return `airstrike-child-${airStrikeIdCounter}-${Date.now()}`;
}

/** Air strike: on terrain impact, spawn 5 child projectiles raining from above. */
export class AirStrikeBehavior implements WeaponBehavior {
  readonly weaponType = 'air-strike';

  update(projectile: Projectile, context: WeaponBehaviorContext): WeaponBehaviorResult {
    const { terrain } = context;

    // Check if we've hit terrain surface
    const terrainHeight = getHeightAt(terrain, projectile.position.x);
    const surfaceY = terrain.config.height - terrainHeight;

    if (projectile.position.y >= surfaceY) {
      // Spawn child projectiles from above
      const targetX = projectile.position.x;
      const children: Projectile[] = [];

      for (let i = 0; i < AIR_STRIKE_COUNT; i++) {
        // Spread evenly across ±SPREAD range
        const count = AIR_STRIKE_COUNT as number;
        const offset =
          count === 1 ? 0 : -AIR_STRIKE_SPREAD + (2 * AIR_STRIKE_SPREAD * i) / (count - 1);

        children.push({
          id: generateAirStrikeChildId(),
          weaponType: 'missile', // Children use standard missile physics, not air-strike behavior
          position: { x: targetX + offset, y: AIR_STRIKE_SPAWN_Y },
          velocity: { x: 0, y: AIR_STRIKE_FALL_SPEED },
          state: 'flying',
          trail: [{ x: targetX + offset, y: AIR_STRIKE_SPAWN_Y }],
          sourcePlayerId: projectile.sourcePlayerId,
        });
      }

      return {
        projectile,
        shouldExplode: false, // Parent doesn't explode, children do
        spawnedProjectiles: children,
      };
    }

    // Still flying — no custom behavior, use default physics
    return { projectile, shouldExplode: false };
  }
}
