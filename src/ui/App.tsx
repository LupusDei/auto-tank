import {
  addDamageNumber,
  createRenderState,
  renderGame,
  triggerKillConfirmation,
  triggerScreenFlash,
  triggerShake,
  triggerTurnTransition,
} from './GameRenderHelpers';
import { adjustAngle, adjustPower, cycleWeapon } from '@engine/input/TankControls';
import { GameManager, type GameManagerConfig } from '@engine/GameManager';
import { type GameSettings, SettingsScreen } from './screens/SettingsScreen';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { connectSoundToEvents } from '@audio/EventBusSoundBridge';
import { createDamageNumber } from '@renderer/weapons/ImpactFeedback';
import { DEFAULT_SETTINGS } from './screens/settingsDefaults';
import { GameHUD } from './hud/GameHUD';
import { GameLoop } from '@engine/GameLoop';
import { getExplosionConfig } from '@renderer/weapons/ExplosionVariety';
import { getTeamHexColor } from '@renderer/entities/TankRenderer';
import { MainMenu } from './screens/MainMenu';
import { ShopScreen } from './shop/ShopScreen';
import { SoundManager } from '@audio/SoundManager';
import { TouchControls } from './controls/TouchControls';

import './styles/index.css';

import type { ExplosionPayload, TankDamagedPayload, TankDestroyedPayload, TurnStartedPayload } from '@engine/events/types';
import type { RenderState } from './GameRenderHelpers';
import type { TeamColor } from '@shared/types/entities';
import type { TerrainTheme } from '@shared/types/terrain';
import type { WeaponType } from '@shared/types/weapons';

type AppScene = 'menu' | 'config' | 'playing' | 'results' | 'settings';

const AVAILABLE_WEAPONS: WeaponType[] = [
  'baby-missile',
  'missile',
  'mirv',
  'nuke',
  'napalm',
  'holy-hand-grenade',
  'banana-bomb',
  'concrete-donkey',
  'dirt-bomb',
  'smoke-tracer',
  'grenade',
  'shotgun',
  'fire-punch',
  'baseball-bat',
  'roller',
  'digger',
  'air-strike',
  'guided-missile',
  'armageddon',
];
const ANGLE_STEP = 2;
const POWER_STEP = 3;

const phaseLabel: Record<string, string> = {
  turn: 'AIM & FIRE',
  firing: 'FIRING...',
  resolution: 'RESOLVING...',
  victory: 'VICTORY!',
};

// ── Config Screen ────────────────────────────────────────────────────

interface ConfigState {
  theme: TerrainTheme;
  playerNames: string[];
  playerColors: TeamColor[];
  playerIsAI: boolean[];
  rounds: number;
  aiDifficulty: 'easy' | 'medium' | 'hard' | 'expert';
}

function ConfigScreen({
  onStart,
}: {
  readonly onStart: (cfg: ConfigState) => void;
}): React.ReactElement {
  const [cfg, setCfg] = useState<ConfigState>({
    theme: 'classic',
    playerNames: ['Player 1', 'Player 2'],
    playerColors: ['red', 'blue'],
    playerIsAI: [false, true],
    rounds: 5,
    aiDifficulty: 'medium',
  });

  return (
    <div className="overlay config-screen" data-testid="config-screen">
      <h1>GAME SETUP</h1>

      <label className="config-label">
        Theme:
        <select
          value={cfg.theme}
          onChange={(e): void => setCfg({ ...cfg, theme: e.target.value as TerrainTheme })}
          className="config-input"
          data-testid="theme-select"
        >
          <option value="classic">Classic</option>
          <option value="desert">Desert</option>
          <option value="arctic">Arctic</option>
          <option value="volcanic">Volcanic</option>
          <option value="lunar">Lunar</option>
        </select>
      </label>

      <label className="config-label">
        Rounds:
        <input
          type="number"
          min={1}
          max={20}
          value={cfg.rounds}
          onChange={(e): void =>
            setCfg({ ...cfg, rounds: Math.max(1, Math.min(20, Number(e.target.value) || 1)) })
          }
          className="config-input"
          style={{ width: 50 }}
          data-testid="rounds-input"
        />
      </label>

      <label className="config-label">
        AI Difficulty:
        <select
          value={cfg.aiDifficulty}
          onChange={(e): void =>
            setCfg({ ...cfg, aiDifficulty: e.target.value as ConfigState['aiDifficulty'] })
          }
          className="config-input"
          data-testid="ai-difficulty-select"
        >
          <option value="easy">Easy</option>
          <option value="medium">Medium</option>
          <option value="hard">Hard</option>
          <option value="expert">Expert</option>
        </select>
      </label>

      {cfg.playerNames.map((name, i) => (
        <div key={i} className="config-player-row">
          <input
            value={name}
            onChange={(e): void => {
              const names = [...cfg.playerNames];
              names[i] = e.target.value;
              setCfg({ ...cfg, playerNames: names });
            }}
            className="config-player-name-input"
            data-testid={`player-name-${i}`}
          />
          <label>
            <input
              type="checkbox"
              checked={cfg.playerIsAI[i] ?? false}
              onChange={(): void => {
                const ai = [...cfg.playerIsAI];
                ai[i] = !ai[i];
                setCfg({ ...cfg, playerIsAI: ai });
              }}
            />{' '}
            AI
          </label>
          {cfg.playerNames.length > 2 && (
            <button
              onClick={(): void => {
                setCfg({
                  ...cfg,
                  playerNames: cfg.playerNames.filter((_, j) => j !== i),
                  playerColors: cfg.playerColors.filter((_, j) => j !== i),
                  playerIsAI: cfg.playerIsAI.filter((_, j) => j !== i),
                });
              }}
              className="btn btn-danger btn-sm"
              data-testid={`remove-player-${i}`}
            >
              ✕
            </button>
          )}
        </div>
      ))}

      {cfg.playerNames.length < 6 && (
        <button
          onClick={(): void => {
            const COLORS: TeamColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
            const usedColors = new Set(cfg.playerColors);
            const nextColor = COLORS.find((c) => !usedColors.has(c)) ?? 'red';
            setCfg({
              ...cfg,
              playerNames: [...cfg.playerNames, `Player ${cfg.playerNames.length + 1}`],
              playerColors: [...cfg.playerColors, nextColor],
              playerIsAI: [...cfg.playerIsAI, true],
            });
          }}
          className="config-add-player-btn"
          data-testid="add-player-btn"
        >
          + Add Player
        </button>
      )}

      <button
        onClick={(): void => onStart(cfg)}
        className="config-start-btn"
        data-testid="start-game-btn"
      >
        START GAME
      </button>
    </div>
  );
}

// ── Results Screen ───────────────────────────────────────────────────

function ResultsScreen({
  winner,
  onPlayAgain,
  onMenu,
}: {
  readonly winner: string;
  readonly onPlayAgain: () => void;
  readonly onMenu: () => void;
}): React.ReactElement {
  return (
    <div className="overlay results-screen" data-testid="results-screen">
      <h1 className="results-title">{winner} WINS!</h1>
      <div className="results-buttons">
        <button
          onClick={onPlayAgain}
          data-testid="play-again-btn"
          className="results-btn btn-primary"
        >
          Play Again
        </button>
        <button
          onClick={onMenu}
          data-testid="main-menu-btn"
          className="results-btn btn-secondary"
        >
          Main Menu
        </button>
      </div>
    </div>
  );
}

// ── Main App ─────────────────────────────────────────────────────────

export function App(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);
  const gameRef = useRef<GameManager | null>(null);
  const playerNamesRef = useRef<string[]>(['Player 1', 'Player 2']);
  const soundManagerRef = useRef<SoundManager | null>(null);
  const soundDisposeRef = useRef<(() => void) | null>(null);
  const renderStateRef = useRef<RenderState>(createRenderState());

  const [scene, setScene] = useState<AppScene>('menu');
  const [_gameConfig, setGameConfig] = useState<ConfigState | null>(null);
  const [winner, setWinner] = useState('');
  const [settings, setSettings] = useState<GameSettings>({ ...DEFAULT_SETTINGS });
  const settingsRef = useRef<GameSettings>(DEFAULT_SETTINGS);
  const isTouchDevice =
    typeof window !== 'undefined' && ('ontouchstart' in window || navigator.maxTouchPoints > 0);

  const playerColorsRef = useRef<TeamColor[]>(['red', 'blue']);

  const [hudState, setHudState] = useState({
    angle: 45,
    power: 75,
    wind: 5,
    currentPlayer: 'Player 1',
    weapon: 'missile' as string,
    roundNumber: 1,
    maxRounds: 5,
    turnNumber: 1,
    playerColor: '#3498db',
  });
  const [statusMessage, setStatusMessage] = useState('');

  const syncHud = useCallback((): void => {
    const game = gameRef.current;
    if (!game) return;
    const snap = game.getSnapshot();
    const tank = game.getActiveTank();
    if (!tank) return;

    const teamColor = playerColorsRef.current[snap.currentPlayerIndex] ?? 'blue';
    setHudState({
      angle: tank.angle,
      power: tank.power,
      wind: snap.wind,
      currentPlayer:
        playerNamesRef.current[snap.currentPlayerIndex] ?? `Player ${snap.currentPlayerIndex + 1}`,
      weapon: tank.selectedWeapon?.definition.name ?? 'None',
      roundNumber: snap.roundNumber,
      maxRounds: snap.maxRounds,
      turnNumber: snap.turnNumber,
      playerColor: getTeamHexColor(teamColor),
    });
    setStatusMessage(phaseLabel[snap.phase] ?? snap.phase);

    // Detect victory
    if (snap.phase === 'victory') {
      const w = snap.tanks.find((t) => t.state === 'alive');
      const idx = w ? snap.tanks.indexOf(w) : -1;
      setWinner(playerNamesRef.current[idx] ?? 'Unknown');
      setScene('results');
    }
  }, []);

  // ── Input handlers ─────────────────────────────────────────────

  const handleAngleLeft = useCallback((): void => {
    const g = gameRef.current;
    if (!g || g.getSnapshot().phase !== 'turn') return;
    const t = g.getActiveTank();
    if (t) {
      g.setAngle(adjustAngle(t.angle, -ANGLE_STEP));
      syncHud();
    }
  }, [syncHud]);

  const handleAngleRight = useCallback((): void => {
    const g = gameRef.current;
    if (!g || g.getSnapshot().phase !== 'turn') return;
    const t = g.getActiveTank();
    if (t) {
      g.setAngle(adjustAngle(t.angle, ANGLE_STEP));
      syncHud();
    }
  }, [syncHud]);

  const handlePowerUp = useCallback((): void => {
    const g = gameRef.current;
    if (!g || g.getSnapshot().phase !== 'turn') return;
    const t = g.getActiveTank();
    if (t) {
      g.setPower(adjustPower(t.power, POWER_STEP));
      syncHud();
    }
  }, [syncHud]);

  const handlePowerDown = useCallback((): void => {
    const g = gameRef.current;
    if (!g || g.getSnapshot().phase !== 'turn') return;
    const t = g.getActiveTank();
    if (t) {
      g.setPower(adjustPower(t.power, -POWER_STEP));
      syncHud();
    }
  }, [syncHud]);

  const handleFire = useCallback((): void => {
    const g = gameRef.current;
    if (g) {
      g.fire();
      syncHud();
    }
  }, [syncHud]);

  const handleCycleWeapon = useCallback((): void => {
    const g = gameRef.current;
    if (!g || g.getSnapshot().phase !== 'turn') return;
    const t = g.getActiveTank();
    if (t) {
      const cur = t.selectedWeapon?.definition.type ?? 'missile';
      g.setWeapon(cycleWeapon(AVAILABLE_WEAPONS, cur, 1));
      syncHud();
    }
  }, [syncHud]);

  useEffect(() => {
    if (scene !== 'playing') return;
    const handleKeyDown = (e: KeyboardEvent): void => {
      switch (e.key) {
        case 'ArrowLeft':
          handleAngleLeft();
          break;
        case 'ArrowRight':
          handleAngleRight();
          break;
        case 'ArrowUp':
          handlePowerUp();
          break;
        case 'ArrowDown':
          handlePowerDown();
          break;
        case 'Tab':
          e.preventDefault();
          handleCycleWeapon();
          break;
        case ' ':
        case 'Enter':
          e.preventDefault();
          handleFire();
          break;
        case 'Escape':
          gameLoopRef.current?.stop();
          setScene('menu');
          break;
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return (): void => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [
    scene,
    handleAngleLeft,
    handleAngleRight,
    handlePowerUp,
    handlePowerDown,
    handleCycleWeapon,
    handleFire,
  ]);

  // ── Game loop ──────────────────────────────────────────────────

  const lastPhaseRef = useRef<string>('turn');

  const update = useCallback(
    (dt: number): void => {
      const g = gameRef.current;
      if (!g) return;
      lastDtRef.current = dt;
      g.update(dt);
      const snap = g.getSnapshot();
      if (snap.phase !== 'turn' || snap.phase !== lastPhaseRef.current) syncHud();
      lastPhaseRef.current = snap.phase;
    },
    [syncHud],
  );

  const lastDtRef = useRef(1 / 60);

  const render = useCallback((ctx: CanvasRenderingContext2D): void => {
    const g = gameRef.current;
    if (!g) return;
    const snap = g.getSnapshot();
    renderGame(
      ctx,
      snap,
      playerNamesRef.current,
      settingsRef.current.showDamageNumbers,
      settingsRef.current.cameraShake,
      renderStateRef.current,
      lastDtRef.current,
    );
  }, []);

  // ── Scene transitions ──────────────────────────────────────────

  const startGame = useCallback(
    (cfg: ConfigState): void => {
      setGameConfig(cfg);
      playerNamesRef.current = [...cfg.playerNames];
      playerColorsRef.current = [...cfg.playerColors];
      setScene('playing');

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Validate player names — default to "Player N" if empty
      const validNames = cfg.playerNames.map((n, i) => n.trim() || `Player ${i + 1}`);

      const managerConfig: GameManagerConfig = {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        seed: Math.floor(Math.random() * 100000),
        playerNames: validNames,
        playerColors: cfg.playerColors,
        theme: cfg.theme,
        rounds: Math.max(1, cfg.rounds),
        playerIsAI: cfg.playerIsAI,
        aiDifficulty: cfg.aiDifficulty,
        commentary: true,
      };

      gameRef.current = new GameManager(managerConfig);

      // Initialize sound system
      if (!soundManagerRef.current) {
        soundManagerRef.current = new SoundManager();
      }
      soundManagerRef.current.initialize();
      soundManagerRef.current.volume = settingsRef.current.volume;

      // Connect audio bridge (dispose previous if any)
      soundDisposeRef.current?.();
      soundDisposeRef.current = connectSoundToEvents(
        gameRef.current.getEventBus(),
        soundManagerRef.current,
      );

      // Wire render events
      renderStateRef.current = createRenderState();
      const bus = gameRef.current.getEventBus();
      const names = [...validNames];
      const colors = [...cfg.playerColors];

      bus.on('explosion', (event) => {
        const payload = event.payload as ExplosionPayload;
        const config = getExplosionConfig(payload.weaponType);
        triggerShake(renderStateRef.current, Math.min(config.shakeIntensity, 25), 0.3);
        if (config.flashOpacity > 0) {
          triggerScreenFlash(renderStateRef.current, config.flashOpacity);
        }
      });

      bus.on('turn_started', (event) => {
        const payload = event.payload as TurnStartedPayload;
        const idx = names.findIndex((_, i) => `player_${i}` === payload.playerId);
        const name = idx >= 0 ? (names[idx] ?? 'Player') : 'Player';
        const color = idx >= 0 ? getTeamHexColor(colors[idx] ?? 'blue') : '#3498db';
        triggerTurnTransition(renderStateRef.current, name, color);
      });

      bus.on('tank_destroyed', (event) => {
        const payload = event.payload as TankDestroyedPayload;
        const victimIdx = names.findIndex((_, i) => `player_${i}` === payload.tankId.replace('tank_', 'player_'));
        const killerIdx = payload.killerPlayerId
          ? names.findIndex((_, i) => `player_${i}` === payload.killerPlayerId)
          : -1;
        const victimName = victimIdx >= 0 ? (names[victimIdx] ?? 'Unknown') : 'Unknown';
        const killerName = killerIdx >= 0 ? (names[killerIdx] ?? 'Unknown') : 'Unknown';
        triggerKillConfirmation(renderStateRef.current, killerName, victimName, payload.position);
      });

      bus.on('tank_damaged', (event) => {
        const payload = event.payload as TankDamagedPayload;
        const tankSnap = gameRef.current?.getSnapshot().tanks.find((t) => t.id === payload.tankId);
        if (tankSnap) {
          const dmg = createDamageNumber(payload.damage, tankSnap.position, payload.damage >= 50);
          addDamageNumber(renderStateRef.current, dmg);
        }
      });

      syncHud();

      const ctx = canvas.getContext('2d');
      if (!ctx) return;

      gameLoopRef.current?.stop();
      const loop = new GameLoop(update, render);
      gameLoopRef.current = loop;
      loop.start(ctx);
    },
    [syncHud, update, render],
  );

  return (
    <div className="app-root">
      <canvas ref={canvasRef} className="game-canvas" data-testid="game-canvas" tabIndex={0} />

      {scene === 'menu' && (
        <MainMenu
          onStartGame={(): void => setScene('config')}
          onMultiplayer={(): void => setScene('config')}
          onSettings={(): void => setScene('settings')}
        />
      )}

      {scene === 'config' && <ConfigScreen onStart={startGame} />}

      {scene === 'playing' && (
        <>
          <GameHUD
            {...hudState}
            roundNumber={hudState.roundNumber}
            maxRounds={hudState.maxRounds}
            turnNumber={hudState.turnNumber}
            playerColor={hudState.playerColor}
          />
          {isTouchDevice && (
            <TouchControls
              onAngleLeft={handleAngleLeft}
              onAngleRight={handleAngleRight}
              onPowerUp={handlePowerUp}
              onPowerDown={handlePowerDown}
              onFire={handleFire}
              onCycleWeapon={handleCycleWeapon}
              disabled={gameRef.current?.getSnapshot().phase !== 'turn'}
            />
          )}
          <div className="status-bar" data-testid="status-bar">
            {statusMessage} | Turn {gameRef.current?.getSnapshot().turnNumber ?? 1}
          </div>
          {gameRef.current?.getSnapshot().phase === 'shop' && (
            <ShopScreen
              playerName={
                playerNamesRef.current[gameRef.current.getSnapshot().currentPlayerIndex] ?? 'Player'
              }
              playerMoney={
                gameRef.current.getSnapshot().playerMoney[
                  gameRef.current.getSnapshot().currentPlayerIndex
                ] ?? 0
              }
              onBuyWeapon={(w): void => {
                const g = gameRef.current;
                if (!g) return;
                const idx = g.getSnapshot().currentPlayerIndex;
                g.buyWeapon(idx, w.type, w.price);
                syncHud();
              }}
              onBuyDefense={(item): void => {
                const g = gameRef.current;
                if (!g) return;
                const idx = g.getSnapshot().currentPlayerIndex;
                g.buyWeapon(idx, 'baby-missile', item.price);
                syncHud();
              }}
              onReady={(): void => {
                const g = gameRef.current;
                if (!g) return;
                // Mark all human players as ready (simplified — shop shows once for all)
                for (let i = 0; i < g.getSnapshot().tanks.length; i++) {
                  g.shopReady(i);
                }
                syncHud();
              }}
            />
          )}
        </>
      )}

      {scene === 'results' && (
        <ResultsScreen
          winner={winner}
          onPlayAgain={(): void => setScene('config')}
          onMenu={(): void => setScene('menu')}
        />
      )}

      {scene === 'settings' && (
        <div className="settings-screen">
          <SettingsScreen
            settings={settings}
            onUpdate={(s: GameSettings): void => {
              settingsRef.current = s;
              setSettings(s);
            }}
            onBack={(): void => setScene('menu')}
          />
        </div>
      )}
    </div>
  );
}
