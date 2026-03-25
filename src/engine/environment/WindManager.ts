import type { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';

import { calculateTurnWind, generateInitialWind } from './WindSystem';
import { createDefaultWindConfig, type WindConfig, type WindState } from './types';

export interface WindManagerOptions {
  readonly seed: number;
  readonly config?: WindConfig;
}

/**
 * Bridges WindSystem pure functions with EventBus.
 * Listens for TURN_STARTED and emits WIND_CHANGED.
 */
export class WindManager {
  private wind: WindState;
  private readonly config: WindConfig;
  private readonly baseSeed: number;
  private readonly unsubscribe: () => void;

  constructor(
    private readonly bus: EventBus,
    options: WindManagerOptions,
  ) {
    this.config = options.config ?? createDefaultWindConfig();
    this.baseSeed = options.seed;

    // Generate initial wind and emit
    this.wind = generateInitialWind(this.config, this.baseSeed);
    this.bus.emit(EventType.WIND_CHANGED, {
      previousWind: 0,
      newWind: this.wind.speed,
    });

    // Listen for turn starts to recalculate wind
    this.unsubscribe = this.bus.on(EventType.TURN_STARTED, (event) => {
      const previousSpeed = this.wind.speed;
      const turnSeed = this.baseSeed + event.payload.turnNumber * 7919;
      this.wind = calculateTurnWind(this.wind, this.config, turnSeed);
      this.bus.emit(EventType.WIND_CHANGED, {
        previousWind: previousSpeed,
        newWind: this.wind.speed,
      });
    });
  }

  get currentWind(): WindState {
    return this.wind;
  }

  dispose(): void {
    this.unsubscribe();
  }
}
