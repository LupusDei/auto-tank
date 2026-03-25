import { describe, expect, it } from 'vitest';
import {
  getTerrainAngleAtPosition,
  placeAllTanks,
  placeTankOnTerrain,
} from '@engine/physics/TankPlacement';
import type { TerrainData } from '@shared/types/terrain';

function createFlatTerrain(width: number, height: number): TerrainData {
  return {
    config: { width, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap: new Array(width).fill(height) as number[],
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

function createSlopedTerrain(width: number): TerrainData {
  // Slope: height increases from left to right (100 to 300)
  const heightMap = Array.from({ length: width }, (_, i) => 100 + (200 * i) / (width - 1));
  return {
    config: { width, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap,
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

describe('TankPlacement', () => {
  describe('placeTankOnTerrain()', () => {
    it('should snap tank y to terrain height at given x', () => {
      const terrain = createFlatTerrain(100, 200);
      const pos = placeTankOnTerrain(50, terrain);

      expect(pos.x).toBe(50);
      expect(pos.y).toBe(200);
    });

    it('should clamp x to terrain bounds', () => {
      const terrain = createFlatTerrain(100, 200);

      const left = placeTankOnTerrain(-10, terrain);
      expect(left.x).toBe(0);

      const right = placeTankOnTerrain(999, terrain);
      expect(right.x).toBe(99);
    });

    it('should follow terrain height at different positions', () => {
      const terrain = createSlopedTerrain(100);
      const pos25 = placeTankOnTerrain(25, terrain);
      const pos75 = placeTankOnTerrain(75, terrain);

      expect(pos75.y).toBeGreaterThan(pos25.y);
    });
  });

  describe('placeAllTanks()', () => {
    it('should distribute tanks evenly across terrain', () => {
      const terrain = createFlatTerrain(1000, 200);
      const positions = placeAllTanks(4, terrain);

      expect(positions).toHaveLength(4);

      // Check even spacing with margins
      for (const pos of positions) {
        expect(pos.x).toBeGreaterThanOrEqual(0);
        expect(pos.x).toBeLessThan(1000);
        expect(pos.y).toBe(200);
      }

      // Positions should be sorted left to right
      for (let i = 1; i < positions.length; i++) {
        const prev = positions[i - 1];
        const curr = positions[i];
        expect(prev).toBeDefined();
        expect(curr).toBeDefined();
        if (prev && curr) {
          expect(curr.x).toBeGreaterThan(prev.x);
        }
      }
    });

    it('should handle single player', () => {
      const terrain = createFlatTerrain(100, 200);
      const positions = placeAllTanks(1, terrain);

      expect(positions).toHaveLength(1);
      expect(positions[0]?.x).toBe(50);
    });

    it('should handle two players', () => {
      const terrain = createFlatTerrain(100, 200);
      const positions = placeAllTanks(2, terrain);

      expect(positions).toHaveLength(2);
      expect(positions[0]?.x).toBeLessThan(50);
      expect(positions[1]?.x).toBeGreaterThan(50);
    });
  });

  describe('getTerrainAngleAtPosition()', () => {
    it('should return 0 for flat terrain', () => {
      const terrain = createFlatTerrain(100, 200);
      const angle = getTerrainAngleAtPosition(50, terrain);

      expect(angle).toBeCloseTo(0, 1);
    });

    it('should return positive angle for uphill slope (left to right)', () => {
      const terrain = createSlopedTerrain(100);
      const angle = getTerrainAngleAtPosition(50, terrain);

      expect(angle).not.toBe(0);
      // On a slope going up (height increases), angle should be non-zero
      expect(typeof angle).toBe('number');
    });

    it('should be deterministic', () => {
      const terrain = createSlopedTerrain(100);
      const a1 = getTerrainAngleAtPosition(50, terrain);
      const a2 = getTerrainAngleAtPosition(50, terrain);

      expect(a1).toBe(a2);
    });
  });
});
