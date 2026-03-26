export interface LeaderboardEntry {
  readonly playerName: string;
  readonly score: number;
  readonly kills: number;
  readonly roundsWon: number;
  readonly damageDealt: number;
  readonly timestamp: number;
}

export interface Leaderboard {
  readonly entries: readonly LeaderboardEntry[];
  readonly maxEntries: number;
}

/** Create empty leaderboard. */
export function createLeaderboard(maxEntries = 10): Leaderboard {
  return { entries: [], maxEntries };
}

/** Add an entry to the leaderboard. Maintains sorted order, trims to max. */
export function addLeaderboardEntry(board: Leaderboard, entry: LeaderboardEntry): Leaderboard {
  const entries = [...board.entries, entry]
    .sort((a, b) => b.score - a.score)
    .slice(0, board.maxEntries);
  return { ...board, entries };
}

/** Check if a score qualifies for the leaderboard. */
export function qualifiesForLeaderboard(board: Leaderboard, score: number): boolean {
  if (board.entries.length < board.maxEntries) return true;
  const lowestEntry = board.entries[board.entries.length - 1];
  return lowestEntry !== undefined && score > lowestEntry.score;
}

/** Get rank of a score (1-indexed). */
export function getRank(board: Leaderboard, score: number): number {
  let rank = 1;
  for (const entry of board.entries) {
    if (score > entry.score) return rank;
    rank++;
  }
  return rank;
}

/** Format score for display. */
export function formatScore(score: number): string {
  if (score >= 1000000) return `${(score / 1000000).toFixed(1)}M`;
  if (score >= 1000) return `${(score / 1000).toFixed(1)}K`;
  return String(score);
}
