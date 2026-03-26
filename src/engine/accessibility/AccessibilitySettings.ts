export interface AccessibilityConfig {
  readonly highContrast: boolean;
  readonly reducedMotion: boolean;
  readonly screenReaderAnnouncements: boolean;
  readonly fontSize: 'normal' | 'large' | 'extra-large';
  readonly colorBlindMode: 'none' | 'deuteranopia' | 'protanopia' | 'tritanopia';
}

export function createDefaultAccessibility(): AccessibilityConfig {
  return {
    highContrast: false,
    reducedMotion: false,
    screenReaderAnnouncements: true,
    fontSize: 'normal',
    colorBlindMode: 'none',
  };
}

/** Detect system reduced-motion preference. */
export function detectReducedMotion(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

/** Detect system high-contrast preference. */
export function detectHighContrast(): boolean {
  if (typeof window === 'undefined') return false;
  return window.matchMedia('(prefers-contrast: more)').matches;
}

/** Apply reduced motion — disables particles, screen shake, animations. */
export function shouldAnimate(config: AccessibilityConfig): boolean {
  return !config.reducedMotion;
}

/** Get font size multiplier. */
export function getFontSizeMultiplier(config: AccessibilityConfig): number {
  switch (config.fontSize) {
    case 'large':
      return 1.25;
    case 'extra-large':
      return 1.5;
    default:
      return 1;
  }
}

/** Announce text for screen readers. */
export function announceForScreenReader(text: string): void {
  if (typeof document === 'undefined') return;
  const el = document.createElement('div');
  el.setAttribute('role', 'alert');
  el.setAttribute('aria-live', 'assertive');
  el.style.position = 'absolute';
  el.style.left = '-9999px';
  el.textContent = text;
  document.body.appendChild(el);
  setTimeout(() => el.remove(), 1000);
}

/** Get high-contrast color variant. */
export function getHighContrastColor(color: string, config: AccessibilityConfig): string {
  if (!config.highContrast) return color;
  // Boost saturation and contrast
  return color; // TODO: actual color transformation
}
