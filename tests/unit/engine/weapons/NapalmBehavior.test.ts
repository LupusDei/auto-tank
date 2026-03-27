import { describe, expect, it } from 'vitest';
import { NapalmBehavior } from '@engine/weapons/NapalmBehavior';
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

describe('NapalmBehavior', () => {
  const behavior = new NapalmBehavior();

  it('has weaponType "napalm"', () => {
    expect(behavior.weaponType).toBe('napalm');
  });

  it('does nothing while above terrain', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj: Projectile = {
      id: 'napalm-1',
      weaponType: 'napalm',
      position: { x: 250, y: 100 },
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

  it('spawns 8 fire patches on terrain impact', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj: Projectile = {
      id: 'napalm-1',
      weaponType: 'napalm',
      position: { x: 250, y: 400 },
      velocity: { x: 0, y: 50 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(true);
    expect(result.spawnedProjectiles).toBeDefined();
    expect(result.spawnedProjectiles).toHaveLength(8);
  });

  it('fire patches are spread ±60px from impact', () => {
    const terrain = createFlatTerrain(500, 200);
    const targetX = 250;
    const proj: Projectile = {
      id: 'napalm-1',
      weaponType: 'napalm',
      position: { x: targetX, y: 400 },
      velocity: { x: 0, y: 50 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);
    const children = result.spawnedProjectiles ?? [];

    // First patch at targetX - 60, last at targetX + 60
    expect(children[0]?.position.x).toBeCloseTo(targetX - 60);
    expect(children[7]?.position.x).toBeCloseTo(targetX + 60);
  });

  it('fire patches inherit sourcePlayerId', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj: Projectile = {
      id: 'napalm-1',
      weaponType: 'napalm',
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

  it('parent also explodes on impact', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj: Projectile = {
      id: 'napalm-1',
      weaponType: 'napalm',
      position: { x: 250, y: 400 },
      velocity: { x: 0, y: 50 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(true);
  });
});
