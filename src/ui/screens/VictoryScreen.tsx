import type { PlayerScore } from './Scoreboard';
import React from 'react';

export interface VictoryScreenProps {
  readonly winner: PlayerScore | null;
  readonly scores: readonly PlayerScore[];
  readonly onPlayAgain: () => void;
  readonly onMainMenu: () => void;
}

function getRankClass(rank: number): string {
  if (rank === 1) return 'victory-rank victory-rank-1';
  if (rank === 2) return 'victory-rank victory-rank-2';
  if (rank === 3) return 'victory-rank victory-rank-3';
  return 'victory-rank victory-rank-other';
}

function sortByPerformance(
  scores: readonly PlayerScore[],
): readonly PlayerScore[] {
  return [...scores].sort(
    (a, b) => b.roundsWon - a.roundsWon || b.kills - a.kills,
  );
}

export function VictoryScreen({
  winner,
  scores,
  onPlayAgain,
  onMainMenu,
}: VictoryScreenProps): React.ReactElement {
  const sorted = sortByPerformance(scores);

  return (
    <div className="overlay results-screen" data-testid="victory-screen">
      <h1 className="results-title">
        {winner ? `${winner.name} Wins!` : 'Draw!'}
      </h1>

      {winner && (
        <p
          className="victory-winner-summary"
          style={{ color: winner.color }}
          data-testid="winner-name"
        >
          {winner.kills} kills, ${winner.money} earned
        </p>
      )}

      <div className="victory-podium" data-testid="victory-podium">
        {sorted.slice(0, 3).map((player, index) => (
          <div
            key={player.name}
            className="victory-podium-card"
            data-testid={`podium-${index + 1}`}
          >
            <span className={getRankClass(index + 1)}>{index + 1}</span>
            <span
              className="victory-player-name"
              style={{ color: player.color }}
            >
              {player.name}
            </span>
            <span className="victory-podium-stat">
              {player.roundsWon}W {player.kills}K
            </span>
          </div>
        ))}
      </div>

      <table className="victory-stats-table" data-testid="victory-stats-table">
        <thead>
          <tr>
            <th>Rank</th>
            <th>Player</th>
            <th>Rounds</th>
            <th>K/D</th>
            <th>Damage</th>
            <th>Money</th>
          </tr>
        </thead>
        <tbody>
          {sorted.map((player, index) => (
            <tr key={player.name} data-testid={`final-score-${player.name}`}>
              <td>
                <span className={getRankClass(index + 1)}>{index + 1}</span>
              </td>
              <td>
                <span
                  className="victory-player-name"
                  style={{ color: player.color }}
                >
                  {player.name}
                </span>
              </td>
              <td>{player.roundsWon}</td>
              <td>
                {player.kills}/{player.deaths}
              </td>
              <td>{player.damageDealt}</td>
              <td>${player.money}</td>
            </tr>
          ))}
        </tbody>
      </table>

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
