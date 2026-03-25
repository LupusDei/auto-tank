import {
  createGameEvent,
  type EventPayloadMap,
  type EventTypeValue,
  type GameEvent,
} from './types';

/** Type-safe event handler */
export type EventHandler<T extends EventTypeValue> = (event: GameEvent<T>) => void;

/** Wildcard handler receives any event */
export type WildcardHandler = (event: GameEvent) => void;

/** Subscription options */
export interface SubscribeOptions<T extends EventTypeValue> {
  readonly filter?: (event: GameEvent<T>) => boolean;
}

/** EventBus configuration */
export interface EventBusOptions {
  readonly historySize?: number;
}

/**
 * Synchronous, type-safe event bus for game systems.
 * All dispatch is synchronous to support deterministic replay.
 */
export class EventBus {
  private readonly handlers = new Map<EventTypeValue, Set<EventHandler<EventTypeValue>>>();
  private readonly wildcardHandlers = new Set<WildcardHandler>();
  private readonly filters = new Map<EventHandler<EventTypeValue>, (event: GameEvent) => boolean>();
  private readonly history: GameEvent[] = [];
  private readonly historySize: number;
  private replaying = false;

  constructor(options?: EventBusOptions) {
    this.historySize = options?.historySize ?? 0;
  }

  /** Subscribe to an event type. Returns an unsubscribe function. */
  on<T extends EventTypeValue>(
    type: T,
    handler: EventHandler<T>,
    options?: SubscribeOptions<T>,
  ): () => void {
    let set = this.handlers.get(type);
    if (!set) {
      set = new Set();
      this.handlers.set(type, set);
    }
    const castHandler = handler as EventHandler<EventTypeValue>;
    set.add(castHandler);

    if (options?.filter) {
      this.filters.set(castHandler, options.filter as (event: GameEvent) => boolean);
    }

    return (): void => {
      this.off(type, handler);
    };
  }

  /** Subscribe to an event type, auto-unsubscribe after first matching call. */
  once<T extends EventTypeValue>(
    type: T,
    handler: EventHandler<T>,
    options?: SubscribeOptions<T>,
  ): () => void {
    const wrappedHandler: EventHandler<T> = (event: GameEvent<T>): void => {
      handler(event);
      this.off(type, wrappedHandler);
    };
    return this.on(type, wrappedHandler, options);
  }

  /** Subscribe to all events (wildcard). Returns an unsubscribe function. */
  onAny(handler: WildcardHandler): () => void {
    this.wildcardHandlers.add(handler);
    return (): void => {
      this.wildcardHandlers.delete(handler);
    };
  }

  /** Unsubscribe a handler from an event type. */
  off<T extends EventTypeValue>(type: T, handler: EventHandler<T>): void {
    const set = this.handlers.get(type);
    const castHandler = handler as EventHandler<EventTypeValue>;
    if (set) {
      set.delete(castHandler);
    }
    this.filters.delete(castHandler);
  }

  /** Synchronously emit an event to all registered handlers. */
  emit<T extends EventTypeValue>(
    type: T,
    payload: T extends keyof EventPayloadMap ? EventPayloadMap[T] : never,
    source = 'system',
  ): void {
    const set = this.handlers.get(type);
    const event = createGameEvent(type, payload, source);

    if (!this.replaying && this.historySize > 0) {
      this.history.push(event);
      if (this.history.length > this.historySize) {
        this.history.shift();
      }
    }

    if (set) {
      for (const handler of [...set]) {
        const filterFn = this.filters.get(handler);
        if (filterFn && !filterFn(event)) continue;
        handler(event);
      }
    }

    for (const handler of this.wildcardHandlers) {
      handler(event);
    }
  }

  /** Returns a copy of the event history. */
  getHistory(): readonly GameEvent[] {
    return [...this.history];
  }

  /** Re-emits recorded events to current handlers without recording to history. */
  replay(events: readonly GameEvent[]): void {
    this.replaying = true;
    try {
      for (const event of events) {
        const set = this.handlers.get(event.type);
        if (set) {
          for (const handler of [...set]) {
            const filterFn = this.filters.get(handler);
            if (filterFn && !filterFn(event)) continue;
            handler(event);
          }
        }
        for (const handler of this.wildcardHandlers) {
          handler(event);
        }
      }
    } finally {
      this.replaying = false;
    }
  }

  /** Resets all state: handlers, wildcards, filters, and history. */
  clear(): void {
    this.handlers.clear();
    this.wildcardHandlers.clear();
    this.filters.clear();
    this.history.length = 0;
  }

  /** Returns the number of handlers for a given event type. */
  handlerCount(type: EventTypeValue): number {
    return this.handlers.get(type)?.size ?? 0;
  }

  /** Remove all handlers for a specific event type, or all handlers if no type given. */
  removeAllHandlers(type?: EventTypeValue): void {
    if (type !== undefined) {
      const set = this.handlers.get(type);
      if (set) {
        for (const handler of set) {
          this.filters.delete(handler);
        }
      }
      this.handlers.delete(type);
    } else {
      this.handlers.clear();
      this.wildcardHandlers.clear();
      this.filters.clear();
    }
  }
}
