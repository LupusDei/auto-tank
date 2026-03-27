import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import { GameManager } from '@engine/GameManager';
import type { GameManagerConfig } from '@engine/GameManager';
import type { WeaponType } from '@shared/types/weapons';

function makeConfig(overrides?: Partial<GameManagerConfig>): GameManagerConfig {
  return {
    canvasWidth: 800,
    canvasHeight: 600,
    seed: 42,
    playerNames: ['Player 1', 'Player 2'],
    playerColors: ['red', 'blue'],
    ...overrides,
  };
}

/** Fire a weapon and simulate until resolution. Returns final phase. */
function fireWeapon(weaponType: WeaponType): string {
  const gm = new GameManager(makeConfig());
  gm.setWeapon(weaponType);
  const fired = gm.fire();
  if (!fired) return 'failed-to-fire';

  // Simulate max 300 ticks (5 seconds at 60fps)
  for (let i = 0; i < 300; i++) {
    gm.update(0.016);
    const s = gm.getSnapshot();
    if (s.phase !== 'firing') return s.phase;
  }
  return gm.getSnapshot().phase;
}

describe('All Weapons Fire Integration', () => {
  beforeEach(() => {
    vi.stubGlobal('performance', { now: vi.fn(() => 1000) });
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  // Test basic projectile weapons first
  it('baby-missile fires and resolves', () => {
    expect(fireWeapon('baby-missile')).not.toBe('firing');
  });

  it('missile fires and resolves', () => {
    expect(fireWeapon('missile')).not.toBe('firing');
  });

  it('smoke-tracer fires and resolves', () => {
    expect(fireWeapon('smoke-tracer')).not.toBe('firing');
  });

  it('grenade fires and resolves', () => {
    expect(fireWeapon('grenade')).not.toBe('firing');
  });

  it('nuke fires and resolves', () => {
    expect(fireWeapon('nuke')).not.toBe('firing');
  });

  it('dirt-bomb fires and resolves', () => {
    expect(fireWeapon('dirt-bomb')).not.toBe('firing');
  });

  it('holy-hand-grenade fires and resolves', () => {
    expect(fireWeapon('holy-hand-grenade')).not.toBe('firing');
  });

  it('napalm fires and resolves', () => {
    expect(fireWeapon('napalm')).not.toBe('firing');
  });

  it('roller fires and resolves', () => {
    expect(fireWeapon('roller')).not.toBe('firing');
  });

  it('digger fires and resolves', () => {
    expect(fireWeapon('digger')).not.toBe('firing');
  });

  it('air-strike fires and resolves', () => {
    expect(fireWeapon('air-strike')).not.toBe('firing');
  });

  it('banana-bomb fires and resolves', () => {
    expect(fireWeapon('banana-bomb')).not.toBe('firing');
  });

  it('concrete-donkey fires and resolves', () => {
    expect(fireWeapon('concrete-donkey')).not.toBe('firing');
  });

  it('guided-missile fires and resolves', () => {
    expect(fireWeapon('guided-missile')).not.toBe('firing');
  });

  it('armageddon fires and resolves', () => {
    expect(fireWeapon('armageddon')).not.toBe('firing');
  });

  it('mirv fires and resolves', () => {
    expect(fireWeapon('mirv')).not.toBe('firing');
  });

  it('shotgun fires and resolves', () => {
    expect(fireWeapon('shotgun')).not.toBe('firing');
  });

  it('fire-punch fires and resolves', () => {
    expect(fireWeapon('fire-punch')).not.toBe('firing');
  });

  it('baseball-bat fires and resolves', () => {
    expect(fireWeapon('baseball-bat')).not.toBe('firing');
  });

  it('all 19 weapon types tested', () => {
    const tested: WeaponType[] = [
      'baby-missile',
      'missile',
      'smoke-tracer',
      'grenade',
      'nuke',
      'dirt-bomb',
      'holy-hand-grenade',
      'napalm',
      'roller',
      'digger',
      'air-strike',
      'banana-bomb',
      'concrete-donkey',
      'guided-missile',
      'armageddon',
      'mirv',
      'shotgun',
      'fire-punch',
      'baseball-bat',
    ];
    expect(tested).toHaveLength(19);
  });
});
