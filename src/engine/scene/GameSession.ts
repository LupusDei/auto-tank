import type { GameConfig, GameState } from '@shared/types/game';
import type { Player, Tank } from '@shared/types/entities';
import type { TerrainConfig, TerrainData } from '@shared/types/terrain';
import { generateTerrain } from '@engine/terrain';
import { getNextPlayer } from '@engine/state/TurnManager';
import { getStartingLoadout } from '@engine/economy';
import { isRoundOver } from '@engine/state/RoundManager';
import { placeAllTanks } from '@engine/physics/TankPlacement';

export interface GameSessionConfig {
  readonly gameConfig: GameConfig;
  readonly terrainConfig: TerrainConfig;
  readonly playerNames: readonly string[];
}

/**
 * Orchestrates a full game session: terrain generation, tank placement,
 * round cycling, and victory detection.
 */
export class GameSession {
  private state: GameState;
  private readonly config: GameSessionConfig;

  constructor(config: GameSessionConfig) {
    this.config = config;

    const terrain = generateTerrain(config.terrainConfig);
    const players = this.createPlayers(config.playerNames, terrain);

    this.state = {
      phase: 'setup',
      players,
      terrain,
      currentPlayerIndex: 0,
      currentRound: 1,
      wind: 0,
      config: config.gameConfig,
      turnTimer: config.gameConfig.turnTimeSeconds,
    };
  }

  get gameState(): GameState {
    return this.state;
  }

  get isComplete(): boolean {
    return this.state.phase === 'victory';
  }

  /** Start the first round. */
  startRound(): void {
    this.state = { ...this.state, phase: 'playing' };
  }

  /** Begin a turn for the current player. */
  startTurn(): void {
    this.state = {
      ...this.state,
      phase: 'turn',
      turnTimer: this.config.gameConfig.turnTimeSeconds,
    };
  }

  /** End the current turn and advance to next player. */
  endCurrentTurn(): void {
    const nextIdx = getNextPlayer(this.state.players, this.state.currentPlayerIndex);
    if (nextIdx === -1) {
      this.state = { ...this.state, phase: 'resolution' };
      return;
    }
    this.state = { ...this.state, currentPlayerIndex: nextIdx };
  }

  /** Check if round is over and handle transition. */
  checkRoundEnd(): boolean {
    if (!isRoundOver(this.state)) return false;

    if (this.state.currentRound >= this.config.gameConfig.maxRounds) {
      this.state = { ...this.state, phase: 'victory' };
    } else {
      this.state = {
        ...this.state,
        phase: 'resolution',
        currentRound: this.state.currentRound + 1,
      };
    }
    return true;
  }

  /** Update game state (for immutable consumers). */
  updateState(patch: Partial<GameState>): void {
    this.state = { ...this.state, ...patch };
  }

  private createPlayers(names: readonly string[], terrain: TerrainData): Player[] {
    const positions = placeAllTanks(names.length, terrain);
    const colors = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'] as const;
    const loadout = getStartingLoadout();

    return names.map((name, i) => {
      const color = colors[i % colors.length] ?? 'red';
      const pos = positions[i] ?? { x: 0, y: 0 };
      const tank: Tank = {
        id: `tank-${i}`,
        playerId: `player-${i}`,
        position: pos,
        angle: 45,
        power: 50,
        health: 100,
        maxHealth: 100,
        fuel: 100,
        state: 'alive',
        color,
        selectedWeapon: null,
      };

      return {
        id: `player-${i}`,
        name,
        color,
        tanks: [tank],
        money: this.config.gameConfig.startingMoney,
        inventory: loadout.map((l) => ({
          definition: {
            type: l.weaponType,
            name: l.weaponType,
            category: 'projectile' as const,
            explosionRadius: 20,
            damage: 30,
            price: 0,
            affectedByWind: true,
            affectedByGravity: true,
          },
          quantity: l.quantity,
        })),
        kills: 0,
        deaths: 0,
        isAI: false,
      };
    });
  }
}
