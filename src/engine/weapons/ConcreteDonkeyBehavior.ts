import { deformTerrain, getHeightAt } from '@engine/terrain';
import type { WeaponBehavior, WeaponBehaviorContext, WeaponBehaviorResult } from './WeaponBehavior';
import type { Projectile } from '@shared/types/projectile';
import type { TerrainData } from '@shared/types/terrain';

const DRILL_SPEED = 150; // px/s downward
const DRILL_DEFORM_INTERVAL = 15; // every 15px of depth
const DRILL_DEFORM_RADIUS = 25;
const DRILL_BOUNCE_HEIGHT = 30; // px upward on exit
const DRILL_MAX_BOUNCES = 3;

export interface DonkeyDrillState {
  readonly drilling: boolean;
  readonly depth: number;
  readonly bounces: number;
  readonly lastDeformDepth: number;
}

/** Create initial donkey drill state. */
export function createDonkeyState(): DonkeyDrillState {
  return {
    drilling: false,
    depth: 0,
    bounces: 0,
    lastDeformDepth: 0,
  };
}

/**
 * Decode drill state from velocity fields.
 * velocity.x = depth, velocity.y encodes: -(bounces * 1000 + lastDeformDepth + 50000)
 * when drilling (sentinel < -40000)
 */
function decodeDrillState(projectile: Projectile): DonkeyDrillState | undefined {
  if (projectile.velocity.y > -40000) {
    return undefined;
  }
  const encoded = -(projectile.velocity.y + 50000);
  const bounces = Math.floor(encoded / 1000);
  const lastDeformDepth = encoded - bounces * 1000;
  return {
    drilling: true,
    depth: projectile.velocity.x,
    bounces,
    lastDeformDepth,
  };
}

/** Encode drill state into velocity fields. */
function encodeDrillState(state: DonkeyDrillState): { x: number; y: number } {
  return {
    x: state.depth,
    y: -(state.bounces * 1000 + state.lastDeformDepth + 50000),
  };
}

/** Check if position is inside terrain (below the surface). */
function isInsideTerrain(y: number, configHeight: number, terrainHeight: number): boolean {
  const surfaceY = configHeight - terrainHeight;
  return y >= surfaceY;
}

/** Build a result, only including terrainModified when terrain actually changed. */
function buildResult(
  projectile: Projectile,
  shouldExplode: boolean,
  originalTerrain: TerrainData,
  currentTerrain: TerrainData,
): WeaponBehaviorResult {
  if (currentTerrain !== originalTerrain) {
    return { projectile, shouldExplode, terrainModified: currentTerrain };
  }
  return { projectile, shouldExplode };
}

/**
 * Concrete Donkey: drops from above, drills through terrain in bouncing passes.
 * Each pass deforms terrain every 15px. After 3 bounces or hitting screen bottom,
 * final massive explosion.
 */
export class ConcreteDonkeyBehavior implements WeaponBehavior {
  readonly weaponType = 'concrete-donkey';

  update(projectile: Projectile, context: WeaponBehaviorContext): WeaponBehaviorResult {
    const { terrain, dt } = context;

    let drillState = decodeDrillState(projectile);

    // Phase 1: Falling (not yet drilling) — check if we hit terrain
    if (!drillState) {
      const terrainHeight = getHeightAt(terrain, projectile.position.x);
      const surfaceY = terrain.config.height - terrainHeight;

      if (projectile.position.y < surfaceY) {
        // Still falling, let default physics handle it
        return { projectile, shouldExplode: false };
      }

      // Just hit terrain — start drilling
      drillState = createDonkeyState();
      drillState = { ...drillState, drilling: true };
    }

    // Phase 2: Drilling downward
    const moveDown = DRILL_SPEED * dt;
    const newY = projectile.position.y + moveDown;
    const newDepth = drillState.depth + moveDown;

    // Screen bottom check
    if (newY >= terrain.config.height) {
      return { projectile, shouldExplode: true };
    }

    // Check if we exited terrain (hit air below)
    const terrainHeightAtX = getHeightAt(terrain, projectile.position.x);
    const inTerrain = isInsideTerrain(newY, terrain.config.height, terrainHeightAtX);

    let currentTerrain = terrain;

    // Deform terrain at intervals
    const depthSinceLastDeform = newDepth - drillState.lastDeformDepth;
    let updatedLastDeformDepth = drillState.lastDeformDepth;

    if (depthSinceLastDeform >= DRILL_DEFORM_INTERVAL) {
      const deformCount = Math.floor(depthSinceLastDeform / DRILL_DEFORM_INTERVAL);
      for (let i = 0; i < deformCount; i++) {
        currentTerrain = deformTerrain(
          currentTerrain,
          projectile.position.x,
          DRILL_DEFORM_RADIUS,
          DRILL_DEFORM_RADIUS * 0.6,
        );
      }
      updatedLastDeformDepth += deformCount * DRILL_DEFORM_INTERVAL;
    }

    // Exited terrain — bounce back up
    if (!inTerrain && drillState.drilling) {
      const newBounces = drillState.bounces + 1;

      if (newBounces >= DRILL_MAX_BOUNCES) {
        // Final massive explosion
        const finalProj: Projectile = {
          ...projectile,
          position: { x: projectile.position.x, y: newY },
        };
        return buildResult(finalProj, true, terrain, currentTerrain);
      }

      // Bounce back up
      const bouncedY = newY - DRILL_BOUNCE_HEIGHT;
      const newState: DonkeyDrillState = {
        drilling: true,
        depth: 0,
        bounces: newBounces,
        lastDeformDepth: 0,
      };

      const bouncedProj: Projectile = {
        ...projectile,
        position: { x: projectile.position.x, y: bouncedY },
        velocity: encodeDrillState(newState),
        trail: [...projectile.trail, { x: projectile.position.x, y: bouncedY }],
      };

      return buildResult(bouncedProj, false, terrain, currentTerrain);
    }

    // Continue drilling
    const updatedDrillState: DonkeyDrillState = {
      drilling: true,
      depth: newDepth,
      bounces: drillState.bounces,
      lastDeformDepth: updatedLastDeformDepth,
    };

    const moved: Projectile = {
      ...projectile,
      position: { x: projectile.position.x, y: newY },
      velocity: encodeDrillState(updatedDrillState),
      trail: [...projectile.trail, { x: projectile.position.x, y: newY }],
    };

    return buildResult(moved, false, terrain, currentTerrain);
  }
}

/** Exported constants for testing. */
export const DONKEY_CONSTANTS = {
  DRILL_SPEED,
  DRILL_DEFORM_INTERVAL,
  DRILL_DEFORM_RADIUS,
  DRILL_BOUNCE_HEIGHT,
  DRILL_MAX_BOUNCES,
} as const;
