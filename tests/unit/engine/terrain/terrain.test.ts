import { deformTerrain, generateTerrain, getHeightAt } from '@engine/terrain';
import { describe, expect, it } from 'vitest';
import type { TerrainConfig } from '@shared/types/terrain';

const baseConfig: TerrainConfig = {
  width: 200,
  height: 600,
  seed: 42,
  roughness: 0.5,
  theme: 'classic',
};

describe('generateTerrain', () => {
  it('produces a heightMap with length equal to config.width', () => {
    const terrain = generateTerrain(baseConfig);
    expect(terrain.heightMap).toHaveLength(baseConfig.width);
    expect(terrain.destructionMap).toHaveLength(baseConfig.width);
  });

  it('produces the same terrain for the same seed (deterministic)', () => {
    const a = generateTerrain(baseConfig);
    const b = generateTerrain(baseConfig);
    expect(a.heightMap).toEqual(b.heightMap);
  });

  it('produces different terrain for different seeds', () => {
    const a = generateTerrain(baseConfig);
    const b = generateTerrain({ ...baseConfig, seed: 999 });
    expect(a.heightMap).not.toEqual(b.heightMap);
  });

  it('keeps all heights between 20% and 80% of config.height', () => {
    const terrain = generateTerrain(baseConfig);
    const minH = baseConfig.height * 0.2;
    const maxH = baseConfig.height * 0.8;

    for (const h of terrain.heightMap) {
      expect(h).toBeGreaterThanOrEqual(minH);
      expect(h).toBeLessThanOrEqual(maxH);
    }
  });
});

describe('deformTerrain', () => {
  it('creates a crater — heights at center are lower than original', () => {
    const terrain = generateTerrain(baseConfig);
    const centerX = 100;
    const radius = 20;
    const depth = 50;
    const deformed = deformTerrain(terrain, centerX, radius, depth);

    // Center should be lowered by the full depth
    expect(deformed.heightMap[centerX] ?? 0).toBeLessThan(terrain.heightMap[centerX] ?? 0);
    // The reduction at center should be approximately equal to depth
    expect((terrain.heightMap[centerX] ?? 0) - (deformed.heightMap[centerX] ?? 0)).toBeCloseTo(
      depth,
      0,
    );

    // Points outside the radius should be unchanged
    expect(deformed.heightMap[0]).toBe(terrain.heightMap[0]);
  });

  it('clamps deformed heights to zero (never negative)', () => {
    const terrain = generateTerrain(baseConfig);
    // Use an extreme depth to force potential negative values
    const deformed = deformTerrain(terrain, 100, 50, 99999);

    for (const h of deformed.heightMap) {
      expect(h).toBeGreaterThanOrEqual(0);
    }
  });

  it('marks destruction map within the crater radius', () => {
    const terrain = generateTerrain(baseConfig);
    const deformed = deformTerrain(terrain, 100, 10, 30);

    expect(deformed.destructionMap[100]).toBe(true);
    expect(deformed.destructionMap[0]).toBe(false);
  });
});

describe('getHeightAt', () => {
  it('returns a valid height for an integer x', () => {
    const terrain = generateTerrain(baseConfig);
    const h = getHeightAt(terrain, 50);
    expect(h).toBe(terrain.heightMap[50]);
  });

  it('interpolates between two points for a fractional x', () => {
    const terrain = generateTerrain(baseConfig);
    const h = getHeightAt(terrain, 50.5);
    const expected = ((terrain.heightMap[50] ?? 0) + (terrain.heightMap[51] ?? 0)) / 2;
    expect(h).toBeCloseTo(expected, 10);
  });

  it('clamps at the lower boundary (x < 0)', () => {
    const terrain = generateTerrain(baseConfig);
    const h = getHeightAt(terrain, -10);
    expect(h).toBe(terrain.heightMap[0]);
  });

  it('clamps at the upper boundary (x >= width)', () => {
    const terrain = generateTerrain(baseConfig);
    const h = getHeightAt(terrain, baseConfig.width + 100);
    expect(h).toBe(terrain.heightMap[baseConfig.width - 1]);
  });
});
