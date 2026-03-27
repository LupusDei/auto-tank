import type { TeamColor } from '@shared/types/entities';

const COLOR_MAP: Record<TeamColor, string> = {
  red: '#e74c3c',
  blue: '#3498db',
  green: '#2ecc71',
  yellow: '#f1c40f',
  purple: '#9b59b6',
  orange: '#e67e22',
};

export function getTeamHexColor(color: TeamColor): string {
  return COLOR_MAP[color];
}

export interface TankRenderParams {
  readonly x: number;
  readonly y: number;
  readonly angle: number;
  readonly color: TeamColor;
  readonly barrelLength?: number;
  readonly bodyWidth?: number;
  readonly bodyHeight?: number;
}

/** Darken a hex color by a factor (0-1, where 0 = black). */
function darkenColor(hex: string, factor: number): string {
  const r = Math.floor(parseInt(hex.slice(1, 3), 16) * factor);
  const g = Math.floor(parseInt(hex.slice(3, 5), 16) * factor);
  const b = Math.floor(parseInt(hex.slice(5, 7), 16) * factor);
  return `rgb(${r},${g},${b})`;
}

/** Lighten a hex color by blending toward white. */
function lightenColor(hex: string, factor: number): string {
  const r = Math.floor(parseInt(hex.slice(1, 3), 16) + (255 - parseInt(hex.slice(1, 3), 16)) * factor);
  const g = Math.floor(parseInt(hex.slice(3, 5), 16) + (255 - parseInt(hex.slice(3, 5), 16)) * factor);
  const b = Math.floor(parseInt(hex.slice(5, 7), 16) + (255 - parseInt(hex.slice(5, 7), 16)) * factor);
  return `rgb(${r},${g},${b})`;
}

/** Draw a rounded rectangle path. */
function roundedRectPath(
  ctx: CanvasRenderingContext2D,
  rx: number,
  ry: number,
  rw: number,
  rh: number,
  radius: number,
): void {
  const r = Math.min(radius, rw / 2, rh / 2);
  ctx.beginPath();
  ctx.moveTo(rx + r, ry);
  ctx.lineTo(rx + rw - r, ry);
  ctx.quadraticCurveTo(rx + rw, ry, rx + rw, ry + r);
  ctx.lineTo(rx + rw, ry + rh - r);
  ctx.quadraticCurveTo(rx + rw, ry + rh, rx + rw - r, ry + rh);
  ctx.lineTo(rx + r, ry + rh);
  ctx.quadraticCurveTo(rx, ry + rh, rx, ry + rh - r);
  ctx.lineTo(rx, ry + r);
  ctx.quadraticCurveTo(rx, ry, rx + r, ry);
  ctx.closePath();
}

/** Render tank body with gradient and shadow underside. */
function renderBody(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bodyWidth: number,
  bodyHeight: number,
  hexColor: string,
): void {
  const bx = x - bodyWidth / 2;
  const by = y - bodyHeight;

  // Body with gradient
  const grad = ctx.createLinearGradient(bx, by, bx, by + bodyHeight);
  grad.addColorStop(0, lightenColor(hexColor, 0.2));
  grad.addColorStop(0.6, hexColor);
  grad.addColorStop(1, darkenColor(hexColor, 0.6));
  roundedRectPath(ctx, bx, by, bodyWidth, bodyHeight, 3);
  ctx.fillStyle = grad;
  ctx.fill();

  // Team-color accent stripe near top
  ctx.fillStyle = lightenColor(hexColor, 0.4);
  ctx.fillRect(bx + 3, by + 2, bodyWidth - 6, 2);
}

/** Render metallic turret dome with gradient. */
function renderTurret(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bodyHeight: number,
  hexColor: string,
): void {
  const domeRadius = bodyHeight * 0.6;
  const domeY = y - bodyHeight;

  const grad = ctx.createRadialGradient(x, domeY - domeRadius * 0.3, 1, x, domeY, domeRadius);
  grad.addColorStop(0, lightenColor(hexColor, 0.4));
  grad.addColorStop(0.7, hexColor);
  grad.addColorStop(1, darkenColor(hexColor, 0.5));

  ctx.beginPath();
  ctx.arc(x, domeY, domeRadius, Math.PI, 0);
  ctx.fillStyle = grad;
  ctx.fill();
}

/** Render treads with wheel circles and track backing. */
function renderTreads(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bodyWidth: number,
): void {
  const trackWidth = bodyWidth + 4;
  const trackX = x - trackWidth / 2;
  const trackHeight = 5;

  // Track rectangle behind wheels
  ctx.fillStyle = '#2a2a2a';
  ctx.fillRect(trackX, y - 2, trackWidth, trackHeight);

  // Wheel circles (5 evenly spaced)
  const wheelCount = 5;
  const wheelRadius = 2.5;
  const spacing = (trackWidth - wheelRadius * 2) / (wheelCount - 1);
  ctx.fillStyle = '#555';
  for (let i = 0; i < wheelCount; i++) {
    const wx = trackX + wheelRadius + spacing * i;
    ctx.beginPath();
    ctx.arc(wx, y + 1, wheelRadius, 0, Math.PI * 2);
    ctx.fill();
  }
}

/** Render thicker barrel with muzzle tip. */
function renderBarrel(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  bodyHeight: number,
  angle: number,
  barrelLength: number,
): void {
  const radians = ((180 - angle) * Math.PI) / 180;
  const baseX = x;
  const baseY = y - bodyHeight;
  const endX = baseX + Math.cos(radians) * barrelLength;
  const endY = baseY - Math.sin(radians) * barrelLength;

  // Main barrel (6px)
  ctx.beginPath();
  ctx.moveTo(baseX, baseY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = '#444';
  ctx.lineWidth = 6;
  ctx.lineCap = 'round';
  ctx.stroke();

  // Muzzle tip (darker end)
  const muzzleLen = 4;
  const muzzleStartX = endX - Math.cos(radians) * muzzleLen;
  const muzzleStartY = endY + Math.sin(radians) * muzzleLen;
  ctx.beginPath();
  ctx.moveTo(muzzleStartX, muzzleStartY);
  ctx.lineTo(endX, endY);
  ctx.strokeStyle = '#222';
  ctx.lineWidth = 7;
  ctx.lineCap = 'round';
  ctx.stroke();
}

export function renderTank(ctx: CanvasRenderingContext2D, params: TankRenderParams): void {
  const { x, y, angle, color, barrelLength = 20, bodyWidth = 30, bodyHeight = 15 } = params;
  const hexColor = getTeamHexColor(color);

  ctx.save();
  renderTreads(ctx, x, y, bodyWidth);
  renderBody(ctx, x, y, bodyWidth, bodyHeight, hexColor);
  renderTurret(ctx, x, y, bodyHeight, hexColor);
  renderBarrel(ctx, x, y, bodyHeight, angle, barrelLength);
  ctx.restore();
}

/** Render a health bar above a tank. */
export function renderHealthBar(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  health: number,
  maxHealth: number,
  width = 30,
): void {
  const barHeight = 6;
  const barY = y - 30;
  const pct = maxHealth > 0 ? health / maxHealth : 0;

  // White border outline
  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 1;
  ctx.strokeRect(x - width / 2 - 1, barY - 1, width + 2, barHeight + 2);

  // Background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fillRect(x - width / 2, barY, width, barHeight);

  // Health fill
  const fillColor = pct > 0.5 ? '#2ecc71' : pct > 0.2 ? '#f39c12' : '#e74c3c';
  ctx.fillStyle = fillColor;
  ctx.fillRect(x - width / 2, barY, width * pct, barHeight);

  // HP number above bar
  const hpText = `${Math.round(health)}`;
  ctx.font = '9px monospace';
  ctx.textAlign = 'center';
  ctx.fillStyle = '#ffffff';
  ctx.fillText(hpText, x, barY - 3);
}

/** Render a complete tank with health bar. */
export function renderTankWithHealth(
  ctx: CanvasRenderingContext2D,
  params: TankRenderParams,
  health: number,
  maxHealth: number,
): void {
  renderTank(ctx, params);
  renderHealthBar(ctx, params.x, params.y, health, maxHealth, params.bodyWidth);
}
