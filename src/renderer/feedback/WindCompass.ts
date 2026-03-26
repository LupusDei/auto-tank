/** Render an animated wind compass indicator. */
export function renderWindCompass(
  ctx: CanvasRenderingContext2D,
  x: number,
  y: number,
  windSpeed: number,
  elapsed: number,
): void {
  const radius = 20;
  const wobble = Math.sin(elapsed * 2) * 2;

  ctx.save();
  ctx.translate(x, y);

  // Compass circle
  ctx.beginPath();
  ctx.arc(0, 0, radius, 0, Math.PI * 2);
  ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
  ctx.fill();
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.3)';
  ctx.lineWidth = 1;
  ctx.stroke();

  // Wind direction arrow
  const direction = windSpeed >= 0 ? 0 : Math.PI;
  const strength = Math.min(1, Math.abs(windSpeed) / 20);
  const arrowLen = radius * 0.7 * strength;

  ctx.rotate(direction + wobble * 0.02);

  // Arrow shaft
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(arrowLen, 0);
  ctx.strokeStyle = strength > 0.5 ? '#ff4444' : '#44ff44';
  ctx.lineWidth = 2;
  ctx.stroke();

  // Arrow head
  ctx.beginPath();
  ctx.moveTo(arrowLen, 0);
  ctx.lineTo(arrowLen - 6, -4);
  ctx.lineTo(arrowLen - 6, 4);
  ctx.closePath();
  ctx.fillStyle = strength > 0.5 ? '#ff4444' : '#44ff44';
  ctx.fill();

  ctx.restore();

  // Wind speed label
  ctx.font = 'bold 10px monospace';
  ctx.fillStyle = '#ffffff';
  ctx.textAlign = 'center';
  ctx.fillText(`${Math.abs(windSpeed)}`, x, y + radius + 12);
}

/** Get wind strength description. */
export function getWindDescription(speed: number): string {
  const abs = Math.abs(speed);
  if (abs === 0) return 'Calm';
  if (abs <= 5) return 'Light';
  if (abs <= 10) return 'Moderate';
  if (abs <= 15) return 'Strong';
  return 'Extreme';
}
