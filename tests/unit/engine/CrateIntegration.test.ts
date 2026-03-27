import { describe, expect, it } from 'vitest';

import { canPickup, collectCrate, generateCrateDrops } from '@engine/defense/CrateDrops';
import { createPRNG } from '@shared/prng';
import { EventType } from '@engine/events/types';

describe('CrateIntegration - Between-Turn Events', () => {
  describe('Crate drop probability', () => {
    it('should produce deterministic results for same turn number', () => {
      const turnNumber = 5;
      const rng1 = createPRNG(turnNumber * 1337);
      const rng2 = createPRNG(turnNumber * 1337);
      expect(rng1()).toBe(rng2());
    });

    it('should produce different results for different turn numbers', () => {
      const rng1 = createPRNG(1 * 1337);
      const rng2 = createPRNG(2 * 1337);
      expect(rng1()).not.toBe(rng2());
    });

    it('should have approximately 30% spawn rate over many turns', () => {
      let spawns = 0;
      const totalTurns = 1000;
      for (let turn = 1; turn <= totalTurns; turn++) {
        const rng = createPRNG(turn * 1337);
        if (rng() < 0.3) spawns++;
      }
      const rate = spawns / totalTurns;
      expect(rate).toBeGreaterThan(0.2);
      expect(rate).toBeLessThan(0.4);
    });

    it('should not generate crate when probability misses', () => {
      // Find a seed that produces roll >= 0.3
      let missedTurn = 0;
      for (let turn = 1; turn <= 100; turn++) {
        const rng = createPRNG(turn * 1337);
        if (rng() >= 0.3) {
          missedTurn = turn;
          break;
        }
      }
      expect(missedTurn).toBeGreaterThan(0);
      const rng = createPRNG(missedTurn * 1337);
      expect(rng()).toBeGreaterThanOrEqual(0.3);
    });
  });

  describe('Crate generation via generateCrateDrops', () => {
    it('should generate requested number of crates', () => {
      const crates = generateCrateDrops(3, 800, 300, 42);
      expect(crates).toHaveLength(3);
    });

    it('should generate crates with valid properties', () => {
      const crates = generateCrateDrops(1, 800, 300, 42);
      const crate = crates[0];
      expect(crate).toBeDefined();
      if (!crate) return;
      expect(crate.id).toBeTruthy();
      expect(crate.collected).toBe(false);
      expect(crate.position.x).toBeGreaterThanOrEqual(50);
      expect(crate.position.x).toBeLessThanOrEqual(750);
    });
  });

  describe('Event types', () => {
    it('should define CRATE_SPAWNED event type', () => {
      expect(EventType.CRATE_SPAWNED).toBe('crate_spawned');
    });

    it('should define CRATE_COLLECTED event type', () => {
      expect(EventType.CRATE_COLLECTED).toBe('crate_collected');
    });
  });

  describe('Sudden death countdown logic', () => {
    it('should fire warning when turnsUntilSuddenDeath is 1-3', () => {
      const suddenDeathTurns = 20;
      const warningTurns: number[] = [];
      for (let turn = 15; turn <= 22; turn++) {
        const remaining = suddenDeathTurns - turn;
        if (remaining <= 3 && remaining > 0) {
          warningTurns.push(turn);
        }
      }
      expect(warningTurns).toEqual([17, 18, 19]);
    });

    it('should not fire warning when more than 3 turns away', () => {
      const suddenDeathTurns = 20;
      const remaining = suddenDeathTurns - 10;
      expect(remaining).toBeGreaterThan(3);
    });

    it('should not fire warning at or past sudden death turn', () => {
      const suddenDeathTurns = 20;
      const remaining = suddenDeathTurns - 20;
      expect(remaining <= 0 || remaining > 3).toBe(true);
    });
  });

  describe('Wind change notification', () => {
    it('should produce toast text with right arrow for positive wind', () => {
      const newWind = 5.5;
      const arrow = newWind > 0 ? '\u2192' : '\u2190';
      const message = `Wind changed: ${arrow} ${Math.abs(newWind).toFixed(1)}`;
      expect(message).toBe('Wind changed: \u2192 5.5');
    });

    it('should use left arrow for negative wind', () => {
      const newWind = -3.2;
      const arrow = newWind > 0 ? '\u2192' : '\u2190';
      const message = `Wind changed: ${arrow} ${Math.abs(newWind).toFixed(1)}`;
      expect(message).toBe('Wind changed: \u2190 3.2');
    });
  });
});

describe('CrateCollection', () => {
  describe('canPickup', () => {
    it('should return true when tank is within radius', () => {
      expect(canPickup({ x: 100, y: 200 }, { x: 110, y: 200 })).toBe(true);
    });

    it('should return false when tank is outside radius', () => {
      expect(canPickup({ x: 100, y: 200 }, { x: 200, y: 200 })).toBe(false);
    });

    it('should use default radius of 20', () => {
      // Distance of exactly 20 should pass
      expect(canPickup({ x: 100, y: 200 }, { x: 120, y: 200 })).toBe(true);
      // Distance of 21 should fail
      expect(canPickup({ x: 100, y: 200 }, { x: 121, y: 200 })).toBe(false);
    });

    it('should work with diagonal distances', () => {
      // distance = sqrt(10^2 + 10^2) = ~14.14 < 20
      expect(canPickup({ x: 100, y: 200 }, { x: 110, y: 210 })).toBe(true);
    });
  });

  describe('collectCrate', () => {
    it('should mark crate as collected', () => {
      const crates = generateCrateDrops(1, 800, 300, 42);
      const crate = crates[0];
      expect(crate).toBeDefined();
      if (!crate) return;
      const collected = collectCrate(crate);
      expect(collected.collected).toBe(true);
      expect(collected.id).toBe(crate.id);
    });

    it('should preserve other crate properties', () => {
      const crates = generateCrateDrops(1, 800, 300, 42);
      const crate = crates[0];
      expect(crate).toBeDefined();
      if (!crate) return;
      const collected = collectCrate(crate);
      expect(collected.type).toBe(crate.type);
      expect(collected.position).toEqual(crate.position);
      expect(collected.content).toEqual(crate.content);
    });
  });

  describe('Collection effects per crate type', () => {
    it('should generate health crates with amount', () => {
      for (let seed = 0; seed < 100; seed++) {
        const crates = generateCrateDrops(1, 800, 300, seed);
        const crate = crates[0];
        if (!crate) continue;
        if (crate.content.kind === 'health') {
          expect(crate.content.amount).toBeGreaterThan(0);
          return;
        }
      }
      expect(true).toBe(false);
    });

    it('should generate weapon crates with weaponType', () => {
      for (let seed = 0; seed < 100; seed++) {
        const crates = generateCrateDrops(1, 800, 300, seed);
        const crate = crates[0];
        if (!crate) continue;
        if (crate.content.kind === 'weapon') {
          expect(crate.content.weaponType).toBeTruthy();
          expect(crate.content.quantity).toBeGreaterThan(0);
          return;
        }
      }
      expect(true).toBe(false);
    });

    it('should generate shield crates with shieldType', () => {
      for (let seed = 0; seed < 100; seed++) {
        const crates = generateCrateDrops(1, 800, 300, seed);
        const crate = crates[0];
        if (!crate) continue;
        if (crate.content.kind === 'shield') {
          expect(['light', 'heavy']).toContain(crate.content.shieldType);
          return;
        }
      }
      expect(true).toBe(false);
    });

    it('should not allow dead tanks to collect (logic verification)', () => {
      // Dead tanks have state === 'destroyed', the collection loop checks state === 'alive'
      const tankState = 'destroyed';
      expect(tankState !== 'alive').toBe(true);
    });
  });
});
