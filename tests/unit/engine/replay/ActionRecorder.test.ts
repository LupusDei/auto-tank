import { describe, expect, it } from 'vitest';
import { ActionRecorder } from '@engine/replay/ActionRecorder';
import type { TurnAction } from '@shared/types/game';

const action: TurnAction = {
  playerId: 'p1',
  tankId: 't1',
  weaponType: 'missile',
  angle: 45,
  power: 80,
};

describe('ActionRecorder', () => {
  it('should start not recording', () => {
    expect(new ActionRecorder().isRecording).toBe(false);
  });

  it('should record actions when recording', () => {
    const rec = new ActionRecorder();
    rec.startRecording();
    rec.record(action, 1, 1);
    expect(rec.actionCount).toBe(1);
  });

  it('should not record when not recording', () => {
    const rec = new ActionRecorder();
    rec.record(action, 1, 1);
    expect(rec.actionCount).toBe(0);
  });

  it('should filter by round', () => {
    const rec = new ActionRecorder();
    rec.startRecording();
    rec.record(action, 1, 1);
    rec.record(action, 2, 1);
    rec.record(action, 3, 2);
    expect(rec.getActionsForRound(1)).toHaveLength(2);
    expect(rec.getActionsForRound(2)).toHaveLength(1);
  });

  it('should clear all actions', () => {
    const rec = new ActionRecorder();
    rec.startRecording();
    rec.record(action, 1, 1);
    rec.clear();
    expect(rec.actionCount).toBe(0);
  });
});
