import {
  checkTankHit,
  checkTerrainHit,
  type CollisionResult,
  detectCollision,
} from '@engine/physics/CollisionDetector';
import { describe, expect, it } from 'vitest';
import type { Projectile } from '@shared/types/projectile';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';

function createTerrain(heightMap: number[]): TerrainData {
  return {
    config: { width: heightMap.length, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap,
    destructionMap: new Array(heightMap.length).fill(false) as boolean[],
  };
}

function createProjectile(x: number, y: number): Projectile {
  return {
    id: 'proj-1',
    weaponType: 'missile',
    position: { x, y },
    velocity: { x: 10, y: 5 },
    state: 'flying',
    trail: [{ x, y }],
    sourcePlayerId: 'p1',
  };
}

function createTank(id: string, x: number, y: number): Tank {
  return {
    id,
    playerId: 'p1',
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

describe('CollisionDetector', () => {
  describe('checkTerrainHit()', () => {
    it('should detect when projectile is at or below terrain', () => {
      const terrain = createTerrain([100, 100, 100, 100, 100]);
      const proj = createProjectile(2, 100);

      expect(checkTerrainHit(proj, terrain)).toBe(true);
    });

    it('should detect when projectile is below terrain', () => {
      const terrain = createTerrain([100, 100, 100, 100, 100]);
      const proj = createProjectile(2, 150);

      expect(checkTerrainHit(proj, terrain)).toBe(true);
    });

    it('should return false when projectile is above terrain', () => {
      const terrain = createTerrain([100, 100, 100, 100, 100]);
      const proj = createProjectile(2, 50);

      expect(checkTerrainHit(proj, terrain)).toBe(false);
    });
  });

  describe('checkTankHit()', () => {
    it('should detect when projectile is near a tank', () => {
      const tanks = [createTank('t1', 50, 100)];
      const proj = createProjectile(52, 98);
      const result = checkTankHit(proj, tanks);

      expect(result).not.toBeNull();
      expect(result?.id).toBe('t1');
    });

    it('should return null when projectile is far from all tanks', () => {
      const tanks = [createTank('t1', 50, 100)];
      const proj = createProjectile(200, 200);

      expect(checkTankHit(proj, tanks)).toBeNull();
    });

    it('should not hit destroyed tanks', () => {
      const tank: Tank = { ...createTank('t1', 50, 100), state: 'destroyed' };
      const proj = createProjectile(50, 100);

      expect(checkTankHit(proj, [tank])).toBeNull();
    });

    it('should return the closest tank when multiple are nearby', () => {
      const tanks = [createTank('t1', 50, 100), createTank('t2', 55, 100)];
      const proj = createProjectile(53, 100);
      const result = checkTankHit(proj, tanks);

      expect(result).not.toBeNull();
      // t2 is closer (distance 2 vs 3)
      expect(result?.id).toBe('t2');
    });
  });

  describe('detectCollision()', () => {
    it('should return terrain collision when projectile hits ground', () => {
      const terrain = createTerrain([100, 100, 100, 100, 100]);
      const proj = createProjectile(2, 110);
      const result = detectCollision(proj, terrain, []);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('terrain');
    });

    it('should return tank collision when projectile hits a tank', () => {
      const terrain = createTerrain([200, 200, 200, 200, 200]); // terrain below
      const tanks = [createTank('t1', 2, 50)];
      const proj = createProjectile(2, 50);
      const result = detectCollision(proj, terrain, tanks);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('tank');
      expect((result as CollisionResult & { type: 'tank' }).tankId).toBe('t1');
    });

    it('should prioritize tank hit over terrain hit', () => {
      const terrain = createTerrain([100, 100, 100, 100, 100]);
      const tanks = [createTank('t1', 2, 100)];
      const proj = createProjectile(2, 100); // hits both terrain and tank
      const result = detectCollision(proj, terrain, tanks);

      expect(result?.type).toBe('tank');
    });

    it('should return null when no collision', () => {
      const terrain = createTerrain([200, 200, 200, 200, 200]);
      const proj = createProjectile(2, 50);
      const result = detectCollision(proj, terrain, []);

      expect(result).toBeNull();
    });

    it('should return out_of_bounds for projectiles beyond terrain horizontally', () => {
      const terrain = createTerrain([100, 100, 100, 100, 100]);
      const proj = createProjectile(-100, 50);
      const result = detectCollision(proj, terrain, []);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('out_of_bounds');
    });

    it('should return out_of_bounds for projectiles escaping upward (y < -500)', () => {
      const terrain = createTerrain([100, 100, 100, 100, 100]);
      const proj = createProjectile(2, -600);
      const result = detectCollision(proj, terrain, []);

      expect(result).not.toBeNull();
      expect(result?.type).toBe('out_of_bounds');
    });

    it('should not flag as out_of_bounds for projectiles at normal altitude', () => {
      const terrain = createTerrain([400, 400, 400, 400, 400]);
      const proj = createProjectile(2, -200);
      const result = detectCollision(proj, terrain, []);

      expect(result).toBeNull();
    });
  });
});
