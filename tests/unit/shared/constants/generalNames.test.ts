import { describe, expect, it } from 'vitest';

import { GENERAL_NAMES, pickRandomGenerals } from '@shared/constants/generalNames';

describe('GENERAL_NAMES', () => {
  it('contains at least 30 names', () => {
    expect(GENERAL_NAMES.length).toBeGreaterThanOrEqual(30);
  });

  it('has no duplicate entries', () => {
    const unique = new Set(GENERAL_NAMES);
    expect(unique.size).toBe(GENERAL_NAMES.length);
  });
});

describe('pickRandomGenerals', () => {
  it('returns the requested count of names', () => {
    expect(pickRandomGenerals(3)).toHaveLength(3);
    expect(pickRandomGenerals(1)).toHaveLength(1);
    expect(pickRandomGenerals(5)).toHaveLength(5);
  });

  it('returns unique names within a single pick', () => {
    const names = pickRandomGenerals(10);
    const unique = new Set(names);
    expect(unique.size).toBe(10);
  });

  it('returns names that exist in the GENERAL_NAMES list', () => {
    const names = pickRandomGenerals(5);
    for (const name of names) {
      expect(GENERAL_NAMES).toContain(name);
    }
  });

  it('produces deterministic results with the same seed', () => {
    const first = pickRandomGenerals(4, 12345);
    const second = pickRandomGenerals(4, 12345);
    expect(first).toEqual(second);
  });

  it('produces different results with different seeds', () => {
    const first = pickRandomGenerals(4, 111);
    const second = pickRandomGenerals(4, 222);
    // Very unlikely to be identical with different seeds
    expect(first).not.toEqual(second);
  });

  it('handles count of 0', () => {
    expect(pickRandomGenerals(0)).toEqual([]);
  });
});
