import { getWeaponDisplay } from '@shared/constants/weaponDisplay';
import React from 'react';

export interface WeaponPickerItem {
  readonly name: string;
  readonly type: string;
  readonly ammo: number;
  readonly selected: boolean;
  readonly tier?: string;
}

export interface WeaponPickerProps {
  readonly weapons: readonly WeaponPickerItem[];
  readonly onSelect?: (type: string) => void;
  readonly disabled?: boolean;
}

const TIER_COLORS: Record<string, string> = {
  free: '#888888',
  common: '#ffffff',
  rare: '#4488ff',
  epic: '#aa44ff',
  legendary: '#ffaa00',
};

export function WeaponPicker({ weapons, onSelect, disabled }: WeaponPickerProps): React.ReactElement {
  return (
    <div className="weapon-picker" data-testid="weapon-picker">
      {weapons.map((w) => {
        const hasAmmo = w.ammo > 0;
        const display = getWeaponDisplay(w.type);
        const tierColor = TIER_COLORS[w.tier ?? 'free'] ?? '#888';
        const classes = [
          'weapon-picker-item',
          w.selected ? 'weapon-picker-active' : '',
          !hasAmmo ? 'weapon-picker-empty' : '',
        ].filter(Boolean).join(' ');

        return (
          <button
            key={w.type}
            className={classes}
            style={{ borderColor: w.selected ? tierColor : `${tierColor}44` }}
            data-testid={`weapon-${w.type}`}
            data-selected={w.selected}
            disabled={(disabled ?? false) || !hasAmmo}
            onClick={(): void => {
              if (hasAmmo) onSelect?.(w.type);
            }}
          >
            <span className="weapon-picker-emoji">{display.emoji}</span>
            <span className="weapon-picker-name">{display.shortName}</span>
            <span className="weapon-picker-ammo">
              {w.ammo >= 99 ? '\u221E' : hasAmmo ? `${w.ammo}` : '\u2014'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
