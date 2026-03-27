import { describe, expect, it } from 'vitest';
import type { Projectile } from '@shared/types/projectile';
import { RollerBehavior } from '@engine/weapons/RollerBehavior';
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

function createRollerProjectile(x: number, directionX: number): Projectile {
  const terrain = createFlatTerrain(500, 200);
  const surfaceY = terrain.config.height - 200; // 400
  return {
    id: 'roller-1',
    weaponType: 'roller',
    position: { x, y: surfaceY },
    velocity: { x: directionX, y: 0 }, // y stores elapsed time (starts at 0)
    state: 'flying',
    trail: [{ x, y: surfaceY }],
    sourcePlayerId: 'player-1',
  };
}

function createContext(terrain: TerrainData, tanks: readonly Tank[] = []): WeaponBehaviorContext {
  return { terrain, tanks, wind: 0, gravity: 9.81, dt: 1 / 60 };
}

describe('RollerBehavior', () => {
  const behavior = new RollerBehavior();

  it('has weaponType "roller"', () => {
    expect(behavior.weaponType).toBe('roller');
  });

  it('follows terrain surface (moves horizontally and snaps Y)', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj = createRollerProjectile(100, 1); // moving right
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(false);
    // Should have moved right
    expect(result.projectile.position.x).toBeGreaterThan(100);
    // Y should be at terrain surface (600 - 200 = 400)
    expect(result.projectile.position.y).toBe(400);
  });

  it('moves left when initial velocity is negative', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj = createRollerProjectile(200, -1);
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(false);
    expect(result.projectile.position.x).toBeLessThan(200);
  });

  it('explodes on steep slope', () => {
    // Create terrain with a steep cliff
    const terrain = createFlatTerrain(500, 200);
    const newHeightMap = [...terrain.heightMap];
    // Create a steep jump: height goes from 200 to 210 in one pixel
    for (let x = 105; x < 500; x++) {
      newHeightMap[x] = 210;
    }
    const steepTerrain: TerrainData = { ...terrain, heightMap: newHeightMap };

    // Position roller just before the cliff
    const proj = createRollerProjectile(104, 1);
    const ctx = createContext(steepTerrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(true);
  });

  it('explodes after timeout (3 seconds)', () => {
    const terrain = createFlatTerrain(500, 200);
    // Set elapsed time close to 3s by encoding it in velocity.y
    const proj: Projectile = {
      ...createRollerProjectile(200, 1),
      velocity: { x: 1, y: 2.99 }, // y = elapsed time, almost 3s
    };
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(true);
  });

  it('explodes when hitting a tank', () => {
    const terrain = createFlatTerrain(500, 200);
    const surfaceY = 400;
    const tank: Tank = {
      id: 'tank-1',
      playerId: 'player-2',
      position: { x: 102, y: surfaceY },
      angle: 45,
      power: 50,
      health: 100,
      maxHealth: 100,
      fuel: 100,
      state: 'alive',
      color: 'red',
      selectedWeapon: null,
    };
    const proj = createRollerProjectile(100, 1);
    const ctx = createContext(terrain, [tank]);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(true);
  });

  it('does not explode when tank is destroyed', () => {
    const terrain = createFlatTerrain(500, 200);
    const surfaceY = 400;
    const tank: Tank = {
      id: 'tank-1',
      playerId: 'player-2',
      position: { x: 102, y: surfaceY },
      angle: 45,
      power: 50,
      health: 0,
      maxHealth: 100,
      fuel: 100,
      state: 'destroyed',
      color: 'red',
      selectedWeapon: null,
    };
    const proj = createRollerProjectile(100, 1);
    const ctx = createContext(terrain, [tank]);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(false);
  });

  it('explodes when going out of bounds', () => {
    const terrain = createFlatTerrain(500, 200);
    const proj = createRollerProjectile(499, 1); // near right edge
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(true);
  });
});
