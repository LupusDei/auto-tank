import { EventType, type EventTypeValue } from '@engine/events/types';
import type { EventBus } from '@engine/events/EventBus';

export type Personality = 'aggressive' | 'cowardly' | 'sarcastic' | 'robot' | 'cheerful';

export interface CommentaryLine {
  readonly text: string;
  readonly personality: Personality;
  readonly event: EventTypeValue;
}

const RESPONSE_POOLS: Record<Personality, Partial<Record<EventTypeValue, readonly string[]>>> = {
  aggressive: {
    [EventType.TANK_DAMAGED]: ['TAKE THAT!', 'Feel the pain!', 'Boom baby!', 'Direct hit!'],
    [EventType.TANK_DESTROYED]: [
      'DESTROYED! Get rekt!',
      'Another one bites the dust!',
      'Obliterated!',
    ],
    [EventType.PROJECTILE_FIRED]: ['Fire in the hole!', 'Incoming!', 'Eat this!'],
    [EventType.EXPLOSION]: ['KABOOM!', 'Beautiful destruction!', "Now THAT's an explosion!"],
  },
  cowardly: {
    [EventType.TANK_DAMAGED]: ['Ow ow ow!', 'Not the face!', 'I surrender!', 'Medic!'],
    [EventType.TANK_DESTROYED]: [
      'I knew this would happen...',
      'Tell my family...',
      'Goodbye cruel world!',
    ],
    [EventType.PROJECTILE_FIRED]: ['Please miss please miss...', "I can't watch!", 'Hide!'],
    [EventType.EXPLOSION]: ['AAAHH!', 'Too close!', 'I need new pants...'],
  },
  sarcastic: {
    [EventType.TANK_DAMAGED]: [
      'Oh, how delightful.',
      'Thanks, I needed that.',
      'Ouch. Real original.',
    ],
    [EventType.TANK_DESTROYED]: [
      'Well, that was inevitable.',
      'Shocking absolutely no one.',
      'GG I guess.',
    ],
    [EventType.PROJECTILE_FIRED]: ['Oh look, a projectile. How novel.', 'Wow, they pressed space.'],
    [EventType.EXPLOSION]: ['What a lovely crater.', 'Modern art, really.'],
  },
  robot: {
    [EventType.TANK_DAMAGED]: [
      'DAMAGE DETECTED. HULL INTEGRITY REDUCED.',
      'WARNING: STRUCTURAL COMPROMISE.',
    ],
    [EventType.TANK_DESTROYED]: [
      'UNIT TERMINATED. MISSION FAILED.',
      'FATAL ERROR: EXISTENCE CEASED.',
    ],
    [EventType.PROJECTILE_FIRED]: [
      'PROJECTILE LAUNCHED. TRAJECTORY CALCULATED.',
      'FIRING SEQUENCE COMPLETE.',
    ],
    [EventType.EXPLOSION]: ['DETONATION CONFIRMED.', 'BLAST RADIUS: NOMINAL.'],
  },
  cheerful: {
    [EventType.TANK_DAMAGED]: ['Nice shot!', 'Oopsie daisy!', 'That tickled!', 'Good one!'],
    [EventType.TANK_DESTROYED]: ['What a game!', 'Well played everyone!', 'That was fun!'],
    [EventType.PROJECTILE_FIRED]: ['Here we go!', 'Wheee!', 'Fingers crossed!'],
    [EventType.EXPLOSION]: ['Fireworks!', 'Pretty!', 'Wow, look at that!'],
  },
};

export class CommentarySystem {
  private lastCommentTime = -Infinity;
  private readonly cooldownMs: number;
  private readonly personality: Personality;
  private unsubscribe: (() => void) | null = null;
  private readonly listeners: ((line: CommentaryLine) => void)[] = [];

  constructor(personality: Personality, cooldownMs = 2000) {
    this.personality = personality;
    this.cooldownMs = cooldownMs;
  }

  /** Subscribe to commentary events. */
  onComment(listener: (line: CommentaryLine) => void): () => void {
    this.listeners.push(listener);
    return (): void => {
      const idx = this.listeners.indexOf(listener);
      if (idx >= 0) this.listeners.splice(idx, 1);
    };
  }

  /** Connect to EventBus. */
  connect(bus: EventBus): void {
    this.unsubscribe = bus.onAny((event) => {
      const now = performance.now();
      if (now - this.lastCommentTime < this.cooldownMs) return;

      const pool = RESPONSE_POOLS[this.personality][event.type];
      if (!pool || pool.length === 0) return;

      const text = pool[Math.floor(Math.random() * pool.length)];
      if (!text) return;

      this.lastCommentTime = now;
      const line: CommentaryLine = { text, personality: this.personality, event: event.type };
      for (const listener of this.listeners) listener(line);
    });
  }

  /** Disconnect from EventBus. */
  disconnect(): void {
    this.unsubscribe?.();
    this.unsubscribe = null;
  }

  /** Get a random comment for a specific event type (for testing). */
  getRandomComment(event: EventTypeValue): string | null {
    const pool = RESPONSE_POOLS[this.personality][event];
    if (!pool || pool.length === 0) return null;
    return pool[Math.floor(Math.random() * pool.length)] ?? null;
  }
}
