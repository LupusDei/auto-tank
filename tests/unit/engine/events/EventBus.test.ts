import { describe, expect, it, vi } from 'vitest';
import {
  EventType,
  type GameEvent,
  type ProjectileFiredPayload,
  type TankDamagedPayload,
  type WindChangedPayload,
} from '@engine/events/types';

import { EventBus } from '@engine/events/EventBus';

function makeProjectileFiredPayload(): ProjectileFiredPayload {
  return {
    projectileId: 'proj-1',
    tankId: 'tank-1',
    weaponType: 'missile',
    position: { x: 100, y: 200 },
    velocity: { x: 50, y: -30 },
  };
}

describe('EventBus', () => {
  describe('on()', () => {
    it('should subscribe a handler and receive emitted events', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      bus.on(EventType.PROJECTILE_FIRED, handler);
      bus.emit(EventType.PROJECTILE_FIRED, makeProjectileFiredPayload());

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: EventType.PROJECTILE_FIRED,
          payload: makeProjectileFiredPayload(),
        }),
      );
    });

    it('should return an unsubscribe function', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      const unsub = bus.on(EventType.WIND_CHANGED, handler);
      unsub();

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 5 });
      expect(handler).not.toHaveBeenCalled();
    });

    it('should support multiple handlers for the same event type', () => {
      const bus = new EventBus();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      bus.on(EventType.TANK_DAMAGED, handler1);
      bus.on(EventType.TANK_DAMAGED, handler2);

      const payload: TankDamagedPayload = {
        tankId: 't1',
        damage: 25,
        newHealth: 75,
        sourcePlayerId: 'p2',
      };
      bus.emit(EventType.TANK_DAMAGED, payload);

      expect(handler1).toHaveBeenCalledTimes(1);
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should not cross-deliver events between different types', () => {
      const bus = new EventBus();
      const windHandler = vi.fn();
      const explosionHandler = vi.fn();

      bus.on(EventType.WIND_CHANGED, windHandler);
      bus.on(EventType.EXPLOSION, explosionHandler);

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });

      expect(windHandler).toHaveBeenCalledTimes(1);
      expect(explosionHandler).not.toHaveBeenCalled();
    });
  });

  describe('off()', () => {
    it('should remove a specific handler', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      bus.on(EventType.TURN_STARTED, handler);
      bus.off(EventType.TURN_STARTED, handler);

      bus.emit(EventType.TURN_STARTED, {
        playerId: 'p1',
        tankId: 't1',
        turnNumber: 1,
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should only remove the specified handler, not others', () => {
      const bus = new EventBus();
      const handler1 = vi.fn();
      const handler2 = vi.fn();

      bus.on(EventType.TURN_ENDED, handler1);
      bus.on(EventType.TURN_ENDED, handler2);
      bus.off(EventType.TURN_ENDED, handler1);

      bus.emit(EventType.TURN_ENDED, {
        playerId: 'p1',
        tankId: 't1',
        turnNumber: 1,
        reason: 'fired' as const,
      });

      expect(handler1).not.toHaveBeenCalled();
      expect(handler2).toHaveBeenCalledTimes(1);
    });

    it('should be safe to call off() for a handler that was never registered', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      expect(() => bus.off(EventType.EXPLOSION, handler)).not.toThrow();
    });
  });

  describe('emit()', () => {
    it('should dispatch synchronously', () => {
      const bus = new EventBus();
      const callOrder: number[] = [];

      bus.on(EventType.PHASE_CHANGED, () => callOrder.push(1));
      bus.on(EventType.PHASE_CHANGED, () => callOrder.push(2));

      callOrder.push(0);
      bus.emit(EventType.PHASE_CHANGED, {
        previousPhase: 'lobby',
        newPhase: 'setup',
      });
      callOrder.push(3);

      expect(callOrder).toEqual([0, 1, 2, 3]);
    });

    it('should create a proper GameEvent for handlers', () => {
      const bus = new EventBus();
      let received: GameEvent | undefined;

      bus.on(EventType.WIND_CHANGED, (event) => {
        received = event as GameEvent;
      });

      const payload: WindChangedPayload = { previousWind: 0, newWind: 5 };
      bus.emit(EventType.WIND_CHANGED, payload);

      expect(received).toBeDefined();
      expect(received?.type).toBe(EventType.WIND_CHANGED);
      expect(received?.payload).toEqual(payload);
      expect(typeof received?.timestamp).toBe('number');
      expect(received?.source).toBe('system');
    });

    it('should pass custom source to event', () => {
      const bus = new EventBus();
      let received: GameEvent | undefined;

      bus.on(EventType.PROJECTILE_FIRED, (event) => {
        received = event as GameEvent;
      });

      bus.emit(EventType.PROJECTILE_FIRED, makeProjectileFiredPayload(), 'tank-1');

      expect(received?.source).toBe('tank-1');
    });

    it('should do nothing when no handlers are registered', () => {
      const bus = new EventBus();
      expect(() =>
        bus.emit(EventType.EXPLOSION, {
          position: { x: 0, y: 0 },
          radius: 10,
          damage: 20,
          weaponType: 'missile',
        }),
      ).not.toThrow();
    });
  });

  describe('handler count', () => {
    it('should report correct handler count per event type', () => {
      const bus = new EventBus();
      const h1 = vi.fn();
      const h2 = vi.fn();

      expect(bus.handlerCount(EventType.WIND_CHANGED)).toBe(0);

      bus.on(EventType.WIND_CHANGED, h1);
      expect(bus.handlerCount(EventType.WIND_CHANGED)).toBe(1);

      bus.on(EventType.WIND_CHANGED, h2);
      expect(bus.handlerCount(EventType.WIND_CHANGED)).toBe(2);

      bus.off(EventType.WIND_CHANGED, h1);
      expect(bus.handlerCount(EventType.WIND_CHANGED)).toBe(1);
    });
  });

  describe('once()', () => {
    it('should fire handler exactly once then auto-unsubscribe', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      bus.once(EventType.WIND_CHANGED, handler);

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });
      bus.emit(EventType.WIND_CHANGED, { previousWind: 3, newWind: 7 });

      expect(handler).toHaveBeenCalledTimes(1);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({
          type: EventType.WIND_CHANGED,
          payload: { previousWind: 0, newWind: 3 },
        }),
      );
    });

    it('should return an unsubscribe function that works before firing', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      const unsub = bus.once(EventType.EXPLOSION, handler);
      unsub();

      bus.emit(EventType.EXPLOSION, {
        position: { x: 0, y: 0 },
        radius: 10,
        damage: 20,
        weaponType: 'missile',
      });

      expect(handler).not.toHaveBeenCalled();
    });

    it('should decrement handler count after firing', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      bus.once(EventType.WIND_CHANGED, handler);
      expect(bus.handlerCount(EventType.WIND_CHANGED)).toBe(1);

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });
      expect(bus.handlerCount(EventType.WIND_CHANGED)).toBe(0);
    });
  });

  describe('onAny()', () => {
    it('should receive events of any type', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      bus.onAny(handler);

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });
      bus.emit(EventType.EXPLOSION, {
        position: { x: 0, y: 0 },
        radius: 10,
        damage: 20,
        weaponType: 'missile',
      });

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ type: EventType.WIND_CHANGED }),
      );
      expect(handler).toHaveBeenCalledWith(expect.objectContaining({ type: EventType.EXPLOSION }));
    });

    it('should return an unsubscribe function', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      const unsub = bus.onAny(handler);
      unsub();

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });
      expect(handler).not.toHaveBeenCalled();
    });

    it('should be cleared by removeAllHandlers()', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      bus.onAny(handler);
      bus.removeAllHandlers();

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });
      expect(handler).not.toHaveBeenCalled();
    });
  });

  describe('filter option', () => {
    it('should only invoke handler when filter predicate returns true', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      bus.on(EventType.TANK_DAMAGED, handler, {
        filter: (event) => event.payload.damage > 30,
      });

      bus.emit(EventType.TANK_DAMAGED, {
        tankId: 't1',
        damage: 10,
        newHealth: 90,
        sourcePlayerId: 'p2',
      });
      expect(handler).not.toHaveBeenCalled();

      bus.emit(EventType.TANK_DAMAGED, {
        tankId: 't1',
        damage: 50,
        newHealth: 50,
        sourcePlayerId: 'p2',
      });
      expect(handler).toHaveBeenCalledTimes(1);
    });

    it('should work with once() and filter together', () => {
      const bus = new EventBus();
      const handler = vi.fn();

      bus.once(EventType.TANK_DAMAGED, handler, {
        filter: (event) => event.payload.damage > 30,
      });

      // Filtered out — doesn't count as the "once" trigger
      bus.emit(EventType.TANK_DAMAGED, {
        tankId: 't1',
        damage: 10,
        newHealth: 90,
        sourcePlayerId: 'p2',
      });
      expect(handler).not.toHaveBeenCalled();

      // Passes filter — fires and auto-unsubscribes
      bus.emit(EventType.TANK_DAMAGED, {
        tankId: 't1',
        damage: 50,
        newHealth: 50,
        sourcePlayerId: 'p2',
      });
      expect(handler).toHaveBeenCalledTimes(1);

      // Already unsubscribed
      bus.emit(EventType.TANK_DAMAGED, {
        tankId: 't1',
        damage: 60,
        newHealth: 40,
        sourcePlayerId: 'p2',
      });
      expect(handler).toHaveBeenCalledTimes(1);
    });
  });

  describe('history', () => {
    it('should record events in order', () => {
      const bus = new EventBus({ historySize: 100 });

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });
      bus.emit(EventType.EXPLOSION, {
        position: { x: 0, y: 0 },
        radius: 10,
        damage: 20,
        weaponType: 'missile',
      });

      const history = bus.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0]?.type).toBe(EventType.WIND_CHANGED);
      expect(history[1]?.type).toBe(EventType.EXPLOSION);
    });

    it('should enforce history size limit', () => {
      const bus = new EventBus({ historySize: 2 });

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 1 });
      bus.emit(EventType.WIND_CHANGED, { previousWind: 1, newWind: 2 });
      bus.emit(EventType.WIND_CHANGED, { previousWind: 2, newWind: 3 });

      const history = bus.getHistory();
      expect(history).toHaveLength(2);
      expect(history[0]?.payload).toEqual({ previousWind: 1, newWind: 2 });
      expect(history[1]?.payload).toEqual({ previousWind: 2, newWind: 3 });
    });

    it('should not record history when historySize is 0 (default)', () => {
      const bus = new EventBus();

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });

      expect(bus.getHistory()).toHaveLength(0);
    });

    it('should return a copy of history, not the internal array', () => {
      const bus = new EventBus({ historySize: 10 });

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });

      const h1 = bus.getHistory();
      const h2 = bus.getHistory();
      expect(h1).not.toBe(h2);
      expect(h1).toEqual(h2);
    });
  });

  describe('replay()', () => {
    it('should re-emit recorded events to current handlers', () => {
      const bus = new EventBus({ historySize: 100 });

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });
      bus.emit(EventType.WIND_CHANGED, { previousWind: 3, newWind: 7 });

      const history = bus.getHistory();

      // New bus with a handler
      const replayBus = new EventBus();
      const handler = vi.fn();
      replayBus.on(EventType.WIND_CHANGED, handler);

      replayBus.replay(history);

      expect(handler).toHaveBeenCalledTimes(2);
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ payload: { previousWind: 0, newWind: 3 } }),
      );
      expect(handler).toHaveBeenCalledWith(
        expect.objectContaining({ payload: { previousWind: 3, newWind: 7 } }),
      );
    });

    it('should not record replayed events in history', () => {
      const bus = new EventBus({ historySize: 100 });

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });
      const history = bus.getHistory();

      const replayBus = new EventBus({ historySize: 100 });
      replayBus.replay(history);

      expect(replayBus.getHistory()).toHaveLength(0);
    });
  });

  describe('clear()', () => {
    it('should remove all handlers, wildcards, and history', () => {
      const bus = new EventBus({ historySize: 100 });
      const handler = vi.fn();
      const wildcard = vi.fn();

      bus.on(EventType.WIND_CHANGED, handler);
      bus.onAny(wildcard);
      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });

      expect(bus.getHistory()).toHaveLength(1);

      bus.clear();

      // History cleared
      expect(bus.getHistory()).toHaveLength(0);
      expect(bus.handlerCount(EventType.WIND_CHANGED)).toBe(0);

      // Handlers removed — second emit doesn't reach them
      bus.emit(EventType.WIND_CHANGED, { previousWind: 3, newWind: 7 });
      expect(handler).toHaveBeenCalledTimes(1); // only the first call
      expect(wildcard).toHaveBeenCalledTimes(1);
    });
  });

  describe('removeAllHandlers()', () => {
    it('should remove all handlers for a specific event type', () => {
      const bus = new EventBus();
      const h1 = vi.fn();
      const h2 = vi.fn();

      bus.on(EventType.EXPLOSION, h1);
      bus.on(EventType.EXPLOSION, h2);
      bus.removeAllHandlers(EventType.EXPLOSION);

      bus.emit(EventType.EXPLOSION, {
        position: { x: 0, y: 0 },
        radius: 10,
        damage: 20,
        weaponType: 'missile',
      });

      expect(h1).not.toHaveBeenCalled();
      expect(h2).not.toHaveBeenCalled();
    });

    it('should remove all handlers for all event types when no type given', () => {
      const bus = new EventBus();
      const windHandler = vi.fn();
      const explosionHandler = vi.fn();

      bus.on(EventType.WIND_CHANGED, windHandler);
      bus.on(EventType.EXPLOSION, explosionHandler);
      bus.removeAllHandlers();

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });
      bus.emit(EventType.EXPLOSION, {
        position: { x: 0, y: 0 },
        radius: 10,
        damage: 20,
        weaponType: 'missile',
      });

      expect(windHandler).not.toHaveBeenCalled();
      expect(explosionHandler).not.toHaveBeenCalled();
    });
  });
});
