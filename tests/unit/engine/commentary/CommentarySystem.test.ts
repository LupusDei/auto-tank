import { describe, expect, it, vi } from 'vitest';
import { CommentarySystem } from '@engine/commentary/CommentarySystem';
import { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';

describe('CommentarySystem', () => {
  it('should produce comments for matching events', () => {
    const sys = new CommentarySystem('aggressive', 0);
    const comment = sys.getRandomComment(EventType.EXPLOSION);
    expect(comment).not.toBeNull();
    expect(typeof comment).toBe('string');
  });

  it('should return null for events without responses', () => {
    const sys = new CommentarySystem('aggressive');
    expect(sys.getRandomComment(EventType.ROUND_STARTED)).toBeNull();
  });

  it('should fire listener when connected to EventBus', () => {
    const bus = new EventBus();
    const sys = new CommentarySystem('sarcastic', 0);
    const listener = vi.fn();
    sys.onComment(listener);
    sys.connect(bus);

    bus.emit(EventType.EXPLOSION, {
      position: { x: 0, y: 0 },
      radius: 30,
      damage: 50,
      weaponType: 'missile',
    });
    expect(listener).toHaveBeenCalledOnce();
    expect(listener.mock.calls[0]?.[0]?.personality).toBe('sarcastic');
  });

  it('should respect cooldown', () => {
    const bus = new EventBus();
    const sys = new CommentarySystem('cheerful', 99999);
    const listener = vi.fn();
    sys.onComment(listener);
    sys.connect(bus);

    bus.emit(EventType.EXPLOSION, {
      position: { x: 0, y: 0 },
      radius: 30,
      damage: 50,
      weaponType: 'missile',
    });
    bus.emit(EventType.EXPLOSION, {
      position: { x: 0, y: 0 },
      radius: 30,
      damage: 50,
      weaponType: 'missile',
    });
    expect(listener).toHaveBeenCalledOnce();
  });

  it('should disconnect cleanly', () => {
    const bus = new EventBus();
    const sys = new CommentarySystem('robot', 0);
    const listener = vi.fn();
    sys.onComment(listener);
    sys.connect(bus);
    sys.disconnect();

    bus.emit(EventType.EXPLOSION, {
      position: { x: 0, y: 0 },
      radius: 30,
      damage: 50,
      weaponType: 'missile',
    });
    expect(listener).not.toHaveBeenCalled();
  });

  it('should have responses for all 5 personalities', () => {
    for (const p of ['aggressive', 'cowardly', 'sarcastic', 'robot', 'cheerful'] as const) {
      const sys = new CommentarySystem(p);
      expect(sys.getRandomComment(EventType.EXPLOSION)).not.toBeNull();
    }
  });
});
