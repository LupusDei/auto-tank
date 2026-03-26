import type { WeaponType } from '@shared/types/weapons';

export type ExplosionStyle = 'standard' | 'fire' | 'dirt' | 'holy' | 'nuclear' | 'cluster';

export interface ExplosionVisualConfig {
  readonly style: ExplosionStyle;
  readonly baseColor: string;
  readonly secondaryColor: string;
  readonly particleCount: number;
  readonly shakeIntensity: number;
  readonly slowMoDuration: number;
  readonly flashOpacity: number;
}

const EXPLOSION_CONFIGS: Partial<Record<WeaponType, ExplosionVisualConfig>> = {
  'baby-missile': {
    style: 'standard',
    baseColor: '#ff8800',
    secondaryColor: '#ffcc00',
    particleCount: 10,
    shakeIntensity: 3,
    slowMoDuration: 0,
    flashOpacity: 0,
  },
  missile: {
    style: 'standard',
    baseColor: '#ff6600',
    secondaryColor: '#ffaa00',
    particleCount: 20,
    shakeIntensity: 5,
    slowMoDuration: 0,
    flashOpacity: 0.1,
  },
  nuke: {
    style: 'nuclear',
    baseColor: '#ffffff',
    secondaryColor: '#ff4400',
    particleCount: 80,
    shakeIntensity: 20,
    slowMoDuration: 1000,
    flashOpacity: 0.8,
  },
  mirv: {
    style: 'cluster',
    baseColor: '#4488ff',
    secondaryColor: '#88ccff',
    particleCount: 15,
    shakeIntensity: 4,
    slowMoDuration: 0,
    flashOpacity: 0,
  },
  napalm: {
    style: 'fire',
    baseColor: '#ff4400',
    secondaryColor: '#ff8800',
    particleCount: 40,
    shakeIntensity: 6,
    slowMoDuration: 0,
    flashOpacity: 0.2,
  },
  'holy-hand-grenade': {
    style: 'holy',
    baseColor: '#ffdd00',
    secondaryColor: '#ffffff',
    particleCount: 50,
    shakeIntensity: 15,
    slowMoDuration: 500,
    flashOpacity: 0.6,
  },
  'banana-bomb': {
    style: 'cluster',
    baseColor: '#ffee00',
    secondaryColor: '#ffcc00',
    particleCount: 12,
    shakeIntensity: 4,
    slowMoDuration: 0,
    flashOpacity: 0,
  },
  'concrete-donkey': {
    style: 'dirt',
    baseColor: '#8B4513',
    secondaryColor: '#A0522D',
    particleCount: 60,
    shakeIntensity: 25,
    slowMoDuration: 800,
    flashOpacity: 0.3,
  },
  'dirt-bomb': {
    style: 'dirt',
    baseColor: '#8B4513',
    secondaryColor: '#654321',
    particleCount: 30,
    shakeIntensity: 3,
    slowMoDuration: 0,
    flashOpacity: 0,
  },
};

/** Get explosion visual config for a weapon. */
export function getExplosionConfig(weaponType: WeaponType): ExplosionVisualConfig {
  return (
    EXPLOSION_CONFIGS[weaponType] ?? {
      style: 'standard',
      baseColor: '#ff8800',
      secondaryColor: '#ffcc00',
      particleCount: 15,
      shakeIntensity: 5,
      slowMoDuration: 0,
      flashOpacity: 0,
    }
  );
}

/** Render screen flash effect. */
export function renderScreenFlash(
  ctx: CanvasRenderingContext2D,
  width: number,
  height: number,
  opacity: number,
): void {
  if (opacity <= 0) return;
  ctx.save();
  ctx.globalAlpha = opacity;
  ctx.fillStyle = '#ffffff';
  ctx.fillRect(0, 0, width, height);
  ctx.restore();
}
