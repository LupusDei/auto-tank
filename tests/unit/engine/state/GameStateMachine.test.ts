import { describe, expect, it } from 'vitest';
import type { GamePhase } from '@shared/types/game';
import { GameStateMachine } from '@engine/state/GameStateMachine';

describe('GameStateMachine', () => {
  it('starts in lobby phase', () => {
    const sm = new GameStateMachine();
    expect(sm.currentPhase).toBe('lobby');
  });

  describe('valid transitions', () => {
    const validChain: [string, string][] = [
      ['lobby', 'setup'],
      ['setup', 'playing'],
      ['playing', 'turn'],
      ['turn', 'firing'],
      ['firing', 'resolution'],
      ['resolution', 'shop'],
      ['shop', 'next-round'],
      ['next-round', 'playing'],
    ];

    it('follows the main phase chain', () => {
      const sm = new GameStateMachine();
      for (const [_from, to] of validChain) {
        sm.transition(to as GamePhase);
      }
      expect(sm.currentPhase).toBe('playing');
    });

    it('allows resolution → next-round', () => {
      const sm = new GameStateMachine();
      sm.transition('setup');
      sm.transition('playing');
      sm.transition('turn');
      sm.transition('firing');
      sm.transition('resolution');
      sm.transition('next-round');
      expect(sm.currentPhase).toBe('next-round');
    });

    it('allows resolution → victory', () => {
      const sm = new GameStateMachine();
      sm.transition('setup');
      sm.transition('playing');
      sm.transition('turn');
      sm.transition('firing');
      sm.transition('resolution');
      sm.transition('victory');
      expect(sm.currentPhase).toBe('victory');
    });
  });

  describe('invalid transitions', () => {
    it('throws when transitioning from lobby to playing', () => {
      const sm = new GameStateMachine();
      expect(() => sm.transition('playing')).toThrow(
        "Invalid transition from 'lobby' to 'playing'",
      );
    });

    it('throws when transitioning from setup to lobby', () => {
      const sm = new GameStateMachine();
      sm.transition('setup');
      expect(() => sm.transition('lobby')).toThrow("Invalid transition from 'setup' to 'lobby'");
    });

    it('throws when transitioning from victory (terminal state)', () => {
      const sm = new GameStateMachine();
      sm.transition('setup');
      sm.transition('playing');
      sm.transition('turn');
      sm.transition('firing');
      sm.transition('resolution');
      sm.transition('victory');
      expect(() => sm.transition('lobby')).toThrow("Invalid transition from 'victory' to 'lobby'");
    });
  });

  describe('canTransition', () => {
    it('returns true for valid transitions', () => {
      const sm = new GameStateMachine();
      expect(sm.canTransition('setup')).toBe(true);
    });

    it('returns false for invalid transitions', () => {
      const sm = new GameStateMachine();
      expect(sm.canTransition('playing')).toBe(false);
      expect(sm.canTransition('victory')).toBe(false);
    });

    it('returns true for all resolution branches', () => {
      const sm = new GameStateMachine();
      sm.transition('setup');
      sm.transition('playing');
      sm.transition('turn');
      sm.transition('firing');
      sm.transition('resolution');
      expect(sm.canTransition('shop')).toBe(true);
      expect(sm.canTransition('next-round')).toBe(true);
      expect(sm.canTransition('victory')).toBe(true);
    });

    it('returns false for non-allowed transitions from resolution', () => {
      const sm = new GameStateMachine();
      sm.transition('setup');
      sm.transition('playing');
      sm.transition('turn');
      sm.transition('firing');
      sm.transition('resolution');
      expect(sm.canTransition('lobby')).toBe(false);
      expect(sm.canTransition('playing')).toBe(false);
    });
  });
});
