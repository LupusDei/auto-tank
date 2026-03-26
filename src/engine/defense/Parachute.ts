/** Parachute state: available, deployed, or used. */
export type ParachuteState = 'available' | 'deployed' | 'used';

export interface Parachute {
  readonly state: ParachuteState;
  readonly autoDeployHeight: number;
}

/** Create a new parachute. */
export function createParachute(autoDeployHeight = 20): Parachute {
  return { state: 'available', autoDeployHeight };
}

/** Deploy parachute (consumes it). */
export function deployParachute(chute: Parachute): Parachute {
  if (chute.state !== 'available') return chute;
  return { ...chute, state: 'deployed' };
}

/** Finish parachute use after landing. */
export function landWithParachute(chute: Parachute): Parachute {
  if (chute.state !== 'deployed') return chute;
  return { ...chute, state: 'used' };
}

/** Check if parachute should auto-deploy based on fall distance. */
export function shouldAutoDeploy(chute: Parachute, fallDistance: number): boolean {
  return chute.state === 'available' && fallDistance >= chute.autoDeployHeight;
}

/** Calculate reduced fall damage with parachute (eliminates all fall damage). */
export function calculateParachuteFallDamage(isDeployed: boolean, normalDamage: number): number {
  return isDeployed ? 0 : normalDamage;
}
