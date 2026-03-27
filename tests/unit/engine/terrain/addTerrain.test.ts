import { describe, expect, it } from 'vitest';
import { addTerrain } from '@engine/terrain';
import type { TerrainData } from '@shared/types/terrain';

function createFlatTerrain(width: number, terrainHeight: number): TerrainData {
  return {
    config: { width, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap: new Array(width).fill(terrainHeight) as number[],
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

describe('addTerrain', () => {
  it('raises height at the center', () => {
    const terrain = createFlatTerrain(500, 200);
    const result = addTerrain(terrain, 250, 30, 40);

    const originalH = terrain.heightMap[250] ?? 0;
    const newH = result.heightMap[250] ?? 0;
    expect(newH).toBeGreaterThan(originalH);
    // At center, cosine factor = 1, so height should increase by full amount
    expect(newH).toBeCloseTo(200 + 40);
  });

  it('applies cosine falloff away from center', () => {
    const terrain = createFlatTerrain(500, 200);
    const result = addTerrain(terrain, 250, 30, 40);

    const centerH = result.heightMap[250] ?? 0;
    const edgeH = result.heightMap[265] ?? 0; // halfway to edge

    expect(edgeH).toBeGreaterThan(200); // still raised
    expect(edgeH).toBeLessThan(centerH); // but less than center
  });

  it('does not modify terrain outside radius', () => {
    const terrain = createFlatTerrain(500, 200);
    const result = addTerrain(terrain, 250, 30, 40);

    // Points outside radius should be unchanged
    expect(result.heightMap[0]).toBe(200);
    expect(result.heightMap[499]).toBe(200);
  });

  it('does not exceed config.height', () => {
    const terrain = createFlatTerrain(500, 500);
    const result = addTerrain(terrain, 250, 30, 200);

    // 500 + 200 = 700, but config.height = 600
    const centerH = result.heightMap[250] ?? 0;
    expect(centerH).toBeLessThanOrEqual(600);
  });

  it('does not mutate the original terrain', () => {
    const terrain = createFlatTerrain(500, 200);
    const originalH = terrain.heightMap[250];

    addTerrain(terrain, 250, 30, 40);

    expect(terrain.heightMap[250]).toBe(originalH);
  });

  it('marks destructionMap as true within radius', () => {
    const terrain = createFlatTerrain(500, 200);
    const result = addTerrain(terrain, 250, 30, 40);

    expect(result.destructionMap[250]).toBe(true);
    expect(result.destructionMap[0]).toBe(false); // outside radius
  });
});
