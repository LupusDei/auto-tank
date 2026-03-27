import { createDefaultSuddenDeathConfig, type SuddenDeathConfig } from './SuddenDeath';
import type { GameConfig } from '@shared/types/game';

export interface GameScheme {
  readonly name: string;
  readonly description: string;
  readonly gameConfig: GameConfig;
  readonly suddenDeath: SuddenDeathConfig;
}

export const SCHEME_PRESETS: Record<string, GameScheme> = {
  standard: {
    name: 'Standard',
    description: 'Classic balanced gameplay',
    gameConfig: {
      maxRounds: 5,
      turnTimeSeconds: 30,
      startingMoney: 5000,
      windStrength: 15,
      gravity: 9.81,
      suddenDeathEnabled: true,
      suddenDeathTurns: 30,
      wallMode: 'open',
    },
    suddenDeath: createDefaultSuddenDeathConfig(),
  },
  quickPlay: {
    name: 'Quick Play',
    description: 'Fast rounds, high damage',
    gameConfig: {
      maxRounds: 3,
      turnTimeSeconds: 15,
      startingMoney: 10000,
      windStrength: 10,
      gravity: 9.81,
      suddenDeathEnabled: true,
      suddenDeathTurns: 15,
      wallMode: 'open',
    },
    suddenDeath: { ...createDefaultSuddenDeathConfig(), triggerTurn: 15, drainPerTurn: 10 },
  },
  artillery: {
    name: 'Artillery Duel',
    description: 'Strong wind, long range',
    gameConfig: {
      maxRounds: 7,
      turnTimeSeconds: 45,
      startingMoney: 3000,
      windStrength: 30,
      gravity: 9.81,
      suddenDeathEnabled: false,
      suddenDeathTurns: 99,
      wallMode: 'open',
    },
    suddenDeath: { ...createDefaultSuddenDeathConfig(), enabled: false },
  },
};

/** Get a scheme by name. */
export function getScheme(name: string): GameScheme | undefined {
  return SCHEME_PRESETS[name];
}

/** List all available scheme names. */
export function getSchemeNames(): string[] {
  return Object.keys(SCHEME_PRESETS);
}
