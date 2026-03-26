import {
  consumeFuel,
  createFuelState,
  getFuelColor,
  getFuelPercentage,
  previewMoveRange,
} from '@engine/physics/FuelSystem';
import { describe, expect, it } from 'vitest';
import type { TerrainData } from '@shared/types/terrain';

function flatTerrain(): TerrainData {
  return {
    config: { width: 200, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
    heightMap: new Array(200).fill(200) as number[],
    destructionMap: new Array(200).fill(false) as boolean[],
  };
}

describe('FuelSystem', () => {
  it('should create fuel state', () => {
    const fuel = createFuelState(100);
    expect(fuel.current).toBe(100);
    expect(fuel.max).toBe(100);
  });

  it('should calculate percentage', () => {
    expect(getFuelPercentage({ current: 50, max: 100 })).toBe(50);
    expect(getFuelPercentage({ current: 0, max: 0 })).toBe(0);
  });

  it('should return color based on level', () => {
    expect(getFuelColor({ current: 80, max: 100 })).toBe('#4caf50');
    expect(getFuelColor({ current: 40, max: 100 })).toBe('#ff9800');
    expect(getFuelColor({ current: 10, max: 100 })).toBe('#f44336');
  });

  it('should consume fuel', () => {
    const result = consumeFuel({ current: 50, max: 100 }, 10);
    expect(result?.current).toBe(40);
  });

  it('should reject insufficient fuel', () => {
    expect(consumeFuel({ current: 5, max: 100 }, 10)).toBeNull();
  });

  it('should preview move range', () => {
    const range = previewMoveRange(100, { current: 20, max: 100 }, 2, flatTerrain());
    expect(range.leftRange).toBeGreaterThan(0);
    expect(range.rightRange).toBeGreaterThan(0);
  });
});
