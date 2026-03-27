import type { Vector2D } from '@shared/types/geometry';

export interface KillConfirmationState {
  readonly killerName: string;
  readonly victimName: string;
  readonly position: Vector2D;
  readonly startTime: number;
  readonly duration: number;
}

const SLOW_MO_END = 0.5;
const TEXT_START = 0.5;
const FADE_START = 1.5;

/** Create a new kill confirmation overlay. */
export function createKillConfirmation(
  killerName: string,
  victimName: string,
  position: Vector2D,
): KillConfirmationState {
  return {
    killerName,
    victimName,
    position,
    startTime: performance.now(),
    duration: 2,
  };
}

/**
 * Get timescale factor for slow-motion effect.
 * Returns 0.2 during slow-mo, ramps back to 1.0.
 */
export function getKillConfirmationTimescale(elapsed: number, duration: number): number {
  if (elapsed >= duration) return 1.0;
  if (elapsed < SLOW_MO_END) return 0.2;
  if (elapsed < FADE_START) {
    // Hold at 0.2 during text display phase
    return 0.2;
  }
  // Ramp from 0.2 to 1.0 during fade-out (1.5s to 2.0s)
  const rampProgress = (elapsed - FADE_START) / (duration - FADE_START);
  return 0.2 + rampProgress * 0.8;
}

/** Render kill confirmation overlay with vignette. */
export function renderKillConfirmation(
  ctx: CanvasRenderingContext2D,
  state: KillConfirmationState,
  canvasWidth: number,
  canvasHeight: number,
  elapsed: number,
): void {
  if (elapsed >= state.duration) return;

  ctx.save();

  // Calculate fade-out alpha
  let alpha = 1;
  if (elapsed >= FADE_START) {
    alpha = 1 - (elapsed - FADE_START) / (state.duration - FADE_START);
  }

  // Dark vignette overlay
  ctx.globalAlpha = alpha * 0.5;
  ctx.fillStyle = '#000000';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // "ELIMINATED" text (visible during text phase)
  if (elapsed >= TEXT_START && elapsed < state.duration) {
    ctx.globalAlpha = alpha;
    ctx.font = 'bold 48px monospace';
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillStyle = '#ff3333';
    ctx.fillText('ELIMINATED', canvasWidth / 2, canvasHeight / 2 - 20);

    // Killer -> Victim subtitle
    ctx.font = '20px monospace';
    ctx.fillStyle = '#ffffff';
    ctx.fillText(
      `${state.killerName} → ${state.victimName}`,
      canvasWidth / 2,
      canvasHeight / 2 + 25,
    );
  }

  ctx.restore();
}
