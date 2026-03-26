export interface UIParticle {
  x: number;
  y: number;
  vx: number;
  vy: number;
  life: number;
  maxLife: number;
  size: number;
  color: string;
}

export type ParticleEffect = 'confetti' | 'sparkle' | 'smoke' | 'burst';

export function createConfettiParticles(x: number, y: number, count: number): UIParticle[] {
  const colors = [
    '#ff4444',
    '#44ff44',
    '#4444ff',
    '#ffff44',
    '#ff44ff',
    '#44ffff',
    '#ff8800',
    '#ffffff',
  ];
  return Array.from({ length: count }, () => ({
    x,
    y,
    vx: (Math.random() - 0.5) * 400,
    vy: -200 - Math.random() * 300,
    life: 1,
    maxLife: 1.5 + Math.random() * 1.5,
    size: 3 + Math.random() * 5,
    color: colors[Math.floor(Math.random() * colors.length)] ?? '#ffffff',
  }));
}

export function createSparkleParticles(x: number, y: number, count: number): UIParticle[] {
  return Array.from({ length: count }, () => {
    const angle = Math.random() * Math.PI * 2;
    const speed = 30 + Math.random() * 80;
    return {
      x,
      y,
      vx: Math.cos(angle) * speed,
      vy: Math.sin(angle) * speed,
      life: 1,
      maxLife: 0.3 + Math.random() * 0.4,
      size: 1 + Math.random() * 3,
      color: `hsl(${40 + Math.random() * 20}, 100%, ${70 + Math.random() * 30}%)`,
    };
  });
}

export function updateParticle(p: UIParticle, dt: number, gravity = 300): UIParticle {
  return {
    ...p,
    x: p.x + p.vx * dt,
    y: p.y + p.vy * dt,
    vy: p.vy + gravity * dt,
    life: p.life - dt / p.maxLife,
  };
}

export function isParticleAlive(p: UIParticle): boolean {
  return p.life > 0;
}

export function renderUIParticles(
  ctx: CanvasRenderingContext2D,
  particles: readonly UIParticle[],
): void {
  for (const p of particles) {
    if (p.life <= 0) continue;
    ctx.globalAlpha = Math.max(0, p.life);
    ctx.fillStyle = p.color;
    ctx.fillRect(p.x - p.size / 2, p.y - p.size / 2, p.size, p.size);
  }
  ctx.globalAlpha = 1;
}
