import type { EventTypeValue } from '@engine/events/types';

export interface SoundConfig {
  readonly frequency: number;
  readonly duration: number;
  readonly volume?: number;
}

/** Maps game event types to placeholder sound configurations. */
const SOUND_MAP: Partial<Record<EventTypeValue, SoundConfig>> = {
  projectile_fired: { frequency: 200, duration: 0.15 },
  explosion: { frequency: 80, duration: 0.5 },
  tank_damaged: { frequency: 300, duration: 0.1 },
  tank_destroyed: { frequency: 60, duration: 0.8 },
  turn_started: { frequency: 500, duration: 0.05 },
  turn_ended: { frequency: 400, duration: 0.05 },
  wind_changed: { frequency: 150, duration: 0.2 },
  weapon_selected: { frequency: 600, duration: 0.03 },
  tank_moved: { frequency: 100, duration: 0.02 },
  round_started: { frequency: 800, duration: 0.3 },
  round_ended: { frequency: 700, duration: 0.4 },
  phase_changed: { frequency: 550, duration: 0.1 },
};

/** Get sound config for an event type. */
export function getSoundForEvent(eventType: EventTypeValue): SoundConfig | undefined {
  return SOUND_MAP[eventType];
}

/** Get all registered event-to-sound mappings. */
export function getAllSoundMappings(): readonly [EventTypeValue, SoundConfig][] {
  return Object.entries(SOUND_MAP) as [EventTypeValue, SoundConfig][];
}

/** Check if an event type has a registered sound. */
export function hasSound(eventType: EventTypeValue): boolean {
  return eventType in SOUND_MAP;
}
