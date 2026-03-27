import React from 'react';

export interface HUDProps {
  readonly angle: number;
  readonly power: number;
  readonly wind: number;
  readonly currentPlayer: string;
  readonly weapon: string;
  readonly roundNumber?: number;
  readonly maxRounds?: number;
  readonly turnNumber?: number;
  readonly playerColor?: string;
}

const hudContainer: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  right: 0,
  zIndex: 10,
  fontFamily: "'Courier New', monospace",
  pointerEvents: 'none',
};

const playerBannerStyle: (color: string) => React.CSSProperties = (color) => ({
  background: `linear-gradient(90deg, ${color}dd 0%, ${color}44 60%, transparent 100%)`,
  padding: '6px 16px',
  display: 'flex',
  alignItems: 'center',
  gap: 12,
});

const playerNameStyle: React.CSSProperties = {
  fontSize: 18,
  fontWeight: 'bold',
  color: '#ffffff',
  textShadow: '1px 1px 2px rgba(0,0,0,0.8)',
};

const roundInfoStyle: React.CSSProperties = {
  fontSize: 12,
  color: 'rgba(255,255,255,0.8)',
  marginLeft: 'auto',
  textShadow: '1px 1px 2px rgba(0,0,0,0.6)',
};

const statsRow: React.CSSProperties = {
  display: 'flex',
  gap: 16,
  padding: '8px 16px',
  background: 'rgba(0,0,0,0.6)',
  backdropFilter: 'blur(8px)',
  alignItems: 'center',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
};

const statBlock: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  gap: 2,
};

const labelStyle: React.CSSProperties = {
  color: 'rgba(255,255,255,0.5)',
  fontSize: 9,
  textTransform: 'uppercase',
  letterSpacing: 1,
};

const valueStyle: React.CSSProperties = {
  fontSize: 16,
  fontWeight: 'bold',
  color: '#ffffff',
};

function getPowerBarColor(power: number): string {
  if (power < 40) return '#2ecc71';
  if (power < 70) return '#f1c40f';
  return '#e74c3c';
}

function PowerBar({ power }: { readonly power: number }): React.ReactElement {
  const barColor = getPowerBarColor(power);
  return (
    <div style={statBlock}>
      <div style={labelStyle}>Power</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <div
          style={{
            width: 120,
            height: 12,
            background: 'rgba(255,255,255,0.15)',
            borderRadius: 6,
            overflow: 'hidden',
            border: '1px solid rgba(255,255,255,0.2)',
          }}
        >
          <div
            data-testid="power-fill"
            style={{
              width: `${power}%`,
              height: '100%',
              background: barColor,
              borderRadius: 6,
              transition: 'width 0.1s ease-out',
            }}
          />
        </div>
        <span style={{ fontSize: 12, color: '#fff', fontWeight: 'bold', minWidth: 32 }}>
          {power}%
        </span>
      </div>
    </div>
  );
}

function AngleGauge({ angle }: { readonly angle: number }): React.ReactElement {
  const indicatorRotation = -(angle - 90);
  return (
    <div style={statBlock}>
      <div style={labelStyle}>Angle</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}>
        <svg width="24" height="14" viewBox="0 0 24 14" style={{ display: 'block' }}>
          <path
            d="M 2 13 A 11 11 0 0 1 22 13"
            fill="none"
            stroke="rgba(255,255,255,0.3)"
            strokeWidth="2"
          />
          <line
            x1="12"
            y1="13"
            x2={12 + 9 * Math.cos((indicatorRotation * Math.PI) / 180)}
            y2={13 + 9 * Math.sin((indicatorRotation * Math.PI) / 180)}
            stroke="#ffcc00"
            strokeWidth="2"
            strokeLinecap="round"
          />
        </svg>
        <span style={{ ...valueStyle, fontSize: 16 }}>{angle}°</span>
      </div>
    </div>
  );
}

function WindDisplay({ wind }: { readonly wind: number }): React.ReactElement {
  const direction = wind >= 0 ? '\u2192' : '\u2190';
  return (
    <div style={statBlock}>
      <div style={labelStyle}>Wind</div>
      <div style={valueStyle}>
        {direction} {Math.abs(wind).toFixed(1)}
      </div>
    </div>
  );
}

function WeaponDisplay({ weapon }: { readonly weapon: string }): React.ReactElement {
  return (
    <div style={statBlock}>
      <div style={labelStyle}>Weapon</div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 4 }}>
        <span style={{ ...valueStyle, fontSize: 14 }}>{weapon}</span>
        <span style={{ fontSize: 11, color: 'rgba(255,255,255,0.5)' }}>{'\u221E'}</span>
      </div>
    </div>
  );
}

export function GameHUD({
  angle,
  power,
  wind,
  currentPlayer,
  weapon,
  roundNumber,
  maxRounds,
  turnNumber,
  playerColor,
}: HUDProps): React.ReactElement {
  const bannerColor = playerColor ?? '#3498db';

  return (
    <div style={hudContainer} data-testid="game-hud">
      <div style={playerBannerStyle(bannerColor)} data-testid="player-banner">
        <span style={playerNameStyle}>{currentPlayer}</span>
        {roundNumber != null && maxRounds != null && (
          <span style={roundInfoStyle} data-testid="round-info">
            Round {roundNumber}/{maxRounds}
            {turnNumber != null ? ` | Turn ${turnNumber}` : ''}
          </span>
        )}
      </div>
      <div style={statsRow}>
        <AngleGauge angle={angle} />
        <PowerBar power={power} />
        <WindDisplay wind={wind} />
        <WeaponDisplay weapon={weapon} />
      </div>
    </div>
  );
}
