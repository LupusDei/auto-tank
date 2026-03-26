import {
  calculateCrossfade,
  calculateDistanceAttenuation,
  calculatePan,
} from '@/audio/PositionalAudio';
import { describe, expect, it } from 'vitest';

describe('PositionalAudio', () => {
  describe('calculatePan()', () => {
    it('should return -1 for far left', () => {
      expect(calculatePan({ x: 0, y: 0 }, 800)).toBeCloseTo(-1);
    });

    it('should return 0 for center', () => {
      expect(calculatePan({ x: 400, y: 0 }, 800)).toBeCloseTo(0);
    });

    it('should return 1 for far right', () => {
      expect(calculatePan({ x: 800, y: 0 }, 800)).toBeCloseTo(1);
    });

    it('should clamp to [-1, 1]', () => {
      expect(calculatePan({ x: -100, y: 0 }, 800)).toBe(-1);
      expect(calculatePan({ x: 1000, y: 0 }, 800)).toBe(1);
    });
  });

  describe('calculateDistanceAttenuation()', () => {
    it('should return 1 at zero distance', () => {
      expect(calculateDistanceAttenuation({ x: 100, y: 100 }, { x: 100, y: 100 }, 500)).toBe(1);
    });

    it('should return 0 at max distance', () => {
      expect(calculateDistanceAttenuation({ x: 600, y: 100 }, { x: 100, y: 100 }, 500)).toBe(0);
    });

    it('should return 0.5 at half distance', () => {
      expect(calculateDistanceAttenuation({ x: 350, y: 100 }, { x: 100, y: 100 }, 500)).toBeCloseTo(
        0.5,
      );
    });
  });

  describe('calculateCrossfade()', () => {
    it('should return full out volume at start', () => {
      const { outVolume, inVolume } = calculateCrossfade(0);
      expect(outVolume).toBe(1);
      expect(inVolume).toBe(0);
    });

    it('should return full in volume at end', () => {
      const { outVolume, inVolume } = calculateCrossfade(1);
      expect(outVolume).toBe(0);
      expect(inVolume).toBe(1);
    });

    it('should return equal volumes at midpoint', () => {
      const { outVolume, inVolume } = calculateCrossfade(0.5);
      expect(outVolume).toBeCloseTo(0.5);
      expect(inVolume).toBeCloseTo(0.5);
    });

    it('should clamp progress to [0, 1]', () => {
      expect(calculateCrossfade(-1).outVolume).toBe(1);
      expect(calculateCrossfade(2).inVolume).toBe(1);
    });
  });
});
