import type { ADSRConfig } from './ADSREnvelope';
import { applyADSR } from './ADSREnvelope';

/** A single synthesizer voice with oscillator, gain, and optional filter. */
export interface SynthVoice {
  readonly oscillator: OscillatorNode;
  readonly gain: GainNode;
  readonly filter?: BiquadFilterNode | undefined;
}

/** Parameters for a single synthesized sound. */
export interface SynthParams {
  readonly frequency: number;
  readonly waveform?: OscillatorType;
  readonly adsr: ADSRConfig;
  readonly duration: number;
  readonly gain?: number;
  readonly filterFreq?: number;
  readonly filterType?: BiquadFilterType;
  readonly detune?: number;
  readonly frequencyEnd?: number;
}

/**
 * Play a synthesized sound with ADSR envelope.
 * Creates an oscillator routed through a gain node (with optional filter)
 * and connects to the provided destination.
 */
export function playSynth(
  context: AudioContext,
  destination: AudioNode,
  params: SynthParams,
): SynthVoice {
  const oscillator = context.createOscillator();
  const gainNode = context.createGain();

  oscillator.frequency.setValueAtTime(params.frequency, context.currentTime);
  oscillator.type = params.waveform ?? 'sine';

  if (params.detune !== undefined) {
    oscillator.detune.value = params.detune;
  }

  // Frequency sweep if frequencyEnd is specified
  if (params.frequencyEnd !== undefined) {
    oscillator.frequency.linearRampToValueAtTime(
      params.frequencyEnd,
      context.currentTime + params.duration,
    );
  }

  const peakGain = params.gain ?? 0.3;
  applyADSR(gainNode, params.adsr, context.currentTime, params.duration, peakGain);

  let filter: BiquadFilterNode | undefined;

  if (params.filterFreq !== undefined) {
    filter = context.createBiquadFilter();
    filter.type = params.filterType ?? 'lowpass';
    filter.frequency.value = params.filterFreq;

    oscillator.connect(filter);
    filter.connect(gainNode);
  } else {
    oscillator.connect(gainNode);
  }

  gainNode.connect(destination);

  oscillator.start(context.currentTime);
  oscillator.stop(context.currentTime + params.duration);

  return { oscillator, gain: gainNode, filter };
}

/**
 * Play layered sound (multiple voices at once for richer sounds).
 * Each voice is independently synthesized and routed to the destination.
 */
export function playLayered(
  context: AudioContext,
  destination: AudioNode,
  voices: readonly SynthParams[],
): SynthVoice[] {
  return voices.map((voiceParams) => playSynth(context, destination, voiceParams));
}
