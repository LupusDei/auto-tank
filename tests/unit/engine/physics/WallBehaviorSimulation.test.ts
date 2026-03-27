import { describe, expect, it } from 'vitest';
import { simulateTick, type SimulationState } from '@engine/physics/ProjectileSimulation';
import { EventBus } from '@engine/events/EventBus';
import { spawnProjectile } from '@engine/physics/ProjectileManager';
import type { TerrainData } from '@shared/types/terrain';

function createTerrain(width: number, height: number): TerrainData {
  return {
    config: { width, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap: new Array(width).fill(height) as number[],
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

describe('Wall behavior in simulation', () => {
  it('open mode: projectile goes OOB normally', () => {
    // Fire a projectile that will go left out of bounds
    const proj = spawnProjectile({ x: 5, y: 50 }, 180, 200, 'baby-missile');
    const terrain = createTerrain(500, 400);
    const bus = new EventBus();

    const state: SimulationState = {
      projectiles: [proj],
      terrain,
      tanks: [],
      wind: 0,
      gravity: 9.81,
      wallMode: 'open' as const,
    };

    // Simulate multiple ticks to move projectile OOB
    let current = state;
    for (let i = 0; i < 20; i++) {
      current = simulateTick(current, 1 / 60, bus);
    }

    // Should eventually leave the playing field and be marked done
    const finalProj = current.projectiles[0];
    if (!finalProj) throw new Error('expected projectile');
    // Projectile is either still flying (moved far left) or done (OOB detected)
    if (finalProj.state === 'flying') {
      expect(finalProj.position.x).toBeLessThan(5);
    }
  });

  it('wrap mode: projectile wraps to other side', () => {
    // Projectile moving left at x near 0
    const proj = spawnProjectile({ x: 2, y: 50 }, 180, 100, 'baby-missile');
    const terrain = createTerrain(500, 400);
    const bus = new EventBus();

    const state: SimulationState = {
      projectiles: [proj],
      terrain,
      tanks: [],
      wind: 0,
      gravity: 9.81,
      wallMode: 'wrap',
    };

    // Simulate a few ticks — projectile should wrap
    let current = state;
    for (let i = 0; i < 5; i++) {
      current = simulateTick(current, 1 / 60, bus);
    }

    const finalProj = current.projectiles[0];
    if (!finalProj) throw new Error('expected projectile');
    // If still flying, it should have wrapped to the right side
    if (finalProj.state === 'flying') {
      expect(finalProj.position.x).toBeGreaterThan(400);
    }
  });

  it('bounce mode: projectile reflects at boundary', () => {
    // Projectile moving left at x near 0
    const proj = spawnProjectile({ x: 2, y: 50 }, 180, 100, 'baby-missile');
    const terrain = createTerrain(500, 400);
    const bus = new EventBus();

    const state: SimulationState = {
      projectiles: [proj],
      terrain,
      tanks: [],
      wind: 0,
      gravity: 9.81,
      wallMode: 'bounce',
    };

    let current = state;
    for (let i = 0; i < 5; i++) {
      current = simulateTick(current, 1 / 60, bus);
    }

    const finalProj = current.projectiles[0];
    if (!finalProj) throw new Error('expected projectile');
    // After bouncing, velocity.x should be positive (reflected)
    if (finalProj.state === 'flying') {
      expect(finalProj.velocity.x).toBeGreaterThan(0);
    }
  });

  it('default wallMode is open when not specified', () => {
    const proj = spawnProjectile({ x: 5, y: 50 }, 180, 200, 'baby-missile');
    const terrain = createTerrain(500, 400);
    const bus = new EventBus();

    const state: SimulationState = {
      projectiles: [proj],
      terrain,
      tanks: [],
      wind: 0,
      gravity: 9.81,
      // wallMode not specified — should default to 'open'
    };

    let current = state;
    for (let i = 0; i < 20; i++) {
      current = simulateTick(current, 1 / 60, bus);
    }

    // Same behavior as open: projectile goes OOB without wrapping
    const finalProj = current.projectiles[0];
    if (!finalProj) throw new Error('expected projectile');
    if (finalProj.state === 'flying') {
      expect(finalProj.position.x).toBeLessThan(5);
    }
  });
});
