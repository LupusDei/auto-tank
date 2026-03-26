# Implementation Plan: Firing Pipeline — Space to Boom

**Branch**: `018-firing-pipeline` | **Date**: 2026-03-26
**Epic**: `auto-tank-018` | **Priority**: P0

## Summary

Wire all existing engine modules into a working firing pipeline: Space key → spawn projectile → physics simulation per frame → collision detection → explosion → terrain deformation → damage → turn advancement. Every piece exists as tested modules — this epic is pure orchestration and rendering integration.

## Bead Map

- `auto-tank-018` - Root: Firing Pipeline
  - `auto-tank-018.1` - Game state upgrade: add projectiles, active effects, phase tracking to App
  - `auto-tank-018.2` - Fire action: Space key → spawnProjectile → PROJECTILE_FIRED event
  - `auto-tank-018.3` - Physics loop: simulateTick integration in update callback
  - `auto-tank-018.4` - Render pipeline: projectile trail + explosion effects in render callback
  - `auto-tank-018.5` - Turn flow: phase transitions + next player after resolution
  - `auto-tank-018.6` - E2E Playwright tests for full firing flow

## Technical Context

**Stack**: TypeScript, Vite, React, Canvas 2D, Vitest, Playwright
**Existing modules**: ProjectileManager, ProjectileSimulation, CollisionDetector, ExplosionResolver, ProjectileRenderer, ExplosionRenderer, EventBus, GameStateMachine, TurnManager
**Key insight**: All logic modules are built and unit-tested. This epic wires them into App.tsx.

## Architecture Decision

Rather than creating a massive GameOrchestrator class, we'll use a **functional composition approach**: App.tsx holds game state in refs, the update callback calls simulateTick, the render callback draws everything. EventBus coordinates between subsystems. This keeps the architecture simple and avoids over-engineering at this stage.

## Phase 1: Game State Upgrade

Expand App.tsx state to include:
- Projectiles array (for physics + rendering)
- Game phase tracking (turn/firing/resolution)
- Active player tracking with real Tank objects
- EventBus instance
- Active explosion effects for rendering
- Wind state that changes per turn

## Phase 2: Fire Action

Wire Space key to:
1. Check canFire(phase, hasFired)
2. Call createFireAction(tank) → TurnAction
3. Call spawnProjectile(position, angle, power, weaponType, playerId)
4. Add projectile to state
5. Transition phase: turn → firing
6. Emit PROJECTILE_FIRED event

## Phase 3: Physics Loop

In the update callback:
1. If phase === 'firing' and projectiles exist:
   - Call simulateTick(state, dt, bus)
   - Update projectiles, terrain, and tank health
2. When all projectiles reach 'done' state:
   - Transition phase: firing → resolution

## Phase 4: Render Pipeline

In the render callback:
1. Draw sky, terrain (with crater updates), tanks (with health bars)
2. For each flying projectile: call renderProjectile(ctx, params)
3. For each active explosion: render particles and apply screen shake
4. Clear finished effects

## Phase 5: Turn Flow

1. On entering 'resolution': evaluate game state
2. endTurn → advance to next alive player
3. Generate new wind
4. Transition: resolution → turn (or victory if only 1 alive)
5. Emit TURN_STARTED, WIND_CHANGED events

## Phase 6: E2E Playwright Tests

Per CLAUDE.md mandate:
1. Write test plan in specs/epic-018-firing-pipeline.plan.md
2. Generate E2E tests in tests/e2e/epic-018/
3. Test: fire weapon → projectile visible → explosion → terrain changed → turn advances

## Parallel Execution

- Phase 1 is sequential (everything depends on it)
- Phases 2, 3, 4 are tightly coupled (state flows through them) — sequential
- Phase 5 depends on 2+3
- Phase 6 depends on all

## Verification Steps

- [ ] Press Space → projectile launches from tank barrel
- [ ] Projectile arcs with visible trail
- [ ] Explosion renders on impact
- [ ] Terrain has visible crater after explosion
- [ ] Turn advances to next player
- [ ] Wind changes between turns
- [ ] All unit tests pass (npm test)
- [ ] Coverage ≥ 90% (npm run test:coverage)
- [ ] E2E Playwright tests pass (npx playwright test tests/e2e/epic-018/)
- [ ] Lint clean (npm run lint)
