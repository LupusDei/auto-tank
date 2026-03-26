import {
  canPickup,
  collectCrate,
  generateCrate,
  generateCrateDrops,
} from '@engine/defense/CrateDrops';
import { describe, expect, it } from 'vitest';

describe('CrateDrops', () => {
  it('should generate a crate with valid position', () => {
    const crate = generateCrate(500, 400, 42);
    expect(crate.position.x).toBeGreaterThanOrEqual(50);
    expect(crate.position.x).toBeLessThanOrEqual(450);
    expect(crate.collected).toBe(false);
  });

  it('should generate deterministic crates', () => {
    const c1 = generateCrate(500, 400, 42);
    const c2 = generateCrate(500, 400, 42);
    expect(c1.position).toEqual(c2.position);
    expect(c1.type).toBe(c2.type);
  });

  it('should generate multiple crate drops', () => {
    const crates = generateCrateDrops(3, 500, 400, 42);
    expect(crates).toHaveLength(3);
    // All unique IDs
    const ids = crates.map((c) => c.id);
    expect(new Set(ids).size).toBe(3);
  });

  it('should collect a crate', () => {
    const crate = generateCrate(500, 400, 42);
    const collected = collectCrate(crate);
    expect(collected.collected).toBe(true);
  });

  it('should check pickup distance', () => {
    expect(canPickup({ x: 100, y: 200 }, { x: 110, y: 200 })).toBe(true);
    expect(canPickup({ x: 100, y: 200 }, { x: 200, y: 200 })).toBe(false);
  });

  it('should have valid content for each crate type', () => {
    // Generate many crates and check all types appear
    const types = new Set<string>();
    for (let seed = 0; seed < 100; seed++) {
      const crate = generateCrate(500, 400, seed);
      types.add(crate.type);
      expect(['weapon', 'health', 'shield', 'fuel']).toContain(crate.type);
    }
    expect(types.size).toBeGreaterThanOrEqual(3);
  });
});
