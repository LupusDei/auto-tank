import { describe, expect, it, vi } from 'vitest';
import {
  playDamageSound,
  playExplosionSound,
  playFireSound,
  playUIClick,
  playVictoryFanfare,
  playWindAmbient,
} from '@audio/SynthSounds';
import { SoundManager } from '@audio/SoundManager';

function createMockSoundManager(): SoundManager {
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

  const mockContext = {
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
  } as unknown as AudioContext;

  const mockMasterGain = mockGain as unknown as GainNode;

  const sm = new SoundManager();
  vi.spyOn(sm, 'getContext').mockReturnValue(mockContext);
  vi.spyOn(sm, 'getMasterGain').mockReturnValue(mockMasterGain);

  return sm;
}

function getContext(sm: SoundManager): AudioContext {
  return sm.getContext() as AudioContext;
}

describe('SynthSounds', () => {
  it('should play explosion sound with layered voices', () => {
    const sm = createMockSoundManager();
    playExplosionSound(sm, 30);

    const ctx = getContext(sm);
    // Explosion uses 3 layered voices
    expect(ctx.createOscillator).toHaveBeenCalledTimes(3);
    expect(ctx.createGain).toHaveBeenCalledTimes(3);
  });

  it('should play explosion sound with no-op when not initialized', () => {
    const sm = new SoundManager();
    // Should not throw
    playExplosionSound(sm, 30);
  });

  it('should play fire sound with frequency sweep', () => {
    const sm = createMockSoundManager();
    playFireSound(sm);

    const ctx = getContext(sm);
    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
  });

  it('should play UI click', () => {
    const sm = createMockSoundManager();
    playUIClick(sm);

    const ctx = getContext(sm);
    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
  });

  it('should play victory fanfare with multiple chords', () => {
    const sm = createMockSoundManager();
    playVictoryFanfare(sm);

    const ctx = getContext(sm);
    // 4 chords * 3 notes each = 12 oscillators
    expect(ctx.createOscillator).toHaveBeenCalledTimes(12);
  });

  it('should play wind ambient with layered voices', () => {
    const sm = createMockSoundManager();
    playWindAmbient(sm, 15);

    const ctx = getContext(sm);
    // 3 detuned voices
    expect(ctx.createOscillator).toHaveBeenCalledTimes(3);
  });

  it('should not play wind ambient when strength is too low', () => {
    const sm = createMockSoundManager();
    playWindAmbient(sm, 1);

    const ctx = getContext(sm);
    expect(ctx.createOscillator).not.toHaveBeenCalled();
  });

  it('should play damage sound with varying intensity', () => {
    const sm = createMockSoundManager();
    playDamageSound(sm, 80);

    const ctx = getContext(sm);
    expect(ctx.createOscillator).toHaveBeenCalledTimes(1);
    // Should also create a filter for damage sound
    expect(ctx.createBiquadFilter).toHaveBeenCalled();
  });

  it('should play damage sound with lower freq for high damage', () => {
    const sm = createMockSoundManager();
    playDamageSound(sm, 80);

    const ctx = getContext(sm);
    const osc = vi.mocked(ctx.createOscillator).mock.results[0]?.value as OscillatorNode;
    expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(100, 0);
  });

  it('should play damage sound with higher freq for low damage', () => {
    const sm = createMockSoundManager();
    playDamageSound(sm, 20);

    const ctx = getContext(sm);
    const osc = vi.mocked(ctx.createOscillator).mock.results[0]?.value as OscillatorNode;
    expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(200, 0);
  });
});
