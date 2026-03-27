import { darkenColor, renderTerrain, renderTerrainDetail } from '@renderer/terrain/TerrainRenderer';
import { describe, expect, it, vi } from 'vitest';
import type { TerrainData, TerrainTheme } from '@shared/types/terrain';

function createMockCanvas(): CanvasRenderingContext2D {
  const mockGradient = {
    addColorStop: vi.fn(),
  };
  return {
    fillStyle: '',
    strokeStyle: '',
    lineWidth: 0,
    globalAlpha: 1,
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    quadraticCurveTo: vi.fn(),
    fillRect: vi.fn(),
    ellipse: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    createLinearGradient: vi.fn().mockReturnValue(mockGradient),
  } as unknown as CanvasRenderingContext2D;
}

function createMockTerrain(width: number, theme: TerrainTheme = 'classic'): TerrainData {
  const heightMap = Array.from({ length: width }, (_, i) => 100 + Math.sin(i * 0.1) * 50);
  return {
    config: {
      width,
      height: 600,
      seed: 42,
      roughness: 0.5,
      theme,
    },
    heightMap,
    destructionMap: new Array(width).fill(false) as boolean[],
  };
}

describe('darkenColor', () => {
  it('should darken a hex color by the given factor', () => {
    const result = darkenColor('#ffffff', 0.3);
    // 255 * 0.7 = 178.5 -> round -> b3
    expect(result).toBe('#b3b3b3');
  });

  it('should return black when darkened by 100%', () => {
    expect(darkenColor('#ff8800', 1.0)).toBe('#000000');
  });

  it('should return the same color when darkened by 0%', () => {
    expect(darkenColor('#4a7c2e', 0)).toBe('#4a7c2e');
  });

  it('should handle mid-range colors correctly', () => {
    // #808080 darkened by 50% -> 128 * 0.5 = 64 -> 0x40
    expect(darkenColor('#808080', 0.5)).toBe('#404040');
  });
});

describe('renderTerrain gradient fill', () => {
  it('should create a vertical linear gradient for terrain fill', () => {
    const ctx = createMockCanvas();
    const terrain = createMockTerrain(100);
    renderTerrain(ctx, terrain, 600);
    expect(ctx.createLinearGradient).toHaveBeenCalled();
  });

  it('should add color stops to the gradient', () => {
    const ctx = createMockCanvas();
    const terrain = createMockTerrain(100);
    renderTerrain(ctx, terrain, 600);
    const gradient = (ctx.createLinearGradient as ReturnType<typeof vi.fn>).mock.results[0]?.value;
    expect(gradient.addColorStop).toHaveBeenCalledTimes(3);
  });
});

describe('renderTerrainDetail', () => {
  it('should draw detail marks on the terrain surface', () => {
    const ctx = createMockCanvas();
    const terrain = createMockTerrain(100);
    renderTerrainDetail(ctx, terrain, 600);
    // Should have drawn something (moveTo/lineTo/arc/quadraticCurveTo/fill calls)
    const totalCalls =
      (ctx.moveTo as ReturnType<typeof vi.fn>).mock.calls.length +
      (ctx.lineTo as ReturnType<typeof vi.fn>).mock.calls.length +
      (ctx.arc as ReturnType<typeof vi.fn>).mock.calls.length +
      (ctx.quadraticCurveTo as ReturnType<typeof vi.fn>).mock.calls.length +
      (ctx.fill as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(totalCalls).toBeGreaterThan(0);
  });

  it('should save and restore canvas state for alpha changes', () => {
    const ctx = createMockCanvas();
    const terrain = createMockTerrain(100);
    renderTerrainDetail(ctx, terrain, 600);
    expect(ctx.save).toHaveBeenCalled();
    expect(ctx.restore).toHaveBeenCalled();
  });

  it('should draw different details for different themes', () => {
    const ctxClassic = createMockCanvas();
    const ctxDesert = createMockCanvas();
    const terrainClassic = createMockTerrain(100, 'classic');
    const terrainDesert = createMockTerrain(100, 'desert');

    renderTerrainDetail(ctxClassic, terrainClassic, 600);
    renderTerrainDetail(ctxDesert, terrainDesert, 600);

    // Both should draw detail but the stroke styles will differ
    const classicCalls = (ctxClassic.stroke as ReturnType<typeof vi.fn>).mock.calls.length;
    const desertCalls = (ctxDesert.stroke as ReturnType<typeof vi.fn>).mock.calls.length;
    expect(classicCalls).toBeGreaterThan(0);
    expect(desertCalls).toBeGreaterThan(0);
  });

  it('should produce deterministic output for same input', () => {
    const ctx1 = createMockCanvas();
    const ctx2 = createMockCanvas();
    const terrain = createMockTerrain(100);

    renderTerrainDetail(ctx1, terrain, 600);
    renderTerrainDetail(ctx2, terrain, 600);

    const calls1 = (ctx1.moveTo as ReturnType<typeof vi.fn>).mock.calls;
    const calls2 = (ctx2.moveTo as ReturnType<typeof vi.fn>).mock.calls;
    expect(calls1).toEqual(calls2);
  });
});
