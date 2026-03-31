import { describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';
import { VictoryScreen } from '@ui/screens/VictoryScreen';

const winner = {
  name: 'Alice',
  kills: 5,
  deaths: 1,
  damageDealt: 300,
  money: 8000,
  roundsWon: 3,
  color: 'red',
};
const scores = [
  winner,
  { name: 'Bob', kills: 2, deaths: 3, damageDealt: 150, money: 3000, roundsWon: 1, color: 'blue' },
];

describe('VictoryScreen', () => {
  it('should show winner name', () => {
    render(
      <VictoryScreen winner={winner} scores={scores} onPlayAgain={vi.fn()} onMainMenu={vi.fn()} />,
    );
    expect(screen.getByText('Alice Wins!')).toBeDefined();
    expect(screen.getByTestId('winner-name')).toBeDefined();
  });

  it('should show Draw when no winner', () => {
    render(
      <VictoryScreen winner={null} scores={scores} onPlayAgain={vi.fn()} onMainMenu={vi.fn()} />,
    );
    expect(screen.getByText('Draw!')).toBeDefined();
  });

  it('should call onPlayAgain', () => {
    const fn = vi.fn();
    render(<VictoryScreen winner={winner} scores={scores} onPlayAgain={fn} onMainMenu={vi.fn()} />);
    fireEvent.click(screen.getByTestId('btn-play-again'));
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should call onMainMenu', () => {
    const fn = vi.fn();
    render(<VictoryScreen winner={winner} scores={scores} onPlayAgain={vi.fn()} onMainMenu={fn} />);
    fireEvent.click(screen.getByTestId('btn-main-menu'));
    expect(fn).toHaveBeenCalledOnce();
  });

  it('should show final scores', () => {
    render(
      <VictoryScreen winner={winner} scores={scores} onPlayAgain={vi.fn()} onMainMenu={vi.fn()} />,
    );
    expect(screen.getByTestId('final-score-Alice')).toBeDefined();
    expect(screen.getByTestId('final-score-Bob')).toBeDefined();
  });

  it('should show match achievements when provided', () => {
    const achievements = { Alice: ['first-blood', 'overkill'] };
    render(
      <VictoryScreen
        winner={winner}
        scores={scores}
        onPlayAgain={vi.fn()}
        onMainMenu={vi.fn()}
        matchAchievements={achievements}
      />,
    );
    expect(screen.getByTestId('match-achievements')).toBeDefined();
    expect(screen.getByTestId('victory-ach-first-blood')).toBeDefined();
    expect(screen.getByTestId('victory-ach-overkill')).toBeDefined();
  });

  it('should not show achievements section when no achievements unlocked', () => {
    render(
      <VictoryScreen
        winner={winner}
        scores={scores}
        onPlayAgain={vi.fn()}
        onMainMenu={vi.fn()}
        matchAchievements={{}}
      />,
    );
    expect(screen.queryByTestId('match-achievements')).toBeNull();
  });
});
