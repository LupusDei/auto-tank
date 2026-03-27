import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { TouchControls } from '@ui/controls/TouchControls';

function createProps(overrides = {}): {
  onAngleLeft: ReturnType<typeof vi.fn>;
  onAngleRight: ReturnType<typeof vi.fn>;
  onPowerUp: ReturnType<typeof vi.fn>;
  onPowerDown: ReturnType<typeof vi.fn>;
  onFire: ReturnType<typeof vi.fn>;
  onCycleWeapon: ReturnType<typeof vi.fn>;
  disabled: boolean;
} {
  return {
    onAngleLeft: vi.fn(),
    onAngleRight: vi.fn(),
    onPowerUp: vi.fn(),
    onPowerDown: vi.fn(),
    onFire: vi.fn(),
    onCycleWeapon: vi.fn(),
    disabled: false,
    ...overrides,
  };
}

describe('TouchControls', () => {
  it('should render all control buttons', () => {
    const props = createProps();
    render(<TouchControls {...props} />);
    expect(screen.getByTestId('touch-controls')).toBeDefined();
    expect(screen.getByTestId('btn-angle-left')).toBeDefined();
    expect(screen.getByTestId('btn-angle-right')).toBeDefined();
    expect(screen.getByTestId('btn-power-up')).toBeDefined();
    expect(screen.getByTestId('btn-power-down')).toBeDefined();
    expect(screen.getByTestId('btn-fire')).toBeDefined();
    expect(screen.getByTestId('btn-cycle-weapon')).toBeDefined();
  });

  it('should call onFire when FIRE button pressed', () => {
    const props = createProps();
    render(<TouchControls {...props} />);
    fireEvent.pointerDown(screen.getByTestId('btn-fire'));
    expect(props.onFire).toHaveBeenCalledOnce();
  });

  it('should call onCycleWeapon when WPN button pressed', () => {
    const props = createProps();
    render(<TouchControls {...props} />);
    fireEvent.pointerDown(screen.getByTestId('btn-cycle-weapon'));
    expect(props.onCycleWeapon).toHaveBeenCalledOnce();
  });

  it('should call onAngleLeft on mouseDown of left button', () => {
    const props = createProps();
    render(<TouchControls {...props} />);
    fireEvent.mouseDown(screen.getByTestId('btn-angle-left'));
    expect(props.onAngleLeft).toHaveBeenCalledOnce();
    fireEvent.mouseUp(screen.getByTestId('btn-angle-left'));
  });

  it('should call onAngleRight on mouseDown of right button', () => {
    const props = createProps();
    render(<TouchControls {...props} />);
    fireEvent.mouseDown(screen.getByTestId('btn-angle-right'));
    expect(props.onAngleRight).toHaveBeenCalledOnce();
    fireEvent.mouseUp(screen.getByTestId('btn-angle-right'));
  });

  it('should call onPowerUp on mouseDown of up button', () => {
    const props = createProps();
    render(<TouchControls {...props} />);
    fireEvent.mouseDown(screen.getByTestId('btn-power-up'));
    expect(props.onPowerUp).toHaveBeenCalledOnce();
    fireEvent.mouseUp(screen.getByTestId('btn-power-up'));
  });

  it('should call onPowerDown on mouseDown of down button', () => {
    const props = createProps();
    render(<TouchControls {...props} />);
    fireEvent.mouseDown(screen.getByTestId('btn-power-down'));
    expect(props.onPowerDown).toHaveBeenCalledOnce();
    fireEvent.mouseUp(screen.getByTestId('btn-power-down'));
  });

  it('should have aria labels for accessibility', () => {
    const props = createProps();
    render(<TouchControls {...props} />);
    expect(screen.getByLabelText('Angle left')).toBeDefined();
    expect(screen.getByLabelText('Angle right')).toBeDefined();
    expect(screen.getByLabelText('Power up')).toBeDefined();
    expect(screen.getByLabelText('Power down')).toBeDefined();
    expect(screen.getByLabelText('Fire')).toBeDefined();
    expect(screen.getByLabelText('Cycle weapon')).toBeDefined();
  });

  it('should disable buttons when disabled prop is true', () => {
    const props = createProps({ disabled: true });
    render(<TouchControls {...props} />);
    const fireBtn = screen.getByTestId('btn-fire');
    expect(fireBtn.style.opacity).toBe('0.3');
    expect(fireBtn.style.pointerEvents).toBe('none');
  });
});
