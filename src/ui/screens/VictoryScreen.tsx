import type { PlayerScore } from './Scoreboard';
import React from 'react';

export interface VictoryScreenProps {
  readonly winner: PlayerScore | null;
  readonly scores: readonly PlayerScore[];
  readonly onPlayAgain: () => void;
  readonly onMainMenu: () => void;
}

export function VictoryScreen({
  winner,
  scores,
  onPlayAgain,
  onMainMenu,
}: VictoryScreenProps): React.ReactElement {
  return (
    <div className="overlay results-screen" data-testid="victory-screen">
      <h1 className="results-title">
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
      <div className="results-buttons">
        <button
          data-testid="btn-play-again"
          onClick={onPlayAgain}
          className="btn btn-primary results-btn"
        >
          Play Again
        </button>
        <button
          data-testid="btn-main-menu"
          onClick={onMainMenu}
          className="btn btn-secondary results-btn"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
}
