import type { GameConfig } from '../types/game';

export const GAME_DEFAULTS: GameConfig = {
  maxRounds: 10,
  turnTimeSeconds: 60,
  startingMoney: 10000,
  windStrength: 10,
  gravity: 9.81,
  suddenDeathEnabled: true,
  suddenDeathTurns: 20,
  wallMode: 'open',
} as const;
