import { describe, expect, it, vi } from 'vitest';
import {
  getTerrainColors,
  renderCraterShadows,
  renderTerrain,
} from '@renderer/terrain/TerrainRenderer';
import type { TerrainData } from '@shared/types/terrain';

function createMockCanvas(): CanvasRenderingContext2D {
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
  } as unknown as CanvasRenderingContext2D;
}

function createMockTerrain(width: number): TerrainData {
  const heightMap = Array.from({ length: width }, (_, i) => 100 + Math.sin(i * 0.1) * 50);
  return {
    config: {
      width,
      height: 600,
      seed: 42,
      roughness: 0.5,
      theme: 'classic',
    },
    heightMap,
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

describe('TerrainRenderer', () => {
  describe('getTerrainColors', () => {
    it('should return colors for classic theme', () => {
      const colors = getTerrainColors('classic');
      expect(colors.fill).toBeDefined();
      expect(colors.stroke).toBeDefined();
      expect(colors.highlight).toBeDefined();
    });

    it('should return different colors for different themes', () => {
      const classic = getTerrainColors('classic');
      const desert = getTerrainColors('desert');
      expect(classic.fill).not.toBe(desert.fill);
    });

    it('should return valid hex colors for all themes', () => {
      const themes = ['classic', 'desert', 'arctic', 'volcanic', 'lunar'] as const;
      for (const theme of themes) {
        const colors = getTerrainColors(theme);
        expect(colors.fill).toMatch(/^#[0-9a-f]{6}$/);
      }
    });
  });

  describe('renderTerrain', () => {
    it('should draw terrain path on canvas', () => {
      const ctx = createMockCanvas();
      const terrain = createMockTerrain(100);
      renderTerrain(ctx, terrain, 600);
      expect(ctx.beginPath).toHaveBeenCalled();
      expect(ctx.moveTo).toHaveBeenCalled();
      expect(ctx.lineTo).toHaveBeenCalled();
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('should close the path to fill terrain', () => {
      const ctx = createMockCanvas();
      const terrain = createMockTerrain(50);
      renderTerrain(ctx, terrain, 600);
      expect(ctx.closePath).toHaveBeenCalled();
    });

    it('should draw terrain outline stroke', () => {
      const ctx = createMockCanvas();
      const terrain = createMockTerrain(50);
      renderTerrain(ctx, terrain, 600);
      expect(ctx.stroke).toHaveBeenCalled();
    });
  });

  describe('renderCraterShadows', () => {
    it('should render shadows over destroyed terrain', () => {
      const ctx = createMockCanvas();
      const terrain = createMockTerrain(20);
      // Mark some terrain as destroyed
      const destructionMap = [...terrain.destructionMap];
      destructionMap[5] = true;
      destructionMap[6] = true;
      destructionMap[7] = true;
      const deformed = { ...terrain, destructionMap };

      renderCraterShadows(ctx, deformed, 600);
      expect(ctx.fill).toHaveBeenCalled();
    });

    it('should not render when no terrain is destroyed', () => {
      const ctx = createMockCanvas();
      const terrain = createMockTerrain(20);
      renderCraterShadows(ctx, terrain, 600);
      expect(ctx.fill).not.toHaveBeenCalled();
    });
  });
});
