import { createTankWreckage, updateWreckage } from '@renderer/entities/TankDestruction';
import { describe, expect, it } from 'vitest';

describe('TankDestruction', () => {
  it('should create wreckage with pieces', () => {
    const wreckage = createTankWreckage({ x: 100, y: 200 }, 'red');
    expect(wreckage.pieces.length).toBeGreaterThan(0);
    expect(wreckage.complete).toBe(false);
  });

  it('should have turret piece', () => {
    const wreckage = createTankWreckage({ x: 100, y: 200 }, 'blue');
    const turret = wreckage.pieces.find((p) => p.type === 'turret');
    expect(turret).toBeDefined();
  });

  it('should update physics', () => {
    let wreckage = createTankWreckage({ x: 100, y: 200 }, 'red');
    wreckage = updateWreckage(wreckage, 0.1);
    expect(wreckage.elapsed).toBeCloseTo(0.1);
    // Turret should have moved upward initially (negative vy)
    const turret = wreckage.pieces.find((p) => p.type === 'turret');
    expect(turret?.position.y).toBeLessThan(200);
  });

  it('should complete after 3 seconds', () => {
    let wreckage = createTankWreckage({ x: 100, y: 200 }, 'red');
    for (let i = 0; i < 40; i++) wreckage = updateWreckage(wreckage, 0.1);
    expect(wreckage.complete).toBe(true);
  });
});
