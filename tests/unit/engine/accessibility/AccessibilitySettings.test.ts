import {
  createDefaultAccessibility,
  getFontSizeMultiplier,
  shouldAnimate,
} from '@engine/accessibility/AccessibilitySettings';
import { describe, expect, it } from 'vitest';

describe('AccessibilitySettings', () => {
  it('should create defaults', () => {
    const config = createDefaultAccessibility();
    expect(config.highContrast).toBe(false);
    expect(config.reducedMotion).toBe(false);
    expect(config.screenReaderAnnouncements).toBe(true);
  });

  it('should allow animation by default', () => {
    expect(shouldAnimate(createDefaultAccessibility())).toBe(true);
  });

  it('should disable animation with reduced motion', () => {
    expect(shouldAnimate({ ...createDefaultAccessibility(), reducedMotion: true })).toBe(false);
  });

  it('should scale font size', () => {
    expect(getFontSizeMultiplier({ ...createDefaultAccessibility(), fontSize: 'normal' })).toBe(1);
    expect(getFontSizeMultiplier({ ...createDefaultAccessibility(), fontSize: 'large' })).toBe(
      1.25,
    );
    expect(
      getFontSizeMultiplier({ ...createDefaultAccessibility(), fontSize: 'extra-large' }),
    ).toBe(1.5);
  });
});
