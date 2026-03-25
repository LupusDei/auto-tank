import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { InputStateDisplay } from '@ui/hud/InputStateDisplay';

const defaultProps = {
  angle: 45,
  power: 80,
  weaponName: 'Missile',
  ammoCount: 3,
  fuel: 75,
  maxFuel: 100,
};

describe('InputStateDisplay', () => {
  it('should render without crashing', () => {
    render(<InputStateDisplay {...defaultProps} />);
    expect(screen.getByTestId('input-state-display')).toBeDefined();
  });

  it('should display angle value', () => {
    render(<InputStateDisplay {...defaultProps} />);
    expect(screen.getByTestId('angle-value').textContent).toBe('45°');
  });

  it('should display power value', () => {
    render(<InputStateDisplay {...defaultProps} />);
    expect(screen.getByTestId('power-value').textContent).toBe('80%');
  });

  it('should display weapon name', () => {
    render(<InputStateDisplay {...defaultProps} />);
    expect(screen.getByTestId('weapon-value').textContent).toBe('Missile');
  });

  it('should display ammo count', () => {
    render(<InputStateDisplay {...defaultProps} />);
    expect(screen.getByTestId('ammo-value').textContent).toBe('3');
  });

  it('should display infinity symbol for unlimited ammo', () => {
    render(<InputStateDisplay {...defaultProps} ammoCount={-1} />);
    expect(screen.getByTestId('ammo-value').textContent).toBe('∞');
  });

  it('should render fuel bar', () => {
    render(<InputStateDisplay {...defaultProps} />);
    expect(screen.getByTestId('fuel-bar')).toBeDefined();
  });

  it('should update when angle changes', () => {
    const { rerender } = render(<InputStateDisplay {...defaultProps} />);
    expect(screen.getByTestId('angle-value').textContent).toBe('45°');

    rerender(<InputStateDisplay {...defaultProps} angle={90} />);
    expect(screen.getByTestId('angle-value').textContent).toBe('90°');
  });

  it('should update when weapon changes', () => {
    const { rerender } = render(<InputStateDisplay {...defaultProps} />);
    rerender(<InputStateDisplay {...defaultProps} weaponName="Nuke" ammoCount={1} />);
    expect(screen.getByTestId('weapon-value').textContent).toBe('Nuke');
    expect(screen.getByTestId('ammo-value').textContent).toBe('1');
  });
});
