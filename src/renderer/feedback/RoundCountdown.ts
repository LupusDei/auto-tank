export interface CountdownState {
  readonly count: number;
  readonly startTime: number;
  readonly interval: number;
}

const DEFAULT_INTERVAL = 0.8;
const TOTAL_COUNTS = 4; // 3, 2, 1, GO!

/** Create a new countdown starting at 3. */
export function createCountdown(): CountdownState {
  return {
    count: 3,
    startTime: performance.now(),
    interval: DEFAULT_INTERVAL,
  };
}

/** Get the display value for the current countdown moment. */
export function getCountdownValue(elapsed: number, interval: number): string {
  const index = Math.floor(elapsed / interval);
  if (index >= TOTAL_COUNTS) return '';
  const values = ['3', '2', '1', 'GO!'];
  return values[index] ?? '';
}

/**
 * Render a countdown number/text centered on screen.
 * progress: 0-1 within the current count interval.
 */
export function renderCountdown(
  ctx: CanvasRenderingContext2D,
  value: string,
  canvasWidth: number,
  canvasHeight: number,
  progress: number,
): void {
  if (value === '') return;

  ctx.save();

  // Semi-transparent dark overlay
  ctx.globalAlpha = 0.4;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // Scale: starts at 2x, bounces down to 1x
  // Bounce ease: overshoot at 0.7 then settle
  const t = Math.min(progress, 1);
  const bounce = t < 0.7 ? 2 - t / 0.7 : 1 + Math.sin(((t - 0.7) / 0.3) * Math.PI) * 0.05;
  const scale = Math.max(bounce, 1);

  ctx.globalAlpha = 1;
  ctx.font = `bold ${Math.round(80 * scale)}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = value === 'GO!' ? '#44ff44' : '#ffffff';
  ctx.fillText(value, canvasWidth / 2, canvasHeight / 2);

  ctx.restore();
}
