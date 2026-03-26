/** Screen shake state. */
export interface ShakeState {
  intensity: number;
  elapsed: number;
  duration: number;
}

/** Create a screen shake. */
export function createShake(intensity: number, duration = 500): ShakeState {
  return { intensity, elapsed: 0, duration };
}

/** Update shake — decay over time. */
export function updateShake(shake: ShakeState, dt: number): ShakeState {
  return { ...shake, elapsed: shake.elapsed + dt * 1000 };
}

/** Get shake offset for this frame. */
export function getShakeOffset(shake: ShakeState): { x: number; y: number } {
  if (shake.elapsed >= shake.duration) return { x: 0, y: 0 };
  const decay = 1 - shake.elapsed / shake.duration;
  return {
    x: (Math.random() * 2 - 1) * shake.intensity * decay,
    y: (Math.random() * 2 - 1) * shake.intensity * decay,
  };
}

/** Check if shake is complete. */
export function isShakeComplete(shake: ShakeState): boolean {
  return shake.elapsed >= shake.duration;
}

/** Kill cam slow-motion factor. */
export function getKillCamFactor(elapsed: number, duration: number): number {
  if (elapsed >= duration) return 1;
  const progress = elapsed / duration;
  return progress < 0.5 ? 0.2 : 0.2 + (progress - 0.5) * 1.6;
}

/** Round transition fade effect (0 = fully visible, 1 = fully black). */
export function getRoundTransitionFade(elapsed: number, duration: number): number {
  const half = duration / 2;
  if (elapsed < half) return elapsed / half;
  return 1 - (elapsed - half) / half;
}
