import {
  addVectors,
  createVector,
  normalizeVector,
  scaleVector,
  vectorMagnitude,
} from '@shared/types/geometry';
import { describe, expect, it } from 'vitest';

describe('Vector2D operations', () => {
  describe('createVector', () => {
    it('should create a vector with given coordinates', () => {
      const v = createVector(3, 4);
      expect(v.x).toBe(3);
      expect(v.y).toBe(4);
    });
  });

  describe('addVectors', () => {
    it('should add two vectors component-wise', () => {
      const result = addVectors({ x: 1, y: 2 }, { x: 3, y: 4 });
      expect(result).toEqual({ x: 4, y: 6 });
    });

    it('should handle negative values', () => {
      const result = addVectors({ x: 5, y: 3 }, { x: -2, y: -1 });
      expect(result).toEqual({ x: 3, y: 2 });
    });
  });

  describe('scaleVector', () => {
    it('should scale a vector by a scalar', () => {
      const result = scaleVector({ x: 2, y: 3 }, 2);
      expect(result).toEqual({ x: 4, y: 6 });
    });

    it('should handle zero scalar', () => {
      const result = scaleVector({ x: 5, y: 10 }, 0);
      expect(result).toEqual({ x: 0, y: 0 });
    });
  });

  describe('vectorMagnitude', () => {
    it('should calculate magnitude of 3-4-5 triangle', () => {
      expect(vectorMagnitude({ x: 3, y: 4 })).toBe(5);
    });

    it('should return 0 for zero vector', () => {
      expect(vectorMagnitude({ x: 0, y: 0 })).toBe(0);
    });
  });

  describe('normalizeVector', () => {
    it('should normalize to unit length', () => {
      const result = normalizeVector({ x: 3, y: 4 });
      expect(result.x).toBeCloseTo(0.6);
      expect(result.y).toBeCloseTo(0.8);
    });

    it('should return zero vector for zero input', () => {
      const result = normalizeVector({ x: 0, y: 0 });
      expect(result).toEqual({ x: 0, y: 0 });
    });
  });
});
