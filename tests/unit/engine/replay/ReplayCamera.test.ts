import {
  calculateSlowMoFactor,
  followProjectile,
  getOverviewPosition,
  zoomToImpact,
} from '@engine/replay/ReplayCamera';
import { describe, expect, it } from 'vitest';
import { createCamera } from '@renderer/Camera';

describe('ReplayCamera', () => {
  it('should follow projectile position', () => {
    const cam = createCamera(800, 600);
    const moved = followProjectile(cam, { x: 600, y: 200 });
    expect(moved.x).toBeGreaterThan(400);
  });

  it('should zoom to impact', () => {
    const cam = createCamera(800, 600);
    const zoomed = zoomToImpact(cam, { x: 200, y: 300 }, 500, 1000);
    expect(zoomed.zoom).toBeGreaterThan(1);
  });

  it('should calculate slow-mo factor for kill shots', () => {
    expect(calculateSlowMoFactor(true, 0, 1000)).toBe(0.25);
    expect(calculateSlowMoFactor(false, 500, 1000)).toBe(1);
  });

  it('should return overview position', () => {
    const pos = getOverviewPosition(800, 600);
    expect(pos.x).toBe(400);
    expect(pos.y).toBe(300);
  });
});
