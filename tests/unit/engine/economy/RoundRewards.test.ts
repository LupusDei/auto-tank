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
    // base(1000) + kills(2000) + damage(50) + survival(500) + interest(1000) = 4550
    expect(reward).toBe(4550);
  });

  it('should calculate reward with no kills and no survival', () => {
    const reward = calculateTotalRoundReward({ kills: 0, damageDealt: 0, survived: false }, 0);
    // base(1000) + interest(0) = 1000
    expect(reward).toBe(1000);
  });

  it('should apply rewards to a player', () => {
    const player = createPlayer('p1', 5000);
    const updated = applyRoundRewards(player, { kills: 0, damageDealt: 0, survived: true });

    // base(1000) + survival(500) + interest(500) = 2000
    expect(updated.money).toBe(5000 + 2000);
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
