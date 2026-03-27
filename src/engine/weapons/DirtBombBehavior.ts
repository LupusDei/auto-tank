import { addTerrain, getHeightAt } from '@engine/terrain';
import type { WeaponBehavior, WeaponBehaviorContext, WeaponBehaviorResult } from './WeaponBehavior';
import type { Projectile } from '@shared/types/projectile';

const DIRT_BOMB_RADIUS = 30;
const DIRT_BOMB_HEIGHT = 40;

/** Dirt bomb adds terrain instead of removing it on impact. */
export class DirtBombBehavior implements WeaponBehavior {
  readonly weaponType = 'dirt-bomb';

  update(projectile: Projectile, context: WeaponBehaviorContext): WeaponBehaviorResult {
    const { terrain } = context;

    // Check if we've hit terrain surface
    const terrainHeight = getHeightAt(terrain, projectile.position.x);
    const surfaceY = terrain.config.height - terrainHeight;

    if (projectile.position.y >= surfaceY) {
      // Add terrain instead of removing
      const modifiedTerrain = addTerrain(
        terrain,
        projectile.position.x,
        DIRT_BOMB_RADIUS,
        DIRT_BOMB_HEIGHT,
      );
      return {
        projectile,
        terrainModified: modifiedTerrain,
        shouldExplode: true,
      };
    }

    // Still flying — no custom behavior needed, let default physics continue
    return { projectile, shouldExplode: false };
  }
}
