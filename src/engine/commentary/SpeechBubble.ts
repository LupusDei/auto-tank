import type { Vector2D } from '@shared/types/geometry';

export interface SpeechBubble {
  readonly text: string;
  readonly position: Vector2D;
  readonly startTime: number;
  readonly duration: number;
  readonly color: string;
}

/** Create a speech bubble above a position. */
export function createSpeechBubble(
  text: string,
  position: Vector2D,
  color = '#ffffff',
  duration = 2500,
): SpeechBubble {
  return {
    text,
    position: { x: position.x, y: position.y - 40 },
    startTime: performance.now(),
    duration,
    color,
  };
}

/** Check if bubble is still visible. */
export function isBubbleVisible(bubble: SpeechBubble): boolean {
  return performance.now() - bubble.startTime < bubble.duration;
}

/** Get bubble opacity (fades out in last 500ms). */
export function getBubbleOpacity(bubble: SpeechBubble): number {
  const elapsed = performance.now() - bubble.startTime;
  const remaining = bubble.duration - elapsed;
  if (remaining <= 0) return 0;
  if (remaining < 500) return remaining / 500;
  return 1;
}

/** Render a comic-style speech bubble. */
export function renderSpeechBubble(ctx: CanvasRenderingContext2D, bubble: SpeechBubble): void {
  const opacity = getBubbleOpacity(bubble);
  if (opacity <= 0) return;

  const { x, y } = bubble.position;
  const padding = 8;
  ctx.font = 'bold 12px "Courier New", monospace';
  const metrics = ctx.measureText(bubble.text);
  const width = metrics.width + padding * 2;
  const height = 24;

  ctx.save();
  ctx.globalAlpha = opacity;

  // Bubble background
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.beginPath();
  ctx.roundRect(x - width / 2, y - height, width, height, 6);
  ctx.fill();

  // Bubble border
  ctx.strokeStyle = bubble.color;
  ctx.lineWidth = 1.5;
  ctx.stroke();

  // Tail triangle
  ctx.fillStyle = 'rgba(0, 0, 0, 0.8)';
  ctx.beginPath();
  ctx.moveTo(x - 5, y);
  ctx.lineTo(x + 5, y);
  ctx.lineTo(x, y + 8);
  ctx.fill();

  // Text
  ctx.fillStyle = bubble.color;
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(bubble.text, x, y - height / 2);

  ctx.restore();
}
