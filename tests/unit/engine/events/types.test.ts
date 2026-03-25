import {
  createGameEvent,
  type EventPayloadMap,
  EventType,
  isGameEvent,
  type PhaseChangedPayload,
  type PlayerEliminatedPayload,
  type ProjectileFiredPayload,
  type RoundEndedPayload,
  type RoundStartedPayload,
  type TankDamagedPayload,
  type TankDestroyedPayload,
  type TankFallingPayload,
  type TankMovedPayload,
  type TerrainDeformedPayload,
  type TurnEndedPayload,
  type TurnStartedPayload,
  type WeaponSelectedPayload,
  type WindChangedPayload,
} from '@engine/events/types';
import { describe, expect, it } from 'vitest';

describe('EventType', () => {
  it('should define all required event types', () => {
    expect(EventType.PROJECTILE_FIRED).toBe('projectile_fired');
    expect(EventType.TERRAIN_DEFORMED).toBe('terrain_deformed');
    expect(EventType.TANK_DAMAGED).toBe('tank_damaged');
    expect(EventType.TURN_STARTED).toBe('turn_started');
    expect(EventType.TURN_ENDED).toBe('turn_ended');
    expect(EventType.PHASE_CHANGED).toBe('phase_changed');
    expect(EventType.WIND_CHANGED).toBe('wind_changed');
    expect(EventType.EXPLOSION).toBe('explosion');
    expect(EventType.TANK_MOVED).toBe('tank_moved');
    expect(EventType.WEAPON_SELECTED).toBe('weapon_selected');
    expect(EventType.TANK_DESTROYED).toBe('tank_destroyed');
    expect(EventType.PLAYER_ELIMINATED).toBe('player_eliminated');
    expect(EventType.ROUND_STARTED).toBe('round_started');
    expect(EventType.ROUND_ENDED).toBe('round_ended');
    expect(EventType.TANK_FALLING).toBe('tank_falling');
  });

  it('should have unique values for all event types', () => {
    const values = Object.values(EventType);
    const uniqueValues = new Set(values);
    expect(uniqueValues.size).toBe(values.length);
  });
});

describe('createGameEvent', () => {
  it('should create a GameEvent with correct type and payload', () => {
    const payload: ProjectileFiredPayload = {
      projectileId: 'proj-1',
      tankId: 'tank-1',
      weaponType: 'missile',
      position: { x: 100, y: 200 },
      velocity: { x: 50, y: -30 },
    };

    const event = createGameEvent(EventType.PROJECTILE_FIRED, payload, 'tank-1');

    expect(event.type).toBe(EventType.PROJECTILE_FIRED);
    expect(event.payload).toEqual(payload);
    expect(event.source).toBe('tank-1');
    expect(typeof event.timestamp).toBe('number');
    expect(event.timestamp).toBeGreaterThan(0);
  });

  it('should create event with default source when omitted', () => {
    const payload: WindChangedPayload = {
      previousWind: 0,
      newWind: 5.5,
    };

    const event = createGameEvent(EventType.WIND_CHANGED, payload);

    expect(event.type).toBe(EventType.WIND_CHANGED);
    expect(event.payload).toEqual(payload);
    expect(event.source).toBe('system');
  });

  it('should assign increasing timestamps for sequential events', () => {
    const payload: TurnStartedPayload = {
      playerId: 'p1',
      tankId: 'tank-1',
      turnNumber: 1,
    };

    const event1 = createGameEvent(EventType.TURN_STARTED, payload);
    const event2 = createGameEvent(EventType.TURN_STARTED, payload);

    expect(event2.timestamp).toBeGreaterThanOrEqual(event1.timestamp);
  });

  it('should preserve payload immutability', () => {
    const payload: TankDamagedPayload = {
      tankId: 'tank-1',
      damage: 25,
      newHealth: 75,
      sourcePlayerId: 'p2',
    };

    const event = createGameEvent(EventType.TANK_DAMAGED, payload);

    expect(Object.isFrozen(event)).toBe(true);
    expect(Object.isFrozen(event.payload)).toBe(true);
  });
});

describe('isGameEvent', () => {
  it('should return true for valid game events', () => {
    const event = createGameEvent(EventType.EXPLOSION, {
      position: { x: 100, y: 200 },
      radius: 50,
      damage: 30,
      weaponType: 'missile',
    });

    expect(isGameEvent(event)).toBe(true);
  });

  it('should return false for non-objects', () => {
    expect(isGameEvent(null)).toBe(false);
    expect(isGameEvent(undefined)).toBe(false);
    expect(isGameEvent('string')).toBe(false);
    expect(isGameEvent(42)).toBe(false);
  });

  it('should return false for objects missing required fields', () => {
    expect(isGameEvent({ type: 'explosion' })).toBe(false);
    expect(isGameEvent({ type: 'explosion', payload: {} })).toBe(false);
    expect(isGameEvent({ payload: {}, timestamp: 1 })).toBe(false);
  });
});

describe('Event payload types', () => {
  it('should type-check ProjectileFiredPayload', () => {
    const payload: ProjectileFiredPayload = {
      projectileId: 'p1',
      tankId: 't1',
      weaponType: 'nuke',
      position: { x: 0, y: 0 },
      velocity: { x: 10, y: -10 },
    };
    expect(payload.projectileId).toBe('p1');
    expect(payload.weaponType).toBe('nuke');
  });

  it('should type-check TerrainDeformedPayload', () => {
    const payload: TerrainDeformedPayload = {
      position: { x: 200, y: 300 },
      radius: 40,
      craterDepth: 15,
    };
    expect(payload.radius).toBe(40);
  });

  it('should type-check TankDamagedPayload', () => {
    const payload: TankDamagedPayload = {
      tankId: 't1',
      damage: 50,
      newHealth: 50,
      sourcePlayerId: 'p2',
    };
    expect(payload.damage).toBe(50);
  });

  it('should type-check PhaseChangedPayload', () => {
    const payload: PhaseChangedPayload = {
      previousPhase: 'turn',
      newPhase: 'firing',
    };
    expect(payload.previousPhase).toBe('turn');
    expect(payload.newPhase).toBe('firing');
  });

  it('should type-check TankMovedPayload', () => {
    const payload: TankMovedPayload = {
      tankId: 't1',
      previousPosition: { x: 0, y: 0 },
      newPosition: { x: 10, y: 0 },
      fuelUsed: 5,
    };
    expect(payload.fuelUsed).toBe(5);
  });

  it('should type-check WeaponSelectedPayload', () => {
    const payload: WeaponSelectedPayload = {
      tankId: 't1',
      previousWeapon: 'baby-missile',
      newWeapon: 'nuke',
    };
    expect(payload.newWeapon).toBe('nuke');
  });

  it('should type-check TankDestroyedPayload', () => {
    const payload: TankDestroyedPayload = {
      tankId: 't1',
      killerPlayerId: 'p2',
      position: { x: 100, y: 200 },
    };
    expect(payload.killerPlayerId).toBe('p2');
  });

  it('should type-check PlayerEliminatedPayload', () => {
    const payload: PlayerEliminatedPayload = {
      playerId: 'p1',
      rank: 3,
    };
    expect(payload.rank).toBe(3);
  });

  it('should type-check RoundStartedPayload', () => {
    const payload: RoundStartedPayload = {
      roundNumber: 1,
      playerIds: ['p1', 'p2'],
    };
    expect(payload.playerIds).toHaveLength(2);
  });

  it('should type-check RoundEndedPayload', () => {
    const payload: RoundEndedPayload = {
      roundNumber: 1,
      winnerId: 'p1',
    };
    expect(payload.winnerId).toBe('p1');
  });

  it('should type-check TurnEndedPayload', () => {
    const payload: TurnEndedPayload = {
      playerId: 'p1',
      tankId: 't1',
      turnNumber: 5,
      reason: 'fired',
    };
    expect(payload.reason).toBe('fired');
  });

  it('should type-check TankFallingPayload', () => {
    const payload: TankFallingPayload = {
      tankId: 't1',
      startPosition: { x: 50, y: 100 },
      fallDistance: 30,
    };
    expect(payload.fallDistance).toBe(30);
  });

  it('should enforce EventPayloadMap type correctness', () => {
    // Verifies that the payload map connects each EventType to its payload
    type TestProjectile = EventPayloadMap[typeof EventType.PROJECTILE_FIRED];
    const _check: TestProjectile = {
      projectileId: 'p1',
      tankId: 't1',
      weaponType: 'missile',
      position: { x: 0, y: 0 },
      velocity: { x: 1, y: 1 },
    };
    expect(_check).toBeDefined();

    type TestPhase = EventPayloadMap[typeof EventType.PHASE_CHANGED];
    const _checkPhase: TestPhase = {
      previousPhase: 'lobby',
      newPhase: 'setup',
    };
    expect(_checkPhase).toBeDefined();
  });
});
