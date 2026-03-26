import { describe, expect, it, vi } from 'vitest';
import { getTrailConfig, renderWeaponTrail } from '@renderer/weapons/WeaponTrails';

describe('WeaponTrails', () => {
  it('should return config for known weapons', () => {
    const config = getTrailConfig('nuke');
    expect(config.style).toBe('fire');
    expect(config.width).toBeGreaterThan(0);
  });

  it('should return default config for unknown weapons', () => {
    const config = getTrailConfig('nonexistent' as 'missile');
    expect(config.style).toBe('smoke');
  });

  it('should have different styles per weapon', () => {
    expect(getTrailConfig('missile').style).not.toBe(getTrailConfig('nuke').style);
  });

  it('should render without throwing', () => {
    const ctx = {
      beginPath: vi.fn(),
      moveTo: vi.fn(),
      lineTo: vi.fn(),
      stroke: vi.fn(),
      strokeStyle: '',
      lineWidth: 0,
      globalAlpha: 1,
    } as unknown as CanvasRenderingContext2D;
    const trail = [
      { x: 0, y: 0 },
      { x: 10, y: 10 },
      { x: 20, y: 15 },
    ];
    expect(() => renderWeaponTrail(ctx, trail, getTrailConfig('missile'))).not.toThrow();
  });
});
