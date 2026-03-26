import {
  addLeaderboardEntry,
  createLeaderboard,
  formatScore,
  getRank,
  qualifiesForLeaderboard,
} from '@engine/campaign/Leaderboard';
import { describe, expect, it } from 'vitest';

describe('Leaderboard', () => {
  it('should create empty leaderboard', () => {
    expect(createLeaderboard().entries).toHaveLength(0);
  });

  it('should add and sort entries', () => {
    let board = createLeaderboard(5);
    board = addLeaderboardEntry(board, {
      playerName: 'A',
      score: 100,
      kills: 1,
      roundsWon: 0,
      damageDealt: 50,
      timestamp: 1,
    });
    board = addLeaderboardEntry(board, {
      playerName: 'B',
      score: 300,
      kills: 3,
      roundsWon: 1,
      damageDealt: 150,
      timestamp: 2,
    });
    board = addLeaderboardEntry(board, {
      playerName: 'C',
      score: 200,
      kills: 2,
      roundsWon: 0,
      damageDealt: 100,
      timestamp: 3,
    });

    expect(board.entries[0]?.playerName).toBe('B');
    expect(board.entries[1]?.playerName).toBe('C');
    expect(board.entries[2]?.playerName).toBe('A');
  });

  it('should trim to max entries', () => {
    let board = createLeaderboard(2);
    board = addLeaderboardEntry(board, {
      playerName: 'A',
      score: 100,
      kills: 0,
      roundsWon: 0,
      damageDealt: 0,
      timestamp: 1,
    });
    board = addLeaderboardEntry(board, {
      playerName: 'B',
      score: 200,
      kills: 0,
      roundsWon: 0,
      damageDealt: 0,
      timestamp: 2,
    });
    board = addLeaderboardEntry(board, {
      playerName: 'C',
      score: 300,
      kills: 0,
      roundsWon: 0,
      damageDealt: 0,
      timestamp: 3,
    });

    expect(board.entries).toHaveLength(2);
    expect(board.entries[0]?.playerName).toBe('C');
  });

  it('should check qualification', () => {
    let board = createLeaderboard(2);
    board = addLeaderboardEntry(board, {
      playerName: 'A',
      score: 100,
      kills: 0,
      roundsWon: 0,
      damageDealt: 0,
      timestamp: 1,
    });
    board = addLeaderboardEntry(board, {
      playerName: 'B',
      score: 200,
      kills: 0,
      roundsWon: 0,
      damageDealt: 0,
      timestamp: 2,
    });

    expect(qualifiesForLeaderboard(board, 150)).toBe(true);
    expect(qualifiesForLeaderboard(board, 50)).toBe(false);
  });

  it('should get rank', () => {
    let board = createLeaderboard(5);
    board = addLeaderboardEntry(board, {
      playerName: 'A',
      score: 100,
      kills: 0,
      roundsWon: 0,
      damageDealt: 0,
      timestamp: 1,
    });
    board = addLeaderboardEntry(board, {
      playerName: 'B',
      score: 300,
      kills: 0,
      roundsWon: 0,
      damageDealt: 0,
      timestamp: 2,
    });

    expect(getRank(board, 500)).toBe(1);
    expect(getRank(board, 200)).toBe(2);
  });

  it('should format scores', () => {
    expect(formatScore(500)).toBe('500');
    expect(formatScore(1500)).toBe('1.5K');
    expect(formatScore(2500000)).toBe('2.5M');
  });
});
