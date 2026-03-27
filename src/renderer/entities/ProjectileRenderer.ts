import type { Vector2D } from '@shared/types/geometry';
import type { WeaponType } from '@shared/types/weapons';

type ProjectileShape = 'circle' | 'pointed' | 'crescent';

interface ProjectileStyle {
  readonly color: string;
  readonly radius: number;
  readonly shape: ProjectileShape;
  readonly glowColor?: string | undefined;
}

const PROJECTILE_STYLES: Partial<Record<WeaponType, ProjectileStyle>> = {
  'nuke': { color: '#ffffff', radius: 6, shape: 'circle', glowColor: '#ff0000' },
  'napalm': { color: '#ff4500', radius: 4, shape: 'pointed', glowColor: '#ff6600' },
  'holy-hand-grenade': { color: '#ffd700', radius: 4, shape: 'circle', glowColor: '#ffffff' },
  'grenade': { color: '#333333', radius: 2.5, shape: 'circle' },
  'banana-bomb': { color: '#ffe135', radius: 4, shape: 'crescent' },
  'dirt-bomb': { color: '#8b4513', radius: 3.5, shape: 'circle' },
  'roller': { color: '#444444', radius: 3, shape: 'circle' },
  'smoke-tracer': { color: '#bbbbbb', radius: 3, shape: 'circle', glowColor: '#cccccc' },
};

export interface ProjectileRenderParams {
  readonly position: Vector2D;
  readonly trail: readonly Vector2D[];
  readonly color?: string;
  readonly radius?: number;
  readonly weaponType?: WeaponType;
}

/** Get the projectile style for a weapon type, with defaults. */
function getProjectileStyle(params: ProjectileRenderParams): ProjectileStyle {
  const weaponStyle = params.weaponType ? PROJECTILE_STYLES[params.weaponType] : undefined;
  return {
    color: params.color ?? weaponStyle?.color ?? '#ff6600',
    radius: params.radius ?? weaponStyle?.radius ?? 3,
    shape: weaponStyle?.shape ?? 'circle',
    glowColor: weaponStyle?.glowColor,
  };
}

/** Render a circle-shaped projectile head. */
function renderCircleHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
): void {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();
}

/** Render a pointed (teardrop) projectile for napalm-like weapons. */
function renderPointedHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  trail: readonly Vector2D[],
): void {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0, Math.PI * 2);
  ctx.fillStyle = color;
  ctx.fill();

  // Draw pointed tail in direction of motion
  if (trail.length >= 2) {
    const prev = trail[trail.length - 2];
    if (prev) {
      const dx = x - prev.x;
      const dy = y - prev.y;
      const dist = Math.sqrt(dx * dx + dy * dy);
      if (dist > 0.1) {
        const nx = -dx / dist;
        const ny = -dy / dist;
        ctx.beginPath();
        ctx.moveTo(x + nx * radius * 2.5, y + ny * radius * 2.5);
        ctx.lineTo(x - ny * radius * 0.6, y + nx * radius * 0.6);
        ctx.lineTo(x + ny * radius * 0.6, y - nx * radius * 0.6);
        ctx.closePath();
        ctx.fillStyle = color;
        ctx.fill();
      }
    }
  }
}

/** Render a crescent-shaped projectile (banana bomb). */
function renderCrescentHead(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
): void {
  ctx.beginPath();
  ctx.arc(x, y, radius, 0.3, Math.PI - 0.3);
  ctx.strokeStyle = color;
  ctx.lineWidth = radius * 0.8;
  ctx.lineCap = 'round';
  ctx.stroke();
}

/** Render the glow effect around a projectile. */
function renderGlow(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  radius: number,
  color: string,
  glowColor?: string,
): void {
  const gc = glowColor ?? color;
  ctx.beginPath();
  ctx.arc(x, y, radius * 2, 0, Math.PI * 2);
  ctx.fillStyle = `${gc}44`;
  ctx.fill();
}

/** Render a projectile with a fading trail. */
export function renderProjectile(
  ctx: CanvasRenderingContext2D,
  params: ProjectileRenderParams,
): void {
  const { position, trail } = params;
  const style = getProjectileStyle(params);
  const { color, radius, shape, glowColor } = style;

  // Draw fading trail
  renderTrail(ctx, trail, color);

  // Draw projectile head based on shape
  switch (shape) {
    case 'pointed':
      renderPointedHead(ctx, position.x, position.y, radius, color, trail);
      break;
    case 'crescent':
      renderCrescentHead(ctx, position.x, position.y, radius, color);
      break;
    default:
      renderCircleHead(ctx, position.x, position.y, radius, color);
      break;
  }

  // Glow effect
  renderGlow(ctx, position.x, position.y, radius, color, glowColor);
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

/** Exported for testing. */
export { PROJECTILE_STYLES };
