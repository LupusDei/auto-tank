import { describe, expect, it } from 'vitest';
import { generateEnvParticles, updateEnvParticles } from '@renderer/effects/EnvironmentalParticles';

describe('EnvironmentalParticles', () => {
  it('should generate particles for snowy arctic theme', () => {
    const particles = generateEnvParticles('arctic', 800, 600);
    expect(particles.length).toBeGreaterThan(0);
    expect(particles[0]?.color).toBe('#ffffff');
  });

  it('should generate no particles for classic theme', () => {
    const particles = generateEnvParticles('classic', 800, 600);
    expect(particles).toHaveLength(0);
  });

  it('should update positions', () => {
    const particles = generateEnvParticles('desert', 800, 600);
    const initialX = particles[0]?.x ?? 0;
    updateEnvParticles(particles, 0.1, 800, 600);
    expect(particles[0]?.x).not.toBe(initialX);
  });

  it('should wrap around screen edges', () => {
    const particles = [{ x: 801, y: 300, vx: 10, vy: 0, size: 2, opacity: 1, color: '#fff' }];
    updateEnvParticles(particles, 0.01, 800, 600);
    expect(particles[0]?.x).toBeLessThanOrEqual(800);
  });
});
