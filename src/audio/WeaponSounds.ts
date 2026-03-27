import { ADSR_PRESETS } from './ADSREnvelope';
import { playLayered } from './SynthEngine';
import type { SynthParams } from './SynthEngine';

/** A set of synth voices for weapon fire and impact sounds. */
export interface WeaponSoundSet {
  readonly fire: readonly SynthParams[];
  readonly impact: readonly SynthParams[];
}

const DEFAULT_SOUND: WeaponSoundSet = {
  fire: [
    {
      frequency: 200,
      waveform: 'triangle',
      adsr: ADSR_PRESETS.percussive,
      duration: 0.15,
      gain: 0.3,
    },
  ],
  impact: [
    { frequency: 80, waveform: 'sine', adsr: ADSR_PRESETS.explosion, duration: 0.4, gain: 0.3 },
  ],
};

const WEAPON_SOUNDS: Record<string, WeaponSoundSet> = {
  'baby-missile': {
    fire: [
      { frequency: 300, waveform: 'sine', adsr: ADSR_PRESETS.percussive, duration: 0.1, gain: 0.2 },
    ],
    impact: [
      { frequency: 150, waveform: 'sine', adsr: ADSR_PRESETS.explosion, duration: 0.25, gain: 0.2 },
    ],
  },

  missile: {
    fire: [
      {
        frequency: 200,
        frequencyEnd: 100,
        waveform: 'triangle',
        adsr: ADSR_PRESETS.percussive,
        duration: 0.2,
        gain: 0.3,
      },
    ],
    impact: [
      { frequency: 60, waveform: 'sine', adsr: ADSR_PRESETS.explosion, duration: 0.5, gain: 0.4 },
      {
        frequency: 120,
        waveform: 'sawtooth',
        adsr: ADSR_PRESETS.percussive,
        duration: 0.2,
        gain: 0.2,
        filterFreq: 400,
        filterType: 'lowpass',
      },
    ],
  },

  grenade: {
    fire: [
      {
        frequency: 400,
        frequencyEnd: 200,
        waveform: 'sine',
        adsr: ADSR_PRESETS.percussive,
        duration: 0.15,
        gain: 0.25,
      },
    ],
    impact: [
      { frequency: 50, waveform: 'sine', adsr: ADSR_PRESETS.explosion, duration: 0.6, gain: 0.45 },
      {
        frequency: 100,
        waveform: 'sawtooth',
        adsr: ADSR_PRESETS.percussive,
        duration: 0.15,
        gain: 0.2,
        filterFreq: 300,
        filterType: 'lowpass',
      },
    ],
  },

  shotgun: {
    fire: [
      {
        frequency: 2000,
        waveform: 'square',
        adsr: ADSR_PRESETS.percussive,
        duration: 0.03,
        gain: 0.25,
      },
      {
        frequency: 1500,
        waveform: 'square',
        adsr: ADSR_PRESETS.percussive,
        duration: 0.03,
        gain: 0.2,
      },
      {
        frequency: 800,
        waveform: 'square',
        adsr: ADSR_PRESETS.percussive,
        duration: 0.03,
        gain: 0.2,
      },
    ],
    impact: [
      { frequency: 100, waveform: 'sine', adsr: ADSR_PRESETS.percussive, duration: 0.1, gain: 0.2 },
    ],
  },

  nuke: {
    fire: [
      {
        frequency: 80,
        frequencyEnd: 200,
        waveform: 'sine',
        adsr: ADSR_PRESETS.pad,
        duration: 1.0,
        gain: 0.3,
      },
    ],
    impact: [
      { frequency: 30, waveform: 'sine', adsr: ADSR_PRESETS.explosion, duration: 1.5, gain: 0.5 },
      {
        frequency: 60,
        waveform: 'sawtooth',
        adsr: ADSR_PRESETS.explosion,
        duration: 1.0,
        gain: 0.3,
        filterFreq: 200,
        filterType: 'lowpass',
      },
      {
        frequency: 500,
        waveform: 'square',
        adsr: ADSR_PRESETS.percussive,
        duration: 0.1,
        gain: 0.2,
      },
    ],
  },

  'holy-hand-grenade': {
    fire: [
      // Choir-like chord: A4, C#5, E5, A5
      { frequency: 440, waveform: 'sine', adsr: ADSR_PRESETS.pad, duration: 0.8, gain: 0.15 },
      { frequency: 554, waveform: 'sine', adsr: ADSR_PRESETS.pad, duration: 0.8, gain: 0.12 },
      { frequency: 659, waveform: 'sine', adsr: ADSR_PRESETS.pad, duration: 0.8, gain: 0.12 },
      { frequency: 880, waveform: 'sine', adsr: ADSR_PRESETS.pad, duration: 0.8, gain: 0.1 },
    ],
    impact: [
      { frequency: 40, waveform: 'sine', adsr: ADSR_PRESETS.explosion, duration: 1.2, gain: 0.5 },
      {
        frequency: 80,
        waveform: 'sawtooth',
        adsr: ADSR_PRESETS.explosion,
        duration: 0.8,
        gain: 0.3,
        filterFreq: 300,
        filterType: 'lowpass',
      },
    ],
  },

  'banana-bomb': {
    fire: [
      {
        frequency: 500,
        frequencyEnd: 300,
        waveform: 'sine',
        adsr: ADSR_PRESETS.pluck,
        duration: 0.1,
        gain: 0.25,
      },
      {
        frequency: 300,
        frequencyEnd: 500,
        waveform: 'sine',
        adsr: ADSR_PRESETS.pluck,
        duration: 0.1,
        gain: 0.2,
      },
    ],
    impact: [
      { frequency: 70, waveform: 'sine', adsr: ADSR_PRESETS.explosion, duration: 0.5, gain: 0.35 },
      {
        frequency: 140,
        waveform: 'sawtooth',
        adsr: ADSR_PRESETS.percussive,
        duration: 0.2,
        gain: 0.2,
        filterFreq: 400,
        filterType: 'lowpass',
      },
    ],
  },

  napalm: {
    fire: [
      {
        frequency: 1200,
        waveform: 'sawtooth',
        adsr: ADSR_PRESETS.pad,
        duration: 0.5,
        gain: 0.15,
        filterFreq: 2000,
        filterType: 'lowpass',
      },
      {
        frequency: 1800,
        waveform: 'sawtooth',
        adsr: ADSR_PRESETS.pad,
        duration: 0.5,
        gain: 0.1,
        filterFreq: 2500,
        filterType: 'lowpass',
      },
    ],
    impact: [
      { frequency: 60, waveform: 'sine', adsr: ADSR_PRESETS.explosion, duration: 0.6, gain: 0.3 },
      {
        frequency: 800,
        waveform: 'sawtooth',
        adsr: ADSR_PRESETS.pad,
        duration: 0.4,
        gain: 0.1,
        filterFreq: 1000,
        filterType: 'lowpass',
      },
    ],
  },

  'air-strike': {
    fire: [
      {
        frequency: 1000,
        frequencyEnd: 200,
        waveform: 'sine',
        adsr: ADSR_PRESETS.pluck,
        duration: 0.5,
        gain: 0.25,
      },
    ],
    impact: [
      { frequency: 50, waveform: 'sine', adsr: ADSR_PRESETS.explosion, duration: 0.5, gain: 0.4 },
      {
        frequency: 100,
        waveform: 'sawtooth',
        adsr: ADSR_PRESETS.percussive,
        duration: 0.15,
        gain: 0.2,
        filterFreq: 350,
        filterType: 'lowpass',
      },
    ],
  },
};

/** Get the sound set for a given weapon type. Falls back to default. */
export function getWeaponSound(weaponType: string): WeaponSoundSet {
  return WEAPON_SOUNDS[weaponType] ?? DEFAULT_SOUND;
}

/** Play the fire sound for a weapon type. */
export function playWeaponFire(
  context: AudioContext,
  destination: AudioNode,
  weaponType: string,
): void {
  const soundSet = getWeaponSound(weaponType);
  playLayered(context, destination, soundSet.fire);
}

/** Play the impact sound for a weapon type, scaled by explosion radius. */
export function playWeaponImpact(
  context: AudioContext,
  destination: AudioNode,
  weaponType: string,
  radius: number,
): void {
  const soundSet = getWeaponSound(weaponType);
  const scale = Math.max(0.5, Math.min(2.0, radius / 30));

  const scaledVoices = soundSet.impact.map((voice) => ({
    ...voice,
    gain: (voice.gain ?? 0.3) * scale,
    duration: voice.duration * Math.max(0.8, scale),
  }));

  playLayered(context, destination, scaledVoices);
}
