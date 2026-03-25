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
    expect(screen.getByText('45°')).toBeDefined();
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
    expect(screen.getByText('→ 5')).toBeDefined();
  });

  it('should show left arrow for negative wind', () => {
    render(<GameHUD {...defaultProps} wind={-3} />);
    expect(screen.getByText('← 3')).toBeDefined();
  });
});
