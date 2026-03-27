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

interface SliderRowProps {
  readonly label: string;
  readonly value: number;
  readonly testId: string;
  readonly onChange: (value: number) => void;
}

function SliderRow({
  label,
  value,
  testId,
  onChange,
}: SliderRowProps): React.ReactElement {
  return (
    <div className="settings-row">
      <span className="settings-label">{label}</span>
      <div className="settings-slider-group">
        <input
          type="range"
          className="settings-slider"
          min={0}
          max={100}
          value={value}
          data-testid={testId}
          onChange={(e): void => onChange(Number(e.target.value))}
        />
        <span className="settings-value">{value}%</span>
      </div>
    </div>
  );
}

interface ToggleRowProps {
  readonly label: string;
  readonly checked: boolean;
  readonly testId: string;
  readonly onToggle: () => void;
}

function ToggleRow({
  label,
  checked,
  testId,
  onToggle,
}: ToggleRowProps): React.ReactElement {
  return (
    <div className="settings-row">
      <span className="settings-label">{label}</span>
      <button
        type="button"
        className="settings-toggle"
        data-checked={String(checked)}
        data-testid={testId}
        onClick={onToggle}
        aria-pressed={checked}
      />
    </div>
  );
}

export function SettingsScreen({
  settings,
  onUpdate,
  onBack,
}: SettingsScreenProps): React.ReactElement {
  return (
    <div className="settings-container" data-testid="settings-screen">
      <h2 className="settings-title">Settings</h2>

      <SliderRow
        label="Master Volume"
        value={settings.volume}
        testId="volume-slider"
        onChange={(v): void => onUpdate({ ...settings, volume: v })}
      />
      <SliderRow
        label="SFX Volume"
        value={settings.sfxVolume}
        testId="sfx-slider"
        onChange={(v): void => onUpdate({ ...settings, sfxVolume: v })}
      />
      <SliderRow
        label="Music Volume"
        value={settings.musicVolume}
        testId="music-slider"
        onChange={(v): void => onUpdate({ ...settings, musicVolume: v })}
      />

      <ToggleRow
        label="Damage Numbers"
        checked={settings.showDamageNumbers}
        testId="damage-numbers-toggle"
        onToggle={(): void =>
          onUpdate({
            ...settings,
            showDamageNumbers: !settings.showDamageNumbers,
          })
        }
      />
      <ToggleRow
        label="Camera Shake"
        checked={settings.cameraShake}
        testId="camera-shake-toggle"
        onToggle={(): void =>
          onUpdate({ ...settings, cameraShake: !settings.cameraShake })
        }
      />
      <ToggleRow
        label="Kill Feed"
        checked={settings.showKillFeed}
        testId="kill-feed-toggle"
        onToggle={(): void =>
          onUpdate({ ...settings, showKillFeed: !settings.showKillFeed })
        }
      />
      <ToggleRow
        label="Reduced Motion"
        checked={settings.reducedMotion}
        testId="reduced-motion-toggle"
        onToggle={(): void =>
          onUpdate({ ...settings, reducedMotion: !settings.reducedMotion })
        }
      />

      <button
        data-testid="btn-back"
        onClick={onBack}
        className="btn btn-secondary settings-back-btn"
      >
        Back
      </button>
    </div>
  );
}
