import React, { useCallback, useEffect, useRef, useState } from 'react';
import { GameHUD } from './hud/GameHUD';
import { GameLoop } from '@engine/GameLoop';
import { generateTerrain } from '@engine/terrain';
import { renderSky } from '@renderer/sky/SkyRenderer';
import { renderTank } from '@renderer/entities/TankRenderer';
import { renderTerrain } from '@renderer/terrain/TerrainRenderer';
import type { TerrainData } from '@shared/types/terrain';

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

export function App(): React.ReactElement {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const gameLoopRef = useRef<GameLoop | null>(null);
  const terrainRef = useRef<TerrainData | null>(null);
  const [hudState] = useState({
    angle: 45,
    power: 75,
    wind: 5,
    currentPlayer: 'Player 1',
    weapon: 'Missile',
  });

  const update = useCallback((_dt: number) => {
    // Game logic updates will go here
  }, []);

  const render = useCallback((ctx: CanvasRenderingContext2D) => {
    const canvas = ctx.canvas;
    renderSky(ctx, canvas.width, canvas.height);

    if (terrainRef.current) {
      renderTerrain(ctx, terrainRef.current, canvas.height);

      // Render a demo tank
      const tankX = Math.floor(canvas.width * 0.3);
      const terrainHeight = terrainRef.current.heightMap[tankX] ?? canvas.height * 0.4;
      renderTank(ctx, {
        x: tankX,
        y: canvas.height - terrainHeight,
        angle: 45,
        color: 'red',
      });

      // Render a second demo tank
      const tank2X = Math.floor(canvas.width * 0.7);
      const terrain2Height = terrainRef.current.heightMap[tank2X] ?? canvas.height * 0.4;
      renderTank(ctx, {
        x: tank2X,
        y: canvas.height - terrain2Height,
        angle: 135,
        color: 'blue',
      });
    }
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const resizeCanvas = (): void => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;

      // Regenerate terrain for new width
      terrainRef.current = generateTerrain({
        width: canvas.width,
        height: canvas.height,
        seed: 42,
        roughness: 0.6,
        theme: 'classic',
      });
    };

    resizeCanvas();
    window.addEventListener('resize', resizeCanvas);

    const ctx = canvas.getContext('2d');
    if (!ctx) return;

    const loop = new GameLoop(update, render);
    gameLoopRef.current = loop;
    loop.start(ctx);

    return (): void => {
      loop.stop();
      window.removeEventListener('resize', resizeCanvas);
    };
  }, [update, render]);

  return (
    <div style={appStyle}>
      <canvas ref={canvasRef} style={canvasStyle} data-testid="game-canvas" />
      <GameHUD {...hudState} />
    </div>
  );
}
