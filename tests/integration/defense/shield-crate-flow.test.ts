import { applyDamageToShield, createShield } from '@engine/defense/ShieldSystem';
import {
  calculateParachuteFallDamage,
  createParachute,
  deployParachute,
  shouldAutoDeploy,
} from '@engine/defense/Parachute';
import { canPickup, generateCrateDrops } from '@engine/defense/CrateDrops';
import { describe, expect, it } from 'vitest';

describe('Shield + Crate Integration', () => {
  it('should absorb damage with shield, then take remaining to health', () => {
    const shield = createShield('heavy');
    const incomingDamage = 60;

    const result = applyDamageToShield(shield, incomingDamage);
    // Heavy absorbs 80%: absorbed = min(100, 60*0.8) = 48
    // Remaining damage = 60 - 48 = 12
    expect(result.remainingDamage).toBe(12);
    expect(result.shield).not.toBeNull();

    // Simulate health: 100 - 12 = 88
    const health = 100 - result.remainingDamage;
    expect(health).toBe(88);
  });

  it('should deploy parachute on crater fall and prevent damage', () => {
    const chute = createParachute(20);

    // Tank falls 30 units into crater
    expect(shouldAutoDeploy(chute, 30)).toBe(true);
    const deployed = deployParachute(chute);

    const damage = calculateParachuteFallDamage(deployed.state === 'deployed', 25);
    expect(damage).toBe(0);
  });

  it('should generate crates and check pickup', () => {
    const crates = generateCrateDrops(3, 500, 400, 42);

    // Tank at position near first crate
    const tankPos = { x: crates[0]?.position.x ?? 0, y: crates[0]?.position.y ?? 0 };
    expect(canPickup(tankPos, crates[0]?.position ?? { x: 0, y: 0 })).toBe(true);

    // Tank far from second crate
    const farTank = { x: 0, y: 0 };
    expect(canPickup(farTank, crates[1]?.position ?? { x: 200, y: 200 })).toBe(false);
  });
});
