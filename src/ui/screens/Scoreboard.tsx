import React from 'react';

export interface PlayerScore {
  readonly name: string;
  readonly kills: number;
  readonly deaths: number;
  readonly damageDealt: number;
  readonly money: number;
  readonly roundsWon: number;
  readonly color: string;
}

export interface ScoreboardProps {
  readonly scores: readonly PlayerScore[];
  readonly currentRound: number;
  readonly maxRounds: number;
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  color: '#fff',
  fontFamily: "'Courier New', monospace",
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '2px solid rgba(255,255,255,0.3)',
  textAlign: 'left',
  textTransform: 'uppercase',
  fontSize: 10,
  letterSpacing: 1,
};

const tdStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
};

export function Scoreboard({
  scores,
  currentRound,
  maxRounds,
}: ScoreboardProps): React.ReactElement {
  const sorted = [...scores].sort((a, b) => b.roundsWon - a.roundsWon || b.kills - a.kills);

  return (
    <div data-testid="scoreboard" style={{ padding: 16 }}>
      <h3 style={{ color: '#fff', fontFamily: "'Courier New', monospace" }}>
        Round {currentRound} / {maxRounds}
      </h3>
      <table style={tableStyle}>
        <thead>
          <tr>
            <th style={thStyle}>Player</th>
            <th style={thStyle}>Wins</th>
            <th style={thStyle}>K/D</th>
            <th style={thStyle}>Damage</th>
            <th style={thStyle}>Money</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((p) => (
            <tr key={p.name} data-testid={`score-row-${p.name}`}>
              <td style={{ ...tdStyle, color: p.color, fontWeight: 'bold' }}>{p.name}</td>
              <td style={tdStyle}>{p.roundsWon}</td>
              <td style={tdStyle}>
                {p.kills}/{p.deaths}
              </td>
              <td style={tdStyle}>{p.damageDealt}</td>
              <td style={tdStyle}>${p.money}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
