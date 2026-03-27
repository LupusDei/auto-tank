/** Legendary historic generals for tank commander names. */
export const GENERAL_NAMES: readonly string[] = [
  'Patton',
  'Rommel',
  'Zhukov',
  'Montgomery',
  'MacArthur',
  'Hannibal',
  'Caesar',
  'Napoleon',
  'Wellington',
  'Alexander',
  'Sun Tzu',
  'Genghis Khan',
  'Saladin',
  'Scipio',
  'Belisarius',
  'Suvorov',
  'Frederick',
  'Guderian',
  'Manstein',
  'Eisenhower',
  'Khalid',
  'Yi Sun-sin',
  'Shaka',
  'Themistocles',
  'Epaminondas',
  'Turenne',
  'Marlborough',
  'Lee',
  'Grant',
  'Sherman',
  'Yamamoto',
  'Nelson',
  'Nimitz',
  'Bradley',
  'de Gaulle',
  'Giap',
  'Kutuzov',
  'Davout',
  'Tamerlane',
  'Attila',
];

/** Pick N unique random names from the generals list. */
export function pickRandomGenerals(count: number, seed?: number): string[] {
  const shuffled = [...GENERAL_NAMES];
  // Fisher-Yates with optional seed
  let s = seed ?? Math.floor(Math.random() * 100000);
  for (let i = shuffled.length - 1; i > 0; i--) {
    s = (s * 1664525 + 1013904223) & 0x7fffffff;
    const j = s % (i + 1);
    [shuffled[i], shuffled[j]] = [shuffled[j]!, shuffled[i]!];
  }
  return shuffled.slice(0, count);
}
