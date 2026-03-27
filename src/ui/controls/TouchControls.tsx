import React, { useCallback, useRef } from 'react';

export interface TouchControlsProps {
  readonly onAngleLeft: () => void;
  readonly onAngleRight: () => void;
  readonly onPowerUp: () => void;
  readonly onPowerDown: () => void;
  readonly onFire: () => void;
  readonly onCycleWeapon: () => void;
  readonly disabled: boolean;
}

const BAR_STYLE: React.CSSProperties = {
  position: 'absolute',
  bottom: 50,
  left: '50%',
  transform: 'translateX(-50%)',
  display: 'flex',
  gap: 8,
  padding: '10px 14px',
  background: 'rgba(0, 0, 0, 0.7)',
  backdropFilter: 'blur(10px)',
  borderRadius: 16,
  zIndex: 20,
  border: '1px solid rgba(255, 255, 255, 0.15)',
  userSelect: 'none',
  WebkitUserSelect: 'none',
  touchAction: 'manipulation',
};

const BUTTON_BASE: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  minWidth: 48,
  minHeight: 48,
  borderRadius: 12,
  border: 'none',
  fontFamily: "'Courier New', monospace",
  fontWeight: 'bold',
  fontSize: 18,
  cursor: 'pointer',
  touchAction: 'manipulation',
  WebkitTapHighlightColor: 'transparent',
  transition: 'background 0.1s, transform 0.1s',
};

const DIRECTION_STYLE: React.CSSProperties = {
  ...BUTTON_BASE,
  background: 'rgba(255, 255, 255, 0.15)',
  color: '#fff',
  padding: '0 14px',
};

const FIRE_STYLE: React.CSSProperties = {
  ...BUTTON_BASE,
  background: 'linear-gradient(135deg, #e74c3c, #c0392b)',
  color: '#fff',
  padding: '0 24px',
  fontSize: 16,
  letterSpacing: 1,
  boxShadow: '0 2px 8px rgba(231, 76, 60, 0.4)',
};

const WEAPON_STYLE: React.CSSProperties = {
  ...BUTTON_BASE,
  background: 'rgba(52, 152, 219, 0.4)',
  color: '#3498db',
  padding: '0 14px',
  fontSize: 14,
};

const DISABLED_STYLE: React.CSSProperties = {
  opacity: 0.3,
  pointerEvents: 'none',
};

const SEPARATOR: React.CSSProperties = {
  width: 1,
  alignSelf: 'stretch',
  background: 'rgba(255, 255, 255, 0.15)',
  margin: '4px 2px',
};

/** Hook for repeat-on-hold behavior for angle/power buttons. */
function useRepeatPress(callback: () => void, intervalMs = 80): {
  onTouchStart: () => void;
  onTouchEnd: () => void;
  onMouseDown: () => void;
  onMouseUp: () => void;
  onMouseLeave: () => void;
} {
  const intervalRef = useRef<ReturnType<typeof setInterval> | null>(null);
  const isTouchRef = useRef(false);

  const stop = useCallback((): void => {
    if (intervalRef.current !== null) {
      clearInterval(intervalRef.current);
      intervalRef.current = null;
    }
    // Reset touch flag after a short delay (after synthetic mouse events)
    setTimeout(() => {
      isTouchRef.current = false;
    }, 100);
  }, []);

  const startTouch = useCallback((): void => {
    isTouchRef.current = true;
    callback();
    intervalRef.current = setInterval(callback, intervalMs);
  }, [callback, intervalMs]);

  const startMouse = useCallback((): void => {
    if (isTouchRef.current) return; // Ignore synthetic mouse event
    callback();
    intervalRef.current = setInterval(callback, intervalMs);
  }, [callback, intervalMs]);

  return {
    onTouchStart: startTouch,
    onTouchEnd: stop,
    onMouseDown: startMouse,
    onMouseUp: stop,
    onMouseLeave: stop,
  };
}

export function TouchControls({
  onAngleLeft,
  onAngleRight,
  onPowerUp,
  onPowerDown,
  onFire,
  onCycleWeapon,
  disabled,
}: TouchControlsProps): React.ReactElement {
  const leftHandlers = useRepeatPress(onAngleLeft);
  const rightHandlers = useRepeatPress(onAngleRight);
  const upHandlers = useRepeatPress(onPowerUp);
  const downHandlers = useRepeatPress(onPowerDown);

  const disabledMixin = disabled ? DISABLED_STYLE : {};

  return (
    <div style={BAR_STYLE} data-testid="touch-controls">
      {/* Angle controls */}
      <button
        type="button"
        style={{ ...DIRECTION_STYLE, ...disabledMixin }}
        aria-label="Angle left"
        data-testid="btn-angle-left"
        {...leftHandlers}
      >
        ◀
      </button>
      <button
        type="button"
        style={{ ...DIRECTION_STYLE, ...disabledMixin }}
        aria-label="Angle right"
        data-testid="btn-angle-right"
        {...rightHandlers}
      >
        ▶
      </button>

      <div style={SEPARATOR} />

      {/* Power controls */}
      <button
        type="button"
        style={{ ...DIRECTION_STYLE, ...disabledMixin }}
        aria-label="Power up"
        data-testid="btn-power-up"
        {...upHandlers}
      >
        ▲
      </button>
      <button
        type="button"
        style={{ ...DIRECTION_STYLE, ...disabledMixin }}
        aria-label="Power down"
        data-testid="btn-power-down"
        {...downHandlers}
      >
        ▼
      </button>

      <div style={SEPARATOR} />

      {/* Weapon cycle */}
      <button
        type="button"
        style={{ ...WEAPON_STYLE, ...disabledMixin }}
        aria-label="Cycle weapon"
        data-testid="btn-cycle-weapon"
        onPointerDown={(e): void => {
          e.preventDefault();
          onCycleWeapon();
        }}
      >
        WPN
      </button>

      <div style={SEPARATOR} />

      {/* Fire button */}
      <button
        type="button"
        style={{ ...FIRE_STYLE, ...disabledMixin }}
        aria-label="Fire"
        data-testid="btn-fire"
        onPointerDown={(e): void => {
          e.preventDefault();
          onFire();
        }}
      >
        FIRE
      </button>
    </div>
  );
}
