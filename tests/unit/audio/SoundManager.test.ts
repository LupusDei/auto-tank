import { describe, expect, it } from 'vitest';
import { SoundManager } from '@/audio/SoundManager';

describe('SoundManager', () => {
  it('should start uninitialized', () => {
    const sm = new SoundManager();
    expect(sm.initialized).toBe(false);
  });

  it('should have default volume of 1', () => {
    const sm = new SoundManager();
    expect(sm.volume).toBe(1);
  });

  it('should clamp volume to [0, 1]', () => {
    const sm = new SoundManager();
    sm.volume = 1.5;
    expect(sm.volume).toBe(1);
    sm.volume = -0.5;
    expect(sm.volume).toBe(0);
  });

  it('should start unmuted', () => {
    const sm = new SoundManager();
    expect(sm.muted).toBe(false);
  });

  it('should toggle mute', () => {
    const sm = new SoundManager();
    sm.muted = true;
    expect(sm.muted).toBe(true);
    sm.muted = false;
    expect(sm.muted).toBe(false);
  });

  it('should return null context before initialization', () => {
    const sm = new SoundManager();
    expect(sm.getContext()).toBeNull();
    expect(sm.getMasterGain()).toBeNull();
  });
});
