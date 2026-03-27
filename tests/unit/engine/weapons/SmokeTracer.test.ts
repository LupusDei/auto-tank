import { describe, expect, it, vi } from 'vitest';
import { simulateTick, type SimulationState } from '@engine/physics/ProjectileSimulation';
import { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
import { spawnProjectile } from '@engine/physics/ProjectileManager';
import type { TerrainData } from '@shared/types/terrain';
import { WEAPONS } from '@shared/constants/weapons';

function createTerrain(width: number, height: number): TerrainData {
  return {
    config: { width, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap: new Array(width).fill(height) as number[],
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

describe('Smoke Tracer', () => {
  it('should be defined in WEAPONS with 0 damage and 0 explosion radius', () => {
    const weapon = WEAPONS['smoke-tracer'];
    expect(weapon).toBeDefined();
    expect(weapon?.damage).toBe(0);
    expect(weapon?.explosionRadius).toBe(0);
    expect(weapon?.price).toBe(0);
    expect(weapon?.affectedByWind).toBe(true);
    expect(weapon?.affectedByGravity).toBe(true);
    expect(weapon?.category).toBe('projectile');
  });

  it('should leave a trail as it flies', () => {
    const proj = spawnProjectile({ x: 100, y: 50 }, 45, 80, 'smoke-tracer');
    const terrain = createTerrain(500, 400);
    const bus = new EventBus();

    const state: SimulationState = {
      projectiles: [proj],
      terrain,
      tanks: [],
      wind: 0,
      gravity: 9.81,
    };

    // Simulate several ticks so trail grows
    let current = state;
    for (let i = 0; i < 10; i++) {
      current = simulateTick(current, 1 / 60, bus);
    }

    const flyingProj = current.projectiles[0];
    if (!flyingProj) throw new Error('expected projectile');
    // Trail should have grown from initial 1 entry
    expect(flyingProj.trail.length).toBeGreaterThan(1);
  });

  it('should not deform terrain on impact', () => {
    // Spawn projectile just above terrain so it hits immediately
    const proj = spawnProjectile({ x: 100, y: 195 }, 0, 1, 'smoke-tracer');
    const terrain = createTerrain(500, 400);
    const bus = new EventBus();

    const state: SimulationState = {
      projectiles: [proj],
      terrain,
      tanks: [],
      wind: 0,
      gravity: 9.81,
    };

    const result = simulateTick(state, 1, bus);

    // Terrain should be unchanged
    const originalHeight = terrain.heightMap[100];
    const newHeight = result.terrain.heightMap[100];
    expect(newHeight).toBe(originalHeight);
  });

  it('should not emit EXPLOSION or TERRAIN_DEFORMED events on impact', () => {
    const proj = spawnProjectile({ x: 100, y: 195 }, 0, 1, 'smoke-tracer');
    const terrain = createTerrain(500, 400);
    const bus = new EventBus();
    const explosionHandler = vi.fn();
    const terrainHandler = vi.fn();
    bus.on(EventType.EXPLOSION, explosionHandler);
    bus.on(EventType.TERRAIN_DEFORMED, terrainHandler);

    const state: SimulationState = {
      projectiles: [proj],
      terrain,
      tanks: [],
      wind: 0,
      gravity: 9.81,
    };

    simulateTick(state, 1, bus);

    expect(explosionHandler).not.toHaveBeenCalled();
    expect(terrainHandler).not.toHaveBeenCalled();
  });

  it('should transition to done state on impact', () => {
    const proj = spawnProjectile({ x: 100, y: 195 }, 0, 1, 'smoke-tracer');
    const terrain = createTerrain(500, 400);
    const bus = new EventBus();

    const state: SimulationState = {
      projectiles: [proj],
      terrain,
      tanks: [],
      wind: 0,
      gravity: 9.81,
    };

    const result = simulateTick(state, 1, bus);
    const finalProj = result.projectiles[0];
    expect(finalProj?.state).toBe('done');
  });

  it('should deal 0 damage to a nearby tank', () => {
    const proj = spawnProjectile({ x: 100, y: 195 }, 0, 1, 'smoke-tracer');
    const terrain = createTerrain(500, 400);
    const bus = new EventBus();
    const damageHandler = vi.fn();
    bus.on(EventType.TANK_DAMAGED, damageHandler);

    const targetTank = {
      id: 'tank-1',
      playerId: 'player-1',
      position: { x: 102, y: 200 },
      angle: 45,
      power: 50,
      health: 100,
      maxHealth: 100,
      fuel: 100,
      state: 'alive' as const,
      color: 'red' as const,
      selectedWeapon: null,
    };

    const state: SimulationState = {
      projectiles: [proj],
      terrain,
      tanks: [targetTank],
      wind: 0,
      gravity: 9.81,
    };

    simulateTick(state, 1, bus);

    // No damage events should fire
    expect(damageHandler).not.toHaveBeenCalled();
  });
});
