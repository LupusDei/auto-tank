import type { Vector2D } from '@shared/types/geometry';

export interface CrateRenderParams {
  readonly position: Vector2D;
  readonly state: 'falling' | 'landed' | 'collected';
  readonly elapsed: number;
}

const CRATE_SIZE = 20;
const CRATE_HALF = CRATE_SIZE / 2;
const CRATE_COLOR = '#8B4513';
const PARACHUTE_COLOR = '#ffffff';
const PARACHUTE_RADIUS = 16;
const SWAY_AMPLITUDE = 3;
const SWAY_FREQUENCY = 0.003;

/** Render a crate on the canvas. */
export function renderCrate(ctx: CanvasRenderingContext2D, params: CrateRenderParams): void {
  if (params.state === 'collected') {
    return;
  }

  ctx.save();

  // Draw the crate box
  ctx.fillStyle = CRATE_COLOR;
  ctx.fillRect(
    params.position.x - CRATE_HALF,
    params.position.y - CRATE_HALF,
    CRATE_SIZE,
    CRATE_SIZE,
  );

  // Draw "?" symbol
  ctx.fillStyle = '#ffdd00';
  ctx.font = 'bold 14px monospace';
  ctx.textAlign = 'center';
  ctx.fillText('?', params.position.x, params.position.y + 5);

  // Parachute while falling
  if (params.state === 'falling') {
    renderParachute(ctx, params.position, params.elapsed);
  }

  // Glow effect when landed
  if (params.state === 'landed') {
    const pulse = 0.5 + 0.5 * Math.sin(params.elapsed * 0.005);
    ctx.strokeStyle = `rgba(255, 255, 0, ${pulse})`;
    ctx.lineWidth = 2;
    ctx.strokeRect(
      params.position.x - CRATE_HALF - 2,
      params.position.y - CRATE_HALF - 2,
      CRATE_SIZE + 4,
      CRATE_SIZE + 4,
    );
  }

  ctx.restore();
}

/** Render parachute above a crate position. */
export function renderParachute(
  ctx: CanvasRenderingContext2D,
  position: Vector2D,
  elapsed: number,
): void {
  const swayOffset = Math.sin(elapsed * SWAY_FREQUENCY) * SWAY_AMPLITUDE;
  const canopyX = position.x + swayOffset;
  const canopyY = position.y - CRATE_HALF - PARACHUTE_RADIUS - 5;

  ctx.save();

  // Canopy (semi-circle)
  ctx.beginPath();
  ctx.arc(canopyX, canopyY + PARACHUTE_RADIUS, PARACHUTE_RADIUS, Math.PI, 0);
  ctx.fillStyle = PARACHUTE_COLOR;
  ctx.fill();
  ctx.closePath();

  // Three strings from canopy to crate
  ctx.strokeStyle = '#cccccc';
  ctx.lineWidth = 1;
  const stringOffsets = [-PARACHUTE_RADIUS, 0, PARACHUTE_RADIUS];
  for (const offset of stringOffsets) {
    ctx.beginPath();
    ctx.moveTo(canopyX + offset, canopyY + PARACHUTE_RADIUS);
    ctx.lineTo(position.x, position.y - CRATE_HALF);
    ctx.stroke();
  }

  ctx.restore();
}
