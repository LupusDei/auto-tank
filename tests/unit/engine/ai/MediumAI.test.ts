import { describe, expect, it } from 'vitest';
import type { AIContext } from '@engine/ai/AIController';
import { MediumAI } from '@engine/ai/MediumAI';
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

function makeContext(enemies: Tank[] = [makeTank('e1', 300)]): AIContext {
  return {
    ownTank: makeTank('own', 100),
    enemyTanks: enemies,
    terrain: {
      config: { width: 500, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
      heightMap: new Array(500).fill(200) as number[],
      destructionMap: new Array(500).fill(false) as boolean[],
    },
    wind: 0,
    gravity: 9.81,
  };
}

describe('MediumAI', () => {
  it('should fire toward nearest target', () => {
    const ai = new MediumAI(42);
    const decision = ai.decideTurn(makeContext());

    expect(decision.action).toBe('fire');
    expect(decision.angle).toBeDefined();
    expect(decision.power).toBeDefined();
  });

  it('should prefer nearest enemy', () => {
    const ai = new MediumAI(42);
    const enemies = [makeTank('far', 400), makeTank('near', 150)];
    const decision = ai.decideTurn(makeContext(enemies));

    // Power should be lower for closer target
    expect(decision.power).toBeLessThan(80);
  });

  it('should skip when no enemies', () => {
    const ai = new MediumAI(42);
    expect(ai.decideTurn(makeContext([])).action).toBe('skip');
  });

  it('should have medium difficulty', () => {
    expect(new MediumAI(42).difficulty).toBe('medium');
  });
});
