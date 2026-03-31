import { afterEach, describe, expect, it, vi } from 'vitest';
import { fireEvent, render, screen } from '@testing-library/react';

import { StatsScreen, addToProfileList, loadProfileList } from '@ui/screens/StatsScreen';
import { saveStats, saveAchievements } from '@engine/stats/StatsPersistence';
import { createEmptyStats } from '@engine/stats/StatsTracker';

describe('StatsScreen', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should show "no profiles" message when localStorage is empty', () => {
    render(<StatsScreen onBack={vi.fn()} />);
    expect(screen.getByTestId('no-profiles')).toBeDefined();
  });

  it('should show player buttons when profiles exist', () => {
    addToProfileList('Alice');
    saveStats('Alice', { ...createEmptyStats(), kills: 3 });

    render(<StatsScreen onBack={vi.fn()} />);
    expect(screen.getByTestId('profile-btn-Alice')).toBeDefined();
  });

  it('should display player stats when profile is selected', () => {
    addToProfileList('Bob');
    saveStats('Bob', {
      ...createEmptyStats(),
      kills: 5,
      deaths: 2,
      totalDamageDealt: 300,
      shotsFired: 20,
      directHits: 14,
      gamesPlayed: 3,
      gamesWon: 2,
    });

    render(<StatsScreen onBack={vi.fn()} />);
    fireEvent.click(screen.getByTestId('profile-btn-Bob'));
    expect(screen.getByTestId('player-detail')).toBeDefined();
    expect(screen.getByTestId('lifetime-stats-table')).toBeDefined();
  });

  it('should display unlocked achievements for selected player', () => {
    addToProfileList('Carol');
    saveStats('Carol', { ...createEmptyStats(), kills: 1 });
    saveAchievements('Carol', ['first-blood', 'overkill']);

    render(<StatsScreen onBack={vi.fn()} />);
    fireEvent.click(screen.getByTestId('profile-btn-Carol'));
    expect(screen.getByTestId('achievement-list')).toBeDefined();
    expect(screen.getByTestId('achievement-first-blood')).toBeDefined();
    expect(screen.getByTestId('achievement-overkill')).toBeDefined();
  });

  it('should call onBack when back button is clicked', () => {
    const onBack = vi.fn();
    render(<StatsScreen onBack={onBack} />);
    fireEvent.click(screen.getByTestId('stats-back-btn'));
    expect(onBack).toHaveBeenCalledOnce();
  });
});

describe('loadProfileList / addToProfileList', () => {
  afterEach(() => {
    localStorage.clear();
  });

  it('should return empty array when no profiles exist', () => {
    expect(loadProfileList()).toEqual([]);
  });

  it('should add and load profile names', () => {
    addToProfileList('Alice');
    addToProfileList('Bob');
    expect(loadProfileList()).toEqual(['Alice', 'Bob']);
  });

  it('should not duplicate profile names', () => {
    addToProfileList('Alice');
    addToProfileList('Alice');
    expect(loadProfileList()).toEqual(['Alice']);
  });
});
