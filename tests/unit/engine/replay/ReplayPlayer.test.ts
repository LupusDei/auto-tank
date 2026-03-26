import { describe, expect, it } from 'vitest';
import type { RecordedAction } from '@engine/replay/ActionRecorder';
import { ReplayPlayer } from '@engine/replay/ReplayPlayer';

const actions: RecordedAction[] = [
  {
    action: { playerId: 'p1', tankId: 't1', weaponType: 'missile', angle: 45, power: 80 },
    timestamp: 100,
    turnNumber: 1,
    roundNumber: 1,
  },
  {
    action: { playerId: 'p2', tankId: 't2', weaponType: 'missile', angle: 60, power: 70 },
    timestamp: 200,
    turnNumber: 2,
    roundNumber: 1,
  },
  {
    action: { playerId: 'p1', tankId: 't1', weaponType: 'nuke', angle: 30, power: 100 },
    timestamp: 300,
    turnNumber: 3,
    roundNumber: 1,
  },
];

describe('ReplayPlayer', () => {
  it('should start idle', () => {
    expect(new ReplayPlayer(actions).state).toBe('idle');
  });

  it('should play through actions in order', () => {
    const player = new ReplayPlayer(actions);
    player.play();
    expect(player.nextAction()?.action.angle).toBe(45);
    expect(player.nextAction()?.action.angle).toBe(60);
    expect(player.nextAction()?.action.angle).toBe(30);
    expect(player.nextAction()).toBeNull();
    expect(player.state).toBe('finished');
  });

  it('should pause and resume', () => {
    const player = new ReplayPlayer(actions);
    player.play();
    player.nextAction();
    player.pause();
    expect(player.nextAction()).toBeNull();
    player.play();
    expect(player.nextAction()?.action.angle).toBe(60);
  });

  it('should set speed clamped', () => {
    const player = new ReplayPlayer(actions);
    player.setSpeed(0.1);
    expect(player.speed).toBe(0.25);
    player.setSpeed(10);
    expect(player.speed).toBe(4);
  });

  it('should report progress', () => {
    const player = new ReplayPlayer(actions);
    player.play();
    player.nextAction();
    expect(player.progress).toBeCloseTo(1 / 3);
  });

  it('should seek to index', () => {
    const player = new ReplayPlayer(actions);
    player.seekTo(2);
    expect(player.currentIndex).toBe(2);
  });

  it('should reset to start', () => {
    const player = new ReplayPlayer(actions);
    player.play();
    player.nextAction();
    player.reset();
    expect(player.currentIndex).toBe(0);
    expect(player.state).toBe('idle');
  });
});
