import {
  createSpeechBubble,
  getBubbleOpacity,
  isBubbleVisible,
} from '@engine/commentary/SpeechBubble';
import { describe, expect, it } from 'vitest';

describe('SpeechBubble', () => {
  it('should create a bubble at position', () => {
    const bubble = createSpeechBubble('Hello!', { x: 100, y: 200 });
    expect(bubble.text).toBe('Hello!');
    expect(bubble.position.y).toBeLessThan(200);
  });

  it('should be visible immediately', () => {
    expect(isBubbleVisible(createSpeechBubble('Hi', { x: 0, y: 0 }))).toBe(true);
  });

  it('should have full opacity initially', () => {
    expect(getBubbleOpacity(createSpeechBubble('Hi', { x: 0, y: 0 }))).toBeCloseTo(1, 0);
  });
});
