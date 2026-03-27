import { deformTerrain, getHeightAt } from '@engine/terrain';
import type { WeaponBehavior, WeaponBehaviorContext, WeaponBehaviorResult } from './WeaponBehavior';
import type { Projectile } from '@shared/types/projectile';
import type { TerrainData } from '@shared/types/terrain';

const DIGGER_SPEED = 100; // px/s downward
const DIGGER_MAX_DEPTH = 200; // max boring depth in px
const DIGGER_BORE_RADIUS = 10;
const DIGGER_EXPLOSION_INTERVAL = 20; // px between small explosions

interface DiggerState {
  readonly boring: boolean;
  readonly depth: number;
}

/** Parse digger state from velocity.y (boring flag) and trail length. */
function getDiggerState(projectile: Projectile): DiggerState {
  // Use velocity.x sign: if NaN-like sentinel, boring mode.
  // Simpler: use velocity.y < -9999 as a boring marker, velocity.x stores depth.
  const boring = projectile.velocity.y <= -9999;
  const depth = boring ? projectile.velocity.x : 0;
  return { boring, depth };
}

function encodeDiggerState(boring: boolean, depth: number): { x: number; y: number } {
  return boring ? { x: depth, y: -9999 } : { x: 0, y: 0 };
}

/** Digger bores vertically through terrain on impact. */
export class DiggerBehavior implements WeaponBehavior {
  readonly weaponType = 'digger';

  update(projectile: Projectile, context: WeaponBehaviorContext): WeaponBehaviorResult {
    const { terrain, dt } = context;
    const state = getDiggerState(projectile);

    if (!state.boring) {
      // Not boring yet — check if we've hit terrain
      const terrainHeight = getHeightAt(terrain, projectile.position.x);
      const surfaceY = terrain.config.height - terrainHeight;

      if (projectile.position.y >= surfaceY) {
        // Start boring
        const encoded = encodeDiggerState(true, 0);
        const boringProjectile: Projectile = {
          ...projectile,
          position: { x: projectile.position.x, y: surfaceY },
          velocity: encoded,
          trail: [...projectile.trail, projectile.position],
        };
        // Deform terrain at entry point
        const newTerrain = deformTerrain(
          terrain,
          projectile.position.x,
          DIGGER_BORE_RADIUS,
          DIGGER_BORE_RADIUS * 0.6,
        );
        return { projectile: boringProjectile, terrainModified: newTerrain, shouldExplode: false };
      }

      // Still flying — let default physics handle it (return not exploding)
      return { projectile, shouldExplode: false };
    }

    // Boring mode: move downward, deform terrain
    const moveDistance = DIGGER_SPEED * dt;
    const newDepth = state.depth + moveDistance;

    if (newDepth >= DIGGER_MAX_DEPTH) {
      return { projectile, shouldExplode: true };
    }

    // Move projectile downward
    const newY = projectile.position.y + moveDistance;

    // Check if we've reached the bottom of the world
    if (newY >= terrain.config.height) {
      return { projectile, shouldExplode: true };
    }

    // Deform terrain every DIGGER_EXPLOSION_INTERVAL
    const prevInterval = Math.floor(state.depth / DIGGER_EXPLOSION_INTERVAL);
    const newInterval = Math.floor(newDepth / DIGGER_EXPLOSION_INTERVAL);
    let modifiedTerrain: TerrainData | undefined;

    if (newInterval > prevInterval) {
      modifiedTerrain = deformTerrain(
        terrain,
        projectile.position.x,
        DIGGER_BORE_RADIUS,
        DIGGER_BORE_RADIUS * 0.6,
      );
    }

    const encoded = encodeDiggerState(true, newDepth);
    const movedProjectile: Projectile = {
      ...projectile,
      position: { x: projectile.position.x, y: newY },
      velocity: encoded,
      trail: [...projectile.trail, { x: projectile.position.x, y: newY }],
    };

    const result: WeaponBehaviorResult = {
      projectile: movedProjectile,
      shouldExplode: false,
    };

    if (modifiedTerrain) {
      return { ...result, terrainModified: modifiedTerrain };
    }

    return result;
  }
}
