import { describe, expect, it } from 'vitest';
import { getAllSoundMappings, getSoundForEvent, hasSound } from '@/audio/SoundRegistry';
import { EventType } from '@engine/events/types';

describe('SoundRegistry', () => {
  it('should return sound config for explosion', () => {
    const config = getSoundForEvent(EventType.EXPLOSION);
    expect(config).toBeDefined();
    expect(config?.frequency).toBeGreaterThan(0);
    expect(config?.duration).toBeGreaterThan(0);
  });

  it('should return undefined for unmapped events', () => {
    expect(getSoundForEvent('nonexistent' as 'explosion')).toBeUndefined();
  });

  it('should check if event has sound', () => {
    expect(hasSound(EventType.EXPLOSION)).toBe(true);
    expect(hasSound(EventType.PROJECTILE_FIRED)).toBe(true);
  });

  it('should list all mappings', () => {
    const mappings = getAllSoundMappings();
    expect(mappings.length).toBeGreaterThan(0);
    for (const [eventType, config] of mappings) {
      expect(typeof eventType).toBe('string');
      expect(config.frequency).toBeGreaterThan(0);
    }
  });
});
