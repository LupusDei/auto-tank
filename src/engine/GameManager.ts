import type { AIController, AIDifficulty } from '@engine/ai/AIController';
import type { Tank, TeamColor } from '@shared/types/entities';
import type { TerrainData, TerrainTheme } from '@shared/types/terrain';
import type { ActiveEffect } from '@renderer/RenderPipeline';
import type { CommentaryLine } from '@engine/commentary/CommentarySystem';
import type { Crate } from '@engine/defense/CrateDrops';
import type { GamePhase } from '@shared/types/game';
import type { GrenadeState } from '@engine/physics/GrenadeBehavior';
import type { MoneyPopup } from '@renderer/feedback/MoneyPopup';
import type { Projectile } from '@shared/types/projectile';
import type { Vector2D } from '@shared/types/geometry';
import type { WeaponType } from '@shared/types/weapons';

import { canPickup, collectCrate, generateCrateDrops } from '@engine/defense/CrateDrops';
import { canFire } from '@engine/input/FiringControls';
import { CommentarySystem } from '@engine/commentary/CommentarySystem';
import { createExplosionEffect } from '@renderer/effects/ExplosionRenderer';
import { createMoneyPopup } from '@renderer/feedback/MoneyPopup';
import { createPRNG } from '@shared/prng';
import { createShield } from '@engine/defense/ShieldSystem';
import { EasyAI } from '@engine/ai/EasyAI';
import { EventBus } from '@engine/events/EventBus';
import { EventType } from '@engine/events/types';
import { ExpertAI } from '@engine/ai/ExpertAI';
import { GAME_DEFAULTS } from '@shared/constants/game';
import { generateTerrain } from '@engine/terrain';
import { getTheme } from '@engine/themes/TerrainThemeSystem';
import { HardAI } from '@engine/ai/HardAI';
import { MediumAI } from '@engine/ai/MediumAI';
import { PHYSICS } from '@shared/constants/physics';
import { simulateTick } from '@engine/physics/ProjectileSimulation';
import { spawnProjectile } from '@engine/physics/ProjectileManager';
import { ToastManager } from '@ui/notifications/ToastSystem';

/** Immutable snapshot of the full game state for rendering. */
export interface GameSnapshot {
  readonly phase: GamePhase;
  readonly terrain: TerrainData;
  readonly tanks: readonly Tank[];
  readonly projectiles: readonly Projectile[];
  readonly activeEffects: readonly ActiveEffect[];
  readonly wind: number;
  readonly currentPlayerIndex: number;
  readonly hasFired: boolean;
  readonly turnNumber: number;
  readonly theme: TerrainTheme;
  readonly moneyPopups: readonly MoneyPopup[];
  readonly commentaryLines: readonly CommentaryLine[];
  readonly playerMoney: readonly number[];
  readonly roundNumber: number;
  readonly maxRounds: number;
  readonly activeCrates: readonly Crate[];
}

export interface GameManagerConfig {
  readonly canvasWidth: number;
  readonly canvasHeight: number;
  readonly seed: number;
  readonly playerNames: readonly string[];
  readonly playerColors: readonly TeamColor[];
  readonly theme?: TerrainTheme;
  readonly aiDifficulty?: AIDifficulty;
  readonly rounds?: number;
  readonly startingMoney?: number;
  readonly playerIsAI?: readonly boolean[];
  readonly commentary?: boolean;
}

const BARREL_LENGTH = 20;

function createTank(
  id: string,
  playerId: string,
  x: number,
  terrainHeight: number,
  canvasHeight: number,
  color: TeamColor,
  angle: number,
): Tank {
  return {
    id,
    playerId,
    position: { x, y: canvasHeight - terrainHeight },
    angle,
    power: 75,
    health: 100,
    maxHealth: 100,
    fuel: 100,
    state: 'alive',
    color,
    selectedWeapon: {
      definition: {
        type: 'missile',
        name: 'Missile',
        category: 'projectile',
        explosionRadius: 25,
        damage: 35,
        price: 0,
        affectedByWind: true,
        affectedByGravity: true,
      },
      quantity: 99,
    },
  };
}

function generateWind(seed: number): number {
  const s = Math.sin(seed * 9301 + 49297) * 49297;
  return Math.round((s - Math.floor(s)) * 20 - 10);
}

function getBarrelTip(tank: Tank): Vector2D {
  const radians = ((180 - tank.angle) * Math.PI) / 180;
  return {
    x: tank.position.x + Math.cos(radians) * BARREL_LENGTH,
    y: tank.position.y - 15 - Math.sin(radians) * BARREL_LENGTH,
  };
}

/** Core game orchestrator — manages state transitions and physics. */
export class GameManager {
  private terrain: TerrainData;
  private tanks: Tank[];
  private projectiles: Projectile[] = [];
  private activeEffects: ActiveEffect[] = [];
  private phase: GamePhase = 'turn';
  private currentPlayerIndex = 0;
  private hasFired = false;
  private wind: number;
  private turnNumber = 1;
  private readonly bus: EventBus;
  private readonly canvasHeight: number;
  private resolutionDelay = 0;
  private readonly theme: TerrainTheme;
  private moneyPopups: MoneyPopup[] = [];
  private commentaryLines: CommentaryLine[] = [];
  private playerMoney: number[];
  private roundNumber = 1;
  private readonly maxRounds: number;
  private readonly commentary: CommentarySystem | null;
  private readonly playerIsAI: boolean[];
  private readonly aiControllers: (AIController | null)[];
  private aiThinkDelay = 0;
  private firingTicks = 0;
  private turnsThisRound = 0;
  private shopReadyPlayers = new Set<number>();
  private _inShop = false;
  private grenadeStates: ReadonlyMap<string, GrenadeState> = new Map();
  private activeCrates: Crate[] = [];
  private readonly toastManager: ToastManager;

  constructor(config: GameManagerConfig) {
    this.bus = new EventBus({ historySize: 100 });
    this.toastManager = new ToastManager();
    this.canvasHeight = config.canvasHeight;
    this.theme = config.theme ?? 'classic';
    this.maxRounds = config.rounds ?? 5;
    this.playerMoney = config.playerNames.map(() => config.startingMoney ?? 5000);

    const themeConfig = getTheme(this.theme);

    this.terrain = generateTerrain({
      width: config.canvasWidth,
      height: config.canvasHeight,
      seed: config.seed,
      roughness: themeConfig.roughness,
      theme: this.theme,
    });

    this.wind = generateWind(config.seed);

    // Setup commentary if enabled
    if (config.commentary !== false) {
      this.commentary = new CommentarySystem('cheerful', 3000);
      this.commentary.onComment((line) => {
        this.commentaryLines.push(line);
        // Auto-remove after 3 seconds
        setTimeout(() => {
          this.commentaryLines = this.commentaryLines.filter((l) => l !== line);
        }, 3000);
      });
      this.commentary.connect(this.bus);
    } else {
      this.commentary = null;
    }

    // Setup AI controllers
    this.playerIsAI = config.playerIsAI
      ? [...config.playerIsAI]
      : config.playerNames.map(() => false);
    const difficulty = config.aiDifficulty ?? 'medium';
    this.aiControllers = this.playerIsAI.map((isAI, i) => {
      if (!isAI) return null;
      const seed = config.seed + i * 1000;
      switch (difficulty) {
        case 'easy':
          return new EasyAI(seed);
        case 'hard':
          return new HardAI(seed);
        case 'expert':
          return new ExpertAI(seed);
        default:
          return new MediumAI(seed);
      }
    });

    // Place tanks — dynamically for N players
    const numPlayers = config.playerNames.length;
    const defaultColors: TeamColor[] = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];
    this.tanks = [];
    for (let i = 0; i < numPlayers; i++) {
      const margin = 0.1;
      const spread = 1 - 2 * margin;
      const xFraction = numPlayers === 1 ? 0.5 : margin + (spread * i) / (numPlayers - 1);
      const tankX = Math.floor(config.canvasWidth * xFraction);
      const terrainH = this.terrain.heightMap[tankX] ?? config.canvasHeight * 0.4;
      const defaultAngle = i < numPlayers / 2 ? 45 : 135;
      this.tanks.push(
        createTank(
          `tank-${i + 1}`,
          `player-${i + 1}`,
          tankX,
          terrainH,
          config.canvasHeight,
          config.playerColors[i] ?? defaultColors[i % defaultColors.length] ?? 'red',
          defaultAngle,
        ),
      );
    }

    // Listen for explosion events to create visual effects
    this.bus.on(EventType.EXPLOSION, (event) => {
      this.activeEffects.push(
        createExplosionEffect({
          position: event.payload.position,
          radius: event.payload.radius,
          particleCount: Math.floor(event.payload.radius * 1.5),
        }),
      );
    });

    // Listen for tank damage to update health and award money
    this.bus.on(EventType.TANK_DAMAGED, (event) => {
      const damagedTank = this.tanks.find((t) => t.id === event.payload.tankId);
      this.tanks = this.tanks.map((t) => {
        if (t.id !== event.payload.tankId) return t;
        const newHealth = Math.max(0, t.health - event.payload.damage);
        return {
          ...t,
          health: newHealth,
          state: newHealth <= 0 ? 'destroyed' : t.state,
        } as Tank;
      });

      // Award damage money to the firing player
      const reward = Math.round(event.payload.damage);
      if (this.playerMoney[this.currentPlayerIndex] !== undefined) {
        this.playerMoney = this.playerMoney.map((m, i) =>
          i === this.currentPlayerIndex ? m + reward : m,
        );
      }

      // Show money popup
      if (damagedTank) {
        this.moneyPopups.push(createMoneyPopup(reward, damagedTank.position));
      }
    });

    // Listen for tank destruction — kill bonus
    this.bus.on(EventType.TANK_DESTROYED, () => {
      const killBonus = 2000;
      if (this.playerMoney[this.currentPlayerIndex] !== undefined) {
        this.playerMoney = this.playerMoney.map((m, i) =>
          i === this.currentPlayerIndex ? m + killBonus : m,
        );
      }
      const activeTank = this.getActiveTank();
      if (activeTank) {
        this.moneyPopups.push(createMoneyPopup(killBonus, activeTank.position, true));
      }
    });
  }

  /** Get current game state snapshot for rendering. */
  getSnapshot(): GameSnapshot {
    return {
      phase: this.phase,
      terrain: this.terrain,
      tanks: this.tanks,
      projectiles: this.projectiles,
      activeEffects: this.activeEffects,
      wind: this.wind,
      currentPlayerIndex: this.currentPlayerIndex,
      hasFired: this.hasFired,
      turnNumber: this.turnNumber,
      theme: this.theme,
      moneyPopups: this.moneyPopups,
      commentaryLines: this.commentaryLines,
      playerMoney: this.playerMoney,
      roundNumber: this.roundNumber,
      maxRounds: this.maxRounds,
      activeCrates: this.activeCrates,
    };
  }

  /** Get the EventBus (for external integrations). */
  getEventBus(): EventBus {
    return this.bus;
  }

  /** Get the currently active tank. */
  getActiveTank(): Tank | undefined {
    return this.tanks[this.currentPlayerIndex];
  }

  /** Update the active tank's angle. */
  setAngle(angle: number): void {
    const idx = this.currentPlayerIndex;
    const tank = this.tanks[idx];
    if (tank) {
      this.tanks = this.tanks.map((t, i) => (i === idx ? ({ ...t, angle } as Tank) : t));
    }
  }

  /** Update the active tank's power. */
  setPower(power: number): void {
    const idx = this.currentPlayerIndex;
    const tank = this.tanks[idx];
    if (tank) {
      this.tanks = this.tanks.map((t, i) => (i === idx ? ({ ...t, power } as Tank) : t));
    }
  }

  /** Update the active tank's selected weapon. */
  setWeapon(weaponType: WeaponType): void {
    const idx = this.currentPlayerIndex;
    const tank = this.tanks[idx];
    if (!tank?.selectedWeapon) return;
    this.tanks = this.tanks.map((t, i) => {
      if (i !== idx || !t.selectedWeapon) return t;
      return {
        ...t,
        selectedWeapon: {
          ...t.selectedWeapon,
          definition: { ...t.selectedWeapon.definition, type: weaponType, name: weaponType },
        },
      } as Tank;
    });
  }

  /** Attempt to fire the active tank's weapon. Returns true if fired. */
  fire(): boolean {
    if (!canFire(this.phase, this.hasFired)) return false;
    const tank = this.getActiveTank();
    if (!tank?.selectedWeapon || tank.state !== 'alive') return false;

    const barrelTip = getBarrelTip(tank);
    // Use the same (180 - angle) convention as the barrel renderer
    // so the projectile launches in the direction the barrel points
    const firingAngle = 180 - tank.angle;
    const projectile = spawnProjectile(
      barrelTip,
      firingAngle,
      tank.power * 5, // Scale power to velocity
      tank.selectedWeapon.definition.type,
      tank.playerId,
    );

    this.projectiles.push(projectile);
    this.hasFired = true;
    this.phase = 'firing';
    this.firingTicks = 0;

    this.bus.emit(EventType.PROJECTILE_FIRED, {
      projectileId: projectile.id,
      tankId: tank.id,
      weaponType: projectile.weaponType,
      position: projectile.position,
      velocity: projectile.velocity,
    });

    return true;
  }

  /** Update game state by one tick. Called every frame. */
  update(dt: number): void {
    // Update explosion effects — remove completed ones
    const now = performance.now();
    this.activeEffects = this.activeEffects.filter((e) => !e.isComplete(now - e.startTime));

    // Clean up expired money popups
    this.moneyPopups = this.moneyPopups.filter((p) => now - p.startTime < 2000);

    // Crate collection — check if any alive tank is adjacent to an active crate
    if (this.phase === 'turn') {
      for (const crate of [...this.activeCrates]) {
        if (crate.collected) continue;
        for (const tank of this.tanks) {
          if (tank.state !== 'alive') continue;
          if (canPickup(tank.position, crate.position)) {
            this.collectCrateForTank(tank, crate);
            break;
          }
        }
      }
    }

    // AI auto-fire during turn phase
    if (this.phase === 'turn' && this.playerIsAI[this.currentPlayerIndex]) {
      this.aiThinkDelay -= dt;
      if (this.aiThinkDelay <= 0) {
        const ai = this.aiControllers[this.currentPlayerIndex];
        const ownTank = this.getActiveTank();
        if (ai && ownTank) {
          const enemyTanks = this.tanks.filter(
            (t, i) => i !== this.currentPlayerIndex && t.state === 'alive',
          );
          const decision = ai.decideTurn({
            ownTank,
            enemyTanks,
            terrain: this.terrain,
            wind: this.wind,
            gravity: PHYSICS.GRAVITY * 50,
          });

          if (
            decision.action === 'fire' &&
            decision.angle !== undefined &&
            decision.power !== undefined
          ) {
            this.setAngle(decision.angle);
            this.setPower(decision.power);
            this.fire();
          } else {
            // AI skipped — just fire with defaults
            this.fire();
          }
        }
      }
    }

    if (this.phase === 'firing') {
      this.firingTicks++;
      // Safety: force-end projectiles after 10 seconds of simulation
      if (this.firingTicks > 600) {
        this.projectiles = this.projectiles.map((p) => ({ ...p, state: 'done' as const }));
      }
      // Run physics simulation
      const simState = simulateTick(
        {
          projectiles: this.projectiles,
          terrain: this.terrain,
          tanks: this.tanks,
          wind: this.wind,
          gravity: PHYSICS.GRAVITY * 50, // Scale gravity for canvas pixels
          grenadeStates: this.grenadeStates,
        },
        dt,
        this.bus,
      );

      this.projectiles = [...simState.projectiles];
      this.terrain = simState.terrain;
      this.grenadeStates = simState.grenadeStates ?? new Map();

      // Check if all projectiles are done
      const allDone = this.projectiles.every((p) => p.state === 'done');
      if (allDone && this.projectiles.length > 0) {
        this.phase = 'resolution';
        this.resolutionDelay = 0.8; // Brief pause to show explosion
      }
    }

    if (this.phase === 'resolution') {
      this.resolutionDelay -= dt;
      if (this.resolutionDelay <= 0) {
        this.advanceTurn();
      }
    }
  }

  /** Advance to the next player's turn. */
  private advanceTurn(): void {
    this.projectiles = [];
    this.grenadeStates = new Map();

    // Snap tanks to terrain after deformation
    this.tanks = this.tanks.map((t) => {
      if (t.state === 'destroyed') return t;
      const terrainH = this.terrain.heightMap[Math.round(t.position.x)] ?? 0;
      return { ...t, position: { x: t.position.x, y: this.canvasHeight - terrainH } } as Tank;
    });

    // Check for winner
    const aliveTanks = this.tanks.filter((t) => t.state === 'alive');
    if (aliveTanks.length <= 1) {
      this.phase = 'victory';

      const endTank = this.tanks[this.currentPlayerIndex];
      this.bus.emit(EventType.TURN_ENDED, {
        playerId: endTank?.playerId ?? 'unknown',
        tankId: endTank?.id ?? 'unknown',
        turnNumber: this.turnNumber,
        reason: 'fired',
      });
      return;
    }

    // Next alive player
    let nextIdx = (this.currentPlayerIndex + 1) % this.tanks.length;
    while (this.tanks[nextIdx]?.state !== 'alive') {
      nextIdx = (nextIdx + 1) % this.tanks.length;
    }

    this.currentPlayerIndex = nextIdx;
    this.hasFired = false;
    this.turnNumber++;
    this.turnsThisRound++;

    // Check if all alive players have had a turn this round → shop phase
    const alivePlayers = this.tanks.filter((t) => t.state === 'alive').length;
    if (this.turnsThisRound >= alivePlayers && this.roundNumber < this.maxRounds) {
      this.turnsThisRound = 0;
      this.roundNumber++;
      this.phase = 'shop';
      this.shopReadyPlayers.clear();
      this._inShop = true;
      // AI players auto-ready in shop
      for (let i = 0; i < this.tanks.length; i++) {
        if (this.playerIsAI[i] || this.tanks[i]?.state === 'destroyed') {
          this.shopReadyPlayers.add(i);
        }
      }
      return;
    }

    const previousWind = this.wind;
    this.wind = generateWind(this.turnNumber * 7 + 42);
    this.phase = 'turn';
    this.aiThinkDelay = this.playerIsAI[nextIdx] ? 1.0 : 0;

    const nextTank = this.tanks[this.currentPlayerIndex];
    this.bus.emit(EventType.TURN_STARTED, {
      playerId: nextTank?.playerId ?? 'unknown',
      tankId: nextTank?.id ?? 'unknown',
      turnNumber: this.turnNumber,
    });

    this.bus.emit(EventType.WIND_CHANGED, {
      previousWind,
      newWind: this.wind,
    });

    // Wind change toast
    if (previousWind !== this.wind) {
      const arrow = this.wind > 0 ? '\u2192' : '\u2190';
      this.toastManager.add(
        `Wind changed: ${arrow} ${Math.abs(this.wind).toFixed(1)}`,
        'info',
        2000,
      );
    }

    // Between-turn crate drop — 30% chance per turn (deterministic via turn seed)
    const crateRng = createPRNG(this.turnNumber * 1337);
    if (crateRng() < 0.3) {
      const minTerrainH = Math.min(
        ...this.terrain.heightMap.filter((h): h is number => h !== undefined),
      );
      const newCrates = generateCrateDrops(
        1,
        this.terrain.heightMap.length,
        minTerrainH,
        this.turnNumber * 42,
      );
      this.activeCrates.push(...newCrates);
      this.bus.emit(EventType.CRATE_SPAWNED, {
        crates: newCrates,
        turnNumber: this.turnNumber,
      });
    }

    // Sudden death countdown warning (uses defaults from GAME_DEFAULTS)
    if (GAME_DEFAULTS.suddenDeathEnabled) {
      const turnsUntilSuddenDeath = GAME_DEFAULTS.suddenDeathTurns - this.turnNumber;
      if (turnsUntilSuddenDeath <= 3 && turnsUntilSuddenDeath > 0) {
        this.toastManager.add(`Sudden death in ${turnsUntilSuddenDeath} turns!`, 'warning', 3000);
      }
    }
  }

  /** Get the toast manager for UI integration. */
  getToastManager(): ToastManager {
    return this.toastManager;
  }

  /** Collect a crate for a tank and apply its effects. */
  private collectCrateForTank(tank: Tank, crate: Crate): void {
    // Mark as collected
    this.activeCrates = this.activeCrates.map((c) => (c.id === crate.id ? collectCrate(c) : c));

    // Apply crate effects
    const content = crate.content;
    switch (content.kind) {
      case 'health': {
        const healAmount = content.amount;
        this.tanks = this.tanks.map((t) =>
          t.id === tank.id
            ? ({ ...t, health: Math.min(t.maxHealth, t.health + healAmount) } as Tank)
            : t,
        );
        break;
      }
      case 'shield': {
        const shield = createShield(content.shieldType);
        // Store shield on tank — for now just heal equivalent HP as shield capacity
        // Full shield integration would extend Tank type; this provides tangible benefit
        const shieldHP = shield.remaining;
        this.tanks = this.tanks.map((t) =>
          t.id === tank.id
            ? ({
                ...t,
                health: Math.min(t.maxHealth, t.health + Math.floor(shieldHP * 0.5)),
              } as Tank)
            : t,
        );
        break;
      }
      case 'fuel': {
        const fuelAmount = content.amount;
        this.tanks = this.tanks.map((t) =>
          t.id === tank.id ? ({ ...t, fuel: t.fuel + fuelAmount } as Tank) : t,
        );
        break;
      }
      case 'weapon': {
        // Weapon crates add ammo — handled via inventory system if available
        // For now emit event so UI can notify player
        break;
      }
    }

    // Emit collection event
    this.bus.emit(EventType.CRATE_COLLECTED, {
      crate,
      tankId: tank.id,
      playerId: tank.playerId,
    });

    // Toast notification
    this.toastManager.add(`${tank.id} collected ${crate.type}!`, 'success', 2500);

    // Remove collected crates from active list
    this.activeCrates = this.activeCrates.filter((c) => !c.collected);
  }

  /** Buy a weapon for a player during shop phase. Returns true if successful. */
  buyWeapon(playerIndex: number, _weaponType: WeaponType, price: number): boolean {
    if (this.phase !== 'shop') return false;
    if (this.playerMoney[playerIndex] === undefined) return false;
    const money = this.playerMoney[playerIndex];
    if (money === undefined || money < price) return false;

    this.playerMoney = this.playerMoney.map((m, i) => (i === playerIndex ? m - price : m));
    return true;
  }

  /** Mark a player as ready in shop. When all ready, advance to next round. */
  shopReady(playerIndex: number): void {
    if (this.phase !== 'shop') return;
    this.shopReadyPlayers.add(playerIndex);

    // Check if all alive players are ready
    const allReady = this.tanks.every(
      (t, i) => t.state === 'destroyed' || this.shopReadyPlayers.has(i),
    );
    if (allReady) {
      this._inShop = false;
      // Start next round
      this.currentPlayerIndex = 0;
      while (
        this.tanks[this.currentPlayerIndex]?.state !== 'alive' &&
        this.currentPlayerIndex < this.tanks.length
      ) {
        this.currentPlayerIndex++;
      }
      this.hasFired = false;
      const prevWind = this.wind;
      this.wind = generateWind(this.roundNumber * 13 + 7);
      this.phase = 'turn';
      this.aiThinkDelay = this.playerIsAI[this.currentPlayerIndex] ? 1.0 : 0;

      this.bus.emit(EventType.WIND_CHANGED, { previousWind: prevWind, newWind: this.wind });
    }
  }

  /** Check if we're in shop phase. */
  get inShop(): boolean {
    return this._inShop;
  }
}
