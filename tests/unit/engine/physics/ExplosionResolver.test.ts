import { describe, expect, it } from 'vitest';
import { resolveExplosion } from '@engine/physics/ExplosionResolver';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';
import type { WeaponDefinition } from '@shared/types/weapons';

function createTerrain(width: number, height: number): TerrainData {
  return {
    config: { width, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap: new Array(width).fill(height) as number[],
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

function createTank(id: string, x: number, y: number): Tank {
  return {
    id,
    playerId: `player-${id}`,
    position: { x, y },
    angle: 45,
    power: 50,
    health: 100,
    maxHealth: 100,
    fuel: 100,
    state: 'alive',
    color: 'red',
    selectedWeapon: null,
  };
}

const testWeapon: WeaponDefinition = {
  type: 'missile',
  name: 'Missile',
  category: 'projectile',
  explosionRadius: 30,
  damage: 50,
  price: 0,
  affectedByWind: true,
  affectedByGravity: true,
};

describe('ExplosionResolver', () => {
  describe('resolveExplosion()', () => {
    it('should deform terrain at impact point', () => {
      const terrain = createTerrain(100, 200);
      const result = resolveExplosion({ x: 50, y: 200 }, testWeapon, terrain, []);

      // Height at impact should be lower
      const impactIdx = 50;
      const original = terrain.heightMap[impactIdx] ?? 0;
      const deformed = result.terrain.heightMap[impactIdx] ?? 0;
      expect(deformed).toBeLessThan(original);
    });

    it('should calculate damage to nearby tanks', () => {
      const terrain = createTerrain(100, 200);
      const tank = createTank('t1', 55, 200);
      const result = resolveExplosion({ x: 50, y: 200 }, testWeapon, terrain, [tank]);

      expect(result.damages).toHaveLength(1);
      expect(result.damages[0]?.tankId).toBe('t1');
      expect(result.damages[0]?.damageDealt).toBeGreaterThan(0);
    });

    it('should apply damage falloff based on distance', () => {
      const terrain = createTerrain(200, 200);
      const closeT = createTank('close', 52, 200); // 2 units away
      const farT = createTank('far', 70, 200); // 20 units away
      const result = resolveExplosion({ x: 50, y: 200 }, testWeapon, terrain, [closeT, farT]);

      const closeDmg = result.damages.find((d) => d.tankId === 'close');
      const farDmg = result.damages.find((d) => d.tankId === 'far');
      expect(closeDmg?.damageDealt).toBeGreaterThan(farDmg?.damageDealt ?? 0);
    });

    it('should not damage tanks outside explosion radius', () => {
      const terrain = createTerrain(200, 200);
      const farTank = createTank('t1', 150, 200); // 100 units away, radius is 30
      const result = resolveExplosion({ x: 50, y: 200 }, testWeapon, terrain, [farTank]);

      expect(result.damages).toHaveLength(0);
    });

    it('should skip destroyed tanks', () => {
      const terrain = createTerrain(100, 200);
      const tank: Tank = { ...createTank('t1', 50, 200), state: 'destroyed' };
      const result = resolveExplosion({ x: 50, y: 200 }, testWeapon, terrain, [tank]);

      expect(result.damages).toHaveLength(0);
    });

    it('should damage multiple tanks in range', () => {
      const terrain = createTerrain(100, 200);
      const t1 = createTank('t1', 45, 200);
      const t2 = createTank('t2', 55, 200);
      const result = resolveExplosion({ x: 50, y: 200 }, testWeapon, terrain, [t1, t2]);

      expect(result.damages).toHaveLength(2);
    });

    it('should mark killed tanks', () => {
      const terrain = createTerrain(100, 200);
      const weakTank: Tank = { ...createTank('t1', 50, 200), health: 10 };
      const result = resolveExplosion({ x: 50, y: 200 }, testWeapon, terrain, [weakTank]);

      expect(result.damages[0]?.killed).toBe(true);
    });
  });
});
