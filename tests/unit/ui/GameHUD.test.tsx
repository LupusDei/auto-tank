import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { GameHUD } from '@ui/hud/GameHUD';

describe('GameHUD', () => {
  const defaultProps = {
    angle: 45,
    power: 75,
    wind: 5,
    currentPlayer: 'Player 1',
    weapon: 'Missile',
  };

  it('should render without crashing', () => {
    render(<GameHUD {...defaultProps} />);
    expect(screen.getByTestId('game-hud')).toBeDefined();
  });

  it('should display the current player name', () => {
    render(<GameHUD {...defaultProps} />);
    expect(screen.getByText('Player 1')).toBeDefined();
  });

  it('should display the angle with degree symbol', () => {
    render(<GameHUD {...defaultProps} />);
    expect(screen.getByText('45\u00B0')).toBeDefined();
  });

  it('should display power as percentage', () => {
    render(<GameHUD {...defaultProps} />);
    expect(screen.getByText('75%')).toBeDefined();
  });

  it('should display weapon name', () => {
    render(<GameHUD {...defaultProps} />);
    expect(screen.getByText('Missile')).toBeDefined();
  });

  it('should show right arrow for positive wind', () => {
    render(<GameHUD {...defaultProps} wind={5} />);
    expect(screen.getByText('\u2192 5.0')).toBeDefined();
  });

  it('should show left arrow for negative wind', () => {
    render(<GameHUD {...defaultProps} wind={-3} />);
    expect(screen.getByText('\u2190 3.0')).toBeDefined();
  });

  it('should render player banner with custom color', () => {
    render(<GameHUD {...defaultProps} playerColor="#e74c3c" />);
    expect(screen.getByTestId('player-banner')).toBeDefined();
  });

  it('should render round/turn info when provided', () => {
    render(<GameHUD {...defaultProps} roundNumber={2} maxRounds={5} turnNumber={3} />);
    expect(screen.getByTestId('round-info')).toBeDefined();
    expect(screen.getByText('Round 2/5 | Turn 3')).toBeDefined();
  });

  it('should not render round info when roundNumber is not provided', () => {
    render(<GameHUD {...defaultProps} />);
    expect(screen.queryByTestId('round-info')).toBeNull();
  });

  it('should render power fill bar', () => {
    render(<GameHUD {...defaultProps} />);
    const fill = screen.getByTestId('power-fill');
    expect(fill).toBeDefined();
    expect(fill.style.width).toBe('75%');
  });

  it('should show green power bar for low power', () => {
    render(<GameHUD {...defaultProps} power={20} />);
    const fill = screen.getByTestId('power-fill');
    expect(fill.style.background).toMatch(/rgb\(46,\s*204,\s*113\)|#2ecc71/);
  });

  it('should show yellow power bar for medium power', () => {
    render(<GameHUD {...defaultProps} power={50} />);
    const fill = screen.getByTestId('power-fill');
    expect(fill.style.background).toMatch(/rgb\(241,\s*196,\s*15\)|#f1c40f/);
  });

  it('should show red power bar for high power', () => {
    render(<GameHUD {...defaultProps} power={90} />);
    const fill = screen.getByTestId('power-fill');
    expect(fill.style.background).toMatch(/rgb\(231,\s*76,\s*60\)|#e74c3c/);
  });

  it('should use default color when playerColor is not provided', () => {
    render(<GameHUD {...defaultProps} />);
    const banner = screen.getByTestId('player-banner');
    expect(banner.style.background).toContain('#3498db');
  });
});
