import {
  addDamageNumber,
  addScorchMark,
  createRenderState,
  renderGame,
  triggerKillConfirmation,
  triggerScreenFlash,
  triggerMuzzleFlash,
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
import { PlayerStatusStrip, type PlayerStatusInfo } from './hud/PlayerStatusStrip';
import { getExplosionConfig } from '@renderer/weapons/ExplosionVariety';
import { getTeamHexColor } from '@renderer/entities/TankRenderer';
import { MainMenu } from './screens/MainMenu';
import { pickRandomGenerals } from '@shared/constants/generalNames';
import { Scoreboard, type PlayerScore } from './screens/Scoreboard';
import { ShopScreen } from './shop/ShopScreen';
import { SoundManager } from '@audio/SoundManager';
import { TouchControls } from './controls/TouchControls';
import { VictoryScreen } from './screens/VictoryScreen';

import './styles/index.css';

import type { ExplosionPayload, TankDamagedPayload, TankDestroyedPayload, TurnStartedPayload } from '@engine/events/types';
import type { RenderState } from './GameRenderHelpers';
import type { TeamColor } from '@shared/types/entities';
import type { TerrainTheme } from '@shared/types/terrain';
import type { WeaponType } from '@shared/types/weapons';

import { getWeaponDisplay } from '@shared/constants/weaponDisplay';
import { NEW_WEAPONS } from '@engine/weapons/NewWeapons';

type AppScene = 'menu' | 'config' | 'playing' | 'paused' | 'results' | 'settings';

function buildPlayerScores(
  gameManager: GameManager,
  playerNames: readonly string[],
  playerColors: readonly TeamColor[],
): PlayerScore[] {
  const stats = gameManager.getStatsTracker().getAllStats();
  const snap = gameManager.getSnapshot();
  return playerNames.map((name, i) => ({
    name,
    kills: stats[i]?.kills ?? 0,
    deaths: stats[i]?.deaths ?? 0,
    damageDealt: stats[i]?.totalDamageDealt ?? 0,
    money: snap.playerMoney[i] ?? 0,
    roundsWon: stats[i]?.roundsWon ?? 0,
    color: getTeamHexColor(playerColors[i] ?? 'red'),
  }));
}

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
  onBack,
}: {
  readonly onStart: (cfg: ConfigState) => void;
  readonly onBack: () => void;
}): React.ReactElement {
  const [cfg, setCfg] = useState<ConfigState>(() => {
    const names = pickRandomGenerals(2);
    return {
      theme: 'classic',
      playerNames: names,
      playerColors: ['red', 'blue'],
      playerIsAI: [false, true],
      rounds: 5,
      aiDifficulty: 'medium',
    };
  });

  return (
    <div className="overlay config-screen" data-testid="config-screen">
      <h1>GAME SETUP</h1>

      <div className="config-settings-row">
        <label className="config-label">
          Theme:
          <select
            value={cfg.theme}
            onChange={(e): void => setCfg({ ...cfg, theme: e.target.value as TerrainTheme })}
            className="config-select"
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
            className="config-number-input"
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
            className="config-select"
            data-testid="ai-difficulty-select"
          >
            <option value="easy">Easy</option>
            <option value="medium">Medium</option>
            <option value="hard">Hard</option>
            <option value="expert">Expert</option>
          </select>
        </label>
      </div>

      <h2 className="config-section-header">PLAYERS</h2>

      {cfg.playerNames.map((name, i) => (
        <div key={i} className="config-player-row">
          <span
            className="config-color-indicator"
            style={{ background: getTeamHexColor(cfg.playerColors[i] ?? 'red') }}
          />
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
          <label className="config-ai-toggle">
            <input
              type="checkbox"
              className="config-checkbox"
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
            const usedNames = new Set(cfg.playerNames);
            const candidates = pickRandomGenerals(cfg.playerNames.length + 1);
            const newName =
              candidates.find((n) => !usedNames.has(n)) ??
              `Player ${cfg.playerNames.length + 1}`;
            setCfg({
              ...cfg,
              playerNames: [...cfg.playerNames, newName],
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

      <button
        onClick={onBack}
        className="btn btn-ghost config-back-btn"
        data-testid="config-back-btn"
      >
        Back
      </button>
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
  const [playerScores, setPlayerScores] = useState<PlayerScore[]>([]);
  const [showScoreboard, setShowScoreboard] = useState(false);
  const [isTransitioning, setIsTransitioning] = useState(false);
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
      gameLoopRef.current?.stop();
      const scores = buildPlayerScores(gameRef.current!, playerNamesRef.current, playerColorsRef.current);
      setPlayerScores(scores);
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
      // Compute barrel tip for muzzle flash before firing changes state
      const tank = g.getActiveTank();
      if (tank && tank.state === 'alive') {
        const angleRad = ((180 - tank.angle) * Math.PI) / 180;
        const tipX = tank.position.x + Math.cos(angleRad) * 20;
        const tipY = tank.position.y - 15 + Math.sin(angleRad) * -20;
        triggerMuzzleFlash(renderStateRef.current, { x: tipX, y: tipY });
      }
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
        case 's':
        case 'S':
          setShowScoreboard((prev) => !prev);
          break;
        case 'Escape':
          gameLoopRef.current?.stop();
          setScene('paused');
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

  const transitionTo = useCallback((newScene: AppScene): void => {
    setIsTransitioning(true);
    setTimeout(() => {
      setScene(newScene);
      setIsTransitioning(false);
    }, 200);
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
        addScorchMark(
          renderStateRef.current,
          payload.position.x,
          payload.position.y,
          payload.radius,
        );
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
    <div className="app-root" style={{ opacity: isTransitioning ? 0 : 1, transition: 'opacity 200ms ease-in-out' }}>
      <canvas ref={canvasRef} className="game-canvas" data-testid="game-canvas" tabIndex={0} />

      {scene === 'menu' && (
        <MainMenu
          onStartGame={(): void => transitionTo('config')}
          onMultiplayer={(): void => { /* Coming Soon */ }}
          onSettings={(): void => transitionTo('settings')}
        />
      )}

      {scene === 'config' && <ConfigScreen onStart={startGame} onBack={(): void => transitionTo('menu')} />}

      {scene === 'playing' && (
        <>
          {gameRef.current?.getSnapshot().phase !== 'shop' && (
            <GameHUD
              {...hudState}
              roundNumber={hudState.roundNumber}
              maxRounds={hudState.maxRounds}
              turnNumber={hudState.turnNumber}
              playerColor={hudState.playerColor}
              weapons={AVAILABLE_WEAPONS.map((type) => {
                const ext = NEW_WEAPONS.find((w) => w.type === type);
                const display = getWeaponDisplay(type);
                return {
                  name: `${display.emoji} ${display.shortName}`,
                  type,
                  ammo: 99,
                  selected: type === (gameRef.current?.getActiveTank()?.selectedWeapon?.definition.type ?? 'missile'),
                  tier: ext?.tier ?? 'free',
                };
              })}
              onSelectWeapon={(type): void => {
                const g = gameRef.current;
                if (g && g.getSnapshot().phase === 'turn') {
                  g.setWeapon(type as WeaponType);
                  syncHud();
                }
              }}
              isTurn={gameRef.current?.getSnapshot().phase === 'turn'}
            />
          )}
          {gameRef.current?.getSnapshot().phase !== 'shop' && gameRef.current && (
            <PlayerStatusStrip
              players={gameRef.current.getSnapshot().tanks.map((t, i): PlayerStatusInfo => ({
                name: playerNamesRef.current[i] ?? `Player ${i + 1}`,
                health: t.health,
                maxHealth: t.maxHealth,
                color: getTeamHexColor(playerColorsRef.current[i] ?? 'red'),
                isAlive: t.state === 'alive',
                isActive: i === gameRef.current!.getSnapshot().currentPlayerIndex,
              }))}
            />
          )}
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
          {gameRef.current?.getSnapshot().phase !== 'shop' && (
            <div className="status-bar" data-testid="status-bar">
              {statusMessage} | Turn {gameRef.current?.getSnapshot().turnNumber ?? 1}
            </div>
          )}
          {showScoreboard && gameRef.current && (
            <div
              style={{
                position: 'absolute',
                top: '50%',
                left: '50%',
                transform: 'translate(-50%, -50%)',
                background: 'rgba(0,0,0,0.85)',
                borderRadius: 12,
                padding: 16,
                zIndex: 25,
                minWidth: 400,
              }}
              data-testid="scoreboard-overlay"
            >
              <Scoreboard
                scores={buildPlayerScores(gameRef.current, playerNamesRef.current, playerColorsRef.current)}
                currentRound={gameRef.current.getSnapshot().roundNumber}
                maxRounds={gameRef.current.getSnapshot().maxRounds}
              />
            </div>
          )}
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
                const idx = g.getSnapshot().currentPlayerIndex;
                g.shopReady(idx);
                syncHud();
              }}
            />
          )}
        </>
      )}

      {scene === 'paused' && (
        <div className="pause-overlay" data-testid="pause-overlay">
          <h1>PAUSED</h1>
          <button
            onClick={(): void => {
              setScene('playing');
              const canvas = canvasRef.current;
              if (canvas) {
                const ctx = canvas.getContext('2d');
                if (ctx && gameLoopRef.current) {
                  gameLoopRef.current.start(ctx);
                }
              }
            }}
            className="btn btn-primary"
            style={{ marginBottom: 12, padding: '12px 32px', fontSize: 18 }}
            data-testid="resume-btn"
          >
            Resume
          </button>
          <button
            onClick={(): void => {
              gameLoopRef.current?.stop();
              transitionTo('menu');
            }}
            className="btn btn-danger"
            style={{ padding: '12px 32px', fontSize: 18 }}
            data-testid="quit-btn"
          >
            Quit to Menu
          </button>
        </div>
      )}

      {scene === 'results' && (
        <VictoryScreen
          winner={playerScores.find((s) => s.name === winner) ?? null}
          scores={playerScores}
          onPlayAgain={(): void => transitionTo('config')}
          onMainMenu={(): void => transitionTo('menu')}
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
            onBack={(): void => transitionTo('menu')}
          />
        </div>
      )}
    </div>
  );
}
