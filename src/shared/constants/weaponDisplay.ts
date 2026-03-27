/** Display names and emoji icons for each weapon type. */
export const WEAPON_DISPLAY: Record<string, { emoji: string; shortName: string }> = {
  'baby-missile': { emoji: '🔹', shortName: 'Baby' },
  'missile': { emoji: '🚀', shortName: 'Missile' },
  'smoke-tracer': { emoji: '💨', shortName: 'Tracer' },
  'grenade': { emoji: '💣', shortName: 'Grenade' },
  'shotgun': { emoji: '🔫', shortName: 'Shotgun' },
  'fire-punch': { emoji: '🔥', shortName: 'Punch' },
  'baseball-bat': { emoji: '🏏', shortName: 'Bat' },
  'roller': { emoji: '🛞', shortName: 'Roller' },
  'digger': { emoji: '⛏️', shortName: 'Digger' },
  'dirt-bomb': { emoji: '🟤', shortName: 'Dirt' },
  'napalm': { emoji: '🔥', shortName: 'Napalm' },
  'air-strike': { emoji: '✈️', shortName: 'Airstrike' },
  'banana-bomb': { emoji: '🍌', shortName: 'Banana' },
  'holy-hand-grenade': { emoji: '✝️', shortName: 'Holy' },
  'nuke': { emoji: '☢️', shortName: 'Nuke' },
  'concrete-donkey': { emoji: '🫏', shortName: 'Donkey' },
  'guided-missile': { emoji: '🎯', shortName: 'Guided' },
  'armageddon': { emoji: '☄️', shortName: 'Armageddon' },
  'mirv': { emoji: '🎆', shortName: 'MIRV' },
  'deaths-head': { emoji: '💀', shortName: 'Deaths Head' },
  'funky-bomb': { emoji: '🪩', shortName: 'Funky' },
};

/** Get display info for a weapon, with fallback. */
export function getWeaponDisplay(type: string): { emoji: string; shortName: string } {
  return WEAPON_DISPLAY[type] ?? { emoji: '❓', shortName: type };
}
