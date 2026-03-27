import {
  bounceGrenade,
  createGrenadeState,
  handleGrenadeTerrain,
  updateGrenade,
} from '@engine/physics/GrenadeBehavior';
import { describe, expect, it } from 'vitest';

describe('GrenadeBehavior', () => {
  describe('createGrenadeState()', () => {
    it('should create default state with 3-second fuse', () => {
      const state = createGrenadeState();
      expect(state.fuseTimer).toBe(3);
      expect(state.bouncesLeft).toBe(3);
      expect(state.restitution).toBe(0.6);
    });

    it('should accept custom fuse timer', () => {
      const state = createGrenadeState(5);
      expect(state.fuseTimer).toBe(5);
    });
  });

  describe('updateGrenade()', () => {
    it('should decrement fuse timer by dt', () => {
      const state = createGrenadeState();
      const result = updateGrenade(state, 1);
      expect(result.state.fuseTimer).toBe(2);
      expect(result.shouldExplode).toBe(false);
    });

    it('should explode when fuse reaches zero', () => {
      const state = createGrenadeState(1);
      const result = updateGrenade(state, 1);
      expect(result.state.fuseTimer).toBe(0);
      expect(result.shouldExplode).toBe(true);
    });

    it('should explode when fuse goes below zero', () => {
      const state = createGrenadeState(0.5);
      const result = updateGrenade(state, 1);
      expect(result.state.fuseTimer).toBe(0);
      expect(result.shouldExplode).toBe(true);
    });
  });

  describe('bounceGrenade()', () => {
    it('should reflect velocity off a flat surface normal', () => {
      // Falling straight down onto flat ground (normal = {0, -1})
      const velocity = { x: 0, y: 100 };
      const normal = { x: 0, y: -1 };
      const result = bounceGrenade(velocity, normal, 0.6);

      expect(result.x).toBeCloseTo(0);
      expect(result.y).toBeCloseTo(-60); // reflected and scaled by 0.6
    });

    it('should reduce velocity by restitution factor', () => {
      const velocity = { x: 50, y: 100 };
      const normal = { x: 0, y: -1 };
      const result = bounceGrenade(velocity, normal, 0.6);

      // Only y is reflected; x stays same direction but scaled
      expect(result.x).toBeCloseTo(30); // 50 * 0.6
      expect(result.y).toBeCloseTo(-60); // -100 * 0.6
    });

    it('should handle angled surface normal', () => {
      const velocity = { x: 100, y: 0 };
      // Normal pointing left (perpendicular to a vertical wall)
      const normal = { x: -1, y: 0 };
      const result = bounceGrenade(velocity, normal, 1.0);

      expect(result.x).toBeCloseTo(-100);
      expect(result.y).toBeCloseTo(0);
    });
  });

  describe('handleGrenadeTerrain()', () => {
    it('should bounce when bounces remain', () => {
      const state = createGrenadeState();
      const velocity = { x: 50, y: 100 };
      const normal = { x: 0, y: -1 };

      const result = handleGrenadeTerrain(state, velocity, normal);

      expect(result.shouldExplode).toBe(false);
      expect(result.state.bouncesLeft).toBe(2);
      expect(result.velocity.y).toBeLessThan(0); // bounced upward
    });

    it('should explode when no bounces remain', () => {
      const state = { ...createGrenadeState(), bouncesLeft: 0 };
      const velocity = { x: 50, y: 100 };
      const normal = { x: 0, y: -1 };

      const result = handleGrenadeTerrain(state, velocity, normal);

      expect(result.shouldExplode).toBe(true);
    });

    it('should decrement bounce count on each bounce', () => {
      const state = createGrenadeState(); // 3 bounces
      const velocity = { x: 50, y: 100 };
      const normal = { x: 0, y: -1 };

      const r1 = handleGrenadeTerrain(state, velocity, normal);
      expect(r1.state.bouncesLeft).toBe(2);

      const r2 = handleGrenadeTerrain(r1.state, velocity, normal);
      expect(r2.state.bouncesLeft).toBe(1);

      const r3 = handleGrenadeTerrain(r2.state, velocity, normal);
      expect(r3.state.bouncesLeft).toBe(0);
      expect(r3.shouldExplode).toBe(false);

      // Fourth hit should explode
      const r4 = handleGrenadeTerrain(r3.state, velocity, normal);
      expect(r4.shouldExplode).toBe(true);
    });
  });
});
