import {
  applyAllRoundRewards,
  applyRoundRewards,
  calculateTotalRoundReward,
} from '@engine/economy/RoundRewards';
import { describe, expect, it } from 'vitest';
import type { Player } from '@shared/types/entities';

function createPlayer(id: string, money: number): Player {
  return {
    id,
    name: `P${id}`,
    color: 'red',
    tanks: [],
    money,
    inventory: [],
    kills: 0,
    deaths: 0,
    isAI: false,
  };
}

describe('RoundRewards', () => {
  it('should calculate total reward including interest', () => {
    const reward = calculateTotalRoundReward({ kills: 1, damageDealt: 50, survived: true }, 10000);
    // base(500) + kills(750) + damage(250) + survival(300) + interest(min(500,500)) = 2300
    expect(reward).toBe(2300);
  });

  it('should calculate reward with no kills and no survival', () => {
    const reward = calculateTotalRoundReward({ kills: 0, damageDealt: 0, survived: false }, 0);
    // base(500) + interest(0) = 500
    expect(reward).toBe(500);
  });

  it('should apply rewards to a player', () => {
    const player = createPlayer('p1', 5000);
    const updated = applyRoundRewards(player, { kills: 0, damageDealt: 0, survived: true });

    // base(500) + survival(300) + interest(min(250,500)) = 1050
    expect(updated.money).toBe(5000 + 1050);
  });

  it('should apply rewards to all players', () => {
    const players = [createPlayer('p1', 1000), createPlayer('p2', 2000)];
    const stats = new Map([
      ['p1', { kills: 1, damageDealt: 100, survived: true }],
      ['p2', { kills: 0, damageDealt: 0, survived: false }],
    ]);

    const updated = applyAllRoundRewards(players, stats);

    expect(updated[0]?.money).toBeGreaterThan(1000);
    expect(updated[1]?.money).toBeGreaterThan(2000);
  });

  it('should not change players without stats', () => {
    const players = [createPlayer('p1', 1000)];
    const stats = new Map<string, { kills: number; damageDealt: number; survived: boolean }>();

    const updated = applyAllRoundRewards(players, stats);
    expect(updated[0]?.money).toBe(1000);
  });
});
