import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { WindIndicator } from '@ui/hud/WindIndicator';

describe('WindIndicator', () => {
  it('should render without crashing', () => {
    render(<WindIndicator speed={5} />);
    expect(screen.getByTestId('wind-indicator')).toBeDefined();
  });

  it('should show right arrow for positive wind', () => {
    render(<WindIndicator speed={5} />);
    const arrow = screen.getByTestId('wind-arrow');
    expect(arrow.textContent).toContain('→');
  });

  it('should show left arrow for negative wind', () => {
    render(<WindIndicator speed={-5} />);
    const arrow = screen.getByTestId('wind-arrow');
    expect(arrow.textContent).toContain('←');
  });

  it('should display strength value', () => {
    render(<WindIndicator speed={7.5} />);
    expect(screen.getByTestId('wind-strength').textContent).toBe('7.5');
  });

  it('should show calm indicator for zero wind', () => {
    render(<WindIndicator speed={0} />);
    expect(screen.getByTestId('wind-strength').textContent).toBe('0');
    const arrow = screen.getByTestId('wind-arrow');
    expect(arrow.textContent).toContain('—');
  });

  it('should show visual intensity based on strength', () => {
    const { rerender } = render(<WindIndicator speed={5} maxStrength={30} />);
    const indicator = screen.getByTestId('wind-indicator');
    expect(indicator.getAttribute('data-intensity')).toBeDefined();

    rerender(<WindIndicator speed={25} maxStrength={30} />);
    const highIntensity = screen.getByTestId('wind-indicator');
    expect(highIntensity.getAttribute('data-intensity')).toBeDefined();
  });
});
