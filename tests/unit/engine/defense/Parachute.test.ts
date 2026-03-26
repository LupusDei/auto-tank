import {
  calculateParachuteFallDamage,
  createParachute,
  deployParachute,
  landWithParachute,
  shouldAutoDeploy,
} from '@engine/defense/Parachute';
import { describe, expect, it } from 'vitest';

describe('Parachute', () => {
  it('should create available parachute', () => {
    const chute = createParachute();
    expect(chute.state).toBe('available');
  });

  it('should deploy parachute', () => {
    const deployed = deployParachute(createParachute());
    expect(deployed.state).toBe('deployed');
  });

  it('should not deploy already deployed parachute', () => {
    const deployed = deployParachute(createParachute());
    const again = deployParachute(deployed);
    expect(again.state).toBe('deployed');
  });

  it('should land with parachute', () => {
    const landed = landWithParachute(deployParachute(createParachute()));
    expect(landed.state).toBe('used');
  });

  it('should auto-deploy at threshold', () => {
    const chute = createParachute(20);
    expect(shouldAutoDeploy(chute, 25)).toBe(true);
    expect(shouldAutoDeploy(chute, 10)).toBe(false);
  });

  it('should eliminate fall damage when deployed', () => {
    expect(calculateParachuteFallDamage(true, 50)).toBe(0);
    expect(calculateParachuteFallDamage(false, 50)).toBe(50);
  });
});
