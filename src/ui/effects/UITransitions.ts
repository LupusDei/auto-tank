export type EasingFn = (t: number) => number;

export const easeOutCubic: EasingFn = (t) => 1 - Math.pow(1 - t, 3);
export const easeInOutQuad: EasingFn = (t) =>
  t < 0.5 ? 2 * t * t : 1 - Math.pow(-2 * t + 2, 2) / 2;
export const easeOutBounce: EasingFn = (t) => {
  if (t < 1 / 2.75) return 7.5625 * t * t;
  if (t < 2 / 2.75) {
    const t2 = t - 1.5 / 2.75;
    return 7.5625 * t2 * t2 + 0.75;
  }
  if (t < 2.5 / 2.75) {
    const t2 = t - 2.25 / 2.75;
    return 7.5625 * t2 * t2 + 0.9375;
  }
  const t2 = t - 2.625 / 2.75;
  return 7.5625 * t2 * t2 + 0.984375;
};

export interface TransitionState {
  readonly active: boolean;
  readonly progress: number;
  readonly startTime: number;
  readonly duration: number;
  readonly easing: EasingFn;
}

export function createTransition(
  duration: number,
  easing: EasingFn = easeOutCubic,
): TransitionState {
  return { active: true, progress: 0, startTime: performance.now(), duration, easing };
}

export function updateTransition(state: TransitionState): TransitionState {
  if (!state.active) return state;
  const elapsed = performance.now() - state.startTime;
  const raw = Math.min(1, elapsed / state.duration);
  const progress = state.easing(raw);
  return { ...state, progress, active: raw < 1 };
}

export function isTransitionComplete(state: TransitionState): boolean {
  return !state.active && state.progress >= 1;
}
