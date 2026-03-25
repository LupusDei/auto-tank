import { describe, expect, it } from 'vitest';

describe('Smoke Tests', () => {
  it('should verify TypeScript compiles and runs', () => {
    const value = 42;
    expect(value).toBe(42);
  });

  it('should import shared types without errors', async () => {
    const types = await import('@shared/types/index');
    expect(types).toBeDefined();
  });

  it('should import shared constants without errors', async () => {
    const constants = await import('@shared/constants/index');
    expect(constants).toBeDefined();
    expect(constants.PHYSICS).toBeDefined();
    expect(constants.WEAPONS).toBeDefined();
    expect(constants.GAME_DEFAULTS).toBeDefined();
  });

  it('should verify PHYSICS constants have expected values', async () => {
    const { PHYSICS } = await import('@shared/constants/physics');
    expect(PHYSICS.GRAVITY).toBe(9.81);
    expect(PHYSICS.MAX_POWER).toBe(100);
    expect(PHYSICS.TICK_RATE).toBe(60);
  });

  it('should verify weapon definitions are populated', async () => {
    const { WEAPONS } = await import('@shared/constants/weapons');
    expect(Object.keys(WEAPONS).length).toBeGreaterThan(0);
    expect(WEAPONS['missile']).toBeDefined();
    expect(WEAPONS['missile']?.name).toBe('Missile');
  });
});
