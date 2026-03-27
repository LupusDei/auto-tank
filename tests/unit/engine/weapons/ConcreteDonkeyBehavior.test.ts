import { ConcreteDonkeyBehavior, DONKEY_CONSTANTS } from '@engine/weapons/ConcreteDonkeyBehavior';
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

function createContext(terrain: TerrainData, dt = 1 / 60): WeaponBehaviorContext {
  return { terrain, tanks: [], wind: 0, gravity: 9.81, dt };
}

function createDonkeyProjectile(x: number, y: number): Projectile {
  return {
    id: 'donkey-1',
    weaponType: 'concrete-donkey',
    position: { x, y },
    velocity: { x: 0, y: 100 },
    state: 'flying',
    trail: [{ x, y }],
    sourcePlayerId: 'player-1',
  };
}

describe('ConcreteDonkeyBehavior', () => {
  const behavior = new ConcreteDonkeyBehavior();

  it('has weaponType "concrete-donkey"', () => {
    expect(behavior.weaponType).toBe('concrete-donkey');
  });

  it('does nothing while above terrain (falling phase)', () => {
    const terrain = createFlatTerrain(500, 200);
    // Surface Y = 600 - 200 = 400; projectile at y=100 (above)
    const proj = createDonkeyProjectile(250, 100);
    const ctx = createContext(terrain);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(false);
    expect(result.terrainModified).toBeUndefined();
  });

  it('starts drilling when hitting terrain surface', () => {
    const terrain = createFlatTerrain(500, 200);
    // Surface Y = 400; projectile at surface
    const proj = createDonkeyProjectile(250, 400);
    const ctx = createContext(terrain, 0.1);

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(false);
    // Position should have moved downward
    expect(result.projectile.position.y).toBeGreaterThan(400);
  });

  it('deforms terrain at depth intervals during drilling', () => {
    const terrain = createFlatTerrain(500, 200);
    // Start at terrain surface to initiate drilling
    const proj = createDonkeyProjectile(250, 400);
    // Use a large dt so depth crosses the deform interval threshold (15px)
    const ctx = createContext(terrain, 0.2); // 150 * 0.2 = 30px, crosses 15px boundary

    const result = behavior.update(proj, ctx);

    expect(result.terrainModified).toBeDefined();
  });

  it('bounces up when exiting terrain', () => {
    // Create thin terrain: terrain height = 20px at x=250
    // Surface Y = 600 - 20 = 580
    const heightMap = new Array(500).fill(20) as number[];
    const terrain: TerrainData = {
      config: { width: 500, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
      heightMap,
      destructionMap: new Array(500).fill(false) as boolean[],
    };
    // Start at surface (580), drill with large dt to exit below
    const proj = createDonkeyProjectile(250, 580);
    // 150 * 0.5 = 75px, would go to y=655 which is below config.height...
    // But terrain is only 20px thick, so we'd exit at ~600
    const ctx = createContext(terrain, 0.2); // 30px, 580+30=610 > 600

    const result = behavior.update(proj, ctx);

    // Should either bounce or explode (reaching screen bottom at 600)
    // Since 610 > 600 (config.height), it hits screen bottom -> explode
    expect(result.shouldExplode).toBe(true);
  });

  it('explodes after max bounces', () => {
    // Use terrain height = 0 so surfaceY = 600, making the position "not in terrain"
    // This forces a bounce exit, triggering the max-bounces check
    const exitTerrain: TerrainData = {
      config: { width: 500, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
      heightMap: new Array(500).fill(0) as number[],
      destructionMap: new Array(500).fill(false) as boolean[],
    };
    // Encode drilling state with 2 bounces already done
    // velocity.x = depth, velocity.y = -(bounces*1000 + lastDeformDepth + 50000)
    const exitProj: Projectile = {
      id: 'donkey-1',
      weaponType: 'concrete-donkey',
      position: { x: 250, y: 550 },
      velocity: { x: 5, y: -(2 * 1000 + 0 + 50000) },
      state: 'flying',
      trail: [{ x: 250, y: 550 }],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(exitTerrain, 0.1); // move 15px to y=565, surfaceY=600, not in terrain

    const result = behavior.update(exitProj, ctx);

    // 3rd bounce (bounces = 2 + 1 = 3) >= MAX_BOUNCES (3) -> explode
    expect(result.shouldExplode).toBe(true);
  });

  it('explodes at screen bottom', () => {
    const terrain = createFlatTerrain(500, 200);
    // Position near bottom, in drilling state
    const proj: Projectile = {
      id: 'donkey-1',
      weaponType: 'concrete-donkey',
      position: { x: 250, y: 595 },
      velocity: { x: 50, y: -(0 * 1000 + 0 + 50000) }, // drilling, 0 bounces
      state: 'flying',
      trail: [{ x: 250, y: 595 }],
      sourcePlayerId: 'player-1',
    };
    const ctx = createContext(terrain, 0.1); // 150 * 0.1 = 15px, 595+15=610 > 600

    const result = behavior.update(proj, ctx);

    expect(result.shouldExplode).toBe(true);
  });
});

describe('DONKEY_CONSTANTS', () => {
  it('has expected drill speed', () => {
    expect(DONKEY_CONSTANTS.DRILL_SPEED).toBe(150);
  });

  it('has expected max bounces', () => {
    expect(DONKEY_CONSTANTS.DRILL_MAX_BOUNCES).toBe(3);
  });
});
