import {
  applyWindForce,
  calculateDamage,
  calculateTrajectoryStep,
  checkTerrainCollision,
} from '../../../../src/engine/physics';
import { describe, expect, it } from 'vitest';
import { createWindState } from '@engine/environment/types';

describe('calculateTrajectoryStep', () => {
  it('applies gravity — y velocity increases over a step', () => {
    const pos = { x: 0, y: 0 };
    const vel = { x: 10, y: 0 };
    const gravity = 9.81;
    const dt = 1;

    const result = calculateTrajectoryStep(pos, vel, 0, gravity, dt);

    expect(result.velocity.y).toBeCloseTo(gravity * dt);
    expect(result.velocity.y).toBeGreaterThan(vel.y);
  });

  it('applies wind — x velocity changes over a step', () => {
    const pos = { x: 0, y: 0 };
    const vel = { x: 10, y: 0 };
    const wind = 5;
    const dt = 1;

    const result = calculateTrajectoryStep(pos, vel, wind, 0, dt);

    expect(result.velocity.x).toBeCloseTo(vel.x + wind * dt);
    expect(result.velocity.x).not.toEqual(vel.x);
  });

  it('updates position based on new velocity', () => {
    const pos = { x: 0, y: 0 };
    const vel = { x: 10, y: 5 };
    const dt = 0.5;

    const result = calculateTrajectoryStep(pos, vel, 0, 0, dt);

    expect(result.position.x).toBeCloseTo(vel.x * dt);
    expect(result.position.y).toBeCloseTo(vel.y * dt);
  });
});

describe('checkTerrainCollision', () => {
  const heightMap = [100, 90, 80, 70, 60];

  it('detects a hit when position.y >= terrain height', () => {
    const position = { x: 2, y: 80 };
    expect(checkTerrainCollision(position, heightMap)).toBe(true);
  });

  it('detects a hit when position.y is below terrain height', () => {
    const position = { x: 2, y: 100 };
    expect(checkTerrainCollision(position, heightMap)).toBe(true);
  });

  it('misses when position.y is above terrain', () => {
    const position = { x: 2, y: 50 };
    expect(checkTerrainCollision(position, heightMap)).toBe(false);
  });

  it('clamps to first index when x is negative', () => {
    const position = { x: -5, y: 100 };
    expect(checkTerrainCollision(position, heightMap)).toBe(true);
  });

  it('clamps to last index when x exceeds bounds', () => {
    const position = { x: 999, y: 60 };
    expect(checkTerrainCollision(position, heightMap)).toBe(true);
  });
});

describe('applyWindForce', () => {
  it('should not change velocity when wind is zero', () => {
    const vel = { x: 10, y: -5 };
    const wind = createWindState(0, { x: 0, y: 0 });
    const result = applyWindForce(vel, wind, 1);
    expect(result.x).toBeCloseTo(10);
    expect(result.y).toBeCloseTo(-5);
  });

  it('should add positive drift with positive wind', () => {
    const vel = { x: 10, y: 0 };
    const wind = createWindState(5, { x: 1, y: 0 });
    const result = applyWindForce(vel, wind, 1);
    expect(result.x).toBeCloseTo(15);
    expect(result.y).toBe(0);
  });

  it('should add negative drift with negative wind', () => {
    const vel = { x: 10, y: 0 };
    const wind = createWindState(-5, { x: -1, y: 0 });
    const result = applyWindForce(vel, wind, 1);
    expect(result.x).toBeCloseTo(5);
  });

  it('should scale with dt', () => {
    const vel = { x: 0, y: 0 };
    const wind = createWindState(10, { x: 1, y: 0 });
    const result = applyWindForce(vel, wind, 0.5);
    expect(result.x).toBeCloseTo(5);
  });

  it('should produce deterministic results across ticks', () => {
    const vel = { x: 50, y: -30 };
    const wind = createWindState(7.5, { x: 1, y: 0 });
    const dt = 1 / 60;

    let v1 = vel;
    let v2 = vel;
    for (let i = 0; i < 100; i++) {
      v1 = applyWindForce(v1, wind, dt);
      v2 = applyWindForce(v2, wind, dt);
    }

    expect(v1.x).toBe(v2.x);
    expect(v1.y).toBe(v2.y);
  });
});

describe('calculateDamage', () => {
  const maxDamage = 100;
  const radius = 50;

  it('returns max damage at the centre (distance 0)', () => {
    expect(calculateDamage(0, radius, maxDamage)).toBe(maxDamage);
  });

  it('returns 0 at the edge of the explosion radius', () => {
    expect(calculateDamage(radius, radius, maxDamage)).toBe(0);
  });

  it('returns 0 outside the explosion radius', () => {
    expect(calculateDamage(radius + 10, radius, maxDamage)).toBe(0);
  });

  it('returns half damage at half the radius', () => {
    expect(calculateDamage(radius / 2, radius, maxDamage)).toBeCloseTo(maxDamage / 2);
  });

  it('returns 0 when explosion radius is 0', () => {
    expect(calculateDamage(0, 0, maxDamage)).toBe(0);
  });
});
