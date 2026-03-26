import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import React from 'react';
import { SceneRenderer } from '@ui/SceneRenderer';

describe('SceneRenderer', () => {
  it('should render canvas', () => {
    const ref = React.createRef<HTMLCanvasElement>();
    render(<SceneRenderer currentScene="playing" canvasRef={ref} />);
    expect(screen.getByTestId('game-canvas')).toBeDefined();
  });

  it('should show title on main menu', () => {
    const ref = React.createRef<HTMLCanvasElement>();
    render(<SceneRenderer currentScene="main-menu" canvasRef={ref} />);
    expect(screen.getByTestId('scene-main-menu')).toBeDefined();
    expect(screen.getByText('AUTO TANK')).toBeDefined();
  });

  it('should show game over on results', () => {
    const ref = React.createRef<HTMLCanvasElement>();
    render(<SceneRenderer currentScene="results" canvasRef={ref} />);
    expect(screen.getByTestId('scene-results')).toBeDefined();
    expect(screen.getByText('GAME OVER')).toBeDefined();
  });

  it('should not show overlays during playing', () => {
    const ref = React.createRef<HTMLCanvasElement>();
    render(<SceneRenderer currentScene="playing" canvasRef={ref} />);
    expect(screen.queryByTestId('scene-main-menu')).toBeNull();
    expect(screen.queryByTestId('scene-results')).toBeNull();
  });
});
