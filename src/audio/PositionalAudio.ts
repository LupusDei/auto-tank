import type { Vector2D } from '@shared/types/geometry';

/** Calculate stereo pan value (-1 to 1) from world position. */
export function calculatePan(position: Vector2D, worldWidth: number): number {
  const normalized = position.x / worldWidth;
  return Math.max(-1, Math.min(1, normalized * 2 - 1));
}

/** Calculate volume attenuation based on distance from listener. */
export function calculateDistanceAttenuation(
  source: Vector2D,
  listener: Vector2D,
  maxDistance: number,
): number {
  const dx = source.x - listener.x;
  const dy = source.y - listener.y;
  const distance = Math.sqrt(dx * dx + dy * dy);
  if (distance >= maxDistance) return 0;
  return 1 - distance / maxDistance;
}

export interface MusicTrack {
  readonly name: string;
  readonly volume: number;
}

/** Calculate crossfade volumes between two tracks. */
export function calculateCrossfade(progress: number): { outVolume: number; inVolume: number } {
  const clamped = Math.max(0, Math.min(1, progress));
  return {
    outVolume: 1 - clamped,
    inVolume: clamped,
  };
}
