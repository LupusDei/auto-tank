import { describe, expect, it } from 'vitest';
import { getScheme, getSchemeNames } from '@engine/gamemode/GameSchemes';

describe('GameSchemes', () => {
  it('should list available schemes', () => {
    const names = getSchemeNames();
    expect(names).toContain('standard');
    expect(names).toContain('quickPlay');
    expect(names).toContain('artillery');
  });

  it('should get a scheme by name', () => {
    const scheme = getScheme('standard');
    expect(scheme).toBeDefined();
    expect(scheme?.gameConfig.maxRounds).toBe(5);
  });

  it('should return undefined for unknown scheme', () => {
    expect(getScheme('nonexistent')).toBeUndefined();
  });

  it('should have sudden death config in schemes', () => {
    const scheme = getScheme('quickPlay');
    expect(scheme?.suddenDeath.drainPerTurn).toBe(10);
  });
});
