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

export function renderTank(ctx: CanvasRenderingContext2D, params: TankRenderParams): void {
  const { x, y, angle, color, barrelLength = 20, bodyWidth = 30, bodyHeight = 15 } = params;

  const hexColor = getTeamHexColor(color);

  // Tank body
  ctx.fillStyle = hexColor;
  ctx.fillRect(x - bodyWidth / 2, y - bodyHeight, bodyWidth, bodyHeight);

  // Tank turret dome
  ctx.beginPath();
  ctx.arc(x, y - bodyHeight, bodyHeight * 0.6, Math.PI, 0);
  ctx.fillStyle = hexColor;
  ctx.fill();

  // Barrel
  const radians = ((180 - angle) * Math.PI) / 180;
  const barrelEndX = x + Math.cos(radians) * barrelLength;
  const barrelEndY = y - bodyHeight - Math.sin(radians) * barrelLength;

  ctx.beginPath();
  ctx.moveTo(x, y - bodyHeight);
  ctx.lineTo(barrelEndX, barrelEndY);
  ctx.strokeStyle = '#333';
  ctx.lineWidth = 4;
  ctx.stroke();

  // Treads
  ctx.fillStyle = '#333';
  ctx.fillRect(x - bodyWidth / 2 - 2, y - 3, bodyWidth + 4, 3);
}
