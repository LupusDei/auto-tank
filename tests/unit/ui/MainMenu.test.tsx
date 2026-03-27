import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { MainMenu } from '@ui/screens/MainMenu';

// Mock canvas getContext since MainMenu now renders an animated background
beforeAll(() => {
  HTMLCanvasElement.prototype.getContext = vi.fn(() => ({
    canvas: { width: 800, height: 600 },
    clearRect: vi.fn(),
    fillRect: vi.fn(),
    fillText: vi.fn(),
    strokeText: vi.fn(),
    beginPath: vi.fn(),
    moveTo: vi.fn(),
    lineTo: vi.fn(),
    closePath: vi.fn(),
    fill: vi.fn(),
    stroke: vi.fn(),
    arc: vi.fn(),
    save: vi.fn(),
    restore: vi.fn(),
    createLinearGradient: vi.fn(() => ({ addColorStop: vi.fn() })),
    set fillStyle(_v: string) { /* noop */ },
    set strokeStyle(_v: string) { /* noop */ },
    set globalAlpha(_v: number) { /* noop */ },
    set lineWidth(_v: number) { /* noop */ },
    set font(_v: string) { /* noop */ },
    set textAlign(_v: string) { /* noop */ },
  })) as unknown as typeof HTMLCanvasElement.prototype.getContext;
});

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

  it('should have multiplayer button disabled with Coming Soon badge', () => {
    render(<MainMenu onStartGame={vi.fn()} onMultiplayer={vi.fn()} onSettings={vi.fn()} />);
    const btn = screen.getByTestId('btn-multiplayer');
    expect(btn).toBeDefined();
    expect((btn as HTMLButtonElement).disabled).toBe(true);
    expect(screen.getByText('SOON')).toBeDefined();
  });

  it('should call onSettings', () => {
    const fn = vi.fn();
    render(<MainMenu onStartGame={vi.fn()} onMultiplayer={vi.fn()} onSettings={fn} />);
    fireEvent.click(screen.getByTestId('btn-settings'));
    expect(fn).toHaveBeenCalledOnce();
  });
});
