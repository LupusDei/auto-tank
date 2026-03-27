import type { WeaponBehavior, WeaponBehaviorContext, WeaponBehaviorResult } from './WeaponBehavior';
import { getHeightAt } from '@engine/terrain';
import type { Projectile } from '@shared/types/projectile';

const GUIDED_DEFAULT_SPEED = 100; // px/s
const GUIDED_MAX_DURATION = 5; // seconds
const GUIDED_TANK_HIT_RADIUS = 15;

export interface GuidedState {
  readonly heading: number; // radians
  readonly speed: number;
  readonly elapsed: number;
  readonly maxDuration: number;
}

/** Create initial guided state from the launch angle. */
export function createGuidedState(initialAngle: number): GuidedState {
  return {
    heading: initialAngle,
    speed: GUIDED_DEFAULT_SPEED,
    elapsed: 0,
    maxDuration: GUIDED_MAX_DURATION,
  };
}

/**
 * Apply steering input to guided state.
 * turnRate: radians per second (positive = clockwise, negative = counter-clockwise)
 */
export function steerGuided(state: GuidedState, turnRate: number, dt: number): GuidedState {
  return {
    ...state,
    heading: state.heading + turnRate * dt,
    elapsed: state.elapsed + dt,
  };
}

/**
 * Decode guided state from projectile velocity encoding.
 * velocity.x = heading (radians), velocity.y = elapsed time (negative sentinel)
 */
function decodeState(projectile: Projectile): GuidedState | undefined {
  // Sentinel: velocity.y is stored as -(elapsed + 10000) to distinguish from normal flight
  if (projectile.velocity.y > -9000) {
    return undefined;
  }
  return {
    heading: projectile.velocity.x,
    speed: GUIDED_DEFAULT_SPEED,
    elapsed: -(projectile.velocity.y + 10000),
    maxDuration: GUIDED_MAX_DURATION,
  };
}

/** Encode guided state into projectile velocity fields. */
function encodeState(state: GuidedState): { x: number; y: number } {
  return {
    x: state.heading,
    y: -(state.elapsed + 10000),
  };
}

/**
 * Guided missile behavior: flies at constant speed in heading direction.
 * Steering is applied externally via steerGuided before each tick.
 * The behavior encodes heading/elapsed into velocity fields as a sentinel.
 */
export class GuidedMissileBehavior implements WeaponBehavior {
  readonly weaponType = 'guided-missile';

  update(projectile: Projectile, context: WeaponBehaviorContext): WeaponBehaviorResult {
    const { terrain, tanks, dt } = context;

    // Decode or initialize guided state
    let state = decodeState(projectile);
    if (!state) {
      const initialHeading = Math.atan2(projectile.velocity.y, projectile.velocity.x);
      state = createGuidedState(initialHeading);
    }

    // Advance elapsed time
    const newElapsed = state.elapsed + dt;

    // Timeout check
    if (newElapsed >= state.maxDuration) {
      return { projectile, shouldExplode: true };
    }

    // Move in heading direction at constant speed
    const dx = Math.cos(state.heading) * state.speed * dt;
    const dy = Math.sin(state.heading) * state.speed * dt;
    const newX = projectile.position.x + dx;
    const newY = projectile.position.y + dy;

    // Out of bounds check
    if (newX < 0 || newX >= terrain.config.width || newY >= terrain.config.height) {
      return { projectile, shouldExplode: true };
    }

    // Terrain collision
    const terrainHeight = getHeightAt(terrain, newX);
    const surfaceY = terrain.config.height - terrainHeight;
    if (newY >= surfaceY) {
      const impacted: Projectile = {
        ...projectile,
        position: { x: newX, y: surfaceY },
      };
      return { projectile: impacted, shouldExplode: true };
    }

    // Tank collision
    for (const tank of tanks) {
      if (tank.state === 'destroyed') continue;
      const tdx = newX - tank.position.x;
      const tdy = newY - tank.position.y;
      const dist = Math.sqrt(tdx * tdx + tdy * tdy);
      if (dist <= GUIDED_TANK_HIT_RADIUS) {
        const impacted: Projectile = {
          ...projectile,
          position: { x: newX, y: newY },
        };
        return { projectile: impacted, shouldExplode: true };
      }
    }

    // Update state encoding
    const updatedState: GuidedState = {
      ...state,
      elapsed: newElapsed,
    };

    const moved: Projectile = {
      ...projectile,
      position: { x: newX, y: newY },
      velocity: encodeState(updatedState),
      trail: [...projectile.trail, { x: newX, y: newY }],
    };

    return { projectile: moved, shouldExplode: false };
  }
}
