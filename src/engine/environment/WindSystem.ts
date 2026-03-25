import { createPRNG } from '@shared/prng';

import { createWindState, type WindConfig, type WindState } from './types';

/** Generate initial wind from config and seed. Deterministic. */
export function generateInitialWind(config: WindConfig, seed: number): WindState {
  const rng = createPRNG(seed);
  const range = config.maxStrength - config.minStrength;
  const strength = config.minStrength + rng() * range;
  const direction = rng() < 0.5 ? -1 : 1;
  const speed = strength * direction;

  return createWindState(speed, { x: direction, y: 0 });
}

/** Calculate new wind for the next turn. Deterministic via seed. */
export function calculateTurnWind(
  previous: WindState,
  config: WindConfig,
  seed: number,
): WindState {
  if (!config.changePerTurn) {
    return previous;
  }

  const rng = createPRNG(seed);
  const maxDelta = config.maxStrength * config.variability;
  const delta = (rng() * 2 - 1) * maxDelta;
  let newSpeed = previous.speed + delta;

  // Clamp strength to bounds
  const absSpeed = Math.abs(newSpeed);
  if (absSpeed > config.maxStrength) {
    newSpeed = config.maxStrength * Math.sign(newSpeed);
  }
  if (absSpeed < config.minStrength) {
    newSpeed = config.minStrength * (Math.sign(newSpeed) || 1);
  }

  const direction = newSpeed >= 0 ? 1 : -1;
  return createWindState(newSpeed, { x: direction, y: 0 });
}
