import {
  createDefaultWindConfig,
  createEnvironmentState,
  createWindState,
  type EnvironmentState,
  type WindConfig,
  type WindState,
} from '@engine/environment/types';
import { describe, expect, it } from 'vitest';

describe('Wind types', () => {
  describe('WindState', () => {
    it('should create a wind state with speed and direction', () => {
      const wind: WindState = createWindState(5, { x: 1, y: 0 });
      expect(wind.speed).toBe(5);
      expect(wind.direction).toEqual({ x: 1, y: 0 });
      expect(wind.strength).toBe(5);
    });

    it('should calculate strength as absolute speed', () => {
      const wind = createWindState(-3, { x: -1, y: 0 });
      expect(wind.strength).toBe(3);
    });

    it('should create zero wind state', () => {
      const wind = createWindState(0, { x: 0, y: 0 });
      expect(wind.speed).toBe(0);
      expect(wind.strength).toBe(0);
    });

    it('should be immutable', () => {
      const wind = createWindState(5, { x: 1, y: 0 });
      expect(Object.isFrozen(wind)).toBe(true);
    });
  });

  describe('WindConfig', () => {
    it('should create a default config with valid ranges', () => {
      const config: WindConfig = createDefaultWindConfig();
      expect(config.minStrength).toBe(0);
      expect(config.maxStrength).toBe(30);
      expect(config.variability).toBeGreaterThan(0);
      expect(config.variability).toBeLessThanOrEqual(1);
      expect(config.changePerTurn).toBe(true);
    });

    it('should have minStrength <= maxStrength', () => {
      const config = createDefaultWindConfig();
      expect(config.minStrength).toBeLessThanOrEqual(config.maxStrength);
    });
  });

  describe('EnvironmentState', () => {
    it('should wrap wind state', () => {
      const wind = createWindState(5, { x: 1, y: 0 });
      const env: EnvironmentState = createEnvironmentState(wind);
      expect(env.wind).toBe(wind);
    });

    it('should default to zero wind when not provided', () => {
      const env = createEnvironmentState();
      expect(env.wind.speed).toBe(0);
      expect(env.wind.strength).toBe(0);
    });

    it('should be immutable', () => {
      const env = createEnvironmentState();
      expect(Object.isFrozen(env)).toBe(true);
    });
  });
});
