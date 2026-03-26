import type { TerrainTheme } from '@shared/types/terrain';

export interface EnvParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  size: number;
  opacity: number;
  color: string;
}

interface ThemeParticleConfig {
  readonly color: string;
  readonly count: number;
  readonly minSize: number;
  readonly maxSize: number;
  readonly speed: number;
  readonly gravity: number;
}

const THEME_PARTICLES: Record<TerrainTheme, ThemeParticleConfig> = {
  classic: { color: '#2ecc71', count: 0, minSize: 1, maxSize: 2, speed: 10, gravity: 0 },
  desert: { color: '#d4a35a', count: 30, minSize: 1, maxSize: 3, speed: 40, gravity: 5 },
  arctic: { color: '#ffffff', count: 40, minSize: 1, maxSize: 4, speed: 15, gravity: 10 },
  volcanic: { color: '#ff6600', count: 20, minSize: 1, maxSize: 3, speed: 20, gravity: -5 },
  lunar: { color: '#cccccc', count: 10, minSize: 1, maxSize: 2, speed: 5, gravity: 2 },
};

/** Generate environmental particles for a theme. */
export function generateEnvParticles(
  theme: TerrainTheme,
  canvasWidth: number,
  canvasHeight: number,
): EnvParticle[] {
  const config = THEME_PARTICLES[theme];
  return Array.from({ length: config.count }, () => ({
    x: Math.random() * canvasWidth,
    y: Math.random() * canvasHeight,
    vx: (Math.random() - 0.3) * config.speed,
    vy: config.gravity + (Math.random() - 0.5) * config.speed * 0.5,
    size: config.minSize + Math.random() * (config.maxSize - config.minSize),
    opacity: 0.2 + Math.random() * 0.5,
    color: config.color,
  }));
}

/** Update particle positions, wrapping around screen edges. */
export function updateEnvParticles(
  particles: EnvParticle[],
  dt: number,
  width: number,
  height: number,
): void {
  for (const p of particles) {
    p.x += p.vx * dt;
    p.y += p.vy * dt;
    if (p.x > width) p.x = 0;
    if (p.x < 0) p.x = width;
    if (p.y > height) p.y = 0;
    if (p.y < 0) p.y = height;
  }
}

/** Render environmental particles. */
export function renderEnvParticles(
  ctx: CanvasRenderingContext2D,
  particles: readonly EnvParticle[],
): void {
  for (const p of particles) {
    ctx.globalAlpha = p.opacity;
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x, p.y, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}
