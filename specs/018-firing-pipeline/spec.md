# Feature Specification: Firing Pipeline — Space to Boom

**Feature Branch**: `018-firing-pipeline`
**Created**: 2026-03-26
**Status**: Draft

## User Scenarios & Testing

### User Story 1 - Player Fires a Weapon (Priority: P0)

Player adjusts angle/power, presses Space. A projectile launches from the tank barrel, arcs through the sky affected by wind and gravity, and detonates on impact with terrain or an enemy tank. The terrain deforms into a crater and damaged tanks lose health.

**Independent Test**: Press Space with default settings — projectile visible, arc complete, explosion visible, terrain crater visible.

**Acceptance Scenarios**:

1. **Given** a game in 'turn' phase, **When** Space is pressed, **Then** a projectile spawns at the active tank's barrel tip and flies in an arc
2. **Given** a flying projectile, **When** it hits terrain, **Then** an explosion renders, terrain deforms into a crater, and the projectile disappears
3. **Given** a flying projectile, **When** it hits an enemy tank, **Then** the tank takes damage, health bar decreases, and explosion renders
4. **Given** a projectile has resolved, **When** all effects complete, **Then** the turn advances to the next player

### User Story 2 - Projectile Visuals (Priority: P1)

The projectile trail renders as a fading arc. Explosions show particle effects and screen shake. The camera follows the projectile.

**Acceptance Scenarios**:

1. **Given** a flying projectile, **When** rendering, **Then** a trail of fading dots follows the projectile head
2. **Given** an explosion, **When** rendering, **Then** particles expand outward and screen shakes proportional to weapon radius

### User Story 3 - Turn Flow (Priority: P1)

After firing, the turn transitions through phases correctly. The next player gains control. Wind changes between turns.

**Acceptance Scenarios**:

1. **Given** player fires, **When** resolution completes, **Then** phase transitions turn → firing → resolution → turn
2. **Given** a turn ends, **When** next turn starts, **Then** a new wind value displays and the next alive player's tank is active

## Requirements

- **FR-001**: Space/Enter key spawns a projectile from the active tank
- **FR-002**: Projectile follows physics (gravity + wind) each frame
- **FR-003**: Collision detection triggers explosion on terrain/tank/out-of-bounds
- **FR-004**: Explosion deforms terrain and damages nearby tanks
- **FR-005**: Projectile trail and explosion effects render visually
- **FR-006**: Turn advances after projectile resolution
- **FR-007**: EventBus emits PROJECTILE_FIRED, EXPLOSION, TERRAIN_DEFORMED, TANK_DAMAGED, TURN_ENDED

## Success Criteria

- **SC-001**: Player can fire and see a complete projectile arc from press to explosion
- **SC-002**: Terrain visibly deforms after explosion
- **SC-003**: Turn alternates between players after each shot
- **SC-004**: All unit tests pass with 90%+ coverage
- **SC-005**: E2E Playwright tests verify the full firing flow
