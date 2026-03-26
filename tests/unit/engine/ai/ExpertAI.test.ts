import { describe, expect, it } from 'vitest';
import type { AIContext } from '@engine/ai/AIController';
import { ExpertAI } from '@engine/ai/ExpertAI';
import { generateTerrain } from '@engine/terrain';
import type { Tank } from '@shared/types/entities';
import type { TerrainData } from '@shared/types/terrain';

function makeTank(id: string, x: number, y: number, health = 100): Tank {
  return {
    id,
    playerId: `p-${id}`,
    position: { x, y },
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

function makeContext(terrain?: TerrainData): AIContext {
  const t =
    terrain ??
    generateTerrain({ width: 500, height: 600, seed: 42, roughness: 0.5, theme: 'classic' });
  return {
    ownTank: makeTank('own', 100, 400),
    enemyTanks: [makeTank('e1', 300, 400)],
    terrain: t,
    wind: 5,
    gravity: 9.81,
  };
}

describe('ExpertAI', () => {
  it('should simulate trajectories and fire', () => {
    const ai = new ExpertAI(42);
    const decision = ai.decideTurn(makeContext());

    expect(decision.action).toBe('fire');
    expect(decision.angle).toBeGreaterThan(0);
    expect(decision.power).toBeGreaterThan(0);
  });

  it('should select appropriate weapon', () => {
    const ai = new ExpertAI(42);
    const decision = ai.decideTurn(makeContext());

    expect(['baby-missile', 'missile']).toContain(decision.weaponType);
  });

  it('should be deterministic with same seed', () => {
    const ctx = makeContext();
    const d1 = new ExpertAI(42).decideTurn(ctx);
    const d2 = new ExpertAI(42).decideTurn(ctx);
    expect(d1.angle).toBe(d2.angle);
    expect(d1.power).toBe(d2.power);
  });

  it('should skip when no enemies', () => {
    const ai = new ExpertAI(42);
    const ctx = { ...makeContext(), enemyTanks: [] };
    expect(ai.decideTurn(ctx).action).toBe('skip');
  });

  it('should have expert difficulty', () => {
    expect(new ExpertAI(42).difficulty).toBe('expert');
  });
});
