import React from 'react';

export interface WeaponPickerItem {
  readonly name: string;
  readonly type: string;
  readonly ammo: number;
  readonly selected: boolean;
}

export interface WeaponPickerProps {
  readonly weapons: readonly WeaponPickerItem[];
  readonly onSelect?: (type: string) => void;
  readonly disabled?: boolean;
}

export function WeaponPicker({ weapons, onSelect, disabled }: WeaponPickerProps): React.ReactElement {
  return (
    <div className="weapon-picker" data-testid="weapon-picker">
      {weapons.map((w) => {
        const hasAmmo = w.ammo > 0;
        const classes = [
          'weapon-picker-item',
          w.selected ? 'weapon-picker-active' : '',
          !hasAmmo ? 'weapon-picker-empty' : '',
        ].filter(Boolean).join(' ');

        return (
          <button
            key={w.type}
            className={classes}
            data-testid={`weapon-${w.type}`}
            data-selected={w.selected}
            disabled={(disabled ?? false) || !hasAmmo}
            onClick={(): void => {
              if (hasAmmo) onSelect?.(w.type);
            }}
          >
            <span className="weapon-picker-name">{w.name}</span>
            <span className="weapon-picker-ammo">
              {w.ammo >= 99 ? '\u221E' : hasAmmo ? `\u00D7${w.ammo}` : '\u2014'}
            </span>
          </button>
        );
      })}
    </div>
  );
}
