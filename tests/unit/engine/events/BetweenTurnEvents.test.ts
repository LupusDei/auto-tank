import { describe, expect, it } from 'vitest';

import { createPRNG } from '@shared/prng';
import { generateBetweenTurnEvent } from '@engine/events/BetweenTurnEvents';

describe('BetweenTurnEvents', () => {
  it('should generate deterministic events for the same seed', () => {
    const rng1 = createPRNG(42);
    const rng2 = createPRNG(42);
    const event1 = generateBetweenTurnEvent(3, rng1);
    const event2 = generateBetweenTurnEvent(3, rng2);
    expect(event1.type).toBe(event2.type);
  });

  it('should generate crate_drop events with valid crate data', () => {
    // Try many seeds to find a crate drop
    let found = false;
    for (let seed = 0; seed < 200; seed++) {
      const rng = createPRNG(seed);
      const event = generateBetweenTurnEvent(3, rng);
      if (event.type === 'crate_drop') {
        found = true;
        expect(event.crate).toBeDefined();
        expect(event.crate.state).toBe('falling');
        break;
      }
    }
    expect(found).toBe(true);
  });

  it('should generate sudden_death when turn exceeds threshold', () => {
    const rng = createPRNG(42);
    const event = generateBetweenTurnEvent(22, rng, 20);
    expect(event.type).toBe('sudden_death');
    if (event.type === 'sudden_death') {
      expect(event.turnsRemaining).toBeLessThanOrEqual(0);
    }
  });

  it('should generate sudden_death exactly at the threshold turn', () => {
    const rng = createPRNG(99);
    const event = generateBetweenTurnEvent(20, rng, 20);
    expect(event.type).toBe('sudden_death');
  });

  it('should generate non-sudden-death events before threshold', () => {
    const rng = createPRNG(42);
    const event = generateBetweenTurnEvent(5, rng, 20);
    expect(event.type).not.toBe('sudden_death');
  });

  it('should sometimes generate none events', () => {
    let foundNone = false;
    for (let seed = 0; seed < 200; seed++) {
      const rng = createPRNG(seed);
      const event = generateBetweenTurnEvent(3, rng);
      if (event.type === 'none') {
        foundNone = true;
        break;
      }
    }
    expect(foundNone).toBe(true);
  });
});
