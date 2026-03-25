import { describe, expect, it, vi } from 'vitest';
import {
  emitPhaseChanged,
  emitRoundEnded,
  emitRoundStarted,
} from '@engine/state/GameSessionEvents';
import { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';

describe('GameSessionEvents', () => {
  describe('emitRoundStarted()', () => {
    it('should emit ROUND_STARTED with round number and player ids', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.ROUND_STARTED, handler);

      emitRoundStarted(bus, 1, ['p1', 'p2']);

      expect(handler).toHaveBeenCalledOnce();
      const payload = handler.mock.calls[0]?.[0]?.payload;
      expect(payload.roundNumber).toBe(1);
      expect(payload.playerIds).toEqual(['p1', 'p2']);
    });
  });

  describe('emitRoundEnded()', () => {
    it('should emit ROUND_ENDED with winner id', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.ROUND_ENDED, handler);

      emitRoundEnded(bus, 2, 'p1');

      expect(handler).toHaveBeenCalledOnce();
      const payload = handler.mock.calls[0]?.[0]?.payload;
      expect(payload.roundNumber).toBe(2);
      expect(payload.winnerId).toBe('p1');
    });

    it('should emit ROUND_ENDED with null winner for draw', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.ROUND_ENDED, handler);

      emitRoundEnded(bus, 3, null);

      const payload = handler.mock.calls[0]?.[0]?.payload;
      expect(payload.winnerId).toBeNull();
    });
  });

  describe('emitPhaseChanged()', () => {
    it('should emit PHASE_CHANGED with previous and new phase', () => {
      const bus = new EventBus();
      const handler = vi.fn();
      bus.on(EventType.PHASE_CHANGED, handler);

      emitPhaseChanged(bus, 'lobby', 'setup');

      expect(handler).toHaveBeenCalledOnce();
      const payload = handler.mock.calls[0]?.[0]?.payload;
      expect(payload.previousPhase).toBe('lobby');
      expect(payload.newPhase).toBe('setup');
    });
  });

  describe('event ordering', () => {
    it('should emit events in correct lifecycle order', () => {
      const bus = new EventBus({ historySize: 100 });

      emitPhaseChanged(bus, 'lobby', 'setup');
      emitPhaseChanged(bus, 'setup', 'playing');
      emitRoundStarted(bus, 1, ['p1', 'p2']);
      emitPhaseChanged(bus, 'playing', 'turn');
      emitRoundEnded(bus, 1, 'p1');
      emitPhaseChanged(bus, 'resolution', 'victory');

      const history = bus.getHistory();
      expect(history).toHaveLength(6);
      expect(history[0]?.type).toBe(EventType.PHASE_CHANGED);
      expect(history[2]?.type).toBe(EventType.ROUND_STARTED);
      expect(history[4]?.type).toBe(EventType.ROUND_ENDED);
    });
  });
});
