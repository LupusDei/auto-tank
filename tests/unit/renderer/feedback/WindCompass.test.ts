import { describe, expect, it } from 'vitest';
import { getWindDescription } from '@renderer/feedback/WindCompass';

describe('WindCompass', () => {
  it('should describe wind levels', () => {
    expect(getWindDescription(0)).toBe('Calm');
    expect(getWindDescription(3)).toBe('Light');
    expect(getWindDescription(8)).toBe('Moderate');
    expect(getWindDescription(12)).toBe('Strong');
    expect(getWindDescription(20)).toBe('Extreme');
  });

  it('should use absolute value', () => {
    expect(getWindDescription(-5)).toBe('Light');
    expect(getWindDescription(-15)).toBe('Strong');
  });
});
