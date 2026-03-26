import { describe, expect, it } from 'vitest';
import { pickRandomTarget, tankDistance } from '@engine/ai/AIController';
import type { Tank } from '@shared/types/entities';

function makeTank(id: string, x: number, alive: boolean): Tank {
  return {
    id,
    playerId: `p-${id}`,
    position: { x, y: 200 },
    angle: 45,
    power: 50,
    health: alive ? 100 : 0,
    maxHealth: 100,
    fuel: 100,
    state: alive ? 'alive' : 'destroyed',
    color: 'red',
    selectedWeapon: null,
  };
}

describe('AIController utilities', () => {
  it('should pick a random alive target', () => {
    const tanks = [
      makeTank('t1', 100, true),
      makeTank('t2', 200, false),
      makeTank('t3', 300, true),
    ];
    const target = pickRandomTarget(tanks, 0);
    expect(target).not.toBeNull();
    expect(target?.state).toBe('alive');
  });

  it('should return null when no alive targets', () => {
    expect(pickRandomTarget([makeTank('t1', 100, false)], 0)).toBeNull();
  });

  it('should calculate distance between tanks', () => {
    const a = makeTank('a', 0, true);
    const b = makeTank('b', 100, true);
    expect(tankDistance(a, b)).toBe(100);
  });
});
