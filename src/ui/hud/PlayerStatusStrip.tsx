import React, { useState } from 'react';

export interface PlayerStatusInfo {
  readonly name: string;
  readonly health: number;
  readonly maxHealth: number;
  readonly color: string;
  readonly isAlive: boolean;
  readonly isActive: boolean;
}

function getHealthColor(pct: number): string {
  if (pct > 0.5) return 'var(--color-success)';
  if (pct > 0.2) return 'var(--color-team-yellow)';
  return 'var(--color-danger)';
}

function PlayerRow({ player }: { readonly player: PlayerStatusInfo }): React.ReactElement {
  const pct = player.maxHealth > 0 ? player.health / player.maxHealth : 0;

  return (
    <div
      className={`pss-row ${player.isActive ? 'pss-row-active' : ''} ${!player.isAlive ? 'pss-row-dead' : ''}`}
      data-testid={`player-status-${player.name}`}
    >
      <span className="pss-color-dot" style={{ background: player.color }} />
      <span className="pss-name">{player.name}</span>
      {player.isAlive ? (
        <>
          <div className="pss-bar-track">
            <div
              className="pss-bar-fill"
              style={{ width: `${pct * 100}%`, background: getHealthColor(pct) }}
            />
          </div>
          <span className="pss-hp">{Math.round(player.health)}</span>
        </>
      ) : (
        <span className="pss-skull">{'\u2620'}</span>
      )}
    </div>
  );
}

/** Collapsed view: just colored dots. */
function CollapsedDots({
  players,
  onClick,
}: {
  readonly players: readonly PlayerStatusInfo[];
  readonly onClick: () => void;
}): React.ReactElement {
  return (
    <button
      className="pss-collapsed"
      onClick={onClick}
      data-testid="pss-expand"
      title="Show player status"
    >
      {players.map((p) => (
        <span
          key={p.name}
          className={`pss-dot ${!p.isAlive ? 'pss-dot-dead' : ''} ${p.isActive ? 'pss-dot-active' : ''}`}
          style={{ background: p.isAlive ? p.color : '#555' }}
        />
      ))}
    </button>
  );
}

export function PlayerStatusStrip({
  players,
}: {
  readonly players: readonly PlayerStatusInfo[];
}): React.ReactElement {
  const [expanded, setExpanded] = useState(false);

  if (!expanded) {
    return <CollapsedDots players={players} onClick={(): void => setExpanded(true)} />;
  }

  return (
    <div className="pss-container" data-testid="player-status-strip">
      <button
        className="pss-collapse-btn"
        onClick={(): void => setExpanded(false)}
        title="Minimize"
      >
        {'\u25B6'}
      </button>
      {players.map((p) => (
        <PlayerRow key={p.name} player={p} />
      ))}
    </div>
  );
}
