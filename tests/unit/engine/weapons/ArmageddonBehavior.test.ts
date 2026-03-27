import { ARMAGEDDON_CONSTANTS, ArmageddonBehavior } from '@engine/weapons/ArmageddonBehavior';
import { describe, expect, it } from 'vitest';
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

describe('ArmageddonBehavior', () => {
  const behavior = new ArmageddonBehavior();

  it('has weaponType "armageddon"', () => {
    expect(behavior.weaponType).toBe('armageddon');
  });

  it('spawns 20 child meteor projectiles', () => {
    const terrain = createFlatTerrain(800, 200);
    const proj: Projectile = {
      id: 'armageddon-1',
      weaponType: 'armageddon',
      position: { x: 400, y: 300 },
      velocity: { x: 0, y: 0 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.spawnedProjectiles).toBeDefined();
    expect(result.spawnedProjectiles).toHaveLength(ARMAGEDDON_CONSTANTS.METEOR_COUNT);
  });

  it('parent does not explode (children do)', () => {
    const terrain = createFlatTerrain(800, 200);
    const proj: Projectile = {
      id: 'armageddon-1',
      weaponType: 'armageddon',
      position: { x: 400, y: 300 },
      velocity: { x: 0, y: 0 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(false);
  });

  it('children spawn from above (y = -100)', () => {
    const terrain = createFlatTerrain(800, 200);
    const proj: Projectile = {
      id: 'armageddon-1',
      weaponType: 'armageddon',
      position: { x: 400, y: 300 },
      velocity: { x: 0, y: 0 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    for (const child of result.spawnedProjectiles ?? []) {
      expect(child.position.y).toBe(ARMAGEDDON_CONSTANTS.METEOR_SPAWN_Y);
      expect(child.state).toBe('flying');
    }
  });

  it('children have downward velocity and slight horizontal drift', () => {
    const terrain = createFlatTerrain(800, 200);
    const proj: Projectile = {
      id: 'armageddon-1',
      weaponType: 'armageddon',
      position: { x: 400, y: 300 },
      velocity: { x: 0, y: 0 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    for (const child of result.spawnedProjectiles ?? []) {
      expect(child.velocity.y).toBe(ARMAGEDDON_CONSTANTS.METEOR_FALL_SPEED);
      expect(Math.abs(child.velocity.x)).toBeLessThanOrEqual(ARMAGEDDON_CONSTANTS.METEOR_MAX_DRIFT);
    }
  });

  it('children inherit sourcePlayerId', () => {
    const terrain = createFlatTerrain(800, 200);
    const proj: Projectile = {
      id: 'armageddon-1',
      weaponType: 'armageddon',
      position: { x: 400, y: 300 },
      velocity: { x: 0, y: 0 },
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

  it('children x positions are spread across the map', () => {
    const mapWidth = 800;
    const terrain = createFlatTerrain(mapWidth, 200);
    const proj: Projectile = {
      id: 'armageddon-1',
      weaponType: 'armageddon',
      position: { x: 400, y: 300 },
      velocity: { x: 0, y: 0 },
      state: 'flying',
      trail: [],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);
    const children = result.spawnedProjectiles ?? [];

    // All x positions should be within the map bounds
    for (const child of children) {
      expect(child.position.x).toBeGreaterThanOrEqual(0);
      expect(child.position.x).toBeLessThanOrEqual(mapWidth);
    }

    // Not all at the same x (random spread)
    const uniqueX = new Set(children.map((c) => Math.round(c.position.x)));
    expect(uniqueX.size).toBeGreaterThan(5);
  });
});
