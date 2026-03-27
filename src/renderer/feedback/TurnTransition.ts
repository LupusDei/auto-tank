export interface TurnTransitionState {
  readonly playerName: string;
  readonly playerColor: string;
  readonly startTime: number;
  readonly duration: number;
  readonly phase: 'slide-in' | 'hold' | 'slide-out';
}

const SLIDE_IN_END = 0.3;
const HOLD_END = 1.1;

/** Create a new turn transition banner. */
export function createTurnTransition(playerName: string, playerColor: string): TurnTransitionState {
  return {
    playerName,
    playerColor,
    startTime: performance.now(),
    duration: 1.5,
    phase: 'slide-in',
  };
}

/** Determine transition phase from elapsed time. */
export function getTurnTransitionPhase(
  elapsed: number,
  duration: number,
): 'slide-in' | 'hold' | 'slide-out' | 'done' {
  if (elapsed >= duration) return 'done';
  if (elapsed < SLIDE_IN_END) return 'slide-in';
  if (elapsed < HOLD_END) return 'hold';
  return 'slide-out';
}

/** Render the turn transition banner overlay. */
export function renderTurnTransition(
  ctx: CanvasRenderingContext2D,
  state: TurnTransitionState,
  canvasWidth: number,
  canvasHeight: number,
  elapsed: number,
): void {
  const phase = getTurnTransitionPhase(elapsed, state.duration);
  if (phase === 'done') return;

  ctx.save();

  const bannerHeight = 100;
  const centerY = canvasHeight / 2 - bannerHeight / 2;

  // Calculate horizontal offset based on phase
  let offsetX = 0;
  if (phase === 'slide-in') {
    const progress = elapsed / SLIDE_IN_END;
    offsetX = (1 - progress) * -canvasWidth;
  } else if (phase === 'slide-out') {
    const progress = (elapsed - HOLD_END) / (state.duration - HOLD_END);
    offsetX = progress * canvasWidth;
  }

  // Semi-transparent black banner
  ctx.globalAlpha = 0.7;
  ctx.fillStyle = '#000000';
  ctx.fillRect(offsetX, centerY, canvasWidth, bannerHeight);

  // Player name
  ctx.globalAlpha = 1;
  ctx.font = 'bold 36px monospace';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillStyle = state.playerColor;
  ctx.fillText(state.playerName, canvasWidth / 2 + offsetX, centerY + 35);

  // "YOUR TURN" subtitle
  ctx.font = '18px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.fillText('YOUR TURN', canvasWidth / 2 + offsetX, centerY + 70);

  ctx.restore();
}
