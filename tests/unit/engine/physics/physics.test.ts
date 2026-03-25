import {
  calculateDamage,
  calculateTrajectoryStep,
  checkTerrainCollision,
} from '../../../../src/engine/physics';
import { describe, expect, it } from 'vitest';

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
