export interface CelebrationState {
  readonly winnerName: string;
  readonly winnerColor: string;
  readonly startTime: number;
}

const CELEBRATION_DURATION = 3;
const FADE_START = 2.5;
const CONFETTI_COUNT = 40;

/** Create a round celebration state. */
export function createCelebration(winnerName: string, winnerColor: string): CelebrationState {
  return {
    winnerName,
    winnerColor,
    startTime: performance.now(),
  };
}

/**
 * Deterministic pseudo-random from a seed.
 * Used for confetti positions so they are reproducible.
 */
function seededRandom(seed: number): number {
  const x = Math.sin(seed * 9301 + 49297) * 49297;
  return x - Math.floor(x);
}

/** Render celebration overlay with confetti and winner text. */
export function renderCelebration(
  ctx: CanvasRenderingContext2D,
  state: CelebrationState,
  canvasWidth: number,
  canvasHeight: number,
  elapsed: number,
): void {
  if (elapsed >= CELEBRATION_DURATION) return;

  ctx.save();

  // Fade out near end
  const alpha =
    elapsed >= FADE_START ? 1 - (elapsed - FADE_START) / (CELEBRATION_DURATION - FADE_START) : 1;
  ctx.globalAlpha = alpha;

  // Semi-transparent overlay
  ctx.fillStyle = 'rgba(0, 0, 0, 0.4)';
  ctx.fillRect(0, 0, canvasWidth, canvasHeight);

  // "ROUND COMPLETE" text
  ctx.font = 'bold 48px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = '#ffcc00';
  ctx.fillText('ROUND COMPLETE', canvasWidth / 2, canvasHeight / 2 - 30);

  // Winner name
  ctx.font = 'bold 32px monospace';
  ctx.fillStyle = state.winnerColor;
  ctx.fillText(state.winnerName, canvasWidth / 2, canvasHeight / 2 + 20);

  // Deterministic confetti particles
  const confettiColors = ['#ff3333', '#33ff33', '#3333ff', '#ffff33', '#ff33ff', '#33ffff'];
  for (let i = 0; i < CONFETTI_COUNT; i++) {
    const seed = i * 7 + 13;
    const x = seededRandom(seed) * canvasWidth;
    const baseY = seededRandom(seed + 1) * canvasHeight * 0.6;
    const fallSpeed = 80 + seededRandom(seed + 2) * 120;
    const y = baseY + elapsed * fallSpeed;
    const colorIndex = Math.floor(seededRandom(seed + 3) * confettiColors.length);
    const color = confettiColors[colorIndex] ?? '#ffffff';
    const size = 3 + seededRandom(seed + 4) * 5;

    ctx.fillStyle = color;
    ctx.beginPath();
    ctx.arc(x, y, size, 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
