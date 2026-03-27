export interface WaterConfig {
  readonly waterLevel: number;
  readonly waveAmplitude: number;
  readonly waveFrequency: number;
  readonly color: string;
  readonly foamColor: string;
}

export function getDefaultWaterConfig(): WaterConfig {
  return {
    waterLevel: 30,
    waveAmplitude: 4,
    waveFrequency: 3,
    color: '#1a6bb5',
    foamColor: '#88ccee',
  };
}

/**
 * Parse a hex color string into r, g, b components.
 * Returns [r, g, b] in 0-255 range.
 */
function parseHex(hex: string): [number, number, number] {
  return [
    parseInt(hex.slice(1, 3), 16),
    parseInt(hex.slice(3, 5), 16),
    parseInt(hex.slice(5, 7), 16),
  ];
}

/** Render animated water at the bottom of the screen. */
export function renderWater(
  ctx: CanvasRenderingContext2D,
  canvasWidth: number,
  canvasHeight: number,
  elapsed: number,
  config?: WaterConfig,
): void {
  const cfg = config ?? getDefaultWaterConfig();
  const baseY = canvasHeight - cfg.waterLevel;
  const speed = 0.002;

  ctx.save();
  ctx.globalAlpha = 0.7;

  // Water body with wave top edge
  ctx.beginPath();
  ctx.moveTo(0, canvasHeight);

  for (let x = 0; x <= canvasWidth; x += 2) {
    const waveX = (x / canvasWidth) * cfg.waveFrequency * Math.PI * 2;
    const y = baseY + Math.sin(waveX + elapsed * speed) * cfg.waveAmplitude;
    ctx.lineTo(x, y);
  }

  ctx.lineTo(canvasWidth, canvasHeight);
  ctx.closePath();

  // Vertical gradient: lighter at surface, darker at bottom
  const [r, g, b] = parseHex(cfg.color);
  const gradient = ctx.createLinearGradient(0, baseY, 0, canvasHeight);
  gradient.addColorStop(0, `rgba(${r + 40}, ${g + 40}, ${b + 40}, 1)`);
  gradient.addColorStop(
    1,
    `rgba(${Math.max(0, r - 30)}, ${Math.max(0, g - 30)}, ${Math.max(0, b - 30)}, 1)`,
  );
  ctx.fillStyle = gradient;
  ctx.fill();

  // Foam line on top (slightly different phase)
  ctx.globalAlpha = 0.6;
  ctx.strokeStyle = cfg.foamColor;
  ctx.lineWidth = 1.5;
  ctx.beginPath();

  for (let x = 0; x <= canvasWidth; x += 2) {
    const waveX = (x / canvasWidth) * cfg.waveFrequency * Math.PI * 2;
    const y = baseY + Math.sin(waveX + elapsed * speed + 0.8) * cfg.waveAmplitude * 0.6;
    if (x === 0) {
      ctx.moveTo(x, y);
    } else {
      ctx.lineTo(x, y);
    }
  }
  ctx.stroke();

  ctx.restore();
}
