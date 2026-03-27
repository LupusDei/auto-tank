import { describe, expect, it } from 'vitest';
import { calculateTrajectoryPreview } from '@renderer/feedback/TurnIndicator';

describe('TrajectoryPreview', () => {
  it('should return an array of points starting from startPos', () => {
    const start = { x: 100, y: 300 };
    const points = calculateTrajectoryPreview(start, 45, 50, 0, 9.81);
    expect(points.length).toBeGreaterThan(1);
    expect(points[0]).toEqual(start);
  });

  it('should return steps + 1 points by default (60 steps)', () => {
    const points = calculateTrajectoryPreview({ x: 100, y: 300 }, 45, 50, 0, 9.81);
    expect(points).toHaveLength(61);
  });

  it('should respect the steps parameter', () => {
    const points = calculateTrajectoryPreview({ x: 100, y: 300 }, 45, 50, 0, 9.81, 10);
    expect(points).toHaveLength(11);
  });

  it('should produce a trajectory affected by gravity (y increases over time)', () => {
    const points = calculateTrajectoryPreview({ x: 100, y: 300 }, 45, 50, 0, 9.81, 120);
    // The projectile should eventually fall below the start y
    const lastPoint = points[points.length - 1];
    const firstPoint = points[0];
    if (!lastPoint || !firstPoint) throw new Error('expected points');
    // With enough steps and gravity the projectile arcs down
    expect(lastPoint.y).toBeGreaterThan(firstPoint.y);
  });

  it('should produce different trajectories with different wind values', () => {
    const noWind = calculateTrajectoryPreview({ x: 100, y: 300 }, 45, 50, 0, 9.81, 30);
    const withWind = calculateTrajectoryPreview({ x: 100, y: 300 }, 45, 50, 5, 9.81, 30);
    const lastNoWind = noWind[noWind.length - 1];
    const lastWithWind = withWind[withWind.length - 1];
    if (!lastNoWind || !lastWithWind) throw new Error('expected points');
    expect(lastNoWind.x).not.toBe(lastWithWind.x);
  });
});
