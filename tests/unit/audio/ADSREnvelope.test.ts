import { ADSR_PRESETS, applyADSR, isValidADSR } from '@audio/ADSREnvelope';
import { describe, expect, it, vi } from 'vitest';
import type { ADSRConfig } from '@audio/ADSREnvelope';

function createMockGainNode() {
  return {
    gain: {
      value: 0,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  } as unknown as GainNode;
}

describe('ADSREnvelope', () => {
  describe('applyADSR', () => {
    it('should schedule gain ramps for attack, decay, and release', () => {
      const gainNode = createMockGainNode();
      const config: ADSRConfig = { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 };

      applyADSR(gainNode, config, 0, 1.0);

      const setValueCalls = vi.mocked(gainNode.gain.setValueAtTime).mock.calls;
      const rampCalls = vi.mocked(gainNode.gain.linearRampToValueAtTime).mock.calls;

      // Should start at 0
      expect(setValueCalls[0]).toEqual([0, 0]);
      // Attack: ramp to peak (1.0)
      expect(rampCalls[0]).toEqual([1.0, 0.01]);
      // Decay: ramp to sustain (0.5)
      expect(rampCalls[1]).toEqual([0.5, 0.11]);
      // Release: ramp to 0 at end
      expect(rampCalls[rampCalls.length - 1]).toEqual([0, 1.0]);
    });

    it('should apply custom peakGain', () => {
      const gainNode = createMockGainNode();
      const config: ADSRConfig = { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 };

      applyADSR(gainNode, config, 0, 1.0, 0.6);

      const rampCalls = vi.mocked(gainNode.gain.linearRampToValueAtTime).mock.calls;
      const attackRamp = rampCalls[0];
      const decayRamp = rampCalls[1];
      // Attack should ramp to peakGain
      expect(attackRamp?.[0]).toBe(0.6);
      // Sustain level = 0.5 * 0.6 = 0.3
      expect(decayRamp?.[0]).toBe(0.3);
    });

    it('should handle zero duration gracefully', () => {
      const gainNode = createMockGainNode();
      const config: ADSRConfig = { attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 };

      applyADSR(gainNode, config, 0, 0);

      const setValueCalls = vi.mocked(gainNode.gain.setValueAtTime).mock.calls;
      expect(setValueCalls[0]).toEqual([0, 0]);
      // Should not schedule ramps for zero duration
      expect(vi.mocked(gainNode.gain.linearRampToValueAtTime)).not.toHaveBeenCalled();
    });

    it('should handle startTime offset', () => {
      const gainNode = createMockGainNode();
      const config: ADSRConfig = { attack: 0.01, decay: 0.05, sustain: 0.7, release: 0.1 };

      applyADSR(gainNode, config, 2.0, 0.5);

      const setValueCalls = vi.mocked(gainNode.gain.setValueAtTime).mock.calls;
      // Should start at the given startTime
      expect(setValueCalls[0]).toEqual([0, 2.0]);

      const rampCalls = vi.mocked(gainNode.gain.linearRampToValueAtTime).mock.calls;
      // Attack ends at 2.0 + 0.01
      expect(rampCalls[0]?.[1]).toBeCloseTo(2.01);
      // Release ends at 2.0 + 0.5
      expect(rampCalls[rampCalls.length - 1]?.[1]).toBeCloseTo(2.5);
    });

    it('should handle zero sustain level', () => {
      const gainNode = createMockGainNode();
      const config: ADSRConfig = { attack: 0.005, decay: 0.1, sustain: 0.0, release: 0.1 };

      applyADSR(gainNode, config, 0, 0.5);

      const rampCalls = vi.mocked(gainNode.gain.linearRampToValueAtTime).mock.calls;
      // Sustain with 0 gets clamped to 0.0001 to avoid issues
      expect(rampCalls[1]?.[0]).toBeCloseTo(0.0001, 4);
    });
  });

  describe('ADSR_PRESETS', () => {
    it('should have valid values for all presets', () => {
      for (const [name, preset] of Object.entries(ADSR_PRESETS)) {
        expect(preset.attack, `${name}.attack`).toBeGreaterThanOrEqual(0);
        expect(preset.decay, `${name}.decay`).toBeGreaterThanOrEqual(0);
        expect(preset.sustain, `${name}.sustain`).toBeGreaterThanOrEqual(0);
        expect(preset.sustain, `${name}.sustain`).toBeLessThanOrEqual(1);
        expect(preset.release, `${name}.release`).toBeGreaterThanOrEqual(0);
      }
    });

    it('should contain expected preset names', () => {
      expect(ADSR_PRESETS).toHaveProperty('percussive');
      expect(ADSR_PRESETS).toHaveProperty('pluck');
      expect(ADSR_PRESETS).toHaveProperty('pad');
      expect(ADSR_PRESETS).toHaveProperty('explosion');
      expect(ADSR_PRESETS).toHaveProperty('ui');
    });
  });

  describe('isValidADSR', () => {
    it('should return true for valid configs', () => {
      expect(isValidADSR({ attack: 0.01, decay: 0.1, sustain: 0.5, release: 0.2 })).toBe(true);
      expect(isValidADSR({ attack: 0, decay: 0, sustain: 0, release: 0 })).toBe(true);
      expect(isValidADSR({ attack: 1, decay: 1, sustain: 1, release: 1 })).toBe(true);
    });

    it('should return false for invalid configs', () => {
      expect(isValidADSR({ attack: -1, decay: 0.1, sustain: 0.5, release: 0.2 })).toBe(false);
      expect(isValidADSR({ attack: 0.01, decay: -0.1, sustain: 0.5, release: 0.2 })).toBe(false);
      expect(isValidADSR({ attack: 0.01, decay: 0.1, sustain: 1.5, release: 0.2 })).toBe(false);
      expect(isValidADSR({ attack: 0.01, decay: 0.1, sustain: -0.1, release: 0.2 })).toBe(false);
      expect(isValidADSR({ attack: 0.01, decay: 0.1, sustain: 0.5, release: -0.2 })).toBe(false);
    });
  });
});
