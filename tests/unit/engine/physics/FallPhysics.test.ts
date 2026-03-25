import { calculateFallDamage, checkFalling, simulateFall } from '@engine/physics/FallPhysics';
import { describe, expect, it } from 'vitest';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';

function createTank(x: number, y: number): Tank {
  return {
    id: 't1',
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

function createTerrain(heightMap: number[]): TerrainData {
  return {
    config: { width: heightMap.length, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap,
    destructionMap: new Array(heightMap.length).fill(false) as boolean[],
  };
}

describe('FallPhysics', () => {
  describe('checkFalling()', () => {
    it('should return true when tank is above terrain (y increases downward)', () => {
      const tank = createTank(5, 50); // tank at y=50, above terrain
      const terrain = createTerrain([200, 200, 200, 200, 200, 200, 200, 200, 200, 200]); // terrain at 200
      expect(checkFalling(tank, terrain)).toBe(true);
    });

    it('should return true when terrain has been lowered below tank', () => {
      const tank = createTank(5, 100); // tank at y=100
      const terrain = createTerrain([200, 200, 200, 200, 200, 300, 200, 200, 200, 200]); // terrain at x=5 is 300
      // tank.y (100) < terrain (300), so tank needs to fall to 300
      expect(checkFalling(tank, terrain)).toBe(true);
    });

    it('should return false when tank is on terrain', () => {
      const tank = createTank(5, 200);
      const terrain = createTerrain([200, 200, 200, 200, 200, 200, 200, 200, 200, 200]);
      expect(checkFalling(tank, terrain)).toBe(false);
    });
  });

  describe('simulateFall()', () => {
    it('should move tank down toward terrain', () => {
      const tank = createTank(5, 100);
      const terrain = createTerrain([200, 200, 200, 200, 200, 300, 200, 200, 200, 200]);
      const result = simulateFall(tank, terrain, 1);

      expect(result.position.y).toBeGreaterThan(100);
    });

    it('should stop at terrain height', () => {
      const tank = createTank(5, 290);
      const terrain = createTerrain([200, 200, 200, 200, 200, 300, 200, 200, 200, 200]);
      const result = simulateFall(tank, terrain, 10);

      expect(result.position.y).toBe(300);
    });

    it('should transition falling tank to alive when landing', () => {
      // Tank is falling and close to terrain — large dt will land it
      const tank: Tank = { ...createTank(5, 295), state: 'falling' };
      const terrain = createTerrain([200, 200, 200, 200, 200, 300, 200, 200, 200, 200]);
      const result = simulateFall(tank, terrain, 10);

      expect(result.position.y).toBe(300);
      expect(result.state).toBe('alive');
    });

    it('should preserve non-falling state when landing from above', () => {
      // Tank is alive (not falling), falls to terrain in one step
      const tank = createTank(5, 295);
      const terrain = createTerrain([200, 200, 200, 200, 200, 300, 200, 200, 200, 200]);
      const result = simulateFall(tank, terrain, 10);

      expect(result.position.y).toBe(300);
      expect(result.state).toBe('alive');
    });

    it('should not move if already on terrain', () => {
      const tank = createTank(5, 200);
      const terrain = createTerrain([200, 200, 200, 200, 200, 200, 200, 200, 200, 200]);
      const result = simulateFall(tank, terrain, 1);

      expect(result.position.y).toBe(200);
    });
  });

  describe('calculateFallDamage()', () => {
    it('should return 0 for short falls below threshold', () => {
      expect(calculateFallDamage(5)).toBe(0);
      expect(calculateFallDamage(10)).toBe(0);
    });

    it('should return damage for falls above threshold', () => {
      expect(calculateFallDamage(50)).toBeGreaterThan(0);
    });

    it('should increase damage with fall distance', () => {
      const shortFall = calculateFallDamage(30);
      const longFall = calculateFallDamage(100);
      expect(longFall).toBeGreaterThan(shortFall);
    });

    it('should cap damage at a maximum', () => {
      const extreme = calculateFallDamage(10000);
      expect(extreme).toBeLessThanOrEqual(100);
    });
  });
});
