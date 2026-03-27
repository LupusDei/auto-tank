import type { Vector2D } from '@shared/types/geometry';

const DEFAULT_FUSE_SECONDS = 3;
const DEFAULT_MAX_BOUNCES = 3;
const DEFAULT_RESTITUTION = 0.6;

export interface GrenadeState {
  readonly fuseTimer: number;
  readonly bouncesLeft: number;
  readonly restitution: number;
}

/** Create initial grenade state with configurable fuse timer. */
export function createGrenadeState(fuseSeconds?: number): GrenadeState {
  return {
    fuseTimer: fuseSeconds ?? DEFAULT_FUSE_SECONDS,
    bouncesLeft: DEFAULT_MAX_BOUNCES,
    restitution: DEFAULT_RESTITUTION,
  };
}

/** Update grenade fuse timer by dt. Returns whether it should explode. */
export function updateGrenade(
  state: GrenadeState,
  dt: number,
): { state: GrenadeState; shouldExplode: boolean } {
  const newTimer = state.fuseTimer - dt;

  if (newTimer <= 0) {
    return {
      state: { ...state, fuseTimer: 0 },
      shouldExplode: true,
    };
  }

  return {
    state: { ...state, fuseTimer: newTimer },
    shouldExplode: false,
  };
}

/** Reflect velocity off a surface normal, scaled by restitution. */
export function bounceGrenade(
  velocity: Vector2D,
  surfaceNormal: Vector2D,
  restitution: number,
): Vector2D {
  // v_reflected = v - 2*(v . n)*n, then scale by restitution
  const dot = velocity.x * surfaceNormal.x + velocity.y * surfaceNormal.y;
  const reflectedX = velocity.x - 2 * dot * surfaceNormal.x;
  const reflectedY = velocity.y - 2 * dot * surfaceNormal.y;

  return {
    x: reflectedX * restitution,
    y: reflectedY * restitution,
  };
}

/**
 * Handle a grenade terrain hit: bounce if bounces remain, otherwise explode.
 * Returns updated state and whether the grenade should explode now.
 */
export function handleGrenadeTerrain(
  state: GrenadeState,
  velocity: Vector2D,
  surfaceNormal: Vector2D,
): { state: GrenadeState; velocity: Vector2D; shouldExplode: boolean } {
  if (state.bouncesLeft <= 0) {
    return { state, velocity, shouldExplode: true };
  }

  const newVelocity = bounceGrenade(velocity, surfaceNormal, state.restitution);
  const newState: GrenadeState = {
    ...state,
    bouncesLeft: state.bouncesLeft - 1,
  };

  return { state: newState, velocity: newVelocity, shouldExplode: false };
}
