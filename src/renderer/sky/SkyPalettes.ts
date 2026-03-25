import type { SkyGradientStop } from './SkyRenderer';

export type TimeOfDay = 'dawn' | 'day' | 'dusk' | 'night';

const SKY_PALETTES: Record<TimeOfDay, readonly SkyGradientStop[]> = {
  dawn: [
    { offset: 0, color: '#1a1a3e' },
    { offset: 0.4, color: '#4a2a5e' },
    { offset: 0.7, color: '#d4622b' },
    { offset: 1.0, color: '#f4a460' },
  ],
  day: [
    { offset: 0, color: '#1e90ff' },
    { offset: 0.5, color: '#87ceeb' },
    { offset: 1.0, color: '#e0f0ff' },
  ],
  dusk: [
    { offset: 0, color: '#0a0a2e' },
    { offset: 0.3, color: '#1a1a4e' },
    { offset: 0.5, color: '#2d1b69' },
    { offset: 0.7, color: '#8b3a3a' },
    { offset: 0.85, color: '#d4622b' },
    { offset: 1.0, color: '#f4a460' },
  ],
  night: [
    { offset: 0, color: '#000010' },
    { offset: 0.5, color: '#0a0a2e' },
    { offset: 1.0, color: '#1a1a3e' },
  ],
};

/** Get sky gradient stops for a time of day. */
export function getSkyPalette(time: TimeOfDay): readonly SkyGradientStop[] {
  return SKY_PALETTES[time];
}

export interface Cloud {
  readonly x: number;
  readonly y: number;
  readonly width: number;
  readonly height: number;
  readonly speed: number;
  readonly opacity: number;
}

/** Generate a set of parallax clouds from a seed. */
export function generateClouds(count: number, canvasWidth: number, seed: number): Cloud[] {
  const clouds: Cloud[] = [];
  let s = seed;
  const rng = (): number => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  for (let i = 0; i < count; i++) {
    clouds.push({
      x: rng() * canvasWidth,
      y: 20 + rng() * 150,
      width: 60 + rng() * 100,
      height: 20 + rng() * 30,
      speed: 5 + rng() * 15,
      opacity: 0.1 + rng() * 0.3,
    });
  }
  return clouds;
}

/** Render parallax clouds. */
export function renderClouds(
  ctx: CanvasRenderingContext2D,
  clouds: readonly Cloud[],
  time: number,
  canvasWidth: number,
): void {
  for (const cloud of clouds) {
    const x = ((cloud.x + time * cloud.speed) % (canvasWidth + cloud.width)) - cloud.width;
    ctx.fillStyle = `rgba(255, 255, 255, ${cloud.opacity})`;
    ctx.beginPath();
    ctx.ellipse(x + cloud.width / 2, cloud.y, cloud.width / 2, cloud.height / 2, 0, 0, Math.PI * 2);
    ctx.fill();
  }
}
