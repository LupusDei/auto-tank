import type { Vector2D } from '@shared/types/geometry';

export interface MoneyPopup {
  readonly amount: number;
  readonly position: Vector2D;
  readonly startTime: number;
  readonly isBonus: boolean;
}

/** Create a floating money popup above a tank. */
export function createMoneyPopup(amount: number, position: Vector2D, isBonus = false): MoneyPopup {
  return {
    amount,
    position: { x: position.x, y: position.y - 30 },
    startTime: performance.now(),
    isBonus,
  };
}

/** Get popup opacity (fades over 2s). */
export function getPopupOpacity(popup: MoneyPopup): number {
  const elapsed = (performance.now() - popup.startTime) / 1000;
  return Math.max(0, 1 - elapsed / 2);
}

/** Get popup Y offset (floats up). */
export function getPopupY(popup: MoneyPopup): number {
  const elapsed = (performance.now() - popup.startTime) / 1000;
  return popup.position.y - elapsed * 30;
}

/** Check if popup is still visible. */
export function isPopupVisible(popup: MoneyPopup): boolean {
  return getPopupOpacity(popup) > 0;
}

/** Render money popups on canvas. */
export function renderMoneyPopups(
  ctx: CanvasRenderingContext2D,
  popups: readonly MoneyPopup[],
): void {
  for (const popup of popups) {
    const opacity = getPopupOpacity(popup);
    if (opacity <= 0) continue;

    const y = getPopupY(popup);
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.font = popup.isBonus ? 'bold 16px monospace' : 'bold 12px monospace';
    ctx.textAlign = 'center';
    ctx.strokeStyle = '#000';
    ctx.lineWidth = 3;
    ctx.strokeText(`+$${popup.amount}`, popup.position.x, y);
    ctx.fillStyle = popup.isBonus ? '#ffdd00' : '#44ff44';
    ctx.fillText(`+$${popup.amount}`, popup.position.x, y);
    ctx.restore();
  }
}
