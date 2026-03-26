export type ShieldType = 'light' | 'heavy';

export interface Shield {
  readonly type: ShieldType;
  readonly absorption: number;
  readonly remaining: number;
}

const SHIELD_CONFIGS: Record<ShieldType, { absorption: number; capacity: number }> = {
  light: { absorption: 0.5, capacity: 50 },
  heavy: { absorption: 0.8, capacity: 100 },
};

/** Create a new shield of the given type. */
export function createShield(type: ShieldType): Shield {
  const config = SHIELD_CONFIGS[type];
  return { type, absorption: config.absorption, remaining: config.capacity };
}

/** Apply damage through a shield. Returns remaining damage and updated shield. */
export function applyDamageToShield(
  shield: Shield,
  damage: number,
): { shield: Shield | null; remainingDamage: number } {
  const absorbed = Math.min(shield.remaining, damage * shield.absorption);
  const newRemaining = shield.remaining - absorbed;
  const remainingDamage = damage - absorbed;

  if (newRemaining <= 0) {
    return { shield: null, remainingDamage: Math.max(0, remainingDamage) };
  }
  return {
    shield: { ...shield, remaining: newRemaining },
    remainingDamage: Math.max(0, remainingDamage),
  };
}

/** Check if a shield is still active. */
export function isShieldActive(shield: Shield | null): boolean {
  return shield !== null && shield.remaining > 0;
}

/** Get shield capacity percentage. */
export function getShieldPercentage(shield: Shield): number {
  const config = SHIELD_CONFIGS[shield.type];
  return (shield.remaining / config.capacity) * 100;
}
