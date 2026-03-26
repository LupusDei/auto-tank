import { adjustAngle, adjustPower, cycleWeapon } from '@engine/input/TankControls';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameHUD } from './hud/GameHUD';
import { GameLoop } from '@engine/GameLoop';
import { GameManager } from '@engine/GameManager';
import { renderProjectile } from '@renderer/entities/ProjectileRenderer';
import { renderSky } from '@renderer/sky/SkyRenderer';
import { renderTankWithHealth } from '@renderer/entities/TankRenderer';
import { renderTerrain } from '@renderer/terrain/TerrainRenderer';
import type { WeaponType } from '@shared/types/weapons';

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

export function App(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);
  const gameRef = useRef<GameManager | null>(null);

  const [hudState, setHudState] = useState({
    angle: 45,
    power: 75,
    wind: 5,
    currentPlayer: 'Player 1',
    weapon: 'missile' as string,
  });

  const [statusMessage, setStatusMessage] = useState('Press SPACE to fire!');

  // Sync HUD with game state
  const syncHud = useCallback((): void => {
    const game = gameRef.current;
    if (!game) return;
    const snap = game.getSnapshot();
    const tank = game.getActiveTank();
    if (!tank) return;

    const playerName = snap.currentPlayerIndex === 0 ? 'Player 1' : 'Player 2';
    const weaponName = tank.selectedWeapon?.definition.name ?? 'None';

    setHudState({
      angle: tank.angle,
      power: tank.power,
      wind: snap.wind,
      currentPlayer: playerName,
      weapon: weaponName,
    });

    setStatusMessage(phaseLabel[snap.phase] ?? snap.phase);
  }, []);

  // Keyboard handler
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent): void => {
      const game = gameRef.current;
      if (!game) return;
      const snap = game.getSnapshot();

      // Only allow input during 'turn' phase
      if (snap.phase !== 'turn') return;

      switch (e.key) {
        case 'ArrowLeft': {
          const tank = game.getActiveTank();
          if (!tank) break;
          const newAngle = adjustAngle(tank.angle, -ANGLE_STEP);
          game.setAngle(newAngle);
          syncHud();
          break;
        }
        case 'ArrowRight': {
          const tank = game.getActiveTank();
          if (!tank) break;
          const newAngle = adjustAngle(tank.angle, ANGLE_STEP);
          game.setAngle(newAngle);
          syncHud();
          break;
        }
        case 'ArrowUp': {
          const tank = game.getActiveTank();
          if (!tank) break;
          const newPower = adjustPower(tank.power, POWER_STEP);
          game.setPower(newPower);
          syncHud();
          break;
        }
        case 'ArrowDown': {
          const tank = game.getActiveTank();
          if (!tank) break;
          const newPower = adjustPower(tank.power, -POWER_STEP);
          game.setPower(newPower);
          syncHud();
          break;
        }
        case 'Tab': {
          e.preventDefault();
          const tank = game.getActiveTank();
          if (!tank) break;
          const currentWeapon = tank.selectedWeapon?.definition.type ?? 'missile';
          const newWeapon = cycleWeapon(AVAILABLE_WEAPONS, currentWeapon, 1);
          game.setWeapon(newWeapon);
          syncHud();
          break;
        }
        case ' ':
        case 'Enter': {
          e.preventDefault();
          game.fire();
          syncHud();
          break;
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return (): void => {
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [syncHud]);

  const lastPhaseRef = useRef<string>('turn');

  const update = useCallback(
    (dt: number): void => {
      const game = gameRef.current;
      if (!game) return;
      game.update(dt);

      // Sync HUD every frame during animations and on phase transitions
      const snap = game.getSnapshot();
      if (snap.phase !== 'turn' || snap.phase !== lastPhaseRef.current) {
        syncHud();
      }
      lastPhaseRef.current = snap.phase;
    },
    [syncHud],
  );

  const render = useCallback((ctx: CanvasRenderingContext2D): void => {
    const game = gameRef.current;
    if (!game) return;
    const snap = game.getSnapshot();
    const canvas = ctx.canvas;

    // Apply screen shake during explosions
    ctx.save();

    // Draw sky
    renderSky(ctx, canvas.width, canvas.height);

    // Draw terrain (updates with craters)
    renderTerrain(ctx, snap.terrain, canvas.height);

    // Draw tanks with health bars
    for (const tank of snap.tanks) {
      if (tank.state === 'destroyed') continue;
      renderTankWithHealth(
        ctx,
        {
          x: tank.position.x,
          y: tank.position.y,
          angle: tank.angle,
          color: tank.color,
        },
        tank.health,
        tank.maxHealth,
      );
    }

    // Draw projectiles
    for (const proj of snap.projectiles) {
      if (proj.state === 'done') continue;
      renderProjectile(ctx, {
        position: proj.position,
        trail: proj.trail,
      });
    }

    // Draw active explosion effects
    const now = performance.now();
    for (const effect of snap.activeEffects) {
      const elapsed = now - effect.startTime;
      if (!effect.isComplete(elapsed)) {
        effect.render(ctx, elapsed);
      }
    }

    // Draw phase indicator
    if (snap.phase === 'victory') {
      ctx.fillStyle = 'rgba(0, 0, 0, 0.5)';
      ctx.fillRect(0, canvas.height / 2 - 40, canvas.width, 80);
      ctx.fillStyle = '#ffcc00';
      ctx.font = 'bold 48px monospace';
      ctx.textAlign = 'center';
      const winner = snap.tanks.find((t) => t.state === 'alive');
      const winnerName = winner?.color === 'red' ? 'Player 1' : 'Player 2';
      ctx.fillText(`${winnerName} WINS!`, canvas.width / 2, canvas.height / 2 + 15);
    }

    // Draw active player indicator
    if (snap.phase === 'turn') {
      const activeTank = snap.tanks[snap.currentPlayerIndex];
      if (activeTank && activeTank.state === 'alive') {
        ctx.fillStyle = '#ffffff';
        ctx.font = '12px monospace';
        ctx.textAlign = 'center';
        ctx.fillText('▼', activeTank.position.x, activeTank.position.y - 35);
      }
    }

    ctx.restore();
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const initCanvas = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Create or recreate game manager
      gameRef.current = new GameManager({
        canvasWidth: canvas.width,
        canvasHeight: canvas.height,
        seed: 42,
        playerNames: ['Player 1', 'Player 2'],
        playerColors: ['red', 'blue'],
      });

      syncHud();
    };

    initCanvas();
    window.addEventListener('resize', initCanvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = new GameLoop(update, render);
    gameLoopRef.current = loop;
    loop.start(ctx);

    return (): void => {
      loop.stop();
      window.removeEventListener('resize', initCanvas);
    };
  }, [update, render, syncHud]);

  return (
    <div style={appStyle}>
      <canvas ref={canvasRef} style={canvasStyle} data-testid="game-canvas" tabIndex={0} />
      <GameHUD {...hudState} />
      <div
        style={{
          position: 'absolute',
          bottom: 16,
          left: '50%',
          transform: 'translateX(-50%)',
          background: 'rgba(0, 0, 0, 0.6)',
          backdropFilter: 'blur(8px)',
          borderRadius: 8,
          padding: '8px 20px',
          color: '#ffcc00',
          fontFamily: "'Courier New', monospace",
          fontSize: 14,
          zIndex: 10,
          border: '1px solid rgba(255, 204, 0, 0.3)',
        }}
        data-testid="status-bar"
      >
        {statusMessage} | Turn {gameRef.current?.getSnapshot().turnNumber ?? 1}
      </div>
    </div>
  );
}
