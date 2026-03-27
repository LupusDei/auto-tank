import type { CrateContent } from '@engine/crates/CrateSystem';

export interface EventNotification {
  readonly text: string;
  readonly icon: string;
  readonly startTime: number;
  readonly duration: number;
  readonly color: string;
}

const NOTIFICATION_DURATION = 3000;

/** Create a notification for a collected crate. */
export function createCrateNotification(content: CrateContent): EventNotification {
  switch (content.type) {
    case 'weapon':
      return {
        text: `Weapon Drop: ${content.weaponType} x${content.quantity}`,
        icon: '\u{1F4E6}',
        startTime: performance.now(),
        duration: NOTIFICATION_DURATION,
        color: '#4488ff',
      };
    case 'health':
      return {
        text: `Health Crate: +${content.amount} HP`,
        icon: '\u{2764}',
        startTime: performance.now(),
        duration: NOTIFICATION_DURATION,
        color: '#44ff44',
      };
    case 'money':
      return {
        text: `Money Crate: +$${content.amount}`,
        icon: '\u{1F4B0}',
        startTime: performance.now(),
        duration: NOTIFICATION_DURATION,
        color: '#ffdd00',
      };
  }
}

/** Create a sudden death warning notification. */
export function createSuddenDeathNotification(turnsLeft: number): EventNotification {
  return {
    text: `SUDDEN DEATH in ${turnsLeft} turns!`,
    icon: '\u{1F480}',
    startTime: performance.now(),
    duration: 4000,
    color: '#ff0000',
  };
}

/** Render a notification banner at the top of the screen. */
export function renderEventNotification(
  ctx: CanvasRenderingContext2D,
  notification: EventNotification,
  elapsed: number,
): void {
  if (elapsed >= notification.duration) {
    return;
  }

  const progress = elapsed / notification.duration;
  const fadeIn = Math.min(1, progress * 5);
  const fadeOut = progress > 0.7 ? 1 - (progress - 0.7) / 0.3 : 1;
  const alpha = fadeIn * fadeOut;

  ctx.save();
  ctx.globalAlpha = alpha;

  // Background banner
  ctx.fillStyle = 'rgba(0, 0, 0, 0.7)';
  ctx.fillRect(0, 20, ctx.canvas.width, 40);

  // Text
  ctx.fillStyle = notification.color;
  ctx.font = 'bold 16px monospace';
  ctx.textAlign = 'center';
  ctx.fillText(`${notification.icon} ${notification.text}`, ctx.canvas.width / 2, 46);

  ctx.restore();
}
