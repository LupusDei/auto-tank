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

/** Deterministic pseudo-random from seed. */
function seededRng(seed: number): () => number {
  let s = seed;
  return (): number => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };
}

/** Pre-generate cloud positions (stable across frames). */
interface CloudShape {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly speed: number;
  readonly opacity: number;
}

let cachedClouds: CloudShape[] | null = null;
let cachedCanvasWidth = 0;

function ensureClouds(canvasWidth: number, canvasHeight: number): CloudShape[] {
  if (cachedClouds && cachedCanvasWidth === canvasWidth) return cachedClouds;

  const rng = seededRng(42);
  const count = 5;
  cachedClouds = Array.from({ length: count }, () => ({
    x: rng() * canvasWidth * 1.5,
    y: 30 + rng() * canvasHeight * 0.25,
    width: 80 + rng() * 140,
    height: 25 + rng() * 30,
    speed: 8 + rng() * 15,
    opacity: 0.08 + rng() * 0.12,
  }));
  cachedCanvasWidth = canvasWidth;
  return cachedClouds;
}

/** Render a single soft cloud using overlapping ellipses. */
function renderCloud(
  ctx: CanvasRenderingContext2D,
  cx: number,
  cy: number,
  w: number,
  h: number,
  opacity: number,
): void {
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#ffffff';

  // Main body
  ctx.beginPath();
  ctx.ellipse(cx, cy, w * 0.5, h * 0.5, 0, 0, Math.PI * 2);
  ctx.fill();

  // Left lobe
  ctx.beginPath();
  ctx.ellipse(cx - w * 0.3, cy + h * 0.1, w * 0.3, h * 0.35, 0, 0, Math.PI * 2);
  ctx.fill();

  // Right lobe
  ctx.beginPath();
  ctx.ellipse(cx + w * 0.3, cy + h * 0.05, w * 0.35, h * 0.4, 0, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();
}

/** Render parallax cloud layer. Call after renderSky. */
export function renderClouds(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  elapsed: number,
): void {
  const clouds = ensureClouds(width, height);

  for (const cloud of clouds) {
    // Drift slowly to the right, wrap around
    const cx = ((cloud.x + elapsed * cloud.speed) % (width + cloud.width * 2)) - cloud.width;
    renderCloud(ctx, cx, cloud.y, cloud.width, cloud.height, cloud.opacity);
  }
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
