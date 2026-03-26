import { describe, expect, it, vi } from 'vitest';
import { getExplosionConfig, renderScreenFlash } from '@renderer/weapons/ExplosionVariety';

describe('ExplosionVariety', () => {
  it('should return config for nuke', () => {
    const config = getExplosionConfig('nuke');
    expect(config.style).toBe('nuclear');
    expect(config.shakeIntensity).toBe(20);
    expect(config.slowMoDuration).toBeGreaterThan(0);
  });

  it('should have higher intensity for legendary weapons', () => {
    const nuke = getExplosionConfig('nuke');
    const baby = getExplosionConfig('baby-missile');
    expect(nuke.shakeIntensity).toBeGreaterThan(baby.shakeIntensity);
    expect(nuke.particleCount).toBeGreaterThan(baby.particleCount);
  });

  it('should render screen flash', () => {
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      globalAlpha: 1,
      fillStyle: '',
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    renderScreenFlash(ctx, 800, 600, 0.5);
    expect(ctx.fillRect).toHaveBeenCalledWith(0, 0, 800, 600);
  });

  it('should not render flash at 0 opacity', () => {
    const ctx = {
      save: vi.fn(),
      restore: vi.fn(),
      globalAlpha: 1,
      fillStyle: '',
      fillRect: vi.fn(),
    } as unknown as CanvasRenderingContext2D;
    renderScreenFlash(ctx, 800, 600, 0);
    expect(ctx.fillRect).not.toHaveBeenCalled();
  });
});
