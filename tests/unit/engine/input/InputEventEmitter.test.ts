import { describe, expect, it, vi } from 'vitest';
import {
  emitProjectileFired,
  emitTankMoved,
  emitWeaponSelected,
} from '@engine/input/InputEventEmitter';
import { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';

describe('InputEventEmitter', () => {
  describe('emitWeaponSelected()', () => {
    it('should emit WEAPON_SELECTED with correct payload', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.WEAPON_SELECTED, handler);

      emitWeaponSelected(bus, 't1', 'baby-missile', 'nuke');

      expect(handler).toHaveBeenCalledOnce();
      const payload = handler.mock.calls[0]?.[0]?.payload;
      expect(payload.tankId).toBe('t1');
      expect(payload.previousWeapon).toBe('baby-missile');
      expect(payload.newWeapon).toBe('nuke');
    });

    it('should handle null previous weapon', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.WEAPON_SELECTED, handler);

      emitWeaponSelected(bus, 't1', null, 'missile');

      const payload = handler.mock.calls[0]?.[0]?.payload;
      expect(payload.previousWeapon).toBeNull();
    });
  });

  describe('emitTankMoved()', () => {
    it('should emit TANK_MOVED with positions and fuel used', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.TANK_MOVED, handler);

      emitTankMoved(bus, 't1', { x: 50, y: 100 }, { x: 52, y: 100 }, 3);

      expect(handler).toHaveBeenCalledOnce();
      const payload = handler.mock.calls[0]?.[0]?.payload;
      expect(payload.tankId).toBe('t1');
      expect(payload.previousPosition).toEqual({ x: 50, y: 100 });
      expect(payload.newPosition).toEqual({ x: 52, y: 100 });
      expect(payload.fuelUsed).toBe(3);
    });
  });

  describe('emitProjectileFired()', () => {
    it('should emit PROJECTILE_FIRED with correct payload', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.PROJECTILE_FIRED, handler);

      emitProjectileFired(bus, 'proj-1', 't1', 'missile', { x: 100, y: 200 }, { x: 50, y: -30 });

      expect(handler).toHaveBeenCalledOnce();
      const payload = handler.mock.calls[0]?.[0]?.payload;
      expect(payload.projectileId).toBe('proj-1');
      expect(payload.tankId).toBe('t1');
      expect(payload.weaponType).toBe('missile');
      expect(payload.position).toEqual({ x: 100, y: 200 });
      expect(payload.velocity).toEqual({ x: 50, y: -30 });
    });
  });
});
