# Auto Tank

Scorched Earth + Worms Armageddon recreation. See README.md for full vision and design.

## Tech Stack
- TypeScript strict mode, Vite, Vitest, Playwright
- HTML5 Canvas + WebGL rendering, React UI chrome
- Node.js + WebSocket multiplayer server
- ESLint strict + Prettier

## Build & Test
```bash
npm run build        # Lint + type-check + bundle (must exit 0)
npm test             # Vitest run (NEVER use bare `vitest`)
npm run test:coverage # Must meet: 90% lines, 95% target
npm run lint         # Zero warnings tolerance
npm run typecheck    # Strict mode, no errors
```

## Code Rules
- TDD: write failing test FIRST, then implement, then refactor
- 90% minimum line coverage, 100% branch coverage on physics/damage/economy
- No `any` types, no `console.log`, no unused variables
- Max 300 lines per file
- Pure functions for all game logic (deterministic for replays)
- Domain-driven naming: `calculateProjectileTrajectory()` not `calc()`
- Conventional commits: feat:, fix:, test:, refactor:, docs:, chore:

## Architecture
- Game loop: physics tick, render frame, and input handling are decoupled
- ECS-inspired: entities (tanks, projectiles, terrain) composed of components
- Event-driven: systems communicate via typed events, not direct references
- State machine: Lobby → Setup → Playing → Turn → Firing → Resolution → Shop → Victory
- Deterministic simulation: same inputs = same outputs (enables replays + netcode)

## Project Structure
```
src/engine/       # Core: physics, terrain, weapons, economy, AI, state
src/renderer/     # Canvas/WebGL: sky, terrain, effects, HUD
src/ui/           # React: lobby, shop, scoreboard, settings
src/network/      # WebSocket multiplayer
src/audio/        # Sound engine
src/shared/       # Types, constants, utilities
server/           # Game server
tests/unit/       # Mirrors src/ structure
tests/integration/
tests/e2e/        # Playwright
```

## Pre-Push Checklist
```bash
npm run build && npm test && npm run test:coverage
```
All three must pass. No exceptions.
