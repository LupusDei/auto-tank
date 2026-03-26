import React from 'react';

export interface GameSettings {
  readonly volume: number;
  readonly sfxVolume: number;
  readonly musicVolume: number;
  readonly showDamageNumbers: boolean;
  readonly showKillFeed: boolean;
  readonly cameraShake: boolean;
  readonly reducedMotion: boolean;
}

export interface SettingsScreenProps {
  readonly settings: GameSettings;
  readonly onUpdate: (settings: GameSettings) => void;
  readonly onBack: () => void;
}

const containerStyle: React.CSSProperties = {
  display: 'flex',
  flexDirection: 'column',
  padding: 32,
  color: '#fff',
  fontFamily: "'Courier New', monospace",
  maxWidth: 400,
  margin: '0 auto',
};

const rowStyle: React.CSSProperties = {
  display: 'flex',
  justifyContent: 'space-between',
  alignItems: 'center',
  padding: '8px 0',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
};

export function SettingsScreen({
  settings,
  onUpdate,
  onBack,
}: SettingsScreenProps): React.ReactElement {
  return (
    <div style={containerStyle} data-testid="settings-screen">
      <h2>Settings</h2>
      <div style={rowStyle}>
        <span>Master Volume</span>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.volume}
          data-testid="volume-slider"
          onChange={(e): void => onUpdate({ ...settings, volume: Number(e.target.value) })}
        />
      </div>
      <div style={rowStyle}>
        <span>SFX Volume</span>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.sfxVolume}
          data-testid="sfx-slider"
          onChange={(e): void => onUpdate({ ...settings, sfxVolume: Number(e.target.value) })}
        />
      </div>
      <div style={rowStyle}>
        <span>Damage Numbers</span>
        <input
          type="checkbox"
          checked={settings.showDamageNumbers}
          data-testid="damage-numbers-toggle"
          onChange={(): void =>
            onUpdate({ ...settings, showDamageNumbers: !settings.showDamageNumbers })
          }
        />
      </div>
      <div style={rowStyle}>
        <span>Music Volume</span>
        <input
          type="range"
          min={0}
          max={100}
          value={settings.musicVolume}
          data-testid="music-slider"
          onChange={(e): void => onUpdate({ ...settings, musicVolume: Number(e.target.value) })}
        />
      </div>
      <div style={rowStyle}>
        <span>Camera Shake</span>
        <input
          type="checkbox"
          checked={settings.cameraShake}
          data-testid="camera-shake-toggle"
          onChange={(): void => onUpdate({ ...settings, cameraShake: !settings.cameraShake })}
        />
      </div>
      <div style={rowStyle}>
        <span>Kill Feed</span>
        <input
          type="checkbox"
          checked={settings.showKillFeed}
          data-testid="kill-feed-toggle"
          onChange={(): void => onUpdate({ ...settings, showKillFeed: !settings.showKillFeed })}
        />
      </div>
      <div style={rowStyle}>
        <span>Reduced Motion</span>
        <input
          type="checkbox"
          checked={settings.reducedMotion}
          data-testid="reduced-motion-toggle"
          onChange={(): void => onUpdate({ ...settings, reducedMotion: !settings.reducedMotion })}
        />
      </div>
      <button
        data-testid="btn-back"
        onClick={onBack}
        style={{ marginTop: 24, padding: '8px 16px', cursor: 'pointer' }}
      >
        Back
      </button>
    </div>
  );
}
