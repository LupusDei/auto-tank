import { canFire, canMove, createFireAction } from '@engine/input/FiringControls';
import { describe, expect, it } from 'vitest';
import type { GamePhase } from '@shared/types/game';
import type { Tank } from '@shared/types/entities';

function createTank(overrides?: Partial<Tank>): Tank {
  return {
    id: 't1',
    playerId: 'p1',
    position: { x: 100, y: 200 },
    angle: 45,
    power: 80,
    health: 100,
    maxHealth: 100,
    fuel: 100,
    state: 'alive',
    color: 'red',
    selectedWeapon: {
      definition: {
        type: 'missile',
        name: 'Missile',
        category: 'projectile',
        explosionRadius: 30,
        damage: 50,
        price: 0,
        affectedByWind: true,
        affectedByGravity: true,
      },
      quantity: 3,
    },
    ...overrides,
  };
}

describe('FiringControls', () => {
  describe('createFireAction()', () => {
    it('should create a valid TurnAction from tank state', () => {
      const tank = createTank();
      const action = createFireAction(tank);

      expect(action.playerId).toBe('p1');
      expect(action.tankId).toBe('t1');
      expect(action.weaponType).toBe('missile');
      expect(action.angle).toBe(45);
      expect(action.power).toBe(80);
    });

    it('should throw when no weapon selected', () => {
      const tank = createTank({ selectedWeapon: null });
      expect(() => createFireAction(tank)).toThrow();
    });
  });

  describe('canFire()', () => {
    it('should allow firing during turn phase', () => {
      expect(canFire('turn', false)).toBe(true);
    });

    it('should block firing outside turn phase', () => {
      const phases: GamePhase[] = [
        'lobby',
        'setup',
        'playing',
        'firing',
        'resolution',
        'shop',
        'victory',
      ];
      for (const phase of phases) {
        expect(canFire(phase, false)).toBe(false);
      }
    });

    it('should block firing if already fired', () => {
      expect(canFire('turn', true)).toBe(false);
    });
  });

  describe('canMove()', () => {
    it('should allow movement during turn phase before firing', () => {
      const tank = createTank();
      expect(canMove(tank, 'turn', false)).toBe(true);
    });

    it('should block movement after firing', () => {
      const tank = createTank();
      expect(canMove(tank, 'turn', true)).toBe(false);
    });

    it('should block movement with zero fuel', () => {
      const tank = createTank({ fuel: 0 });
      expect(canMove(tank, 'turn', false)).toBe(false);
    });

    it('should block movement outside turn phase', () => {
      const tank = createTank();
      expect(canMove(tank, 'firing', false)).toBe(false);
    });

    it('should block movement for destroyed tanks', () => {
      const tank = createTank({ state: 'destroyed' });
      expect(canMove(tank, 'turn', false)).toBe(false);
    });
  });
});
