import type { WeaponBehavior, WeaponBehaviorContext, WeaponBehaviorResult } from './WeaponBehavior';
import type { Projectile } from '@shared/types/projectile';

const METEOR_COUNT = 20;
const METEOR_SPAWN_Y = -100;
const METEOR_FALL_SPEED = 250; // initial downward velocity
const METEOR_MAX_DRIFT = 30; // max horizontal drift px/s

let armageddonIdCounter = 0;

function generateMeteorId(): string {
  armageddonIdCounter += 1;
  return `armageddon-meteor-${armageddonIdCounter}-${Date.now()}`;
}

/**
 * Generate a deterministic-ish random number from a seed index.
 * Uses a simple hash to spread values across [0, 1).
 */
function seededRandom(index: number, salt: number): number {
  const x = Math.sin(index * 9301 + salt * 49297) * 49297;
  return x - Math.floor(x);
}

/**
 * Armageddon: spawns 20 meteors from the sky at random x positions.
 * Each meteor falls with gravity and slight random horizontal drift.
 * Parent projectile finishes immediately after spawning.
 */
export class ArmageddonBehavior implements WeaponBehavior {
  readonly weaponType = 'armageddon';

  update(projectile: Projectile, context: WeaponBehaviorContext): WeaponBehaviorResult {
    const { terrain } = context;
    const mapWidth = terrain.config.width;

    // Use position as a salt for determinism
    const salt = Math.round(projectile.position.x * 100 + projectile.position.y * 7);

    const children: Projectile[] = [];

    for (let i = 0; i < METEOR_COUNT; i++) {
      const xRand = seededRandom(i, salt);
      const driftRand = seededRandom(i + METEOR_COUNT, salt);
      const spawnX = xRand * mapWidth;
      const drift = (driftRand - 0.5) * 2 * METEOR_MAX_DRIFT;

      children.push({
        id: generateMeteorId(),
        weaponType: 'missile', // Children use standard missile physics, not armageddon behavior
        position: { x: spawnX, y: METEOR_SPAWN_Y },
        velocity: { x: drift, y: METEOR_FALL_SPEED },
        state: 'flying',
        trail: [{ x: spawnX, y: METEOR_SPAWN_Y }],
        sourcePlayerId: projectile.sourcePlayerId,
      });
    }

    return {
      projectile,
      shouldExplode: false,
      spawnedProjectiles: children,
    };
  }
}

/** Exported constants for testing. */
export const ARMAGEDDON_CONSTANTS = {
  METEOR_COUNT,
  METEOR_SPAWN_Y,
  METEOR_FALL_SPEED,
  METEOR_MAX_DRIFT,
} as const;
