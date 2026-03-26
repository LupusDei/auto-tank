import { adjustAngle, adjustPower, cycleWeapon } from '@engine/input/TankControls';
import { GameManager, type GameManagerConfig } from '@engine/GameManager';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameHUD } from './hud/GameHUD';
import { GameLoop } from '@engine/GameLoop';
import { MainMenu } from './screens/MainMenu';
import { renderMoneyPopups } from '@renderer/feedback/MoneyPopup';
import { renderProjectile } from '@renderer/entities/ProjectileRenderer';
import { renderSky } from '@renderer/sky/SkyRenderer';
import { renderTankWithHealth } from '@renderer/entities/TankRenderer';
import { renderTerrain } from '@renderer/terrain/TerrainRenderer';
import type { TeamColor } from '@shared/types/entities';
import type { TerrainTheme } from '@shared/types/terrain';
import type { WeaponType } from '@shared/types/weapons';

type AppScene = 'menu' | 'config' | 'playing' | 'results';

const appStyle: React.CSSProperties = {
  width: '100vw',
  height: '100vh',
  position: 'relative',
  overflow: 'hidden',
  background: '#000',
};

const canvasStyle: React.CSSProperties = {
  display: 'block',
  width: '100%',
  height: '100%',
};

const AVAILABLE_WEAPONS: WeaponType[] = ['baby-missile', 'missile', 'mirv', 'nuke', 'napalm'];
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
}

const configOverlay: React.CSSProperties = {
  position: 'absolute',
  inset: 0,
  display: 'flex',
  flexDirection: 'column',
  alignItems: 'center',
  justifyContent: 'center',
  background: 'rgba(0,0,0,0.9)',
  color: '#fff',
  fontFamily: "'Courier New', monospace",
  zIndex: 30,
};

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
  });

  return (
    <div style={configOverlay} data-testid="config-screen">
      <h1 style={{ fontSize: 36, marginBottom: 24 }}>GAME SETUP</h1>

      <label style={{ marginBottom: 8 }}>
        Theme:
        <select
          value={cfg.theme}
          onChange={(e): void => setCfg({ ...cfg, theme: e.target.value as TerrainTheme })}
          style={{ marginLeft: 8, padding: 4 }}
          data-testid="theme-select"
        >
          <option value="classic">Classic</option>
          <option value="desert">Desert</option>
          <option value="arctic">Arctic</option>
          <option value="volcanic">Volcanic</option>
          <option value="lunar">Lunar</option>
        </select>
      </label>

      <label style={{ marginBottom: 8 }}>
        Rounds:
        <input
          type="number"
          min={1}
          max={20}
          value={cfg.rounds}
          onChange={(e): void => setCfg({ ...cfg, rounds: Number(e.target.value) })}
          style={{ marginLeft: 8, width: 50, padding: 4 }}
          data-testid="rounds-input"
        />
      </label>

      {cfg.playerNames.map((name, i) => (
        <div key={i} style={{ display: 'flex', gap: 8, marginBottom: 4, alignItems: 'center' }}>
          <input
            value={name}
            onChange={(e): void => {
              const names = [...cfg.playerNames];
              names[i] = e.target.value;
              setCfg({ ...cfg, playerNames: names });
            }}
            style={{ padding: 4, width: 120 }}
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
        </div>
      ))}

      <button
        onClick={(): void => onStart(cfg)}
        style={{
          marginTop: 24,
          padding: '12px 32px',
          fontSize: 18,
          cursor: 'pointer',
          background: '#2ecc71',
          border: 'none',
          borderRadius: 8,
          fontWeight: 'bold',
        }}
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
    <div style={{ ...configOverlay, gap: 16 }} data-testid="results-screen">
      <h1 style={{ fontSize: 48, color: '#ffcc00' }}>{winner} WINS!</h1>
      <div style={{ display: 'flex', gap: 16, marginTop: 24 }}>
        <button
          onClick={onPlayAgain}
          data-testid="play-again-btn"
          style={{
            padding: '12px 24px',
            fontSize: 16,
            cursor: 'pointer',
            background: '#2ecc71',
            border: 'none',
            borderRadius: 8,
          }}
        >
          Play Again
        </button>
        <button
          onClick={onMenu}
          data-testid="main-menu-btn"
          style={{
            padding: '12px 24px',
            fontSize: 16,
            cursor: 'pointer',
            background: '#3498db',
            border: 'none',
            borderRadius: 8,
          }}
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

  const [scene, setScene] = useState<AppScene>('menu');
  const [gameConfig, setGameConfig] = useState<ConfigState | null>(null);
  const [winner, setWinner] = useState('');

  const [hudState, setHudState] = useState({
    angle: 45,
    power: 75,
    wind: 5,
    currentPlayer: 'Player 1',
    weapon: 'missile' as string,
  });
  const [statusMessage, setStatusMessage] = useState('');

  const syncHud = useCallback((): void => {
    const game = gameRef.current;
    if (!game) return;
    const snap = game.getSnapshot();
    const tank = game.getActiveTank();
    if (!tank) return;

    setHudState({
      angle: tank.angle,
      power: tank.power,
      wind: snap.wind,
      currentPlayer:
        snap.currentPlayerIndex === 0
          ? (gameConfig?.playerNames[0] ?? 'P1')
          : (gameConfig?.playerNames[1] ?? 'P2'),
      weapon: tank.selectedWeapon?.definition.name ?? 'None',
    });
    setStatusMessage(phaseLabel[snap.phase] ?? snap.phase);

    // Detect victory
    if (snap.phase === 'victory') {
      const w = snap.tanks.find((t) => t.state === 'alive');
      const idx = w ? snap.tanks.indexOf(w) : -1;
      setWinner(gameConfig?.playerNames[idx] ?? 'Unknown');
      setScene('results');
    }
  }, [gameConfig]);

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
      g.update(dt);
      const snap = g.getSnapshot();
      if (snap.phase !== 'turn' || snap.phase !== lastPhaseRef.current) syncHud();
      lastPhaseRef.current = snap.phase;
    },
    [syncHud],
  );

  const render = useCallback(
    (ctx: CanvasRenderingContext2D): void => {
      const g = gameRef.current;
      if (!g) return;
      const snap = g.getSnapshot();
      const canvas = ctx.canvas;

      ctx.save();
      renderSky(ctx, canvas.width, canvas.height);
      renderTerrain(ctx, snap.terrain, canvas.height);

      for (const tank of snap.tanks) {
        if (tank.state === 'destroyed') continue;
        renderTankWithHealth(
          ctx,
          { x: tank.position.x, y: tank.position.y, angle: tank.angle, color: tank.color },
          tank.health,
          tank.maxHealth,
        );
      }

      for (const proj of snap.projectiles) {
        if (proj.state === 'done') continue;
        renderProjectile(ctx, { position: proj.position, trail: proj.trail });
      }

      const now = performance.now();
      for (const effect of snap.activeEffects) {
        const elapsed = now - effect.startTime;
        if (!effect.isComplete(elapsed)) effect.render(ctx, elapsed);
      }

      // Money popups
      renderMoneyPopups(ctx, snap.moneyPopups);

      // Turn indicator
      if (snap.phase === 'turn') {
        const at = snap.tanks[snap.currentPlayerIndex];
        if (at?.state === 'alive') {
          ctx.fillStyle = '#fff';
          ctx.font = '12px monospace';
          ctx.textAlign = 'center';
          ctx.fillText('▼', at.position.x, at.position.y - 35);
        }
      }

      // Victory overlay
      if (snap.phase === 'victory') {
        ctx.fillStyle = 'rgba(0,0,0,0.5)';
        ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
        ctx.fillStyle = '#ffcc00';
        ctx.font = 'bold 48px monospace';
        ctx.textAlign = 'center';
        const w = snap.tanks.find((t) => t.state === 'alive');
        const name = w ? (gameConfig?.playerNames[snap.tanks.indexOf(w)] ?? 'Winner') : 'Draw';
        ctx.fillText(`${name} WINS!`, canvas.width / 2, canvas.height / 2 + 15);
      }

      ctx.restore();
    },
    [gameConfig],
  );

  // ── Scene transitions ──────────────────────────────────────────

  const startGame = useCallback(
    (cfg: ConfigState): void => {
      setGameConfig(cfg);
      setScene('playing');

      const canvas = canvasRef.current;
      if (!canvas) return;
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      const managerConfig: GameManagerConfig = {
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        seed: Math.floor(Math.random() * 100000),
        playerNames: cfg.playerNames,
        playerColors: cfg.playerColors,
        theme: cfg.theme,
        rounds: cfg.rounds,
        playerIsAI: cfg.playerIsAI,
        commentary: true,
      };

      gameRef.current = new GameManager(managerConfig);
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
    <div style={appStyle}>
      <canvas ref={canvasRef} style={canvasStyle} data-testid="game-canvas" tabIndex={0} />

      {scene === 'menu' && (
        <MainMenu
          onStartGame={(): void => setScene('config')}
          onMultiplayer={(): void => setScene('config')}
          onSettings={(): void => {
            /* TODO */
          }}
        />
      )}

      {scene === 'config' && <ConfigScreen onStart={startGame} />}

      {scene === 'playing' && (
        <>
          <GameHUD {...hudState} />
          <div
            style={{
              position: 'absolute',
              bottom: 16,
              left: '50%',
              transform: 'translateX(-50%)',
              background: 'rgba(0,0,0,0.6)',
              backdropFilter: 'blur(8px)',
              borderRadius: 8,
              padding: '8px 20px',
              color: '#ffcc00',
              fontFamily: "'Courier New', monospace",
              fontSize: 14,
              zIndex: 10,
              border: '1px solid rgba(255,204,0,0.3)',
            }}
            data-testid="status-bar"
          >
            {statusMessage} | Turn {gameRef.current?.getSnapshot().turnNumber ?? 1}
          </div>
        </>
      )}

      {scene === 'results' && (
        <ResultsScreen
          winner={winner}
          onPlayAgain={(): void => setScene('config')}
          onMenu={(): void => setScene('menu')}
        />
      )}
    </div>
  );
}
