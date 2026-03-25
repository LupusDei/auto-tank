import { describe, expect, it } from 'vitest';
import { moveTank, validateMove } from '@engine/physics/TankMovement';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';

function createTank(x: number, y: number, fuel: number): Tank {
  return {
    id: 't1',
    playerId: 'p1',
    position: { x, y },
    angle: 45,
    power: 50,
    health: 100,
    maxHealth: 100,
    fuel,
    state: 'alive',
    color: 'red',
    selectedWeapon: null,
  };
}

function createFlatTerrain(width: number, height: number): TerrainData {
  return {
    config: { width, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap: new Array(width).fill(height) as number[],
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

function createSlopedTerrain(width: number): TerrainData {
  const heightMap = Array.from({ length: width }, (_, i) => 100 + (200 * i) / (width - 1));
  return {
    config: { width, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap,
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

describe('TankMovement', () => {
  describe('validateMove()', () => {
    it('should allow movement when tank has fuel', () => {
      const tank = createTank(50, 200, 100);
      expect(validateMove(tank, 1)).toBe(true);
    });

    it('should prevent movement when tank has no fuel', () => {
      const tank = createTank(50, 200, 0);
      expect(validateMove(tank, 1)).toBe(false);
    });

    it('should prevent movement for destroyed tanks', () => {
      const tank: Tank = { ...createTank(50, 200, 100), state: 'destroyed' };
      expect(validateMove(tank, 1)).toBe(false);
    });
  });

  describe('moveTank()', () => {
    it('should move tank in the specified direction', () => {
      const tank = createTank(50, 200, 100);
      const terrain = createFlatTerrain(200, 200);
      const result = moveTank(tank, 1, terrain);

      expect(result.position.x).toBeGreaterThan(50);
    });

    it('should reduce fuel after movement', () => {
      const tank = createTank(50, 200, 100);
      const terrain = createFlatTerrain(200, 200);
      const result = moveTank(tank, 1, terrain);

      expect(result.fuel).toBeLessThan(100);
    });

    it('should snap tank to terrain height at new position', () => {
      const tank = createTank(50, 200, 100);
      const terrain = createFlatTerrain(200, 150);
      const result = moveTank(tank, 1, terrain);

      expect(result.position.y).toBe(150);
    });

    it('should cost more fuel on steep slopes', () => {
      const flatTerrain = createFlatTerrain(200, 200);
      const slopedTerrain = createSlopedTerrain(200);

      const tank = createTank(50, 200, 100);
      const flatResult = moveTank(tank, 1, flatTerrain);
      const slopedResult = moveTank(tank, 1, slopedTerrain);

      expect(slopedResult.fuel).toBeLessThan(flatResult.fuel);
    });

    it('should not move past terrain bounds', () => {
      const terrain = createFlatTerrain(100, 200);
      const tankRight = createTank(99, 200, 100);
      const result = moveTank(tankRight, 1, terrain);

      expect(result.position.x).toBeLessThanOrEqual(99);
    });

    it('should not move if tank has no fuel', () => {
      const tank = createTank(50, 200, 0);
      const terrain = createFlatTerrain(200, 200);
      const result = moveTank(tank, 1, terrain);

      expect(result.position.x).toBe(50);
      expect(result.fuel).toBe(0);
    });

    it('should move left with direction -1', () => {
      const tank = createTank(50, 200, 100);
      const terrain = createFlatTerrain(200, 200);
      const result = moveTank(tank, -1, terrain);

      expect(result.position.x).toBeLessThan(50);
    });
  });
});
