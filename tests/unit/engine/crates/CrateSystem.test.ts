import {
  createCrate,
  generateCrateContent,
  shouldSpawnCrate,
  updateCrate,
} from '@engine/crates/CrateSystem';
import { describe, expect, it } from 'vitest';

import type { CrateContent } from '@engine/crates/CrateSystem';
import { createPRNG } from '@shared/prng';
import type { TerrainData } from '@shared/types/terrain';

function makeTerrain(width: number, height: number): TerrainData {
  const heightMap = new Array(width).fill(height * 0.5) as number[];
  const destructionMap = new Array(width).fill(false) as boolean[];
  return {
    config: { width, height, seed: 1, roughness: 0.5, theme: 'classic' },
    heightMap,
    destructionMap,
  };
}

describe('CrateSystem', () => {
  describe('shouldSpawnCrate', () => {
    it('should return true when random value is below chance threshold', () => {
      // PRNG(42) first value is deterministic; use a fixed function
      const alwaysLow = (): number => 0.1;
      expect(shouldSpawnCrate(alwaysLow, 0.3)).toBe(true);
    });

    it('should return false when random value is above chance threshold', () => {
      const alwaysHigh = (): number => 0.9;
      expect(shouldSpawnCrate(alwaysHigh, 0.3)).toBe(false);
    });

    it('should use 30% default chance', () => {
      const justBelow = (): number => 0.29;
      const justAbove = (): number => 0.31;
      expect(shouldSpawnCrate(justBelow)).toBe(true);
      expect(shouldSpawnCrate(justAbove)).toBe(false);
    });
  });

  describe('generateCrateContent', () => {
    it('should generate deterministic content for the same PRNG seed', () => {
      const rng1 = createPRNG(42);
      const rng2 = createPRNG(42);
      const content1 = generateCrateContent(rng1);
      const content2 = generateCrateContent(rng2);
      expect(content1).toEqual(content2);
    });

    it('should produce all three content types across many seeds', () => {
      const types = new Set<CrateContent['type']>();
      for (let seed = 0; seed < 200; seed++) {
        const rng = createPRNG(seed);
        const content = generateCrateContent(rng);
        types.add(content.type);
      }
      expect(types.has('weapon')).toBe(true);
      expect(types.has('health')).toBe(true);
      expect(types.has('money')).toBe(true);
    });

    it('should produce valid values for each content type', () => {
      for (let seed = 0; seed < 100; seed++) {
        const rng = createPRNG(seed);
        const content = generateCrateContent(rng);
        switch (content.type) {
          case 'weapon':
            expect(content.quantity).toBeGreaterThanOrEqual(1);
            expect(typeof content.weaponType).toBe('string');
            break;
          case 'health':
            expect(content.amount).toBe(25);
            break;
          case 'money':
            expect(content.amount).toBe(3000);
            break;
        }
      }
    });
  });

  describe('createCrate', () => {
    it('should create a crate in falling state above canvas', () => {
      const rng = createPRNG(99);
      const crate = createCrate(400, 200, 600, rng);
      expect(crate.state).toBe('falling');
      expect(crate.position.y).toBeLessThan(0);
      expect(crate.position.x).toBeGreaterThanOrEqual(0);
      expect(crate.position.x).toBeLessThanOrEqual(600);
      expect(crate.fallSpeed).toBe(40);
      expect(crate.id).toMatch(/^crate-/);
    });
  });

  describe('updateCrate', () => {
    it('should move crate downward while falling', () => {
      const rng = createPRNG(1);
      const terrain = makeTerrain(800, 600);
      const crate = createCrate(400, 300, 800, rng);
      const updated = updateCrate(crate, terrain, 800, 1.0);
      expect(updated.position.y).toBeGreaterThan(crate.position.y);
      expect(updated.state).toBe('falling');
    });

    it('should land when reaching terrain surface', () => {
      const rng = createPRNG(1);
      const terrain = makeTerrain(800, 600);
      // Terrain height is 300 (0.5 * 600). Create crate and simulate many steps.
      let crate = createCrate(400, 300, 800, rng);
      for (let i = 0; i < 500; i++) {
        crate = updateCrate(crate, terrain, 800, 0.1);
        if (crate.state === 'landed') break;
      }
      expect(crate.state).toBe('landed');
    });

    it('should not move a landed crate', () => {
      const rng = createPRNG(1);
      const terrain = makeTerrain(800, 600);
      let crate = createCrate(400, 300, 800, rng);
      // Force to landed
      for (let i = 0; i < 500; i++) {
        crate = updateCrate(crate, terrain, 800, 0.1);
        if (crate.state === 'landed') break;
      }
      const landedY = crate.position.y;
      const afterUpdate = updateCrate(crate, terrain, 800, 1.0);
      expect(afterUpdate.position.y).toBe(landedY);
    });
  });
});
