import type { Crate, CrateType } from '@engine/defense/CrateDrops';

/** Color mapping for crate types. */
const CRATE_COLORS: Record<CrateType, string> = {
  weapon: '#f1c40f',
  health: '#2ecc71',
  shield: '#3498db',
  fuel: '#e74c3c',
};

/** Crate icon labels per type. */
const CRATE_ICONS: Record<CrateType, string> = {
  weapon: 'W',
  health: '+',
  shield: 'S',
  fuel: 'F',
};

/** Size of rendered crate box. */
const CRATE_SIZE = 16;

/** Parachute animation duration in seconds. */
const PARACHUTE_DURATION = 2.0;

/** Animation state for a dropping crate. */
export interface CrateAnimation {
  readonly crateId: string;
  readonly startY: number;
  readonly endY: number;
  readonly startTime: number;
}

/**
 * Manages crate drop animations.
 * Call `startDrop()` when a crate spawns, then `getProgress()` per frame.
 */
export class CrateAnimationManager {
  private animations = new Map<string, CrateAnimation>();

  /** Begin a parachute descent animation for a crate. */
  startDrop(crateId: string, endY: number, now: number, startY = 0): void {
    this.animations.set(crateId, { crateId, startY, endY, startTime: now });
  }

  /** Get normalized progress [0..1] for a crate animation. Returns null if not animating. */
  getProgress(crateId: string, now: number): number | null {
    const anim = this.animations.get(crateId);
    if (!anim) return null;
    const elapsed = (now - anim.startTime) / 1000;
    if (elapsed >= PARACHUTE_DURATION) {
      this.animations.delete(crateId);
      return null;
    }
    return Math.min(elapsed / PARACHUTE_DURATION, 1);
  }

  /** Get the interpolated Y position during animation. */
  getAnimatedY(crateId: string, now: number): number | null {
    const anim = this.animations.get(crateId);
    if (!anim) return null;
    const progress = this.getProgress(crateId, now);
    if (progress === null) return null;
    // Ease-out for smooth landing
    const eased = 1 - (1 - progress) * (1 - progress);
    return anim.startY + (anim.endY - anim.startY) * eased;
  }

  /** Check if a crate is currently animating. */
  isAnimating(crateId: string): boolean {
    return this.animations.has(crateId);
  }

  /** Get elapsed time in seconds since animation started. Returns null if not animating. */
  getElapsed(crateId: string, now: number): number | null {
    const anim = this.animations.get(crateId);
    if (!anim) return null;
    return (now - anim.startTime) / 1000;
  }

  /** Remove completed animations. */
  cleanup(): void {
    // Animations auto-remove via getProgress; this is a manual sweep
    const now = performance.now();
    for (const [id, anim] of this.animations) {
      if ((now - anim.startTime) / 1000 >= PARACHUTE_DURATION) {
        this.animations.delete(id);
      }
    }
  }
}

/** Get the hex color for a crate type. */
export function getCrateColor(type: CrateType): string {
  return CRATE_COLORS[type];
}

/** Render a single crate on the canvas. */
export function renderCrate(
  ctx: CanvasRenderingContext2D,
  crate: Crate,
  animManager: CrateAnimationManager | null,
  now: number,
): void {
  if (crate.collected) return;

  const color = CRATE_COLORS[crate.type];
  const icon = CRATE_ICONS[crate.type];
  const half = CRATE_SIZE / 2;

  // Determine Y position (animated or final)
  let y = crate.position.y;
  let isDropping = false;
  let swayX = 0;

  if (animManager) {
    const animY = animManager.getAnimatedY(crate.id, now);
    if (animY !== null) {
      y = animY;
      isDropping = true;
      // Gentle sine-wave sway during descent
      const elapsed = animManager.getElapsed(crate.id, now) ?? 0;
      swayX = Math.sin(elapsed * 3) * 8;
    }
  }

  const x = crate.position.x + swayX;

  ctx.save();

  // Draw parachute if still descending
  if (isDropping) {
    renderParachute(ctx, x, y, color);
  }

  // Landed glow/pulse effect
  if (!isDropping) {
    const pulse = 0.5 + 0.5 * Math.sin(now / 300);
    const glowRadius = CRATE_SIZE + 4 + pulse * 4;
    ctx.beginPath();
    ctx.arc(x, y - half, glowRadius, 0, Math.PI * 2);
    ctx.fillStyle = `${color}22`;
    ctx.fill();
  }

  // Crate box
  ctx.fillStyle = '#2c2c2c';
  ctx.fillRect(x - half, y - CRATE_SIZE, CRATE_SIZE, CRATE_SIZE);
  ctx.strokeStyle = color;
  ctx.lineWidth = 2;
  ctx.strokeRect(x - half, y - CRATE_SIZE, CRATE_SIZE, CRATE_SIZE);

  // Cross straps
  ctx.beginPath();
  ctx.moveTo(x - half, y - CRATE_SIZE);
  ctx.lineTo(x + half, y);
  ctx.moveTo(x + half, y - CRATE_SIZE);
  ctx.lineTo(x - half, y);
  ctx.strokeStyle = `${color}66`;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Type icon
  ctx.fillStyle = color;
  ctx.font = `bold ${CRATE_SIZE - 4}px monospace`;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(icon, x, y - half);

  ctx.restore();
}

/** Render a simple parachute above the crate. */
function renderParachute(ctx: CanvasRenderingContext2D, x: number, y: number, color: string): void {
  const canopyWidth = CRATE_SIZE * 2;
  const canopyHeight = CRATE_SIZE * 1.2;
  const canopyY = y - CRATE_SIZE - canopyHeight;

  // Canopy arc
  ctx.beginPath();
  ctx.arc(x, canopyY + canopyHeight, canopyWidth / 2, Math.PI, 0);
  ctx.fillStyle = `${color}44`;
  ctx.fill();
  ctx.strokeStyle = color;
  ctx.lineWidth = 1;
  ctx.stroke();

  // Suspension lines
  ctx.beginPath();
  ctx.moveTo(x - canopyWidth / 2, canopyY + canopyHeight);
  ctx.lineTo(x, y - CRATE_SIZE);
  ctx.moveTo(x + canopyWidth / 2, canopyY + canopyHeight);
  ctx.lineTo(x, y - CRATE_SIZE);
  ctx.moveTo(x, canopyY + canopyHeight);
  ctx.lineTo(x, y - CRATE_SIZE);
  ctx.strokeStyle = `${color}88`;
  ctx.lineWidth = 0.5;
  ctx.stroke();
}

/** Render all active (non-collected) crates. */
export function renderCrates(
  ctx: CanvasRenderingContext2D,
  crates: readonly Crate[],
  animManager: CrateAnimationManager | null,
  now: number,
): void {
  for (const crate of crates) {
    renderCrate(ctx, crate, animManager, now);
  }
}
