import type { Vector2D } from '@shared/types/geometry';

export interface KillCelebration {
  readonly position: Vector2D;
  readonly startTime: number;
  readonly killerName: string;
  readonly victimName: string;
  readonly bonusAmount: number;
}

/** Create a kill celebration effect. */
export function createKillCelebration(
  position: Vector2D,
  killerName: string,
  victimName: string,
  bonusAmount: number,
): KillCelebration {
  return { position, startTime: performance.now(), killerName, victimName, bonusAmount };
}

/** Get celebration opacity (visible for 3s). */
export function getCelebrationOpacity(celebration: KillCelebration): number {
  const elapsed = (performance.now() - celebration.startTime) / 1000;
  if (elapsed > 3) return 0;
  if (elapsed > 2.5) return (3 - elapsed) * 2;
  return 1;
}

/** Check if celebration is visible. */
export function isCelebrationVisible(celebration: KillCelebration): boolean {
  return getCelebrationOpacity(celebration) > 0;
}

/** Render kill celebration. */
export function renderKillCelebration(
  ctx: CanvasRenderingContext2D,
  celebration: KillCelebration,
): void {
  const opacity = getCelebrationOpacity(celebration);
  if (opacity <= 0) return;

  const elapsed = (performance.now() - celebration.startTime) / 1000;
  const y = celebration.position.y - 50 - elapsed * 15;

  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.textAlign = 'center';

  // Kill text
  ctx.font = 'bold 18px monospace';
  ctx.strokeStyle = '#000';
  ctx.lineWidth = 3;
  const killText = `${celebration.killerName} ELIMINATED ${celebration.victimName}`;
  ctx.strokeText(killText, celebration.position.x, y);
  ctx.fillStyle = '#ff4444';
  ctx.fillText(killText, celebration.position.x, y);

  // Bonus amount
  ctx.font = 'bold 14px monospace';
  const bonusText = `+$${celebration.bonusAmount} KILL BONUS`;
  ctx.strokeText(bonusText, celebration.position.x, y + 22);
  ctx.fillStyle = '#ffdd00';
  ctx.fillText(bonusText, celebration.position.x, y + 22);

  ctx.restore();
}
