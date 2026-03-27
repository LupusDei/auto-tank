import {
  createGuidedState,
  GuidedMissileBehavior,
  steerGuided,
} from '@engine/weapons/GuidedMissileBehavior';
import { describe, expect, it } from 'vitest';
import type { Projectile } from '@shared/types/projectile';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';
import type { WeaponBehaviorContext } from '@engine/weapons/WeaponBehavior';

function createFlatTerrain(width: number, terrainHeight: number): TerrainData {
  return {
    config: { width, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap: new Array(width).fill(terrainHeight) as number[],
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

function createContext(
  terrain: TerrainData,
  tanks: readonly Tank[] = [],
  dt = 1 / 60,
): WeaponBehaviorContext {
  return { terrain, tanks, wind: 0, gravity: 9.81, dt };
}

function createGuidedProjectile(x: number, y: number, vx = 100, vy = 0): Projectile {
  return {
    id: 'guided-1',
    weaponType: 'guided-missile',
    position: { x, y },
    velocity: { x: vx, y: vy },
    state: 'flying',
    trail: [{ x, y }],
    sourcePlayerId: 'player-1',
  };
}

describe('GuidedMissileBehavior', () => {
  const behavior = new GuidedMissileBehavior();

  it('has weaponType "guided-missile"', () => {
    expect(behavior.weaponType).toBe('guided-missile');
  });

  it('moves forward in heading direction at constant speed', () => {
    const terrain = createFlatTerrain(1000, 100);
    // Heading right (vx=100, vy=0 -> angle 0)
    const proj = createGuidedProjectile(200, 200, 100, 0);
    const ctx = createContext(terrain, [], 0.1);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(false);
    // At heading 0 (right), speed 100, dt 0.1 -> dx = 10, dy = 0
    expect(result.projectile.position.x).toBeCloseTo(210, 0);
    expect(result.projectile.position.y).toBeCloseTo(200, 0);
  });

  it('explodes after max duration (5 seconds)', () => {
    const terrain = createFlatTerrain(10000, 100);
    const proj = createGuidedProjectile(200, 200, 100, 0);
    const ctx = createContext(terrain, [], 0.1);

    // Simulate enough ticks to exceed 5 seconds
    let current = proj;
    let exploded = false;
    for (let i = 0; i < 60; i++) {
      const result = behavior.update(current, ctx);
      if (result.shouldExplode) {
        exploded = true;
        break;
      }
      current = result.projectile;
    }

    expect(exploded).toBe(true);
  });

  it('explodes on terrain collision', () => {
    // Terrain at height 400 -> surface Y = 200
    const terrain = createFlatTerrain(500, 400);
    // Heading downward (angle ~pi/2)
    const proj = createGuidedProjectile(250, 190, 0, 100);
    const ctx = createContext(terrain, [], 0.5);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(true);
  });

  it('explodes on tank collision', () => {
    const terrain = createFlatTerrain(500, 100);
    const tank: Tank = {
      id: 'tank-1',
      playerId: 'player-2',
      color: 'red',
      position: { x: 210, y: 200 },
      health: 100,
      maxHealth: 100,
      fuel: 100,
      angle: 45,
      power: 50,
      state: 'alive',
      selectedWeapon: null,
    };
    const proj = createGuidedProjectile(200, 200, 100, 0);
    const ctx = createContext(terrain, [tank], 0.1);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(true);
  });

  it('ignores destroyed tanks', () => {
    const terrain = createFlatTerrain(500, 100);
    const tank: Tank = {
      id: 'tank-1',
      playerId: 'player-2',
      color: 'red',
      position: { x: 210, y: 200 },
      health: 0,
      maxHealth: 100,
      fuel: 100,
      angle: 45,
      power: 50,
      state: 'destroyed',
      selectedWeapon: null,
    };
    const proj = createGuidedProjectile(200, 200, 100, 0);
    const ctx = createContext(terrain, [tank], 0.1);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(false);
  });

  it('adds trail points during flight', () => {
    const terrain = createFlatTerrain(1000, 100);
    const proj = createGuidedProjectile(200, 200, 100, 0);
    const ctx = createContext(terrain, [], 0.1);

    const result = behavior.update(proj, ctx);

    expect(result.projectile.trail.length).toBeGreaterThan(proj.trail.length);
  });
});

describe('createGuidedState', () => {
  it('creates state with given initial angle', () => {
    const state = createGuidedState(Math.PI / 4);

    expect(state.heading).toBeCloseTo(Math.PI / 4);
    expect(state.speed).toBe(100);
    expect(state.elapsed).toBe(0);
    expect(state.maxDuration).toBe(5);
  });
});

describe('steerGuided', () => {
  it('adjusts heading by turn rate * dt', () => {
    const state = createGuidedState(0);
    const turned = steerGuided(state, Math.PI, 0.5);

    expect(turned.heading).toBeCloseTo(Math.PI / 2);
    expect(turned.elapsed).toBeCloseTo(0.5);
  });
});
