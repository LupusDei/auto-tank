import { describe, expect, it } from 'vitest';
import { DiggerBehavior } from '@engine/weapons/DiggerBehavior';
import type { Projectile } from '@shared/types/projectile';
import type { TerrainData } from '@shared/types/terrain';
import type { WeaponBehaviorContext } from '@engine/weapons/WeaponBehavior';

function createFlatTerrain(width: number, terrainHeight: number): TerrainData {
  return {
    config: { width, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap: new Array(width).fill(terrainHeight) as number[],
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

function createContext(terrain: TerrainData): WeaponBehaviorContext {
  return { terrain, tanks: [], wind: 0, gravity: 9.81, dt: 1 / 60 };
}

function createDiggerProjectile(x: number, y: number): Projectile {
  return {
    id: 'digger-1',
    weaponType: 'digger',
    position: { x, y },
    velocity: { x: 0, y: 50 }, // falling down
    state: 'flying',
    trail: [{ x, y }],
    sourcePlayerId: 'player-1',
  };
}

describe('DiggerBehavior', () => {
  const behavior = new DiggerBehavior();

  it('has weaponType "digger"', () => {
    expect(behavior.weaponType).toBe('digger');
  });

  it('does not start boring while still above terrain', () => {
    const terrain = createFlatTerrain(500, 200);
    // Surface Y = 600 - 200 = 400, projectile at y=100 (above surface)
    const proj = createDiggerProjectile(100, 100);
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(false);
    // Should not modify terrain yet
    expect(result.terrainModified).toBeUndefined();
  });

  it('starts boring when hitting terrain surface', () => {
    const terrain = createFlatTerrain(500, 200);
    // Surface Y = 400, projectile at surface
    const proj = createDiggerProjectile(100, 400);
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(false);
    // Should have modified terrain (initial bore)
    expect(result.terrainModified).toBeDefined();
  });

  it('bores downward through terrain', () => {
    const terrain = createFlatTerrain(500, 200);
    // Create a projectile already in boring mode (velocity.y = -9999, velocity.x = depth)
    const proj: Projectile = {
      id: 'digger-1',
      weaponType: 'digger',
      position: { x: 100, y: 420 },
      velocity: { x: 10, y: -9999 }, // boring mode, depth=10
      state: 'flying',
      trail: [{ x: 100, y: 420 }],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(false);
    // Should have moved downward
    expect(result.projectile.position.y).toBeGreaterThan(420);
  });

  it('creates terrain deformation at explosion intervals', () => {
    const terrain = createFlatTerrain(500, 200);
    // Position at depth just before 20px interval boundary
    const proj: Projectile = {
      id: 'digger-1',
      weaponType: 'digger',
      position: { x: 100, y: 420 },
      velocity: { x: 19, y: -9999 }, // boring mode, depth=19
      state: 'flying',
      trail: [{ x: 100, y: 420 }],
      sourcePlayerId: 'player-1',
    };
    // Use larger dt so we cross the 20px boundary
    const ctx: WeaponBehaviorContext = {
      terrain,
      tanks: [],
      wind: 0,
      gravity: 9.81,
      dt: 0.1, // 100px/s * 0.1s = 10px, 19+10=29 crosses 20 boundary
    };

    const result = behavior.update(proj, ctx);

    expect(result.terrainModified).toBeDefined();
  });

  it('explodes after reaching max depth (200px)', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj: Projectile = {
      id: 'digger-1',
      weaponType: 'digger',
      position: { x: 100, y: 580 },
      velocity: { x: 199, y: -9999 }, // boring mode, depth=199
      state: 'flying',
      trail: [{ x: 100, y: 580 }],
      sourcePlayerId: 'player-1',
    };
    const ctx: WeaponBehaviorContext = {
      terrain,
      tanks: [],
      wind: 0,
      gravity: 9.81,
      dt: 0.1, // will push past 200
    };

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(true);
  });

  it('explodes when reaching bottom of world', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj: Projectile = {
      id: 'digger-1',
      weaponType: 'digger',
      position: { x: 100, y: 599 },
      velocity: { x: 50, y: -9999 }, // boring mode, depth=50
      state: 'flying',
      trail: [{ x: 100, y: 599 }],
      sourcePlayerId: 'player-1',
    };
    const ctx: WeaponBehaviorContext = {
      terrain,
      tanks: [],
      wind: 0,
      gravity: 9.81,
      dt: 0.1, // 100px/s * 0.1 = 10px, 599+10 = 609 > 600
    };

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(true);
  });
});
