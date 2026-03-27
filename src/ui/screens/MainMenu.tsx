import React from 'react';

export interface MainMenuProps {
  readonly onStartGame: () => void;
  readonly onMultiplayer: () => void;
  readonly onSettings: () => void;
}

export function MainMenu({
  onStartGame,
  onMultiplayer,
  onSettings,
}: MainMenuProps): React.ReactElement {
  return (
    <div className="overlay main-menu" data-testid="main-menu">
      <h1 className="main-menu-title">AUTO TANK</h1>
      <button className="btn-ghost" data-testid="btn-start" onClick={onStartGame}>
        Start Game
      </button>
      <button className="btn-ghost" data-testid="btn-multiplayer" onClick={onMultiplayer}>
        Multiplayer
      </button>
      <button className="btn-ghost" data-testid="btn-settings" onClick={onSettings}>
        Settings
      </button>
      <p className="main-menu-subtitle">Scorched Earth + Worms Armageddon</p>
    </div>
  );
}
