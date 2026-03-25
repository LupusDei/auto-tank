import type { GameConfig, GamePhase } from '@shared/types/game';
import type { Player, TeamColor } from '@shared/types/entities';
import { GameStateMachine } from './GameStateMachine';

const TEAM_COLORS: readonly TeamColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

/**
 * Orchestrates a full game session from lobby to victory.
 * Uses GameStateMachine for valid phase transitions.
 */
export class GameSessionManager {
  private readonly stateMachine = new GameStateMachine();
  private readonly players: Player[] = [];
  private round = 1;
  readonly config: GameConfig;

  constructor(config: GameConfig) {
    this.config = config;
  }

  get currentPhase(): GamePhase {
    return this.stateMachine.currentPhase;
  }

  get currentRound(): number {
    return this.round;
  }

  get playerCount(): number {
    return this.players.length;
  }

  /** Add a player during lobby phase. */
  addPlayer(id: string, name: string): void {
    const color = TEAM_COLORS[this.players.length % TEAM_COLORS.length] ?? 'red';
    this.players.push({
      id,
      name,
      color,
      tanks: [],
      money: this.config.startingMoney,
      inventory: [],
      kills: 0,
      deaths: 0,
      isAI: false,
    });
  }

  /** Transition from lobby to setup. Requires at least 2 players. */
  startSetup(): void {
    if (this.players.length < 2) {
      throw new Error('At least 2 players required to start');
    }
    this.stateMachine.transition('setup');
  }

  /** Transition from setup to playing. */
  startPlaying(): void {
    this.stateMachine.transition('playing');
  }

  /** Advance round counter. */
  advanceRound(): void {
    this.round += 1;
  }
}
