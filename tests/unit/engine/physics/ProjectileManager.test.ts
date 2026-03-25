import { describe, expect, it } from 'vitest';
import {
  explodeProjectile,
  finishProjectile,
  spawnProjectile,
  updateProjectile,
} from '@engine/physics/ProjectileManager';

describe('ProjectileManager', () => {
  describe('spawnProjectile()', () => {
    it('should create a flying projectile at given position', () => {
      const proj = spawnProjectile({ x: 100, y: 200 }, 45, 80, 'missile');

      expect(proj.state).toBe('flying');
      expect(proj.position).toEqual({ x: 100, y: 200 });
      expect(proj.weaponType).toBe('missile');
      expect(proj.trail).toHaveLength(1);
      expect(proj.trail[0]).toEqual({ x: 100, y: 200 });
    });

    it('should compute velocity from angle and power', () => {
      const proj = spawnProjectile({ x: 0, y: 0 }, 0, 100, 'missile');
      // 0 degrees = horizontal right
      expect(proj.velocity.x).toBeCloseTo(100);
      expect(proj.velocity.y).toBeCloseTo(0, 5);
    });

    it('should compute correct velocity for 90 degrees (straight up)', () => {
      const proj = spawnProjectile({ x: 0, y: 0 }, 90, 100, 'missile');
      expect(proj.velocity.x).toBeCloseTo(0, 5);
      expect(proj.velocity.y).toBeCloseTo(-100); // negative y = up
    });

    it('should compute correct velocity for 45 degrees', () => {
      const proj = spawnProjectile({ x: 0, y: 0 }, 45, 100, 'missile');
      const expected = 100 * Math.cos(Math.PI / 4);
      expect(proj.velocity.x).toBeCloseTo(expected);
      expect(proj.velocity.y).toBeCloseTo(-expected);
    });

    it('should generate a unique id', () => {
      const p1 = spawnProjectile({ x: 0, y: 0 }, 45, 50, 'missile');
      const p2 = spawnProjectile({ x: 0, y: 0 }, 45, 50, 'missile');
      expect(p1.id).not.toBe(p2.id);
    });
  });

  describe('updateProjectile()', () => {
    it('should apply physics and update position', () => {
      const proj = spawnProjectile({ x: 100, y: 200 }, 0, 50, 'missile');
      const updated = updateProjectile(proj, 0, 9.81, 1 / 60);

      expect(updated.position.x).toBeGreaterThan(proj.position.x);
      expect(updated.state).toBe('flying');
    });

    it('should apply wind force', () => {
      const proj = spawnProjectile({ x: 100, y: 200 }, 90, 50, 'missile');
      const noWind = updateProjectile(proj, 0, 9.81, 1);
      const withWind = updateProjectile(proj, 10, 9.81, 1);

      expect(withWind.position.x).toBeGreaterThan(noWind.position.x);
    });

    it('should add to trail', () => {
      const proj = spawnProjectile({ x: 100, y: 200 }, 45, 50, 'missile');
      const updated = updateProjectile(proj, 0, 9.81, 1 / 60);

      expect(updated.trail.length).toBe(proj.trail.length + 1);
    });

    it('should not update a non-flying projectile', () => {
      const proj = spawnProjectile({ x: 100, y: 200 }, 45, 50, 'missile');
      const exploding = explodeProjectile(proj);
      const updated = updateProjectile(exploding, 0, 9.81, 1 / 60);

      expect(updated).toBe(exploding);
    });
  });

  describe('state transitions', () => {
    it('should transition from flying to exploding', () => {
      const proj = spawnProjectile({ x: 0, y: 0 }, 45, 50, 'missile');
      const exploding = explodeProjectile(proj);

      expect(exploding.state).toBe('exploding');
      expect(exploding.position).toEqual(proj.position);
    });

    it('should transition from exploding to done', () => {
      const proj = spawnProjectile({ x: 0, y: 0 }, 45, 50, 'missile');
      const exploding = explodeProjectile(proj);
      const done = finishProjectile(exploding);

      expect(done.state).toBe('done');
    });

    it('should not explode an already exploding projectile', () => {
      const proj = spawnProjectile({ x: 0, y: 0 }, 45, 50, 'missile');
      const exploding = explodeProjectile(proj);
      const again = explodeProjectile(exploding);

      expect(again).toBe(exploding);
    });
  });
});
