import React, { useEffect, useRef } from 'react';

export interface MainMenuProps {
  readonly onStartGame: () => void;
  readonly onMultiplayer: () => void;
  readonly onSettings: () => void;
}

/** Generate a simple terrain silhouette for the menu background. */
function generateMenuTerrain(width: number): number[] {
  const points: number[] = [];
  let y = 0.6;
  for (let x = 0; x < width; x++) {
    y += (Math.sin(x * 0.008) * 0.002 + Math.sin(x * 0.023) * 0.001 + Math.sin(x * 0.05) * 0.0005);
    points.push(Math.max(0.5, Math.min(0.75, y)));
  }
  return points;
}

/** Render the animated menu background on a canvas. */
function renderMenuBackground(
  ctx: CanvasRenderingContext2D,
  terrain: number[],
  elapsed: number,
): void {
  const { width, height } = ctx.canvas;

  // Sky gradient — dark blue to deep purple
  const grad = ctx.createLinearGradient(0, 0, 0, height);
  grad.addColorStop(0, '#0a0a2e');
  grad.addColorStop(0.4, '#1a1040');
  grad.addColorStop(0.7, '#2a1535');
  grad.addColorStop(1, '#0d0d1a');
  ctx.fillStyle = grad;
  ctx.fillRect(0, 0, width, height);

  // Stars
  ctx.fillStyle = '#ffffff';
  for (let i = 0; i < 80; i++) {
    const sx = ((i * 137 + 51) % width);
    const sy = ((i * 97 + 23) % (height * 0.5));
    const twinkle = 0.3 + 0.7 * Math.abs(Math.sin(elapsed * 0.5 + i * 2.1));
    ctx.globalAlpha = twinkle * 0.8;
    const size = (i % 3 === 0) ? 2 : 1;
    ctx.fillRect(sx, sy, size, size);
  }
  ctx.globalAlpha = 1;

  // Floating projectile arcs — 3 arcs at different phases
  for (let a = 0; a < 3; a++) {
    const phase = elapsed * 0.3 + a * 2.1;
    const arcProgress = (phase % 3) / 3;
    const startX = (a * 0.3 + 0.1) * width;
    const arcWidth = width * 0.25;

    ctx.save();
    ctx.strokeStyle = a === 0 ? '#ff6600' : a === 1 ? '#ffcc00' : '#3498db';
    ctx.lineWidth = 2;
    ctx.globalAlpha = 0.4 * (1 - arcProgress);

    ctx.beginPath();
    const steps = Math.floor(arcProgress * 40);
    for (let s = 0; s <= steps; s++) {
      const t = s / 40;
      const px = startX + t * arcWidth;
      const py = height * 0.35 - Math.sin(t * Math.PI) * height * 0.2;
      if (s === 0) ctx.moveTo(px, py);
      else ctx.lineTo(px, py);
    }
    ctx.stroke();

    // Projectile head
    if (steps > 0) {
      const headT = steps / 40;
      const hx = startX + headT * arcWidth;
      const hy = height * 0.35 - Math.sin(headT * Math.PI) * height * 0.2;
      ctx.beginPath();
      ctx.arc(hx, hy, 3, 0, Math.PI * 2);
      ctx.fillStyle = ctx.strokeStyle;
      ctx.globalAlpha = 0.8 * (1 - arcProgress);
      ctx.fill();
    }
    ctx.restore();
  }

  // Terrain silhouette
  const terrainGrad = ctx.createLinearGradient(0, height * 0.6, 0, height);
  terrainGrad.addColorStop(0, '#1a2a15');
  terrainGrad.addColorStop(1, '#0a1508');
  ctx.fillStyle = terrainGrad;
  ctx.beginPath();
  ctx.moveTo(0, height);
  for (let x = 0; x < terrain.length; x++) {
    const h = terrain[x] ?? 0.65;
    ctx.lineTo(x, height * h);
  }
  ctx.lineTo(width, height);
  ctx.closePath();
  ctx.fill();

  // Terrain edge glow
  ctx.strokeStyle = '#2a5a1a';
  ctx.lineWidth = 1;
  ctx.globalAlpha = 0.5;
  ctx.beginPath();
  for (let x = 0; x < terrain.length; x++) {
    const h = terrain[x] ?? 0.65;
    if (x === 0) ctx.moveTo(x, height * h);
    else ctx.lineTo(x, height * h);
  }
  ctx.stroke();
  ctx.globalAlpha = 1;
}

export function MainMenu({
  onStartGame,
  onMultiplayer,
  onSettings,
}: MainMenuProps): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const animRef = useRef(0);
  const terrainRef = useRef<number[]>([]);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
    terrainRef.current = generateMenuTerrain(canvas.width);

    const start = performance.now();
    const tick = (): void => {
      const elapsed = (performance.now() - start) / 1000;
      renderMenuBackground(ctx, terrainRef.current, elapsed);
      animRef.current = requestAnimationFrame(tick);
    };
    animRef.current = requestAnimationFrame(tick);

    return (): void => cancelAnimationFrame(animRef.current);
  }, []);

  return (
    <div className="overlay main-menu" data-testid="main-menu">
      <canvas
        ref={canvasRef}
        style={{ position: 'absolute', inset: 0, zIndex: 0 }}
      />
      <div className="main-menu-content">
        <h1 className="main-menu-title">AUTO TANK</h1>
        <div className="main-menu-buttons">
          <button className="btn-ghost" data-testid="btn-start" onClick={onStartGame}>
            Start Game
          </button>
          <button
            className="btn-ghost btn-disabled"
            data-testid="btn-multiplayer"
            onClick={onMultiplayer}
            disabled
            title="Coming Soon"
          >
            Multiplayer
            <span className="coming-soon-badge">SOON</span>
          </button>
          <button className="btn-ghost" data-testid="btn-settings" onClick={onSettings}>
            Settings
          </button>
        </div>
        <p className="main-menu-subtitle">Scorched Earth + Worms Armageddon</p>
      </div>
    </div>
  );
}
