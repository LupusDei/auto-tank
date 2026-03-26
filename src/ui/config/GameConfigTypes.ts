import type { AIDifficulty } from '@engine/ai/AIController';
import type { TeamColor } from '@shared/types/entities';
import type { TerrainTheme } from '@shared/types/terrain';

export interface PlayerConfig {
  readonly name: string;
  readonly color: TeamColor;
  readonly isAI: boolean;
  readonly aiDifficulty: AIDifficulty;
}

export interface LandscapeConfig {
  readonly width: number;
  readonly height: number;
  readonly theme: TerrainTheme;
  readonly roughness: number;
  readonly seed: number | 'random';
}

export interface GameSetupConfig {
  readonly landscape: LandscapeConfig;
  readonly players: readonly PlayerConfig[];
  readonly rounds: number;
  readonly turnTime: number;
  readonly startingMoney: number;
  readonly windStrength: number;
  readonly suddenDeath: boolean;
}

export const TEAM_COLORS: readonly TeamColor[] = [
  'red',
  'blue',
  'green',
  'yellow',
  'purple',
  'orange',
];
export const TERRAIN_THEMES: readonly TerrainTheme[] = [
  'classic',
  'desert',
  'arctic',
  'volcanic',
  'lunar',
];
export const AI_DIFFICULTIES: readonly AIDifficulty[] = ['easy', 'medium', 'hard', 'expert'];

export function createDefaultSetup(): GameSetupConfig {
  return {
    landscape: { width: 1280, height: 720, theme: 'classic', roughness: 0.6, seed: 'random' },
    players: [
      { name: 'Player 1', color: 'red', isAI: false, aiDifficulty: 'medium' },
      { name: 'Player 2', color: 'blue', isAI: true, aiDifficulty: 'medium' },
    ],
    rounds: 5,
    turnTime: 30,
    startingMoney: 5000,
    windStrength: 15,
    suddenDeath: true,
  };
}

export function addPlayer(config: GameSetupConfig): GameSetupConfig {
  if (config.players.length >= 6) return config;
  const color = TEAM_COLORS.find((c) => !config.players.some((p) => p.color === c)) ?? 'red';
  return {
    ...config,
    players: [
      ...config.players,
      { name: `Player ${config.players.length + 1}`, color, isAI: true, aiDifficulty: 'medium' },
    ],
  };
}

export function removePlayer(config: GameSetupConfig, index: number): GameSetupConfig {
  if (config.players.length <= 2) return config;
  return { ...config, players: config.players.filter((_, i) => i !== index) };
}

export function updatePlayer(
  config: GameSetupConfig,
  index: number,
  update: Partial<PlayerConfig>,
): GameSetupConfig {
  return {
    ...config,
    players: config.players.map((p, i) => (i === index ? { ...p, ...update } : p)),
  };
}
