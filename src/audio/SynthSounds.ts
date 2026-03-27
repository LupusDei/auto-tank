import { playLayered, playSynth } from './SynthEngine';
import { ADSR_PRESETS } from './ADSREnvelope';
import type { SoundManager } from './SoundManager';
import type { SynthParams } from './SynthEngine';

/**
 * Play an explosion sound with pitch/duration scaled by radius.
 * Layers: low rumble + mid crunch + high crackle.
 */
export function playExplosionSound(sm: SoundManager, radius: number): void {
  const context = sm.getContext();
  const dest = sm.getMasterGain();
  if (!context || !dest) return;

  const scale = Math.max(0.3, Math.min(2.0, radius / 30));
  const baseDuration = 0.3 + radius * 0.01;

  const voices: SynthParams[] = [
    // Low rumble
    {
      frequency: Math.max(40, 80 - radius),
      waveform: 'sine',
      adsr: ADSR_PRESETS.explosion,
      duration: baseDuration * scale,
      gain: 0.4 * scale,
    },
    // Mid crunch
    {
      frequency: 120,
      waveform: 'sawtooth',
      adsr: ADSR_PRESETS.percussive,
      duration: baseDuration * 0.6,
      gain: 0.2 * scale,
      filterFreq: 400,
      filterType: 'lowpass',
    },
    // High crackle
    {
      frequency: 800,
      waveform: 'square',
      adsr: { attack: 0.001, decay: 0.03, sustain: 0.0, release: 0.02 },
      duration: 0.05,
      gain: 0.1 * scale,
    },
  ];

  playLayered(context, dest, voices);
}

/** Play a weapon fire sound: quick punchy "thwoop" with frequency sweep. */
export function playFireSound(sm: SoundManager): void {
  const context = sm.getContext();
  const dest = sm.getMasterGain();
  if (!context || !dest) return;

  playSynth(context, dest, {
    frequency: 200,
    frequencyEnd: 100,
    waveform: 'triangle',
    adsr: ADSR_PRESETS.percussive,
    duration: 0.15,
    gain: 0.3,
  });
}

/** Play a UI click sound: short blip. */
export function playUIClick(sm: SoundManager): void {
  const context = sm.getContext();
  const dest = sm.getMasterGain();
  if (!context || !dest) return;

  playSynth(context, dest, {
    frequency: 800,
    waveform: 'sine',
    adsr: ADSR_PRESETS.ui,
    duration: 0.06,
    gain: 0.2,
  });
}

/**
 * Play a victory fanfare: ascending chord progression with layered voices.
 * Uses triangle/sine waves for warm tone.
 */
export function playVictoryFanfare(sm: SoundManager): void {
  const context = sm.getContext();
  const dest = sm.getMasterGain();
  if (!context || !dest) return;

  const chords: readonly (readonly number[])[] = [
    [440, 554, 659], // A major
    [523, 659, 784], // C major (high)
    [587, 740, 880], // D major (high)
    [880, 1109, 1319], // A major (octave up)
  ];

  const noteDelay = 0.25;
  const noteDuration = 0.4;

  chords.forEach((chord, chordIndex) => {
    const startOffset = chordIndex * noteDelay;
    const isLast = chordIndex === chords.length - 1;
    const duration = isLast ? noteDuration * 1.5 : noteDuration;

    chord.forEach((freq) => {
      const osc = context.createOscillator();
      const gain = context.createGain();

      osc.type = chordIndex % 2 === 0 ? 'triangle' : 'sine';
      osc.frequency.setValueAtTime(freq, context.currentTime + startOffset);

      const peakGain = isLast ? 0.2 : 0.15;
      gain.gain.setValueAtTime(0, context.currentTime + startOffset);
      gain.gain.linearRampToValueAtTime(peakGain, context.currentTime + startOffset + 0.02);
      gain.gain.linearRampToValueAtTime(0, context.currentTime + startOffset + duration);

      osc.connect(gain);
      gain.connect(dest);
      osc.start(context.currentTime + startOffset);
      osc.stop(context.currentTime + startOffset + duration);
    });
  });
}

/**
 * Play ambient wind sound: multiple detuned sine waves at low frequency.
 * Uses pad ADSR for gentle crossfade.
 */
export function playWindAmbient(sm: SoundManager, windStrength: number): void {
  const context = sm.getContext();
  const dest = sm.getMasterGain();
  if (!context || !dest) return;

  const vol = Math.min(1, Math.abs(windStrength) / 20);
  if (vol <= 0.1) return;

  const baseFreq = 100 + Math.abs(windStrength) * 3;
  const voices: SynthParams[] = [
    {
      frequency: baseFreq,
      waveform: 'sine',
      adsr: ADSR_PRESETS.pad,
      duration: 2.0,
      gain: 0.08 * vol,
      detune: -10,
    },
    {
      frequency: baseFreq * 1.01,
      waveform: 'sine',
      adsr: ADSR_PRESETS.pad,
      duration: 2.0,
      gain: 0.06 * vol,
      detune: 7,
    },
    {
      frequency: baseFreq * 0.99,
      waveform: 'sine',
      adsr: ADSR_PRESETS.pad,
      duration: 2.0,
      gain: 0.06 * vol,
      detune: -15,
    },
  ];

  playLayered(context, dest, voices);
}

/** Play a damage hit sound with intensity based on damage amount. */
export function playDamageSound(sm: SoundManager, damage: number): void {
  const context = sm.getContext();
  const dest = sm.getMasterGain();
  if (!context || !dest) return;

  const freq = damage > 50 ? 100 : 200;
  const intensity = Math.min(1, damage / 100);

  playSynth(context, dest, {
    frequency: freq,
    waveform: 'sawtooth',
    adsr: ADSR_PRESETS.percussive,
    duration: 0.1 + intensity * 0.1,
    gain: 0.2 + intensity * 0.15,
    filterFreq: 600,
    filterType: 'lowpass',
  });
}
