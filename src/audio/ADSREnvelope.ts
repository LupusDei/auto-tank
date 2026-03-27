/** ADSR (Attack-Decay-Sustain-Release) envelope configuration. */
export interface ADSRConfig {
  readonly attack: number;
  readonly decay: number;
  readonly sustain: number;
  readonly release: number;
}

/**
 * Apply an ADSR envelope to a GainNode.
 *
 * Schedules gain automation: ramp up during attack, ramp down to sustain
 * during decay, hold sustain, then ramp to zero during release.
 */
export function applyADSR(
  gainNode: GainNode,
  config: ADSRConfig,
  startTime: number,
  duration: number,
  peakGain = 1.0,
): void {
  const { attack, decay, sustain, release } = config;
  const sustainLevel = sustain * peakGain;

  // Clamp to avoid negative times
  const safeAttack = Math.max(0, attack);
  const safeDecay = Math.max(0, decay);
  const safeRelease = Math.max(0, release);

  // Handle zero or very short durations
  if (duration <= 0) {
    gainNode.gain.setValueAtTime(0, startTime);
    return;
  }

  // Start at zero
  gainNode.gain.setValueAtTime(0, startTime);

  // Attack: ramp to peak
  const attackEnd = startTime + safeAttack;
  gainNode.gain.linearRampToValueAtTime(peakGain, attackEnd);

  // Decay: ramp to sustain level
  const decayEnd = attackEnd + safeDecay;
  gainNode.gain.linearRampToValueAtTime(Math.max(sustainLevel, 0.0001), decayEnd);

  // Release: ramp to zero at end of duration
  const releaseStart = startTime + duration - safeRelease;
  if (releaseStart > decayEnd) {
    // Hold sustain until release starts
    gainNode.gain.setValueAtTime(Math.max(sustainLevel, 0.0001), releaseStart);
  }

  gainNode.gain.linearRampToValueAtTime(0, startTime + duration);
}

/** Common ADSR presets for different sound types. */
export const ADSR_PRESETS = {
  percussive: { attack: 0.005, decay: 0.1, sustain: 0.0, release: 0.1 } as ADSRConfig,
  pluck: { attack: 0.01, decay: 0.15, sustain: 0.3, release: 0.2 } as ADSRConfig,
  pad: { attack: 0.3, decay: 0.5, sustain: 0.7, release: 0.8 } as ADSRConfig,
  explosion: { attack: 0.001, decay: 0.3, sustain: 0.2, release: 0.5 } as ADSRConfig,
  ui: { attack: 0.001, decay: 0.05, sustain: 0.0, release: 0.05 } as ADSRConfig,
} as const;

/** Validate that an ADSRConfig has reasonable values. */
export function isValidADSR(config: ADSRConfig): boolean {
  return (
    config.attack >= 0 &&
    config.decay >= 0 &&
    config.sustain >= 0 &&
    config.sustain <= 1 &&
    config.release >= 0
  );
}
