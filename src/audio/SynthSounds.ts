import type { SoundManager } from './SoundManager';

/** Play an explosion sound with pitch/duration scaled by radius. */
export function playExplosionSound(sm: SoundManager, radius: number): void {
  const freq = Math.max(40, 120 - radius);
  const duration = 0.2 + radius * 0.01;
  sm.playTone(freq, duration);
}

/** Play a weapon fire sound. */
export function playFireSound(sm: SoundManager): void {
  sm.playTone(200, 0.1);
}

/** Play a UI click sound. */
export function playUIClick(sm: SoundManager): void {
  sm.playTone(800, 0.03);
}

/** Play a victory fanfare (ascending tones). */
export function playVictoryFanfare(sm: SoundManager): void {
  sm.playTone(440, 0.15);
  setTimeout(() => sm.playTone(554, 0.15), 200);
  setTimeout(() => sm.playTone(659, 0.15), 400);
  setTimeout(() => sm.playTone(880, 0.3), 600);
}

/** Play ambient wind sound (white noise filtered). */
export function playWindAmbient(sm: SoundManager, windStrength: number): void {
  const vol = Math.min(1, Math.abs(windStrength) / 20);
  if (vol > 0.1) {
    sm.playTone(150 + windStrength * 5, 0.5);
  }
}

/** Play a damage hit sound. */
export function playDamageSound(sm: SoundManager, damage: number): void {
  const freq = damage > 50 ? 100 : 200;
  sm.playTone(freq, 0.08);
}
