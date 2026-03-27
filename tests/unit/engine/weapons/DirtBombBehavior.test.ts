import { describe, expect, it } from 'vitest';
import { DirtBombBehavior } from '@engine/weapons/DirtBombBehavior';
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

describe('DirtBombBehavior', () => {
  const behavior = new DirtBombBehavior();

  it('has weaponType "dirt-bomb"', () => {
    expect(behavior.weaponType).toBe('dirt-bomb');
  });

  it('does nothing while still above terrain', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj: Projectile = {
      id: 'dirt-1',
      weaponType: 'dirt-bomb',
      position: { x: 100, y: 100 }, // above surface at 400
      velocity: { x: 0, y: 50 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(false);
    expect(result.terrainModified).toBeUndefined();
  });

  it('adds terrain on impact instead of removing it', () => {
    const terrain = createFlatTerrain(500, 200);
    // Surface Y = 600 - 200 = 400
    const proj: Projectile = {
      id: 'dirt-1',
      weaponType: 'dirt-bomb',
      position: { x: 250, y: 400 }, // at surface
      velocity: { x: 0, y: 50 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(true);
    expect(result.terrainModified).toBeDefined();
    // Height at center should be HIGHER than original
    const originalH = terrain.heightMap[250] ?? 0;
    const modified = result.terrainModified;
    expect(modified).toBeDefined();
    const newH = modified ? (modified.heightMap[250] ?? 0) : 0;
    expect(newH).toBeGreaterThan(originalH);
  });

  it('does not modify terrain far from impact', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj: Projectile = {
      id: 'dirt-1',
      weaponType: 'dirt-bomb',
      position: { x: 250, y: 400 },
      velocity: { x: 0, y: 50 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    // Points far from impact (radius=30) should be unchanged
    const modifiedFar = result.terrainModified;
    expect(modifiedFar).toBeDefined();
    const farH = modifiedFar ? (modifiedFar.heightMap[0] ?? 0) : 0;
    expect(farH).toBe(200);
  });
});
