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
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 4,
  padding: '8px 12px',
  background: 'rgba(0, 0, 0, 0.6)',
  borderRadius: 8,
  fontFamily: "'Courier New', monospace",
};

function itemStyle(selected: boolean, hasAmmo: boolean): React.CSSProperties {
  return {
    padding: '4px 8px',
    borderRadius: 4,
    background: selected ? 'rgba(255, 255, 255, 0.2)' : 'transparent',
    color: hasAmmo ? '#fff' : '#666',
    fontSize: 11,
    cursor: hasAmmo ? 'pointer' : 'default',
    border: selected ? '1px solid rgba(255, 255, 255, 0.4)' : '1px solid transparent',
  };
}

export function WeaponPicker({ weapons, onSelect }: WeaponPickerProps): React.ReactElement {
  return (
    <div style={containerStyle} data-testid="weapon-picker">
      {weapons.map((w) => (
        <div
          key={w.type}
          style={itemStyle(w.selected, w.ammo > 0)}
          data-testid={`weapon-${w.type}`}
          data-selected={w.selected}
          onClick={(): void => {
            if (w.ammo > 0) onSelect?.(w.type);
          }}
        >
          <div>{w.name}</div>
          <div style={{ fontSize: 9, opacity: 0.7 }}>{w.ammo > 0 ? `×${w.ammo}` : 'empty'}</div>
        </div>
      ))}
    </div>
  );
}
