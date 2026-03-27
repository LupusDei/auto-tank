import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { WeaponPicker, type WeaponPickerItem } from '@ui/hud/WeaponPicker';

const weapons: WeaponPickerItem[] = [
  { name: '🚀 Missile', type: 'missile', ammo: 3, selected: true, tier: 'common' },
  { name: '☢️ Nuke', type: 'nuke', ammo: 1, selected: false, tier: 'legendary' },
  { name: '🎆 MIRV', type: 'mirv', ammo: 0, selected: false, tier: 'rare' },
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

  it('should show ammo counts and empty state', () => {
    render(<WeaponPicker weapons={weapons} />);
    // ammo=3 shows "3", ammo=1 shows "1", ammo=0 shows "—"
    expect(screen.getByText('3')).toBeDefined();
    expect(screen.getByText('1')).toBeDefined();
    expect(screen.getByText('\u2014')).toBeDefined();
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

  it('should show emoji icons', () => {
    render(<WeaponPicker weapons={weapons} />);
    expect(screen.getByText('🚀')).toBeDefined();
    expect(screen.getByText('☢️')).toBeDefined();
    expect(screen.getByText('🎆')).toBeDefined();
  });

  it('should show tier-colored borders via style', () => {
    render(<WeaponPicker weapons={weapons} />);
    const missile = screen.getByTestId('weapon-missile');
    // Selected weapon gets full tier color border
    expect(missile.style.borderColor).toBeTruthy();
  });
});
