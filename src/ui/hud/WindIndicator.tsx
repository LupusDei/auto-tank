import React from 'react';

export interface WindIndicatorProps {
  readonly speed: number;
  readonly maxStrength?: number;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  alignItems: 'center',
  gap: 8,
};

const arrowStyle: React.CSSProperties = {
  fontSize: 20,
  fontWeight: 'bold',
};

const strengthStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 'bold',
  fontFamily: "'Courier New', monospace",
};

function getWindArrow(speed: number): string {
  if (speed === 0) return '—';
  return speed > 0 ? '→' : '←';
}

function getIntensity(
  speed: number,
  maxStrength: number,
): 'calm' | 'light' | 'moderate' | 'strong' {
  const ratio = Math.abs(speed) / maxStrength;
  if (ratio === 0) return 'calm';
  if (ratio < 0.33) return 'light';
  if (ratio < 0.66) return 'moderate';
  return 'strong';
}

export function WindIndicator({ speed, maxStrength = 30 }: WindIndicatorProps): React.ReactElement {
  const intensity = getIntensity(speed, maxStrength);

  return (
    <div style={containerStyle} data-testid="wind-indicator" data-intensity={intensity}>
      <span style={arrowStyle} data-testid="wind-arrow">
        {getWindArrow(speed)}
      </span>
      <span style={strengthStyle} data-testid="wind-strength">
        {Math.abs(speed)}
      </span>
    </div>
  );
}
