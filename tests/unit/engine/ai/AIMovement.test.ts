import { calculateMoveSteps, shouldMove } from '@engine/ai/AIMovement';
import { describe, expect, it } from 'vitest';
import type { AIContext } from '@engine/ai/AIController';
import type { Tank } from '@shared/types/entities';

function makeTank(id: string, x: number, fuel = 100): Tank {
  return {
    id,
    playerId: `p-${id}`,
    position: { x, y: 200 },
    angle: 45,
    power: 50,
    health: 100,
    maxHealth: 100,
    fuel,
    state: 'alive',
    color: 'red',
    selectedWeapon: null,
  };
}

function makeContext(ownX: number, enemyX: number, fuel = 100): AIContext {
  return {
    ownTank: makeTank('own', ownX, fuel),
    enemyTanks: [makeTank('e1', enemyX)],
    terrain: {
      config: { width: 500, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
      heightMap: new Array(500).fill(200) as number[],
      destructionMap: new Array(500).fill(false) as boolean[],
    },
    wind: 0,
    gravity: 9.81,
  };
}

describe('AIMovement', () => {
  describe('shouldMove()', () => {
    it('should want to move away when too close to enemy', () => {
      const result = shouldMove(makeContext(100, 120));
      expect(result.shouldMove).toBe(true);
      expect(result.direction).toBe(-1); // move away (enemy is to the right)
    });

    it('should not move when at comfortable distance', () => {
      const result = shouldMove(makeContext(100, 300));
      expect(result.shouldMove).toBe(false);
    });

    it('should not move with zero fuel', () => {
      const result = shouldMove(makeContext(100, 120, 0));
      expect(result.shouldMove).toBe(false);
    });

    it('should not move when no enemies', () => {
      const ctx = { ...makeContext(100, 300), enemyTanks: [] };
      const result = shouldMove(ctx);
      expect(result.shouldMove).toBe(false);
    });
  });

  describe('calculateMoveSteps()', () => {
    it('should return steps based on fuel and urgency', () => {
      expect(calculateMoveSteps(100, 0.5)).toBeGreaterThan(0);
      expect(calculateMoveSteps(100, 1.0)).toBeGreaterThan(calculateMoveSteps(100, 0.3));
    });

    it('should return at least 1 step', () => {
      expect(calculateMoveSteps(2, 0.1)).toBeGreaterThanOrEqual(1);
    });

    it('should cap steps based on fuel', () => {
      expect(calculateMoveSteps(4, 1.0)).toBeLessThanOrEqual(2);
    });
  });
});
