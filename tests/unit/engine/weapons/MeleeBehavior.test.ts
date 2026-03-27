import { describe, expect, it } from 'vitest';
import { performMelee } from '@engine/weapons/MeleeBehavior';
import type { Tank } from '@shared/types/entities';

function createTank(id: string, x: number, y: number): Tank {
  return {
    id,
    playerId: `player-${id}`,
    position: { x, y },
    angle: 45,
    power: 50,
    health: 100,
    maxHealth: 100,
    fuel: 100,
    state: 'alive',
    color: 'red',
    selectedWeapon: null,
  };
}

describe('MeleeBehavior', () => {
  describe('performMelee()', () => {
    it('should hit a tank within range in facing direction', () => {
      const attacker = { x: 100, y: 200 };
      // Facing right (0 degrees), target to the right
      const target = createTank('t1', 120, 200);

      const result = performMelee(attacker, 0, [target], 30, 30, 20);

      expect(result.hit).toBe(true);
      expect(result.targetTankId).toBe('t1');
      expect(result.damage).toBe(30);
    });

    it('should miss a tank beyond range', () => {
      const attacker = { x: 100, y: 200 };
      const target = createTank('t1', 200, 200); // 100px away, beyond 30px range

      const result = performMelee(attacker, 0, [target], 30, 30, 20);

      expect(result.hit).toBe(false);
      expect(result.damage).toBe(0);
    });

    it('should miss a tank behind the attacker', () => {
      const attacker = { x: 100, y: 200 };
      // Facing right (0 degrees), target to the LEFT
      const target = createTank('t1', 80, 200);

      const result = performMelee(attacker, 0, [target], 30, 30, 20);

      expect(result.hit).toBe(false);
    });

    it('should apply knockback in the direction away from attacker', () => {
      const attacker = { x: 100, y: 200 };
      const target = createTank('t1', 120, 200);

      const result = performMelee(attacker, 0, [target], 30, 30, 20);

      expect(result.knockback.x).toBeGreaterThan(0); // pushed rightward
    });

    it('should apply correct knockback force', () => {
      const attacker = { x: 100, y: 200 };
      const target = createTank('t1', 120, 200);

      const result = performMelee(attacker, 0, [target], 30, 15, 40);

      expect(result.damage).toBe(15);
      const magnitude = Math.sqrt(
        result.knockback.x * result.knockback.x + result.knockback.y * result.knockback.y,
      );
      expect(magnitude).toBeCloseTo(40);
    });

    it('should ignore destroyed tanks', () => {
      const attacker = { x: 100, y: 200 };
      const target = { ...createTank('t1', 120, 200), state: 'destroyed' as const };

      const result = performMelee(attacker, 0, [target], 30, 30, 20);

      expect(result.hit).toBe(false);
    });

    it('should hit the closest tank when multiple in range', () => {
      const attacker = { x: 100, y: 200 };
      const near = createTank('near', 115, 200);
      const far = createTank('far', 125, 200);

      const result = performMelee(attacker, 0, [far, near], 30, 30, 20);

      expect(result.hit).toBe(true);
      expect(result.targetTankId).toBe('near');
    });

    it('should return zero knockback on miss', () => {
      const attacker = { x: 100, y: 200 };

      const result = performMelee(attacker, 0, [], 30, 30, 20);

      expect(result.hit).toBe(false);
      expect(result.knockback).toEqual({ x: 0, y: 0 });
    });
  });
});
