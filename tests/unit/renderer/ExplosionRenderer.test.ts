import { calculateScreenShake, createExplosionEffect } from '@renderer/effects/ExplosionRenderer';
import { describe, expect, it, vi } from 'vitest';

describe('ExplosionRenderer', () => {
  describe('createExplosionEffect()', () => {
    it('should create an effect with correct duration', () => {
      const effect = createExplosionEffect({
        position: { x: 100, y: 200 },
        radius: 30,
        duration: 500,
      });

      expect(effect.id).toContain('explosion');
      expect(effect.duration).toBe(500);
    });

    it('should report incomplete before duration', () => {
      const effect = createExplosionEffect({
        position: { x: 100, y: 200 },
        radius: 30,
        duration: 1000,
      });

      expect(effect.isComplete(500)).toBe(false);
    });

    it('should report complete after duration', () => {
      const effect = createExplosionEffect({
        position: { x: 100, y: 200 },
        radius: 30,
        duration: 1000,
      });

      expect(effect.isComplete(1000)).toBe(true);
      expect(effect.isComplete(1500)).toBe(true);
    });

    it('should render without throwing', () => {
      const ctx = {
        beginPath: vi.fn(),
        arc: vi.fn(),
        stroke: vi.fn(),
        fill: vi.fn(),
        strokeStyle: '',
        fillStyle: '',
        lineWidth: 0,
        globalAlpha: 1,
      } as unknown as CanvasRenderingContext2D;

      const effect = createExplosionEffect({
        position: { x: 100, y: 200 },
        radius: 30,
      });

      expect(() => effect.render(ctx, 300)).not.toThrow();
    });
  });

  describe('calculateScreenShake()', () => {
    it('should return zero offset after duration', () => {
      const shake = calculateScreenShake(10, 1000, 1000);
      expect(shake.x).toBe(0);
      expect(shake.y).toBe(0);
    });

    it('should return non-zero offset during shake', () => {
      // Run multiple times since it's random — at least some should be non-zero
      let anyNonZero = false;
      for (let i = 0; i < 20; i++) {
        const shake = calculateScreenShake(20, 100, 500);
        if (shake.x !== 0 || shake.y !== 0) anyNonZero = true;
      }
      expect(anyNonZero).toBe(true);
    });

    it('should decay over time', () => {
      // Intensity should be lower near the end
      let maxEarly = 0;
      let maxLate = 0;
      for (let i = 0; i < 50; i++) {
        const early = calculateScreenShake(20, 50, 1000);
        const late = calculateScreenShake(20, 900, 1000);
        maxEarly = Math.max(maxEarly, Math.abs(early.x) + Math.abs(early.y));
        maxLate = Math.max(maxLate, Math.abs(late.x) + Math.abs(late.y));
      }
      expect(maxEarly).toBeGreaterThan(maxLate);
    });
  });
});
