import type { Vector2D } from '@shared/types/geometry';
import type { WeaponType } from '@shared/types/weapons';

export interface TrailConfig {
  readonly color: string;
  readonly glowColor: string;
  readonly width: number;
  readonly fadeLength: number;
  readonly style: 'smoke' | 'glow' | 'fire' | 'sparkle' | 'none';
}

const TRAIL_CONFIGS: Partial<Record<WeaponType, TrailConfig>> = {
  'baby-missile': {
    color: '#aaaaaa',
    glowColor: '#ffffff44',
    width: 1,
    fadeLength: 20,
    style: 'smoke',
  },
  missile: { color: '#ff8800', glowColor: '#ff880044', width: 2, fadeLength: 40, style: 'glow' },
  nuke: { color: '#ff0000', glowColor: '#ff000066', width: 3, fadeLength: 60, style: 'fire' },
  mirv: { color: '#44aaff', glowColor: '#44aaff44', width: 2, fadeLength: 30, style: 'sparkle' },
  napalm: { color: '#ff4400', glowColor: '#ff440088', width: 3, fadeLength: 50, style: 'fire' },
  'holy-hand-grenade': {
    color: '#ffdd00',
    glowColor: '#ffdd0066',
    width: 2,
    fadeLength: 35,
    style: 'glow',
  },
  'banana-bomb': {
    color: '#ffee00',
    glowColor: '#ffee0044',
    width: 1.5,
    fadeLength: 25,
    style: 'sparkle',
  },
  'concrete-donkey': {
    color: '#888888',
    glowColor: '#88888844',
    width: 4,
    fadeLength: 10,
    style: 'smoke',
  },
  'dirt-bomb': {
    color: '#8B4513',
    glowColor: '#8B451344',
    width: 2,
    fadeLength: 20,
    style: 'smoke',
  },
};

/** Get trail config for a weapon type. */
export function getTrailConfig(weaponType: WeaponType): TrailConfig {
  return (
    TRAIL_CONFIGS[weaponType] ?? {
      color: '#ffffff',
      glowColor: '#ffffff44',
      width: 1,
      fadeLength: 20,
      style: 'smoke',
    }
  );
}

/** Render a weapon-specific trail. */
export function renderWeaponTrail(
  ctx: CanvasRenderingContext2D,
  trail: readonly Vector2D[],
  config: TrailConfig,
): void {
  if (trail.length < 2) return;

  const maxPoints = Math.min(trail.length, config.fadeLength);
  const startIdx = trail.length - maxPoints;

  // Glow layer
  if (config.style === 'glow' || config.style === 'fire') {
    for (let i = startIdx + 1; i < trail.length; i++) {
      const prev = trail[i - 1];
      const curr = trail[i];
      if (!prev || !curr) continue;
      const progress = (i - startIdx) / maxPoints;
      ctx.beginPath();
      ctx.moveTo(prev.x, prev.y);
      ctx.lineTo(curr.x, curr.y);
      ctx.strokeStyle = config.glowColor;
      ctx.lineWidth = config.width * 3 * progress;
      ctx.stroke();
    }
  }

  // Main trail
  for (let i = startIdx + 1; i < trail.length; i++) {
    const prev = trail[i - 1];
    const curr = trail[i];
    if (!prev || !curr) continue;
    const progress = (i - startIdx) / maxPoints;
    ctx.beginPath();
    ctx.moveTo(prev.x, prev.y);
    ctx.lineTo(curr.x, curr.y);
    ctx.strokeStyle = config.color;
    ctx.lineWidth = config.width * progress;
    ctx.globalAlpha = progress;
    ctx.stroke();
  }
  ctx.globalAlpha = 1;
}
