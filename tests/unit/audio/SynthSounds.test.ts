import { describe, expect, it, vi } from 'vitest';
import {
  playDamageSound,
  playExplosionSound,
  playFireSound,
  playUIClick,
} from '@audio/SynthSounds';
import { SoundManager } from '@audio/SoundManager';

describe('SynthSounds', () => {
  it('should play explosion sound', () => {
    const sm = new SoundManager();
    sm.playTone = vi.fn();
    playExplosionSound(sm, 30);
    expect(sm.playTone).toHaveBeenCalled();
  });

  it('should play fire sound', () => {
    const sm = new SoundManager();
    sm.playTone = vi.fn();
    playFireSound(sm);
    expect(sm.playTone).toHaveBeenCalledWith(200, 0.1);
  });

  it('should play UI click', () => {
    const sm = new SoundManager();
    sm.playTone = vi.fn();
    playUIClick(sm);
    expect(sm.playTone).toHaveBeenCalledWith(800, 0.03);
  });

  it('should play damage sound with varying freq', () => {
    const sm = new SoundManager();
    sm.playTone = vi.fn();
    playDamageSound(sm, 80);
    expect(sm.playTone).toHaveBeenCalledWith(100, 0.08);
    playDamageSound(sm, 20);
    expect(sm.playTone).toHaveBeenCalledWith(200, 0.08);
  });
});
