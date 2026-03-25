import { describe, expect, it, vi } from 'vitest';
import { EventType, type WindChangedPayload } from '@engine/events/types';
import { EventBus } from '@engine/events/EventBus';
import { WindManager } from '@engine/environment/WindManager';

describe('WindManager', () => {
  it('should emit WIND_CHANGED on initialization', () => {
    const bus = new EventBus();
    const handler = vi.fn();
    bus.on(EventType.WIND_CHANGED, handler);

    new WindManager(bus, { seed: 42 });

    expect(handler).toHaveBeenCalledTimes(1);
    const payload = handler.mock.calls[0]?.[0]?.payload as WindChangedPayload;
    expect(payload.previousWind).toBe(0);
    expect(typeof payload.newWind).toBe('number');
    expect(payload.newWind).not.toBe(0);
  });

  it('should recalculate wind on TURN_STARTED and emit WIND_CHANGED', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    new WindManager(bus, { seed: 42 });

    bus.on(EventType.WIND_CHANGED, handler);

    // Simulate turn start
    bus.emit(EventType.TURN_STARTED, {
      playerId: 'p1',
      tankId: 't1',
      turnNumber: 1,
    });

    expect(handler).toHaveBeenCalledTimes(1);
    const payload = handler.mock.calls[0]?.[0]?.payload as WindChangedPayload;
    expect(typeof payload.previousWind).toBe('number');
    expect(typeof payload.newWind).toBe('number');
  });

  it('should expose current wind state', () => {
    const bus = new EventBus();
    const manager = new WindManager(bus, { seed: 42 });

    expect(manager.currentWind.strength).toBeGreaterThan(0);
  });

  it('should produce different wind for different turn seeds', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    new WindManager(bus, { seed: 42 });
    bus.on(EventType.WIND_CHANGED, handler);

    bus.emit(EventType.TURN_STARTED, { playerId: 'p1', tankId: 't1', turnNumber: 1 });
    bus.emit(EventType.TURN_STARTED, { playerId: 'p1', tankId: 't1', turnNumber: 2 });

    expect(handler).toHaveBeenCalledTimes(2);
    const payload1 = handler.mock.calls[0]?.[0]?.payload as WindChangedPayload;
    const payload2 = handler.mock.calls[1]?.[0]?.payload as WindChangedPayload;
    // Turn seeds derive from turn number, so winds should differ
    expect(payload1.newWind).not.toBe(payload2.newWind);
  });

  it('should clean up event listener on dispose', () => {
    const bus = new EventBus();
    const handler = vi.fn();

    const manager = new WindManager(bus, { seed: 42 });
    bus.on(EventType.WIND_CHANGED, handler);

    manager.dispose();

    bus.emit(EventType.TURN_STARTED, { playerId: 'p1', tankId: 't1', turnNumber: 1 });
    expect(handler).not.toHaveBeenCalled();
  });
});
