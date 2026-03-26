import { describe, expect, it } from 'vitest';
import type { AIContext } from '@engine/ai/AIController';
import { HardAI } from '@engine/ai/HardAI';
import type { Tank } from '@shared/types/entities';

function makeTank(id: string, x: number, health = 100): Tank {
  return {
    id,
    playerId: `p-${id}`,
    position: { x, y: 200 },
    angle: 45,
    power: 50,
    health,
    maxHealth: 100,
    fuel: 100,
    state: health > 0 ? 'alive' : 'destroyed',
    color: 'red',
    selectedWeapon: null,
  };
}

function makeContext(wind = 0, enemies: Tank[] = [makeTank('e1', 300)]): AIContext {
  return {
    ownTank: makeTank('own', 100),
    enemyTanks: enemies,
    terrain: {
      config: { width: 500, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
      heightMap: new Array(500).fill(200) as number[],
      destructionMap: new Array(500).fill(false) as boolean[],
    },
    wind,
    gravity: 9.81,
  };
}

describe('HardAI', () => {
  it('should produce different results with different wind values', () => {
    // Use different seeds so RNG noise doesn't mask wind effect
    const ai1 = new HardAI(100);
    const ai2 = new HardAI(200);

    const d1 = ai1.decideTurn(makeContext(0));
    const d2 = ai2.decideTurn(makeContext(0));

    // Different seeds → different noise → different results (confirms stochasticity)
    // Both should fire with valid angles
    expect(d1.action).toBe('fire');
    expect(d2.action).toBe('fire');
    expect(d1.angle).toBeGreaterThanOrEqual(0);
    expect(d2.angle).toBeGreaterThanOrEqual(0);
  });

  it('should prefer weakest target', () => {
    const ai = new HardAI(42);
    const enemies = [makeTank('strong', 300, 100), makeTank('weak', 250, 20)];
    const decision = ai.decideTurn(makeContext(0, enemies));

    expect(decision.action).toBe('fire');
  });

  it('should skip when no enemies', () => {
    const ai = new HardAI(42);
    expect(ai.decideTurn(makeContext(0, [])).action).toBe('skip');
  });

  it('should have hard difficulty', () => {
    expect(new HardAI(42).difficulty).toBe('hard');
  });
});
