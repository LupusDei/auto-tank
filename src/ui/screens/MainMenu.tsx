import React from 'react';

export interface MainMenuProps {
  readonly onStartGame: () => void;
  readonly onMultiplayer: () => void;
  readonly onSettings: () => void;
}

const containerStyle: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'linear-gradient(180deg, #0a0a2e, #1a1a4e)',
  color: '#fff',
  fontFamily: "'Courier New', monospace",
  zIndex: 30,
};

const buttonStyle: React.CSSProperties = {
  padding: '12px 32px',
  margin: 8,
  fontSize: 18,
  fontWeight: 'bold',
  cursor: 'pointer',
  background: 'rgba(255,255,255,0.1)',
  border: '2px solid rgba(255,255,255,0.3)',
  borderRadius: 8,
  color: '#fff',
  transition: 'all 0.2s',
};

export function MainMenu({
  onStartGame,
  onMultiplayer,
  onSettings,
}: MainMenuProps): React.ReactElement {
  return (
    <div style={containerStyle} data-testid="main-menu">
      <h1 style={{ fontSize: 64, marginBottom: 48 }}>AUTO TANK</h1>
      <button style={buttonStyle} data-testid="btn-start" onClick={onStartGame}>
        Start Game
      </button>
      <button style={buttonStyle} data-testid="btn-multiplayer" onClick={onMultiplayer}>
        Multiplayer
      </button>
      <button style={buttonStyle} data-testid="btn-settings" onClick={onSettings}>
        Settings
      </button>
      <p style={{ marginTop: 48, opacity: 0.5, fontSize: 12 }}>Scorched Earth + Worms Armageddon</p>
    </div>
  );
}
