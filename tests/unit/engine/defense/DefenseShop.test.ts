import {
  buyDefenseItem,
  getAffordableDefenses,
  getAllDefenseItems,
} from '@engine/defense/DefenseShop';
import { describe, expect, it } from 'vitest';
import type { Player } from '@shared/types/entities';

function createPlayer(money: number): Player {
  return {
    id: 'p1',
    name: 'Alice',
    color: 'red',
    tanks: [],
    money,
    inventory: [],
    kills: 0,
    deaths: 0,
    isAI: false,
  };
}

describe('DefenseShop', () => {
  it('should list all defense items', () => {
    const items = getAllDefenseItems();
    expect(items.length).toBeGreaterThanOrEqual(3);
  });

  it('should filter affordable items', () => {
    const cheap = getAffordableDefenses(2000);
    for (const item of cheap) {
      expect(item.price).toBeLessThanOrEqual(2000);
    }
  });

  it('should buy defense item', () => {
    const player = createPlayer(5000);
    const items = getAllDefenseItems();
    const lightShield = items.find((i) => i.subtype === 'light');
    expect(lightShield).toBeDefined();
    if (!lightShield) return;

    const result = buyDefenseItem(player, lightShield);
    expect(result).not.toBeNull();
    expect(result?.money).toBe(2000);
  });

  it('should reject purchase when broke', () => {
    const player = createPlayer(100);
    const items = getAllDefenseItems();
    const heavyShield = items.find((i) => i.subtype === 'heavy');
    if (!heavyShield) return;
    expect(buyDefenseItem(player, heavyShield)).toBeNull();
  });
});
