export type TimeoutAction = 'skip' | 'auto_fire' | 'random_fire';

export interface RoundTimerConfig {
  readonly maxTurnTime: number;
  readonly timeoutAction: TimeoutAction;
  readonly warningThreshold: number;
}

/** Create default timer config. */
export function createTimerConfig(maxTurnTime = 30): RoundTimerConfig {
  return { maxTurnTime, timeoutAction: 'skip', warningThreshold: 5 };
}

/** Check if turn time is expired. */
export function isTurnExpired(elapsed: number, maxTime: number): boolean {
  return elapsed >= maxTime;
}

/** Check if warning should be shown. */
export function shouldShowWarning(remaining: number, threshold: number): boolean {
  return remaining > 0 && remaining <= threshold;
}

/** Get remaining time. */
export function getRemainingTime(elapsed: number, maxTime: number): number {
  return Math.max(0, maxTime - elapsed);
}

/** Get timer percentage (0-1). */
export function getTimerProgress(elapsed: number, maxTime: number): number {
  return Math.min(1, elapsed / maxTime);
}
