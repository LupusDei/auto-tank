import React from 'react';

export interface HUDProps {
  readonly angle: number;
  readonly power: number;
  readonly wind: number;
  readonly currentPlayer: string;
  readonly weapon: string;
}

const hudStyle: React.CSSProperties = {
  position: 'absolute',
  top: 16,
  left: 16,
  padding: '12px 20px',
  background: 'rgba(0, 0, 0, 0.6)',
  backdropFilter: 'blur(8px)',
  borderRadius: 12,
  color: '#fff',
  fontFamily: "'Courier New', monospace",
  fontSize: 14,
  display: 'flex',
  gap: 24,
  zIndex: 10,
  border: '1px solid rgba(255, 255, 255, 0.1)',
};

const labelStyle: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: 10,
  textTransform: 'uppercase',
  letterSpacing: 1,
};

const valueStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 'bold',
};

function HUDItem({
  label,
  value,
}: {
  readonly label: string;
  readonly value: string;
}): React.ReactElement {
  return (
    <div>
      <div style={labelStyle}>{label}</div>
      <div style={valueStyle}>{value}</div>
    </div>
  );
}

export function GameHUD({
  angle,
  power,
  wind,
  currentPlayer,
  weapon,
}: HUDProps): React.ReactElement {
  const windDirection = wind >= 0 ? '→' : '←';
  return (
    <div style={hudStyle} data-testid="game-hud">
      <HUDItem label="Player" value={currentPlayer} />
      <HUDItem label="Angle" value={`${angle}°`} />
      <HUDItem label="Power" value={`${power}%`} />
      <HUDItem label="Wind" value={`${windDirection} ${Math.abs(wind)}`} />
      <HUDItem label="Weapon" value={weapon} />
    </div>
  );
}
