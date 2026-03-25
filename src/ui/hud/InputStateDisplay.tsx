import React from 'react';

export interface InputStateDisplayProps {
  readonly angle: number;
  readonly power: number;
  readonly weaponName: string;
  readonly ammoCount: number;
  readonly fuel: number;
  readonly maxFuel: number;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  alignItems: 'center',
  padding: '8px 16px',
  background: 'rgba(0, 0, 0, 0.5)',
  borderRadius: 8,
  color: '#fff',
  fontFamily: "'Courier New', monospace",
  fontSize: 13,
};

const itemStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
};

const labelStyle: React.CSSProperties = {
  color: 'rgba(255, 255, 255, 0.5)',
  fontSize: 9,
  textTransform: 'uppercase',
  letterSpacing: 1,
};

const valueStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 'bold',
};

function FuelBar({
  fuel,
  maxFuel,
}: {
  readonly fuel: number;
  readonly maxFuel: number;
}): React.ReactElement {
  const pct = maxFuel > 0 ? (fuel / maxFuel) * 100 : 0;
  const color = pct > 50 ? '#4caf50' : pct > 20 ? '#ff9800' : '#f44336';

  return (
    <div
      style={{ width: 60, height: 6, background: 'rgba(255,255,255,0.2)', borderRadius: 3 }}
      data-testid="fuel-bar"
    >
      <div
        style={{ width: `${pct}%`, height: '100%', background: color, borderRadius: 3 }}
        data-testid="fuel-fill"
      />
    </div>
  );
}

export function InputStateDisplay({
  angle,
  power,
  weaponName,
  ammoCount,
  fuel,
  maxFuel,
}: InputStateDisplayProps): React.ReactElement {
  return (
    <div style={containerStyle} data-testid="input-state-display">
      <div style={itemStyle}>
        <span style={labelStyle}>Angle</span>
        <span style={valueStyle} data-testid="angle-value">
          {angle}°
        </span>
      </div>
      <div style={itemStyle}>
        <span style={labelStyle}>Power</span>
        <span style={valueStyle} data-testid="power-value">
          {power}%
        </span>
      </div>
      <div style={itemStyle}>
        <span style={labelStyle}>Weapon</span>
        <span style={valueStyle} data-testid="weapon-value">
          {weaponName}
        </span>
      </div>
      <div style={itemStyle}>
        <span style={labelStyle}>Ammo</span>
        <span style={valueStyle} data-testid="ammo-value">
          {ammoCount === -1 ? '∞' : ammoCount}
        </span>
      </div>
      <div style={itemStyle}>
        <span style={labelStyle}>Fuel</span>
        <FuelBar fuel={fuel} maxFuel={maxFuel} />
      </div>
    </div>
  );
}
