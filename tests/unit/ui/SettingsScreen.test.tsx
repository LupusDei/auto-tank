import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { DEFAULT_SETTINGS } from '@ui/screens/settingsDefaults';
import { SettingsScreen } from '@ui/screens/SettingsScreen';

describe('SettingsScreen', () => {
  it('should render settings controls', () => {
    render(
      <SettingsScreen settings={{ ...DEFAULT_SETTINGS }} onUpdate={vi.fn()} onBack={vi.fn()} />,
    );
    expect(screen.getByTestId('settings-screen')).toBeDefined();
    expect(screen.getByTestId('volume-slider')).toBeDefined();
  });

  it('should call onBack', () => {
    const fn = vi.fn();
    render(<SettingsScreen settings={{ ...DEFAULT_SETTINGS }} onUpdate={vi.fn()} onBack={fn} />);
    fireEvent.click(screen.getByTestId('btn-back'));
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should toggle damage numbers', () => {
    const onUpdate = vi.fn();
    render(
      <SettingsScreen settings={{ ...DEFAULT_SETTINGS }} onUpdate={onUpdate} onBack={vi.fn()} />,
    );
    fireEvent.click(screen.getByTestId('damage-numbers-toggle'));
    expect(onUpdate).toHaveBeenCalledWith(expect.objectContaining({ showDamageNumbers: false }));
  });
});
