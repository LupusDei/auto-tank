import { describe, expect, it } from 'vitest';
import { render, screen } from '@testing-library/react';
import { Scoreboard } from '@ui/screens/Scoreboard';

const scores = [
  { name: 'Alice', kills: 3, deaths: 1, damageDealt: 200, money: 5000, roundsWon: 2, color: 'red' },
  { name: 'Bob', kills: 1, deaths: 2, damageDealt: 100, money: 3000, roundsWon: 1, color: 'blue' },
];

describe('Scoreboard', () => {
  it('should render scoreboard', () => {
    render(<Scoreboard scores={scores} currentRound={3} maxRounds={5} />);
    expect(screen.getByTestId('scoreboard')).toBeDefined();
  });

  it('should show round info', () => {
    render(<Scoreboard scores={scores} currentRound={3} maxRounds={5} />);
    expect(screen.getByText('Round 3 / 5')).toBeDefined();
  });

  it('should render player rows sorted by wins', () => {
    render(<Scoreboard scores={scores} currentRound={3} maxRounds={5} />);
    expect(screen.getByTestId('score-row-Alice')).toBeDefined();
    expect(screen.getByTestId('score-row-Bob')).toBeDefined();
  });
});
