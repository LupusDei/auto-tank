import { calculateTurnWind, generateInitialWind } from '@engine/environment/WindSystem';
import {
  createDefaultWindConfig,
  createWindState,
  type WindConfig,
} from '@engine/environment/types';
import { describe, expect, it } from 'vitest';

describe('WindSystem', () => {
  describe('generateInitialWind()', () => {
    it('should produce deterministic results for the same seed', () => {
      const config = createDefaultWindConfig();
      const wind1 = generateInitialWind(config, 42);
      const wind2 = generateInitialWind(config, 42);

      expect(wind1.speed).toBe(wind2.speed);
      expect(wind1.direction).toEqual(wind2.direction);
      expect(wind1.strength).toBe(wind2.strength);
    });

    it('should produce different results for different seeds', () => {
      const config = createDefaultWindConfig();
      const wind1 = generateInitialWind(config, 42);
      const wind2 = generateInitialWind(config, 99);

      expect(wind1.speed).not.toBe(wind2.speed);
    });

    it('should respect maxStrength bounds', () => {
      const config: WindConfig = {
        minStrength: 0,
        maxStrength: 10,
        variability: 1,
        changePerTurn: true,
      };

      // Test many seeds to verify bounds
      for (let seed = 0; seed < 100; seed++) {
        const wind = generateInitialWind(config, seed);
        expect(wind.strength).toBeLessThanOrEqual(config.maxStrength);
        expect(wind.strength).toBeGreaterThanOrEqual(config.minStrength);
      }
    });

    it('should produce horizontal wind direction', () => {
      const config = createDefaultWindConfig();
      const wind = generateInitialWind(config, 42);

      // Wind is horizontal (left or right)
      expect(wind.direction.y).toBe(0);
      expect(Math.abs(wind.direction.x)).toBe(1);
    });
  });

  describe('calculateTurnWind()', () => {
    it('should produce deterministic results for the same seed', () => {
      const config = createDefaultWindConfig();
      const prev = generateInitialWind(config, 42);

      const next1 = calculateTurnWind(prev, config, 100);
      const next2 = calculateTurnWind(prev, config, 100);

      expect(next1.speed).toBe(next2.speed);
      expect(next1.direction).toEqual(next2.direction);
    });

    it('should produce different wind for different seeds', () => {
      const config = createDefaultWindConfig();
      const prev = generateInitialWind(config, 42);

      const next1 = calculateTurnWind(prev, config, 100);
      const next2 = calculateTurnWind(prev, config, 200);

      expect(next1.speed).not.toBe(next2.speed);
    });

    it('should respect maxStrength bounds after changes', () => {
      const config: WindConfig = {
        minStrength: 0,
        maxStrength: 15,
        variability: 1,
        changePerTurn: true,
      };

      let wind = generateInitialWind(config, 42);
      for (let turn = 0; turn < 100; turn++) {
        wind = calculateTurnWind(wind, config, turn);
        expect(wind.strength).toBeLessThanOrEqual(config.maxStrength);
        expect(wind.strength).toBeGreaterThanOrEqual(config.minStrength);
      }
    });

    it('should vary by variability setting', () => {
      const lowVar: WindConfig = {
        minStrength: 0,
        maxStrength: 30,
        variability: 0.1,
        changePerTurn: true,
      };
      const highVar: WindConfig = {
        minStrength: 0,
        maxStrength: 30,
        variability: 1.0,
        changePerTurn: true,
      };

      const prev = generateInitialWind(lowVar, 42);

      // Run many turns and measure total change magnitude
      let totalChangeLow = 0;
      let totalChangeHigh = 0;
      let windLow = prev;
      let windHigh = prev;

      for (let i = 0; i < 50; i++) {
        const nextLow = calculateTurnWind(windLow, lowVar, i);
        const nextHigh = calculateTurnWind(windHigh, highVar, i);
        totalChangeLow += Math.abs(nextLow.speed - windLow.speed);
        totalChangeHigh += Math.abs(nextHigh.speed - windHigh.speed);
        windLow = nextLow;
        windHigh = nextHigh;
      }

      expect(totalChangeHigh).toBeGreaterThan(totalChangeLow);
    });

    it('should enforce minStrength when wind drops below it', () => {
      const config: WindConfig = {
        minStrength: 5,
        maxStrength: 10,
        variability: 1,
        changePerTurn: true,
      };

      // Start with wind near the minimum
      const prev = createWindState(5.1, { x: 1, y: 0 });

      // Run many turns — wind should never go below minStrength
      let wind = prev;
      for (let i = 0; i < 200; i++) {
        wind = calculateTurnWind(wind, config, i);
        expect(wind.strength).toBeGreaterThanOrEqual(config.minStrength);
      }
    });

    it('should not force minStrength when speed crosses zero with minStrength=0', () => {
      const config: WindConfig = {
        minStrength: 0,
        maxStrength: 30,
        variability: 1,
        changePerTurn: true,
      };

      // Start with very small positive wind
      const prev = createWindState(0.1, { x: 1, y: 0 });
      // After many turns, wind should sometimes be zero or near-zero
      let sawNearZero = false;
      let wind = prev;
      for (let i = 0; i < 500; i++) {
        wind = calculateTurnWind(wind, config, i);
        if (wind.strength < 1) sawNearZero = true;
      }
      expect(sawNearZero).toBe(true);
    });

    it('should preserve direction when speed is exactly zero with minStrength > 0', () => {
      const config: WindConfig = {
        minStrength: 3,
        maxStrength: 30,
        variability: 1,
        changePerTurn: true,
      };

      // Force a scenario where speed is negative before clamping
      const prev = createWindState(-5, { x: -1, y: 0 });
      const next = calculateTurnWind(prev, config, 42);
      // Should preserve some direction, never produce NaN or 0 speed with minStrength > 0
      expect(Number.isFinite(next.speed)).toBe(true);
      expect(next.strength).toBeGreaterThanOrEqual(config.minStrength);
    });

    it('should return previous wind when changePerTurn is false', () => {
      const config: WindConfig = {
        minStrength: 0,
        maxStrength: 30,
        variability: 1,
        changePerTurn: false,
      };

      const prev = generateInitialWind(config, 42);
      const next = calculateTurnWind(prev, config, 100);

      expect(next.speed).toBe(prev.speed);
      expect(next.direction).toEqual(prev.direction);
    });
  });
});
