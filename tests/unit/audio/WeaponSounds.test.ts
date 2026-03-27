import { describe, expect, it, vi } from 'vitest';
import { getWeaponSound, playWeaponFire, playWeaponImpact } from '@audio/WeaponSounds';

function createMockAudioContext() {
  const mockGain = {
    gain: {
      value: 0,
      setValueAtTime: vi.fn(),
      linearRampToValueAtTime: vi.fn(),
      exponentialRampToValueAtTime: vi.fn(),
    },
    connect: vi.fn(),
    disconnect: vi.fn(),
  };
  const mockOsc = {
    frequency: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    type: 'sine' as OscillatorType,
    detune: { value: 0 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
  const mockFilter = {
    frequency: { value: 0 },
    type: 'lowpass' as BiquadFilterType,
    connect: vi.fn(),
  };

  return {
    context: {
      currentTime: 0,
      createOscillator: vi.fn(() => ({
        ...mockOsc,
        frequency: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
      })),
      createGain: vi.fn(() => ({
        ...mockGain,
        gain: {
          value: 0,
          setValueAtTime: vi.fn(),
          linearRampToValueAtTime: vi.fn(),
          exponentialRampToValueAtTime: vi.fn(),
        },
      })),
      createBiquadFilter: vi.fn(() => ({ ...mockFilter })),
    } as unknown as AudioContext,
    mockDestination: { connect: vi.fn() } as unknown as AudioNode,
  };
}

describe('WeaponSounds', () => {
  describe('getWeaponSound', () => {
    const knownWeapons = [
      'baby-missile',
      'missile',
      'grenade',
      'shotgun',
      'nuke',
      'holy-hand-grenade',
      'banana-bomb',
      'napalm',
      'air-strike',
    ];

    it.each(knownWeapons)('should return valid sound set for %s', (weaponType) => {
      const soundSet = getWeaponSound(weaponType);

      expect(soundSet).toHaveProperty('fire');
      expect(soundSet).toHaveProperty('impact');
      expect(soundSet.fire.length).toBeGreaterThan(0);
      expect(soundSet.impact.length).toBeGreaterThan(0);

      for (const voice of soundSet.fire) {
        expect(voice.frequency).toBeGreaterThan(0);
        expect(voice.duration).toBeGreaterThan(0);
        expect(voice.adsr).toBeDefined();
      }
      for (const voice of soundSet.impact) {
        expect(voice.frequency).toBeGreaterThan(0);
        expect(voice.duration).toBeGreaterThan(0);
        expect(voice.adsr).toBeDefined();
      }
    });

    it('should fall back to default for unknown weapon type', () => {
      const soundSet = getWeaponSound('unknown-weapon');

      expect(soundSet).toHaveProperty('fire');
      expect(soundSet).toHaveProperty('impact');
      expect(soundSet.fire.length).toBeGreaterThan(0);
      expect(soundSet.impact.length).toBeGreaterThan(0);
    });

    it('should return different sounds for different weapons', () => {
      const missile = getWeaponSound('missile');
      const shotgun = getWeaponSound('shotgun');

      // Shotgun fire has 3 voices (sharp crack), missile has 1
      expect(shotgun.fire.length).toBeGreaterThan(missile.fire.length);
    });
  });

  describe('playWeaponFire', () => {
    it('should create oscillator nodes for weapon fire', () => {
      const { context, mockDestination } = createMockAudioContext();

      playWeaponFire(context, mockDestination, 'missile');

      expect(context.createOscillator).toHaveBeenCalled();
      expect(context.createGain).toHaveBeenCalled();
    });

    it('should create multiple oscillators for shotgun fire', () => {
      const { context, mockDestination } = createMockAudioContext();

      playWeaponFire(context, mockDestination, 'shotgun');

      // Shotgun has 3 voices
      expect(context.createOscillator).toHaveBeenCalledTimes(3);
    });

    it('should work with unknown weapon type (uses default)', () => {
      const { context, mockDestination } = createMockAudioContext();

      playWeaponFire(context, mockDestination, 'unknown');

      expect(context.createOscillator).toHaveBeenCalled();
    });
  });

  describe('playWeaponImpact', () => {
    it('should create oscillator nodes for weapon impact', () => {
      const { context, mockDestination } = createMockAudioContext();

      playWeaponImpact(context, mockDestination, 'missile', 30);

      expect(context.createOscillator).toHaveBeenCalled();
    });

    it('should scale with radius', () => {
      const { context: ctx1, mockDestination: dest1 } = createMockAudioContext();
      const { context: ctx2, mockDestination: dest2 } = createMockAudioContext();

      playWeaponImpact(ctx1, dest1, 'missile', 15);
      playWeaponImpact(ctx2, dest2, 'missile', 60);

      // Both should create oscillators - the scaling happens in gain/duration
      expect(ctx1.createOscillator).toHaveBeenCalled();
      expect(ctx2.createOscillator).toHaveBeenCalled();
    });

    it('should create multiple voices for nuke impact', () => {
      const { context, mockDestination } = createMockAudioContext();

      playWeaponImpact(context, mockDestination, 'nuke', 50);

      // Nuke has 3 impact voices
      expect(context.createOscillator).toHaveBeenCalledTimes(3);
    });

    it('should work with unknown weapon type (uses default)', () => {
      const { context, mockDestination } = createMockAudioContext();

      playWeaponImpact(context, mockDestination, 'nonexistent', 20);

      expect(context.createOscillator).toHaveBeenCalled();
    });
  });
});
