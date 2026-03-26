import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MainMenu } from '@ui/screens/MainMenu';

describe('MainMenu', () => {
  it('should render title', () => {
    render(<MainMenu onStartGame={vi.fn()} onMultiplayer={vi.fn()} onSettings={vi.fn()} />);
    expect(screen.getByText('AUTO TANK')).toBeDefined();
  });

  it('should call onStartGame', () => {
    const fn = vi.fn();
    render(<MainMenu onStartGame={fn} onMultiplayer={vi.fn()} onSettings={vi.fn()} />);
    fireEvent.click(screen.getByTestId('btn-start'));
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should call onMultiplayer', () => {
    const fn = vi.fn();
    render(<MainMenu onStartGame={vi.fn()} onMultiplayer={fn} onSettings={vi.fn()} />);
    fireEvent.click(screen.getByTestId('btn-multiplayer'));
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should call onSettings', () => {
    const fn = vi.fn();
    render(<MainMenu onStartGame={vi.fn()} onMultiplayer={vi.fn()} onSettings={fn} />);
    fireEvent.click(screen.getByTestId('btn-settings'));
    expect(fn).toHaveBeenCalledOnce();
  });
});
