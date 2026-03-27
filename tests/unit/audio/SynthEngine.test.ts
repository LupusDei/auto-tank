import { describe, expect, it, vi } from 'vitest';
import { playLayered, playSynth } from '@audio/SynthEngine';
import { ADSR_PRESETS } from '@audio/ADSREnvelope';
import type { SynthParams } from '@audio/SynthEngine';

function createMockAudioContext() {
  const mockOsc = {
    frequency: { value: 0, setValueAtTime: vi.fn(), linearRampToValueAtTime: vi.fn() },
    type: 'sine' as OscillatorType,
    detune: { value: 0 },
    connect: vi.fn(),
    start: vi.fn(),
    stop: vi.fn(),
  };
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

function getOscResult(ctx: AudioContext, index: number): OscillatorNode {
  return vi.mocked(ctx.createOscillator).mock.results[index]?.value as OscillatorNode;
}

function getGainResult(ctx: AudioContext, index: number): GainNode {
  return vi.mocked(ctx.createGain).mock.results[index]?.value as GainNode;
}

function getFilterResult(ctx: AudioContext, index: number): BiquadFilterNode {
  return vi.mocked(ctx.createBiquadFilter).mock.results[index]?.value as BiquadFilterNode;
}

describe('SynthEngine', () => {
  describe('playSynth', () => {
    it('should create oscillator with correct frequency and waveform', () => {
      const { context, mockDestination } = createMockAudioContext();
      const params: SynthParams = {
        frequency: 440,
        waveform: 'sawtooth',
        adsr: ADSR_PRESETS.percussive,
        duration: 0.5,
      };

      playSynth(context, mockDestination, params);

      expect(context.createOscillator).toHaveBeenCalled();
      expect(context.createGain).toHaveBeenCalled();

      const osc = getOscResult(context, 0);
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(440, 0);
      expect(osc.type).toBe('sawtooth');
    });

    it('should default to sine waveform when not specified', () => {
      const { context, mockDestination } = createMockAudioContext();
      const params: SynthParams = {
        frequency: 440,
        adsr: ADSR_PRESETS.percussive,
        duration: 0.5,
      };

      playSynth(context, mockDestination, params);

      const osc = getOscResult(context, 0);
      expect(osc.type).toBe('sine');
    });

    it('should apply ADSR to gain node', () => {
      const { context, mockDestination } = createMockAudioContext();
      const params: SynthParams = {
        frequency: 200,
        adsr: ADSR_PRESETS.explosion,
        duration: 1.0,
        gain: 0.5,
      };

      playSynth(context, mockDestination, params);

      const gainNode = getGainResult(context, 0);
      // ADSR should set initial value to 0
      expect(gainNode.gain.setValueAtTime).toHaveBeenCalledWith(0, 0);
      // Should have linear ramp calls for attack, decay, and release
      expect(gainNode.gain.linearRampToValueAtTime).toHaveBeenCalled();
    });

    it('should start and stop oscillator at correct times', () => {
      const { context, mockDestination } = createMockAudioContext();
      const params: SynthParams = {
        frequency: 440,
        adsr: ADSR_PRESETS.percussive,
        duration: 0.5,
      };

      playSynth(context, mockDestination, params);

      const osc = getOscResult(context, 0);
      expect(osc.start).toHaveBeenCalledWith(0);
      expect(osc.stop).toHaveBeenCalledWith(0.5);
    });

    it('should apply detune when specified', () => {
      const { context, mockDestination } = createMockAudioContext();
      const params: SynthParams = {
        frequency: 440,
        adsr: ADSR_PRESETS.percussive,
        duration: 0.5,
        detune: 10,
      };

      playSynth(context, mockDestination, params);

      const osc = getOscResult(context, 0);
      expect(osc.detune.value).toBe(10);
    });

    it('should apply frequency sweep when frequencyEnd is specified', () => {
      const { context, mockDestination } = createMockAudioContext();
      const params: SynthParams = {
        frequency: 1000,
        frequencyEnd: 200,
        adsr: ADSR_PRESETS.pluck,
        duration: 0.5,
      };

      playSynth(context, mockDestination, params);

      const osc = getOscResult(context, 0);
      expect(osc.frequency.setValueAtTime).toHaveBeenCalledWith(1000, 0);
      expect(osc.frequency.linearRampToValueAtTime).toHaveBeenCalledWith(200, 0.5);
    });

    it('should create BiquadFilterNode when filterFreq is specified', () => {
      const { context, mockDestination } = createMockAudioContext();
      const params: SynthParams = {
        frequency: 200,
        adsr: ADSR_PRESETS.percussive,
        duration: 0.3,
        filterFreq: 800,
        filterType: 'lowpass',
      };

      playSynth(context, mockDestination, params);

      expect(context.createBiquadFilter).toHaveBeenCalled();
      const filter = getFilterResult(context, 0);
      expect(filter.frequency.value).toBe(800);
      expect(filter.type).toBe('lowpass');
    });

    it('should not create filter when filterFreq is not specified', () => {
      const { context, mockDestination } = createMockAudioContext();
      const params: SynthParams = {
        frequency: 440,
        adsr: ADSR_PRESETS.percussive,
        duration: 0.5,
      };

      const voice = playSynth(context, mockDestination, params);

      expect(context.createBiquadFilter).not.toHaveBeenCalled();
      expect(voice.filter).toBeUndefined();
    });

    it('should return a SynthVoice object', () => {
      const { context, mockDestination } = createMockAudioContext();
      const params: SynthParams = {
        frequency: 440,
        adsr: ADSR_PRESETS.percussive,
        duration: 0.5,
        filterFreq: 1000,
      };

      const voice = playSynth(context, mockDestination, params);

      expect(voice).toHaveProperty('oscillator');
      expect(voice).toHaveProperty('gain');
      expect(voice).toHaveProperty('filter');
      expect(voice.filter).toBeDefined();
    });
  });

  describe('playLayered', () => {
    it('should create multiple voices', () => {
      const { context, mockDestination } = createMockAudioContext();
      const voices: SynthParams[] = [
        { frequency: 440, adsr: ADSR_PRESETS.percussive, duration: 0.5 },
        { frequency: 880, adsr: ADSR_PRESETS.percussive, duration: 0.5 },
        { frequency: 1320, adsr: ADSR_PRESETS.percussive, duration: 0.5 },
      ];

      const result = playLayered(context, mockDestination, voices);

      expect(result).toHaveLength(3);
      expect(context.createOscillator).toHaveBeenCalledTimes(3);
      expect(context.createGain).toHaveBeenCalledTimes(3);
    });

    it('should handle empty voices array', () => {
      const { context, mockDestination } = createMockAudioContext();

      const result = playLayered(context, mockDestination, []);

      expect(result).toHaveLength(0);
      expect(context.createOscillator).not.toHaveBeenCalled();
    });

    it('should pass each voice params correctly', () => {
      const { context, mockDestination } = createMockAudioContext();
      const voices: SynthParams[] = [
        { frequency: 200, waveform: 'sawtooth', adsr: ADSR_PRESETS.explosion, duration: 1.0 },
        {
          frequency: 800,
          waveform: 'square',
          adsr: ADSR_PRESETS.percussive,
          duration: 0.5,
          filterFreq: 1000,
        },
      ];

      const result = playLayered(context, mockDestination, voices);

      expect(result).toHaveLength(2);
      // Second voice should have a filter
      expect(context.createBiquadFilter).toHaveBeenCalledTimes(1);
    });
  });
});
