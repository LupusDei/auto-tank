import { describe, expect, it } from 'vitest';
import type { AIContext } from '@engine/ai/AIController';
import { EasyAI } from '@engine/ai/EasyAI';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';

function makeTank(id: string, x: number): Tank {
  return {
    id,
    playerId: `p-${id}`,
    position: { x, y: 200 },
    angle: 45,
    power: 50,
    health: 100,
    maxHealth: 100,
    fuel: 100,
    state: 'alive',
    color: 'red',
    selectedWeapon: null,
  };
}

function makeContext(): AIContext {
  return {
    ownTank: makeTank('own', 100),
    enemyTanks: [makeTank('e1', 300)],
    terrain: {
      config: { width: 500, height: 600, seed: 42, roughness: 0.5, theme: 'classic' },
      heightMap: new Array(500).fill(200) as number[],
      destructionMap: new Array(500).fill(false) as boolean[],
    } as TerrainData,
    wind: 0,
    gravity: 9.81,
  };
}

describe('EasyAI', () => {
  it('should return fire decision with angle and power', () => {
    const ai = new EasyAI(42);
    const decision = ai.decideTurn(makeContext());

    expect(decision.action).toBe('fire');
    expect(decision.angle).toBeGreaterThanOrEqual(0);
    expect(decision.angle).toBeLessThanOrEqual(180);
    expect(decision.power).toBeGreaterThan(0);
  });

  it('should be deterministic with same seed', () => {
    const d1 = new EasyAI(42).decideTurn(makeContext());
    const d2 = new EasyAI(42).decideTurn(makeContext());
    expect(d1.angle).toBe(d2.angle);
    expect(d1.power).toBe(d2.power);
  });

  it('should skip when no enemies alive', () => {
    const ai = new EasyAI(42);
    const ctx: AIContext = { ...makeContext(), enemyTanks: [] };
    expect(ai.decideTurn(ctx).action).toBe('skip');
  });

  it('should have easy difficulty', () => {
    expect(new EasyAI(42).difficulty).toBe('easy');
  });
});
