import type { PlayerScore } from './Scoreboard';
import React from 'react';

export interface VictoryScreenProps {
  readonly winner: PlayerScore | null;
  readonly scores: readonly PlayerScore[];
  readonly onPlayAgain: () => void;
  readonly onMainMenu: () => void;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  height: '100vh',
  color: '#fff',
  fontFamily: "'Courier New', monospace",
  background: 'rgba(0,0,0,0.8)',
};

export function VictoryScreen({
  winner,
  scores,
  onPlayAgain,
  onMainMenu,
}: VictoryScreenProps): React.ReactElement {
  return (
    <div style={containerStyle} data-testid="victory-screen">
      <h1 style={{ fontSize: 48, marginBottom: 16 }}>
        {winner ? `${winner.name} Wins!` : 'Draw!'}
      </h1>
      {winner && (
        <p
          style={{ color: winner.color, fontSize: 24, marginBottom: 32 }}
          data-testid="winner-name"
        >
          {winner.kills} kills, ${winner.money} earned
        </p>
      )}
      <div style={{ marginBottom: 32 }}>
        {scores.map((s) => (
          <div
            key={s.name}
            style={{ display: 'flex', gap: 16, padding: 4 }}
            data-testid={`final-score-${s.name}`}
          >
            <span style={{ color: s.color, width: 80 }}>{s.name}</span>
            <span>{s.roundsWon}W</span>
            <span>
              {s.kills}K/{s.deaths}D
            </span>
          </div>
        ))}
      </div>
      <button
        data-testid="btn-play-again"
        onClick={onPlayAgain}
        style={{ padding: '12px 24px', margin: 8, cursor: 'pointer' }}
      >
        Play Again
      </button>
      <button
        data-testid="btn-main-menu"
        onClick={onMainMenu}
        style={{ padding: '12px 24px', margin: 8, cursor: 'pointer' }}
      >
        Main Menu
      </button>
    </div>
  );
}
