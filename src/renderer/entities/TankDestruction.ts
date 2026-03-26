import { getTeamHexColor } from './TankRenderer';
import type { TeamColor } from '@shared/types/entities';
import type { Vector2D } from '@shared/types/geometry';

export interface WreckagePiece {
  readonly position: Vector2D;
  readonly velocity: Vector2D;
  readonly rotation: number;
  readonly rotationSpeed: number;
  readonly size: number;
  readonly color: string;
  readonly type: 'body' | 'turret' | 'tread' | 'debris';
}

export interface TankWreckage {
  readonly pieces: WreckagePiece[];
  readonly position: Vector2D;
  readonly elapsed: number;
  readonly complete: boolean;
}

/** Create wreckage pieces when a tank is destroyed. */
export function createTankWreckage(position: Vector2D, color: TeamColor): TankWreckage {
  const hexColor = getTeamHexColor(color);
  const pieces: WreckagePiece[] = [
    {
      position: { ...position },
      velocity: { x: -30, y: -120 },
      rotation: 0,
      rotationSpeed: 3,
      size: 15,
      color: hexColor,
      type: 'body',
    },
    {
      position: { x: position.x, y: position.y - 15 },
      velocity: { x: 20, y: -200 },
      rotation: 0,
      rotationSpeed: 8,
      size: 10,
      color: hexColor,
      type: 'turret',
    },
    {
      position: { x: position.x - 10, y: position.y },
      velocity: { x: -60, y: -80 },
      rotation: 0,
      rotationSpeed: 5,
      size: 8,
      color: '#333',
      type: 'tread',
    },
    {
      position: { x: position.x + 10, y: position.y },
      velocity: { x: 50, y: -150 },
      rotation: 0,
      rotationSpeed: -6,
      size: 5,
      color: '#666',
      type: 'debris',
    },
    {
      position: { x: position.x + 5, y: position.y - 5 },
      velocity: { x: -20, y: -180 },
      rotation: 0,
      rotationSpeed: 10,
      size: 4,
      color: '#888',
      type: 'debris',
    },
  ];
  return { pieces, position, elapsed: 0, complete: false };
}

/** Update wreckage physics. */
export function updateWreckage(wreckage: TankWreckage, dt: number, gravity = 300): TankWreckage {
  if (wreckage.complete) return wreckage;
  const elapsed = wreckage.elapsed + dt;
  const pieces = wreckage.pieces.map((p) => ({
    ...p,
    position: { x: p.position.x + p.velocity.x * dt, y: p.position.y + p.velocity.y * dt },
    velocity: { x: p.velocity.x * 0.99, y: p.velocity.y + gravity * dt },
    rotation: p.rotation + p.rotationSpeed * dt,
  }));
  return { ...wreckage, pieces, elapsed, complete: elapsed > 3 };
}

/** Render wreckage pieces. */
export function renderWreckage(ctx: CanvasRenderingContext2D, wreckage: TankWreckage): void {
  for (const piece of wreckage.pieces) {
    const alpha = Math.max(0, 1 - wreckage.elapsed / 3);
    ctx.save();
    ctx.globalAlpha = alpha;
    ctx.translate(piece.position.x, piece.position.y);
    ctx.rotate(piece.rotation);
    ctx.fillStyle = piece.color;
    ctx.fillRect(-piece.size / 2, -piece.size / 2, piece.size, piece.size);
    ctx.restore();
  }
}
