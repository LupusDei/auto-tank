import { describe, expect, it, vi } from 'vitest';
import { EventType, type GameEvent, type PhaseChangedPayload } from '@engine/events/types';

import { EventBus } from '@engine/events/EventBus';
import { GameStateMachine } from '@engine/state/GameStateMachine';

describe('EventBus integration', () => {
  describe('with GameStateMachine phase transitions', () => {
    it('should emit phase change events during state machine transitions', () => {
      const bus = new EventBus({ historySize: 100 });
      const sm = new GameStateMachine();
      const handler = vi.fn();

      bus.on(EventType.PHASE_CHANGED, handler);

      // Wire state machine transitions to event bus
      const originalTransition = sm.transition.bind(sm);
      sm.transition = (to): void => {
        const previous = sm.currentPhase;
        originalTransition(to);
        bus.emit(EventType.PHASE_CHANGED, {
          previousPhase: previous,
          newPhase: to,
        });
      };

      sm.transition('setup');
      sm.transition('playing');
      sm.transition('turn');

      expect(handler).toHaveBeenCalledTimes(3);

      const calls = handler.mock.calls as [GameEvent<typeof EventType.PHASE_CHANGED>][];
      expect(calls[0]?.[0]?.payload.previousPhase).toBe('lobby');
      expect(calls[0]?.[0]?.payload.newPhase).toBe('setup');
      expect(calls[1]?.[0]?.payload.previousPhase).toBe('setup');
      expect(calls[1]?.[0]?.payload.newPhase).toBe('playing');
      expect(calls[2]?.[0]?.payload.previousPhase).toBe('playing');
      expect(calls[2]?.[0]?.payload.newPhase).toBe('turn');
    });

    it('should record full phase transition history', () => {
      const bus = new EventBus({ historySize: 100 });
      const sm = new GameStateMachine();

      sm.transition = (
        (original) =>
        (to): void => {
          const previous = sm.currentPhase;
          original.call(sm, to);
          bus.emit(EventType.PHASE_CHANGED, { previousPhase: previous, newPhase: to });
        }
      )(sm.transition.bind(sm));

      sm.transition('setup');
      sm.transition('playing');
      sm.transition('turn');
      sm.transition('firing');
      sm.transition('resolution');
      sm.transition('victory');

      const history = bus.getHistory();
      expect(history).toHaveLength(6);

      const phases = history.map((e) => (e.payload as PhaseChangedPayload).newPhase);
      expect(phases).toEqual(['setup', 'playing', 'turn', 'firing', 'resolution', 'victory']);
    });
  });

  describe('deterministic replay', () => {
    it('should produce identical handler calls when replaying recorded events', () => {
      const bus = new EventBus({ historySize: 100 });

      // Record a sequence of events
      bus.emit(EventType.ROUND_STARTED, { roundNumber: 1, playerIds: ['p1', 'p2'] });
      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3.5 });
      bus.emit(EventType.TURN_STARTED, { playerId: 'p1', tankId: 't1', turnNumber: 1 });
      bus.emit(EventType.PROJECTILE_FIRED, {
        projectileId: 'proj-1',
        tankId: 't1',
        weaponType: 'missile',
        position: { x: 100, y: 200 },
        velocity: { x: 50, y: -30 },
      });
      bus.emit(EventType.EXPLOSION, {
        position: { x: 300, y: 150 },
        radius: 40,
        damage: 30,
        weaponType: 'missile',
      });
      bus.emit(EventType.TANK_DAMAGED, {
        tankId: 't2',
        damage: 25,
        newHealth: 75,
        sourcePlayerId: 'p1',
      });

      const recordedHistory = bus.getHistory();

      // Replay on a new bus with handlers
      const replayBus = new EventBus();
      const receivedTypes: string[] = [];

      replayBus.onAny((event) => {
        receivedTypes.push(event.type);
      });

      replayBus.replay(recordedHistory);

      expect(receivedTypes).toEqual([
        EventType.ROUND_STARTED,
        EventType.WIND_CHANGED,
        EventType.TURN_STARTED,
        EventType.PROJECTILE_FIRED,
        EventType.EXPLOSION,
        EventType.TANK_DAMAGED,
      ]);
    });

    it('should preserve exact payload data through replay', () => {
      const bus = new EventBus({ historySize: 100 });
      const originalPayload = {
        projectileId: 'proj-1',
        tankId: 't1',
        weaponType: 'missile' as const,
        position: { x: 100, y: 200 },
        velocity: { x: 50, y: -30 },
      };

      bus.emit(EventType.PROJECTILE_FIRED, originalPayload);
      const history = bus.getHistory();

      const replayBus = new EventBus();
      let replayedPayload: unknown;
      replayBus.on(EventType.PROJECTILE_FIRED, (event) => {
        replayedPayload = event.payload;
      });

      replayBus.replay(history);
      expect(replayedPayload).toEqual(originalPayload);
    });
  });

  describe('memory cleanup', () => {
    it('should have no listeners after clear()', () => {
      const bus = new EventBus({ historySize: 100 });

      // Register many handlers
      for (let i = 0; i < 50; i++) {
        bus.on(EventType.WIND_CHANGED, vi.fn());
        bus.on(EventType.EXPLOSION, vi.fn());
      }
      bus.onAny(vi.fn());

      // Emit some events
      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });

      expect(bus.handlerCount(EventType.WIND_CHANGED)).toBe(50);
      expect(bus.getHistory()).toHaveLength(1);

      bus.clear();

      expect(bus.handlerCount(EventType.WIND_CHANGED)).toBe(0);
      expect(bus.handlerCount(EventType.EXPLOSION)).toBe(0);
      expect(bus.getHistory()).toHaveLength(0);
    });

    it('should not leak handlers when using once()', () => {
      const bus = new EventBus();

      for (let i = 0; i < 100; i++) {
        bus.once(EventType.WIND_CHANGED, vi.fn());
      }
      expect(bus.handlerCount(EventType.WIND_CHANGED)).toBe(100);

      bus.emit(EventType.WIND_CHANGED, { previousWind: 0, newWind: 3 });
      expect(bus.handlerCount(EventType.WIND_CHANGED)).toBe(0);
    });

    it('should not leak handlers when using unsubscribe functions', () => {
      const bus = new EventBus();
      const unsubs: (() => void)[] = [];

      for (let i = 0; i < 50; i++) {
        unsubs.push(bus.on(EventType.EXPLOSION, vi.fn()));
      }
      expect(bus.handlerCount(EventType.EXPLOSION)).toBe(50);

      for (const unsub of unsubs) {
        unsub();
      }
      expect(bus.handlerCount(EventType.EXPLOSION)).toBe(0);
    });
  });
});
