import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { WeaponPicker, type WeaponPickerItem } from '@ui/hud/WeaponPicker';

const weapons: WeaponPickerItem[] = [
  { name: 'Missile', type: 'missile', ammo: 3, selected: true },
  { name: 'Nuke', type: 'nuke', ammo: 1, selected: false },
  { name: 'MIRV', type: 'mirv', ammo: 0, selected: false },
];

describe('WeaponPicker', () => {
  it('should render all weapons', () => {
    render(<WeaponPicker weapons={weapons} />);
    expect(screen.getByTestId('weapon-picker')).toBeDefined();
    expect(screen.getByTestId('weapon-missile')).toBeDefined();
    expect(screen.getByTestId('weapon-nuke')).toBeDefined();
    expect(screen.getByTestId('weapon-mirv')).toBeDefined();
  });

  it('should mark selected weapon', () => {
    render(<WeaponPicker weapons={weapons} />);
    const missile = screen.getByTestId('weapon-missile');
    expect(missile.getAttribute('data-selected')).toBe('true');
  });

  it('should show ammo count', () => {
    render(<WeaponPicker weapons={weapons} />);
    expect(screen.getByText('×3')).toBeDefined();
    expect(screen.getByText('×1')).toBeDefined();
    expect(screen.getByText('empty')).toBeDefined();
  });

  it('should call onSelect when clicking weapon with ammo', () => {
    const onSelect = vi.fn();
    render(<WeaponPicker weapons={weapons} onSelect={onSelect} />);

    fireEvent.click(screen.getByTestId('weapon-nuke'));
    expect(onSelect).toHaveBeenCalledWith('nuke');
  });

  it('should not call onSelect for empty weapons', () => {
    const onSelect = vi.fn();
    render(<WeaponPicker weapons={weapons} onSelect={onSelect} />);

    fireEvent.click(screen.getByTestId('weapon-mirv'));
    expect(onSelect).not.toHaveBeenCalled();
  });
});
