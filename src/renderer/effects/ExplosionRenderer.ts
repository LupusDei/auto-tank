import type { ActiveEffect } from '../RenderPipeline';
import type { Vector2D } from '@shared/types/geometry';

export interface ExplosionConfig {
  readonly position: Vector2D;
  readonly radius: number;
  readonly duration?: number;
  readonly particleCount?: number;
}

interface Particle {
  readonly angle: number;
  readonly speed: number;
  readonly size: number;
  readonly color: string;
}

const COLORS = ['#ff4400', '#ff8800', '#ffcc00', '#ffffff'];

function generateParticles(count: number, seed: number): Particle[] {
  let s = seed;
  const rng = (): number => {
    s = (s * 1103515245 + 12345) & 0x7fffffff;
    return s / 0x7fffffff;
  };

  return Array.from({ length: count }, () => ({
    angle: rng() * Math.PI * 2,
    speed: 30 + rng() * 120,
    size: 1 + rng() * 3,
    color: COLORS[Math.floor(rng() * COLORS.length)] ?? '#ff4400',
  }));
}

/** Create an explosion effect that can be added to the RenderPipeline. */
export function createExplosionEffect(config: ExplosionConfig): ActiveEffect {
  const { position, radius, duration = 1500, particleCount = 30 } = config;
  const particles = generateParticles(particleCount, Math.floor(position.x * 1000 + position.y));

  return {
    id: `explosion-${performance.now()}`,
    startTime: performance.now(),
    duration,
    render(ctx: CanvasRenderingContext2D, elapsed: number): void {
      const progress = elapsed / duration;
      const easedProgress = 1 - Math.pow(1 - progress, 3);

      // Expanding shockwave circle
      const currentRadius = radius * easedProgress;
      const alpha = 1 - progress;

      ctx.beginPath();
      ctx.arc(position.x, position.y, currentRadius, 0, Math.PI * 2);
      ctx.strokeStyle = `rgba(255, 200, 50, ${alpha})`;
      ctx.lineWidth = 3 * (1 - progress);
      ctx.stroke();

      // Inner glow
      ctx.beginPath();
      ctx.arc(position.x, position.y, currentRadius * 0.6, 0, Math.PI * 2);
      ctx.fillStyle = `rgba(255, 100, 0, ${alpha * 0.4})`;
      ctx.fill();

      // Particles
      for (const p of particles) {
        const dist = p.speed * easedProgress;
        const px = position.x + Math.cos(p.angle) * dist;
        const py = position.y + Math.sin(p.angle) * dist;
        const pAlpha = Math.max(0, 1 - progress * 1.5);

        ctx.beginPath();
        ctx.arc(px, py, p.size * (1 - progress * 0.5), 0, Math.PI * 2);
        ctx.fillStyle = p.color.replace(')', `, ${pAlpha})`).replace('rgb', 'rgba');
        // Simple hex-to-rgba fallback
        ctx.globalAlpha = pAlpha;
        ctx.fillStyle = p.color;
        ctx.fill();
        ctx.globalAlpha = 1;
      }
    },
    isComplete(elapsed: number): boolean {
      return elapsed >= duration;
    },
  };
}

/** Apply screen shake offset. Returns {x, y} offset to translate the canvas. */
export function calculateScreenShake(
  intensity: number,
  elapsed: number,
  duration: number,
): Vector2D {
  if (elapsed >= duration) return { x: 0, y: 0 };
  const decay = 1 - elapsed / duration;
  const shakeX = (Math.random() * 2 - 1) * intensity * decay;
  const shakeY = (Math.random() * 2 - 1) * intensity * decay;
  return { x: shakeX, y: shakeY };
}
