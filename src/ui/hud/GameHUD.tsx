import { WeaponPicker, type WeaponPickerItem } from './WeaponPicker';
import { getWeaponDisplay } from '@shared/constants/weaponDisplay';
import React, { useState } from 'react';

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
  readonly weapons?: readonly WeaponPickerItem[];
  readonly onSelectWeapon?: (type: string) => void;
  readonly isTurn?: boolean;
}

function getPowerBarColor(power: number): string {
  if (power < 40) return 'var(--color-success)';
  if (power < 70) return 'var(--color-team-yellow)';
  return 'var(--color-danger)';
}

function PowerBar({ power }: { readonly power: number }): React.ReactElement {
  return (
    <div className="hud-stat-block">
      <div className="hud-label">Power</div>
      <div className="hud-bar-row">
        <div className="hud-bar-track">
          <div
            className="hud-bar-fill"
            data-testid="power-fill"
            style={{ width: `${power}%`, background: getPowerBarColor(power) }}
          />
        </div>
        <span className="hud-bar-value">{power}%</span>
      </div>
    </div>
  );
}

function AngleGauge({ angle }: { readonly angle: number }): React.ReactElement {
  const rot = -(angle - 90);
  return (
    <div className="hud-stat-block">
      <div className="hud-label">Angle</div>
      <div className="hud-bar-row">
        <svg width="24" height="14" viewBox="0 0 24 14" className="hud-angle-svg">
          <path d="M 2 13 A 11 11 0 0 1 22 13" fill="none" stroke="rgba(255,255,255,0.3)" strokeWidth="2" />
          <line
            x1="12" y1="13"
            x2={12 + 9 * Math.cos((rot * Math.PI) / 180)}
            y2={13 + 9 * Math.sin((rot * Math.PI) / 180)}
            stroke="var(--color-accent)" strokeWidth="2" strokeLinecap="round"
          />
        </svg>
        <span className="hud-value hud-value-sm">{angle}°</span>
      </div>
    </div>
  );
}

function WindDisplay({ wind }: { readonly wind: number }): React.ReactElement {
  const arrow = wind >= 0 ? '\u2192' : '\u2190';
  return (
    <div className="hud-stat-block">
      <div className="hud-label">Wind</div>
      <div className="hud-value">{arrow} {Math.abs(wind).toFixed(1)}</div>
    </div>
  );
}

export function GameHUD({
  angle, power, wind, currentPlayer, weapon,
  roundNumber, maxRounds, turnNumber, playerColor,
  weapons, onSelectWeapon, isTurn,
}: HUDProps): React.ReactElement {
  const [expanded, setExpanded] = useState(false);
  const bannerColor = playerColor ?? 'var(--color-team-blue)';
  const display = getWeaponDisplay(weapon);
  const showPicker = expanded && isTurn;

  return (
    <div className={`hud-container ${expanded ? '' : 'hud-compact'}`} data-testid="game-hud">
      <div
        className="hud-player-banner"
        style={{ background: `linear-gradient(90deg, ${bannerColor}dd 0%, ${bannerColor}44 60%, transparent 100%)` }}
        data-testid="player-banner"
      >
        <span className="hud-player-name">{currentPlayer}</span>
        {roundNumber != null && maxRounds != null && (
          <span className="hud-round-info" data-testid="round-info">
            R{roundNumber}/{maxRounds}
            {turnNumber != null ? ` T${turnNumber}` : ''}
          </span>
        )}
      </div>
      <div className="hud-stats-row">
        <AngleGauge angle={angle} />
        <PowerBar power={power} />
        <WindDisplay wind={wind} />
        <button
          className="hud-weapon-toggle"
          onClick={(): void => setExpanded(!expanded)}
          data-testid="weapon-toggle"
          title={expanded ? 'Hide weapons' : 'Show weapons'}
        >
          <span className="hud-weapon-emoji">{display.emoji}</span>
          <span className="hud-weapon-name">{display.shortName}</span>
          <span className="hud-expand-arrow">{expanded ? '\u25B2' : '\u25BC'}</span>
        </button>
      </div>
      {showPicker && weapons && weapons.length > 0 && (
        <WeaponPicker
          weapons={weapons}
          onSelect={(type): void => {
            onSelectWeapon?.(type);
            setExpanded(false);
          }}
          disabled={!isTurn}
        />
      )}
    </div>
  );
}
