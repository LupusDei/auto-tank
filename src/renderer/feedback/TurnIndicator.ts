import { calculateTrajectoryStep } from '@engine/physics';
import type { Vector2D } from '@shared/types/geometry';

/** Calculate trajectory preview points for the aim guide. */
export function calculateTrajectoryPreview(
  startPos: Vector2D,
  angleDeg: number,
  power: number,
  wind: number,
  gravity: number,
  steps = 60,
): Vector2D[] {
  const angleRad = ((180 - angleDeg) * Math.PI) / 180;
  let pos = { ...startPos };
  let vel = { x: Math.cos(angleRad) * power * 5, y: -Math.sin(angleRad) * power * 5 };
  const points: Vector2D[] = [{ ...pos }];
  const dt = 1 / 60;

  for (let i = 0; i < steps; i++) {
    const result = calculateTrajectoryStep(pos, vel, wind, gravity * 50, dt);
    pos = result.position;
    vel = result.velocity;
    points.push({ ...pos });
  }

  return points;
}

/** Render dotted trajectory preview. */
export function renderTrajectoryPreview(
  ctx: CanvasRenderingContext2D,
  points: readonly Vector2D[],
): void {
  ctx.save();
  for (let i = 0; i < points.length; i++) {
    const p = points[i];
    if (!p) continue;
    const alpha = 1 - i / points.length;
    ctx.globalAlpha = alpha * 0.5;
    ctx.fillStyle = '#ffffff';
    if (i % 3 === 0) {
      ctx.beginPath();
      ctx.arc(p.x, p.y, 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }
  ctx.restore();
}

/** Render animated turn indicator arrow above active tank. */
export function renderTurnIndicator(
  ctx: CanvasRenderingContext2D,
  position: Vector2D,
  elapsed: number,
): void {
  const bounce = Math.sin(elapsed * 4) * 5;
  const x = position.x;
  const y = position.y - 45 + bounce;

  ctx.save();
  ctx.fillStyle = '#ffffff';
  ctx.globalAlpha = 0.8;

  // Triangle arrow pointing down
  ctx.beginPath();
  ctx.moveTo(x, y + 10);
  ctx.lineTo(x - 6, y);
  ctx.lineTo(x + 6, y);
  ctx.closePath();
  ctx.fill();

  ctx.restore();
}
