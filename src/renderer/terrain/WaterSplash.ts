/** Duration of a water splash in milliseconds. */
const SPLASH_DURATION_MS = 800;

/** Number of droplets per splash. */
const DROPLET_COUNT = 4;

export interface WaterSplash {
  readonly x: number;
  readonly startTime: number;
  readonly intensity: number;
}

/** Create a water splash at a given x position. */
export function createWaterSplash(x: number, intensity?: number): WaterSplash {
  return {
    x,
    startTime: Date.now(),
    intensity: intensity ?? 0.5,
  };
}

/** Check if a water splash animation is complete. */
export function isWaterSplashComplete(splash: WaterSplash, elapsed: number): boolean {
  return elapsed - splash.startTime >= SPLASH_DURATION_MS;
}

/** Render a water splash as rising/falling droplets. */
export function renderWaterSplash(
  ctx: CanvasRenderingContext2D,
  splash: WaterSplash,
  canvasHeight: number,
  waterLevel: number,
  elapsed: number,
): void {
  const age = elapsed - splash.startTime;
  if (age < 0 || age >= SPLASH_DURATION_MS) return;

  const progress = age / SPLASH_DURATION_MS; // 0 -> 1
  const fadeAlpha = 1 - progress;

  ctx.save();
  ctx.globalAlpha = fadeAlpha * splash.intensity;
  ctx.fillStyle = '#ffffff';

  const baseY = canvasHeight - waterLevel;

  for (let i = 0; i < DROPLET_COUNT; i++) {
    // Deterministic spread based on droplet index
    const angle = (i / DROPLET_COUNT) * Math.PI * 0.8 + Math.PI * 0.1;
    const speed = 30 + i * 10;
    const dx = Math.cos(angle) * speed * progress * splash.intensity;
    // Parabolic arc: rises then falls
    const dy =
      -Math.sin(angle) * speed * progress * splash.intensity + 0.5 * 200 * progress * progress; // gravity-like term

    const dropX = splash.x + dx;
    const dropY = baseY + dy;
    const radius = 1.5 * (1 - progress);

    ctx.beginPath();
    ctx.arc(dropX, dropY, Math.max(0.5, radius), 0, Math.PI * 2);
    ctx.fill();
  }

  ctx.restore();
}
