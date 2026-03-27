import type { WeaponBehavior, WeaponBehaviorContext, WeaponBehaviorResult } from './WeaponBehavior';
import { getHeightAt } from '@engine/terrain';
import type { Projectile } from '@shared/types/projectile';

const NAPALM_PATCH_COUNT = 8;
const NAPALM_SPREAD = 60; // ±60px from impact
const NAPALM_SPAWN_HEIGHT_OFFSET = 20; // spawn slightly above terrain

let napalmIdCounter = 0;

function generateNapalmChildId(): string {
  napalmIdCounter += 1;
  return `napalm-child-${napalmIdCounter}-${Date.now()}`;
}

/** Napalm: on impact, create a line of fire patches along terrain. */
export class NapalmBehavior implements WeaponBehavior {
  readonly weaponType = 'napalm';

  update(projectile: Projectile, context: WeaponBehaviorContext): WeaponBehaviorResult {
    const { terrain } = context;

    // Check if we've hit terrain surface
    const terrainHeight = getHeightAt(terrain, projectile.position.x);
    const surfaceY = terrain.config.height - terrainHeight;

    if (projectile.position.y >= surfaceY) {
      // Spawn fire patches spread horizontally
      const targetX = projectile.position.x;
      const children: Projectile[] = [];

      for (let i = 0; i < NAPALM_PATCH_COUNT; i++) {
        const count = NAPALM_PATCH_COUNT as number;
        const offset = count === 1 ? 0 : -NAPALM_SPREAD + (2 * NAPALM_SPREAD * i) / (count - 1);

        const patchX = targetX + offset;
        const patchTerrainH = getHeightAt(terrain, patchX);
        const patchSurfaceY = terrain.config.height - patchTerrainH;

        children.push({
          id: generateNapalmChildId(),
          weaponType: 'baby-missile', // Children use standard physics, not napalm behavior
          position: { x: patchX, y: patchSurfaceY - NAPALM_SPAWN_HEIGHT_OFFSET },
          velocity: { x: 0, y: 100 }, // Fall to terrain surface
          state: 'flying',
          trail: [{ x: patchX, y: patchSurfaceY - NAPALM_SPAWN_HEIGHT_OFFSET }],
          sourcePlayerId: projectile.sourcePlayerId,
        });
      }

      return {
        projectile,
        shouldExplode: true, // Parent also explodes
        spawnedProjectiles: children,
      };
    }

    // Still flying — use default physics
    return { projectile, shouldExplode: false };
  }
}
