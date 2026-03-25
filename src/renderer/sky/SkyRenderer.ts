export interface SkyGradientStop {
  readonly offset: number;
  readonly color: string;
}

const DEFAULT_SKY_GRADIENT: readonly SkyGradientStop[] = [
  { offset: 0, color: '#0a0a2e' },
  { offset: 0.3, color: '#1a1a4e' },
  { offset: 0.5, color: '#2d1b69' },
  { offset: 0.7, color: '#8b3a3a' },
  { offset: 0.85, color: '#d4622b' },
  { offset: 1.0, color: '#f4a460' },
];

export function createSkyGradient(
  ctx: CanvasRenderingContext2D,
  _width: number,
  height: number,
  stops?: readonly SkyGradientStop[],
): CanvasGradient {
  const gradient = ctx.createLinearGradient(0, 0, 0, height);
  const skyStops = stops ?? DEFAULT_SKY_GRADIENT;
  for (const stop of skyStops) {
    gradient.addColorStop(stop.offset, stop.color);
  }
  return gradient;
}

export function renderSky(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  stops?: readonly SkyGradientStop[],
): void {
  const gradient = createSkyGradient(ctx, width, height, stops);
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);
}
