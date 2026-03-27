import { describe, expect, it } from 'vitest';
import { AirStrikeBehavior } from '@engine/weapons/AirStrikeBehavior';
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

describe('AirStrikeBehavior', () => {
  const behavior = new AirStrikeBehavior();

  it('has weaponType "air-strike"', () => {
    expect(behavior.weaponType).toBe('air-strike');
  });

  it('does nothing while above terrain', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj: Projectile = {
      id: 'air-1',
      weaponType: 'air-strike',
      position: { x: 250, y: 100 }, // above surface at 400
      velocity: { x: 10, y: 50 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(false);
    expect(result.spawnedProjectiles).toBeUndefined();
  });

  it('spawns 5 child projectiles on terrain impact', () => {
    const terrain = createFlatTerrain(500, 200);
    // Surface Y = 400
    const proj: Projectile = {
      id: 'air-1',
      weaponType: 'air-strike',
      position: { x: 250, y: 400 },
      velocity: { x: 0, y: 50 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.spawnedProjectiles).toBeDefined();
    expect(result.spawnedProjectiles).toHaveLength(5);
  });

  it('children spawn from above (y = -50)', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj: Projectile = {
      id: 'air-1',
      weaponType: 'air-strike',
      position: { x: 250, y: 400 },
      velocity: { x: 0, y: 50 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    for (const child of result.spawnedProjectiles ?? []) {
      expect(child.position.y).toBe(-50);
      expect(child.state).toBe('flying');
    }
  });

  it('children are spread across ±40px from target', () => {
    const terrain = createFlatTerrain(500, 200);
    const targetX = 250;
    const proj: Projectile = {
      id: 'air-1',
      weaponType: 'air-strike',
      position: { x: targetX, y: 400 },
      velocity: { x: 0, y: 50 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);
    const children = result.spawnedProjectiles ?? [];

    // First child should be at targetX - 40, last at targetX + 40
    expect(children[0]?.position.x).toBeCloseTo(targetX - 40);
    expect(children[4]?.position.x).toBeCloseTo(targetX + 40);
  });

  it('children fall downward (positive y velocity)', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj: Projectile = {
      id: 'air-1',
      weaponType: 'air-strike',
      position: { x: 250, y: 400 },
      velocity: { x: 0, y: 50 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    for (const child of result.spawnedProjectiles ?? []) {
      expect(child.velocity.y).toBeGreaterThan(0);
    }
  });

  it('children inherit sourcePlayerId', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj: Projectile = {
      id: 'air-1',
      weaponType: 'air-strike',
      position: { x: 250, y: 400 },
      velocity: { x: 0, y: 50 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-attacker',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    for (const child of result.spawnedProjectiles ?? []) {
      expect(child.sourcePlayerId).toBe('player-attacker');
    }
  });

  it('parent does not explode (children do the damage)', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj: Projectile = {
      id: 'air-1',
      weaponType: 'air-strike',
      position: { x: 250, y: 400 },
      velocity: { x: 0, y: 50 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(false);
  });
});
