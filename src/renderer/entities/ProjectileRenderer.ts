import type { Vector2D } from '@shared/types/geometry';

export interface ProjectileRenderParams {
  readonly position: Vector2D;
  readonly trail: readonly Vector2D[];
  readonly color?: string;
  readonly radius?: number;
}

/** Render a projectile with a fading trail. */
export function renderProjectile(
  ctx: CanvasRenderingContext2D,
  params: ProjectileRenderParams,
): void {
  const { position, trail, color = '#ff6600', radius = 3 } = params;

  // Draw fading trail
  renderTrail(ctx, trail, color);

  // Draw projectile head
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Glow effect
  ctx.beginPath();
  ctx.arc(position.x, position.y, radius * 2, 0, Math.PI * 2);
  ctx.fillStyle = `${color}44`;
  ctx.fill();
}

/** Render a fading trail behind a projectile. */
export function renderTrail(
  ctx: CanvasRenderingContext2D,
  trail: readonly Vector2D[],
  color: string,
): void {
  if (trail.length < 2) return;

  const maxPoints = Math.min(trail.length, 50);
  const startIdx = trail.length - maxPoints;

  for (let i = startIdx + 1; i < trail.length; i++) {
    const prev = trail[i - 1];
    const curr = trail[i];
    if (!prev || !curr) continue;

    const progress = (i - startIdx) / maxPoints;
    const alpha = Math.floor(progress * 255)
      .toString(16)
      .padStart(2, '0');

    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.strokeStyle = `${color}${alpha}`;
    ctx.lineWidth = 1 + progress;
    ctx.stroke();
  }
}
