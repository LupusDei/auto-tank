import React from 'react';
import type { SceneId } from '@engine/scene/SceneManager';

export interface SceneRendererProps {
  readonly currentScene: SceneId | null;
  readonly canvasRef: React.RefObject<HTMLCanvasElement | null>;
}

const overlayStyle: React.CSSProperties = {
  position: 'absolute',
  top: 0,
  left: 0,
  width: '100%',
  height: '100%',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
  color: '#fff',
  fontFamily: "'Courier New', monospace",
  zIndex: 20,
  pointerEvents: 'none',
};

const titleStyle: React.CSSProperties = {
  fontSize: 48,
  fontWeight: 'bold',
  textShadow: '0 2px 10px rgba(0,0,0,0.5)',
};

/** Renders scene-specific UI overlays on top of the canvas. */
export function SceneRenderer({ currentScene, canvasRef }: SceneRendererProps): React.ReactElement {
  return (
    <>
      <canvas
        ref={canvasRef}
        style={{ display: 'block', width: '100%', height: '100%' }}
        data-testid="game-canvas"
      />
      {currentScene === 'main-menu' && (
        <div style={overlayStyle} data-testid="scene-main-menu">
          <div style={titleStyle}>AUTO TANK</div>
        </div>
      )}
      {currentScene === 'results' && (
        <div style={overlayStyle} data-testid="scene-results">
          <div style={titleStyle}>GAME OVER</div>
        </div>
      )}
    </>
  );
}
