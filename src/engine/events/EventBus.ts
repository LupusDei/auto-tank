import {
  createGameEvent,
  type EventPayloadMap,
  type EventTypeValue,
  type GameEvent,
} from './types';

/** Type-safe event handler */
export type EventHandler<T extends EventTypeValue> = (event: GameEvent<T>) => void;

/**
 * Synchronous, type-safe event bus for game systems.
 * All dispatch is synchronous to support deterministic replay.
 */
export class EventBus {
  private readonly handlers = new Map<EventTypeValue, Set<EventHandler<EventTypeValue>>>();

  /** Subscribe to an event type. Returns an unsubscribe function. */
  on<T extends EventTypeValue>(type: T, handler: EventHandler<T>): () => void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set();
      this.handlers.set(type, set);
    }
    set.add(handler as EventHandler<EventTypeValue>);

    return (): void => {
      this.off(type, handler);
    };
  }

  /** Unsubscribe a handler from an event type. */
  off<T extends EventTypeValue>(type: T, handler: EventHandler<T>): void {
    const set = this.handlers.get(type);
    if (set) {
      set.delete(handler as EventHandler<EventTypeValue>);
    }
  }

  /** Synchronously emit an event to all registered handlers. */
  emit<T extends EventTypeValue>(
    type: T,
    payload: T extends keyof EventPayloadMap ? EventPayloadMap[T] : never,
    source = 'system',
  ): void {
    const set = this.handlers.get(type);
    if (!set) return;

    const event = createGameEvent(type, payload, source);
    for (const handler of set) {
      handler(event);
    }
  }

  /** Returns the number of handlers for a given event type. */
  handlerCount(type: EventTypeValue): number {
    return this.handlers.get(type)?.size ?? 0;
  }

  /** Remove all handlers for a specific event type, or all handlers if no type given. */
  removeAllHandlers(type?: EventTypeValue): void {
    if (type !== undefined) {
      this.handlers.delete(type);
    } else {
      this.handlers.clear();
    }
  }
}
