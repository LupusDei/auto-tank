import type { Achievement } from '@engine/stats/Achievements';
import type { PlayerStats } from '@engine/stats/StatsTracker';
import React from 'react';

export interface PlayerAchievements {
  readonly playerId: number;
  readonly achievements: readonly Achievement[];
}

export interface StatsScreenProps {
  readonly stats: readonly PlayerStats[];
  readonly playerNames: readonly string[];
  readonly achievements: readonly PlayerAchievements[];
  readonly onBack: () => void;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  padding: 32,
  minHeight: '100vh',
  color: '#fff',
  fontFamily: "'Courier New', monospace",
  background: 'rgba(0,0,0,0.9)',
};

const tableStyle: React.CSSProperties = {
  borderCollapse: 'collapse',
  marginBottom: 32,
  width: '100%',
  maxWidth: 900,
};

const cellStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '1px solid #333',
  textAlign: 'right',
};

const headerCellStyle: React.CSSProperties = {
  ...cellStyle,
  borderBottom: '2px solid #555',
  fontWeight: 'bold',
  color: '#aaa',
};

const STAT_COLUMNS: readonly { key: keyof PlayerStats; label: string }[] = [
  { key: 'kills', label: 'Kills' },
  { key: 'deaths', label: 'Deaths' },
  { key: 'totalDamageDealt', label: 'Dmg Dealt' },
  { key: 'totalDamageTaken', label: 'Dmg Taken' },
  { key: 'shotsFired', label: 'Shots' },
  { key: 'directHits', label: 'Hits' },
  { key: 'maxDamageInOneShot', label: 'Max Hit' },
  { key: 'roundsWon', label: 'Rounds Won' },
];

export function StatsScreen({
  stats,
  playerNames,
  achievements,
  onBack,
}: StatsScreenProps): React.ReactElement {
  return (
    <div style={containerStyle} data-testid="stats-screen">
      <h1 style={{ fontSize: 36, marginBottom: 24 }}>Player Statistics</h1>

      <table style={tableStyle} data-testid="stats-table">
        <thead>
          <tr>
            <th style={{ ...headerCellStyle, textAlign: 'left' }}>Player</th>
            {STAT_COLUMNS.map((col) => (
              <th key={col.key} style={headerCellStyle}>
                {col.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {stats.map((playerStats, index) => {
            const name = playerNames[index] ?? `Player ${index + 1}`;
            return (
              <tr key={name} data-testid={`stats-row-${index}`}>
                <td style={{ ...cellStyle, textAlign: 'left' }}>{name}</td>
                {STAT_COLUMNS.map((col) => (
                  <td key={col.key} style={cellStyle}>
                    {playerStats[col.key]}
                  </td>
                ))}
              </tr>
            );
          })}
        </tbody>
      </table>

      {achievements.length > 0 && (
        <div style={{ marginBottom: 32, width: '100%', maxWidth: 900 }}>
          <h2 style={{ fontSize: 24, marginBottom: 16 }}>Achievements</h2>
          {achievements.map(({ playerId, achievements: playerAch }) => {
            const name = playerNames[playerId] ?? `Player ${playerId + 1}`;
            return (
              <div
                key={playerId}
                data-testid={`achievements-${playerId}`}
                style={{ marginBottom: 16 }}
              >
                <h3 style={{ fontSize: 18, color: '#ccc' }}>{name}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
                  {playerAch.map((ach) => (
                    <span
                      key={ach.id}
                      data-testid={`achievement-${ach.id}`}
                      title={ach.description}
                      style={{
                        padding: '4px 10px',
                        background: '#222',
                        borderRadius: 4,
                        border: '1px solid #444',
                      }}
                    >
                      {ach.icon} {ach.name}
                    </span>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      )}

      <button
        data-testid="btn-back"
        onClick={onBack}
        style={{ padding: '12px 24px', cursor: 'pointer' }}
      >
        Back
      </button>
    </div>
  );
}
