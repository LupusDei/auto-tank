import type { Vector2D } from '@shared/types/geometry';

export interface DamageNumber {
  readonly value: number;
  readonly position: Vector2D;
  readonly startTime: number;
  readonly color: string;
  readonly isCritical: boolean;
  readonly fontSize: number;
}

export interface CritSparkle {
  readonly position: Vector2D;
  readonly startTime: number;
  readonly duration: number;
}

/** Create a floating damage number. */
export function createDamageNumber(
  value: number,
  position: Vector2D,
  isCritical = false,
): DamageNumber {
  const color = isCritical ? '#ffdd00' : value >= 50 ? '#ff4444' : '#ffffff';
  const fontSize = isCritical ? 24 : value >= 50 ? 18 : 14;
  return {
    value,
    position: { x: position.x + (Math.random() - 0.5) * 20, y: position.y - 20 },
    startTime: performance.now(),
    color,
    isCritical,
    fontSize,
  };
}

/** Get damage number display position (floats up over time). */
export function getDamageNumberPosition(dmg: DamageNumber): Vector2D {
  const elapsed = (performance.now() - dmg.startTime) / 1000;
  return { x: dmg.position.x, y: dmg.position.y - elapsed * 40 };
}

/** Get damage number opacity (fades over 1.5s). */
export function getDamageNumberOpacity(dmg: DamageNumber): number {
  const elapsed = (performance.now() - dmg.startTime) / 1000;
  return Math.max(0, 1 - elapsed / 1.5);
}

/** Check if damage number is still visible. */
export function isDamageNumberVisible(dmg: DamageNumber): boolean {
  return getDamageNumberOpacity(dmg) > 0;
}

/** Render floating damage numbers. */
export function renderDamageNumbers(
  ctx: CanvasRenderingContext2D,
  numbers: readonly DamageNumber[],
): void {
  for (const dmg of numbers) {
    const opacity = getDamageNumberOpacity(dmg);
    if (opacity <= 0) continue;

    const pos = getDamageNumberPosition(dmg);
    ctx.save();
    ctx.globalAlpha = opacity;
    ctx.font = `bold ${dmg.fontSize}px "Courier New", monospace`;
    ctx.textAlign = 'center';

    // Outline
    ctx.strokeStyle = '#000000';
    ctx.lineWidth = 3;
    ctx.strokeText(`-${dmg.value}`, pos.x, pos.y);

    // Fill
    ctx.fillStyle = dmg.color;
    ctx.fillText(`-${dmg.value}`, pos.x, pos.y);

    // Critical sparkle text
    if (dmg.isCritical) {
      ctx.fillStyle = '#ffdd00';
      ctx.font = 'bold 10px "Courier New", monospace';
      ctx.fillText('CRITICAL!', pos.x, pos.y - 15);
    }

    ctx.restore();
  }
}

/** Check if a hit is an overkill (damage > remaining health). */
export function isOverkill(damage: number, remainingHealth: number): boolean {
  return damage > remainingHealth * 2;
}
