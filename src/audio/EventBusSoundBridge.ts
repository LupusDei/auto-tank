import type { EventBus } from '@engine/events/EventBus';
import { getSoundForEvent } from './SoundRegistry';
import type { SoundManager } from './SoundManager';

/**
 * Bridges EventBus to SoundManager: auto-triggers sounds from game events.
 * Returns a dispose function to unsubscribe.
 */
export function connectSoundToEvents(bus: EventBus, soundManager: SoundManager): () => void {
  const unsub = bus.onAny((event) => {
    const config = getSoundForEvent(event.type);
    if (config) {
      soundManager.playTone(config.frequency, config.duration);
    }
  });

  return unsub;
}
