import React, { useEffect, useState } from 'react';

import { ACHIEVEMENTS, type Achievement } from '@engine/stats/Achievements';
import { loadAchievements, loadStats } from '@engine/stats/StatsPersistence';
import { createEmptyStats, type PlayerStats } from '@engine/stats/StatsTracker';

export interface StatsScreenProps {
  readonly onBack: () => void;
}

interface PlayerProfile {
  readonly name: string;
  readonly stats: PlayerStats;
  readonly achievements: string[];
}

const PROFILE_LIST_KEY = 'auto-tank-profile-list';

/** Load the list of known player profile keys from localStorage. */
export function loadProfileList(): string[] {
  try {
    const raw = localStorage.getItem(PROFILE_LIST_KEY);
    if (!raw) return [];
    const parsed: unknown = JSON.parse(raw);
    if (!Array.isArray(parsed)) return [];
    return parsed.filter((item): item is string => typeof item === 'string');
  } catch {
    return [];
  }
}

/** Save a player name to the profile list if not already present. */
export function addToProfileList(name: string): void {
  try {
    const list = loadProfileList();
    if (!list.includes(name)) {
      list.push(name);
      localStorage.setItem(PROFILE_LIST_KEY, JSON.stringify(list));
    }
  } catch {
    // Storage unavailable — silently ignore
  }
}

function loadAllProfiles(): PlayerProfile[] {
  const names = loadProfileList();
  return names.map((name) => ({
    name,
    stats: loadStats(name) ?? createEmptyStats(),
    achievements: loadAchievements(name),
  }));
}

function getAccuracy(stats: PlayerStats): string {
  if (stats.shotsFired === 0) return '0%';
  return `${Math.round((stats.directHits / stats.shotsFired) * 100)}%`;
}

function getAchievementById(id: string): Achievement | undefined {
  return ACHIEVEMENTS.find((a) => a.id === id);
}

const tableStyle: React.CSSProperties = {
  width: '100%',
  borderCollapse: 'collapse',
  color: '#fff',
  fontFamily: "'Courier New', monospace",
  fontSize: 13,
};

const thStyle: React.CSSProperties = {
  padding: '8px 12px',
  borderBottom: '2px solid rgba(255,255,255,0.3)',
  textAlign: 'left',
  textTransform: 'uppercase',
  fontSize: 10,
  letterSpacing: 1,
};

const tdStyle: React.CSSProperties = {
  padding: '6px 12px',
  borderBottom: '1px solid rgba(255,255,255,0.1)',
};

export function StatsScreen({ onBack }: StatsScreenProps): React.ReactElement {
  const [profiles, setProfiles] = useState<PlayerProfile[]>([]);
  const [selectedPlayer, setSelectedPlayer] = useState<string | null>(null);

  useEffect(() => {
    setProfiles(loadAllProfiles());
  }, []);

  const selectedProfile = profiles.find((p) => p.name === selectedPlayer);

  return (
    <div className="overlay stats-screen" data-testid="stats-screen">
      <div
        className="glass-panel"
        style={{ padding: 32, maxWidth: 700, width: '90%', maxHeight: '80vh', overflowY: 'auto' }}
      >
        <h1 style={{ textAlign: 'center', marginBottom: 24 }}>PLAYER STATS</h1>

        {profiles.length === 0 ? (
          <p data-testid="no-profiles" style={{ textAlign: 'center', opacity: 0.6 }}>
            No player data yet. Play a game to see stats here.
          </p>
        ) : (
          <>
            {/* Player selector */}
            <div style={{ display: 'flex', gap: 8, marginBottom: 20, flexWrap: 'wrap' }}>
              {profiles.map((p) => (
                <button
                  key={p.name}
                  className={`btn ${selectedPlayer === p.name ? 'btn-primary' : 'btn-ghost'}`}
                  style={{ fontSize: 12, padding: '6px 16px' }}
                  onClick={(): void => setSelectedPlayer(p.name)}
                  data-testid={`profile-btn-${p.name}`}
                >
                  {p.name}
                </button>
              ))}
            </div>

            {selectedProfile ? (
              <div data-testid="player-detail">
                <h2 style={{ marginBottom: 16 }}>{selectedProfile.name}</h2>

                {/* Lifetime Stats Table */}
                <table style={tableStyle} data-testid="lifetime-stats-table">
                  <thead>
                    <tr>
                      <th style={thStyle}>Stat</th>
                      <th style={thStyle}>Value</th>
                    </tr>
                  </thead>
                  <tbody>
                    <tr>
                      <td style={tdStyle}>Games Played</td>
                      <td style={tdStyle}>{selectedProfile.stats.gamesPlayed}</td>
                    </tr>
                    <tr>
                      <td style={tdStyle}>Games Won</td>
                      <td style={tdStyle}>{selectedProfile.stats.gamesWon}</td>
                    </tr>
                    <tr>
                      <td style={tdStyle}>Rounds Won</td>
                      <td style={tdStyle}>{selectedProfile.stats.roundsWon}</td>
                    </tr>
                    <tr>
                      <td style={tdStyle}>Kills / Deaths</td>
                      <td style={tdStyle}>
                        {selectedProfile.stats.kills} / {selectedProfile.stats.deaths}
                      </td>
                    </tr>
                    <tr>
                      <td style={tdStyle}>Total Damage</td>
                      <td style={tdStyle}>{selectedProfile.stats.totalDamageDealt}</td>
                    </tr>
                    <tr>
                      <td style={tdStyle}>Shots Fired</td>
                      <td style={tdStyle}>{selectedProfile.stats.shotsFired}</td>
                    </tr>
                    <tr>
                      <td style={tdStyle}>Accuracy</td>
                      <td style={tdStyle}>{getAccuracy(selectedProfile.stats)}</td>
                    </tr>
                    <tr>
                      <td style={tdStyle}>Best Single Hit</td>
                      <td style={tdStyle}>{selectedProfile.stats.maxDamageInOneShot}</td>
                    </tr>
                  </tbody>
                </table>

                {/* Achievements */}
                <h3 style={{ marginTop: 24, marginBottom: 12 }}>ACHIEVEMENTS</h3>
                {selectedProfile.achievements.length === 0 ? (
                  <p style={{ opacity: 0.5 }}>No achievements unlocked yet.</p>
                ) : (
                  <div
                    style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}
                    data-testid="achievement-list"
                  >
                    {selectedProfile.achievements.map((achId) => {
                      const ach = getAchievementById(achId);
                      if (!ach) return null;
                      return (
                        <div
                          key={ach.id}
                          style={{
                            background: 'rgba(255,255,255,0.08)',
                            borderRadius: 8,
                            padding: '8px 14px',
                            textAlign: 'center',
                            minWidth: 100,
                          }}
                          data-testid={`achievement-${ach.id}`}
                          title={ach.description}
                        >
                          <div style={{ fontSize: 24 }}>{ach.icon}</div>
                          <div style={{ fontSize: 11, marginTop: 4 }}>{ach.name}</div>
                        </div>
                      );
                    })}
                  </div>
                )}
              </div>
            ) : (
              <p style={{ textAlign: 'center', opacity: 0.5 }}>
                Select a player to view their stats.
              </p>
            )}
          </>
        )}

        <button
          className="btn btn-ghost"
          style={{ marginTop: 24, display: 'block', marginInline: 'auto' }}
          onClick={onBack}
          data-testid="stats-back-btn"
        >
          Back
        </button>
      </div>
    </div>
  );
}
