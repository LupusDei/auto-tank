import { applyDamage, landTank, startFalling } from '@engine/physics/TankStateManager';
import { describe, expect, it, vi } from 'vitest';
import { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
import type { Tank } from '@shared/types/entities';

function createTank(overrides?: Partial<Tank>): Tank {
  return {
    id: 't1',
    playerId: 'p1',
    position: { x: 50, y: 100 },
    angle: 45,
    power: 50,
    health: 100,
    maxHealth: 100,
    fuel: 100,
    state: 'alive',
    color: 'red',
    selectedWeapon: null,
    ...overrides,
  };
}

describe('TankStateManager', () => {
  describe('applyDamage()', () => {
    it('should reduce health', () => {
      const tank = createTank();
      const result = applyDamage(tank, 30, null);
      expect(result.health).toBe(70);
      expect(result.state).toBe('alive');
    });

    it('should destroy tank when health reaches 0', () => {
      const tank = createTank({ health: 20 });
      const result = applyDamage(tank, 30, 'p2');
      expect(result.health).toBe(0);
      expect(result.state).toBe('destroyed');
    });

    it('should emit TANK_DESTROYED event', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.TANK_DESTROYED, handler);

      const tank = createTank({ health: 10 });
      applyDamage(tank, 20, 'p2', bus);

      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not damage already destroyed tanks', () => {
      const tank = createTank({ state: 'destroyed', health: 0 });
      const result = applyDamage(tank, 50, null);
      expect(result).toBe(tank);
    });
  });

  describe('startFalling()', () => {
    it('should transition alive tank to falling', () => {
      const tank = createTank();
      const result = startFalling(tank);
      expect(result.state).toBe('falling');
    });

    it('should emit TANK_FALLING event', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.TANK_FALLING, handler);

      startFalling(createTank(), bus);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not transition destroyed tanks', () => {
      const tank = createTank({ state: 'destroyed' });
      const result = startFalling(tank);
      expect(result).toBe(tank);
    });
  });

  describe('landTank()', () => {
    it('should transition falling tank to alive', () => {
      const tank = createTank({ state: 'falling' });
      const result = landTank(tank, 50);
      expect(result.state).toBe('alive');
    });

    it('should emit TANK_MOVED event on landing', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.TANK_MOVED, handler);

      const tank = createTank({ state: 'falling' });
      landTank(tank, 50, bus);
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should not transition non-falling tanks', () => {
      const tank = createTank({ state: 'alive' });
      const result = landTank(tank, 0);
      expect(result).toBe(tank);
    });
  });
});
