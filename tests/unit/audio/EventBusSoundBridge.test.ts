import { describe, expect, it, vi } from 'vitest';
import { connectSoundToEvents } from '@/audio/EventBusSoundBridge';
import { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
import { SoundManager } from '@/audio/SoundManager';

describe('EventBusSoundBridge', () => {
  it('should play sound when event is emitted', () => {
    const bus = new EventBus();
    const sm = new SoundManager();
    sm.playTone = vi.fn();

    connectSoundToEvents(bus, sm);

    bus.emit(EventType.EXPLOSION, {
      position: { x: 100, y: 200 },
      radius: 30,
      damage: 50,
      weaponType: 'missile',
    });

    expect(sm.playTone).toHaveBeenCalledOnce();
  });

  it('should not play sound for unmapped events', () => {
    const bus = new EventBus();
    const sm = new SoundManager();
    sm.playTone = vi.fn();

    connectSoundToEvents(bus, sm);

    bus.emit(EventType.TANK_FALLING, {
      tankId: 't1',
      startPosition: { x: 0, y: 0 },
      fallDistance: 10,
    });

    expect(sm.playTone).not.toHaveBeenCalled();
  });

  it('should stop playing after dispose', () => {
    const bus = new EventBus();
    const sm = new SoundManager();
    sm.playTone = vi.fn();

    const dispose = connectSoundToEvents(bus, sm);
    dispose();

    bus.emit(EventType.EXPLOSION, {
      position: { x: 100, y: 200 },
      radius: 30,
      damage: 50,
      weaponType: 'missile',
    });

    expect(sm.playTone).not.toHaveBeenCalled();
  });
});
