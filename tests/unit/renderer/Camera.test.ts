import {
  applyCameraTransform,
  createCamera,
  lerpCamera,
  setZoom,
  zoomToFit,
} from '@renderer/Camera';
import { describe, expect, it, vi } from 'vitest';

describe('Camera', () => {
  describe('createCamera()', () => {
    it('should center on world', () => {
      const cam = createCamera(800, 600);
      expect(cam.x).toBe(400);
      expect(cam.y).toBe(300);
      expect(cam.zoom).toBe(1);
    });
  });

  describe('lerpCamera()', () => {
    it('should move toward target', () => {
      const cam = createCamera(800, 600);
      const moved = lerpCamera(cam, { x: 500, y: 300 });

      expect(moved.x).toBeGreaterThan(400);
      expect(moved.x).toBeLessThan(500);
    });

    it('should respect speed parameter', () => {
      const cam = createCamera(800, 600);
      const slow = lerpCamera(cam, { x: 800, y: 300 }, 0.1);
      const fast = lerpCamera(cam, { x: 800, y: 300 }, 0.5);

      expect(fast.x).toBeGreaterThan(slow.x);
    });

    it('should preserve zoom', () => {
      const cam = setZoom(createCamera(800, 600), 1.5);
      const moved = lerpCamera(cam, { x: 500, y: 300 });
      expect(moved.zoom).toBe(1.5);
    });
  });

  describe('setZoom()', () => {
    it('should set zoom level', () => {
      const cam = setZoom(createCamera(800, 600), 1.5);
      expect(cam.zoom).toBe(1.5);
    });

    it('should clamp to minimum zoom', () => {
      const cam = setZoom(createCamera(800, 600), 0.1);
      expect(cam.zoom).toBe(0.5);
    });

    it('should clamp to maximum zoom', () => {
      const cam = setZoom(createCamera(800, 600), 5);
      expect(cam.zoom).toBe(2.0);
    });
  });

  describe('zoomToFit()', () => {
    it('should return 1 for empty points', () => {
      expect(zoomToFit([], 800, 600)).toBe(1);
    });

    it('should zoom out for widely spread points', () => {
      const points = [
        { x: 0, y: 0 },
        { x: 2000, y: 1500 },
      ];
      const zoom = zoomToFit(points, 800, 600);
      expect(zoom).toBeLessThan(1);
    });

    it('should zoom in for closely packed points', () => {
      const points = [
        { x: 390, y: 290 },
        { x: 410, y: 310 },
      ];
      const zoom = zoomToFit(points, 800, 600);
      expect(zoom).toBeGreaterThan(1);
    });
  });

  describe('applyCameraTransform()', () => {
    it('should apply translate and scale to context', () => {
      const ctx = {
        translate: vi.fn(),
        scale: vi.fn(),
      } as unknown as CanvasRenderingContext2D;

      const cam = createCamera(800, 600);
      applyCameraTransform(ctx, cam, 800, 600);

      expect(ctx.translate).toHaveBeenCalledTimes(2);
      expect(ctx.scale).toHaveBeenCalledTimes(1);
    });
  });
});
