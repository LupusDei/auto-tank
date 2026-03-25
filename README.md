# Auto Tank

**A modern web recreation of Scorched Earth, infused with the spirit of Worms Armageddon.**

Auto Tank is a turn-based artillery strategy game built as a Node.js TypeScript web application. Players command tanks on destructible terrain, selecting weapons, adjusting angle and power, and unleashing devastation on their opponents. The game draws its core mechanics from the classic DOS game *Scorched Earth* (1991) and layers on the personality, weapon variety, and polish of *Worms Armageddon* (1999).

---

## Vision

Scorched Earth defined the artillery genre. Worms Armageddon perfected it with humor, creativity, and depth. Auto Tank brings both legacies to the browser with modern web technology, beautiful visuals, and a codebase built to last.

**This is not a quick prototype.** Auto Tank is built with rigorous engineering discipline — test-driven development, comprehensive coverage, strict linting, and clean architecture from day one.

---

## Tech Stack

| Layer | Technology |
|-------|-----------|
| **Language** | TypeScript (strict mode) |
| **Runtime** | Node.js |
| **Frontend** | HTML5 Canvas + WebGL for rendering, React for UI chrome |
| **Backend** | Node.js with WebSocket for multiplayer |
| **Build** | Vite |
| **Testing** | Vitest + Playwright (E2E) |
| **Linting** | ESLint (strict config) + Prettier |
| **Task Tracking** | Beads (`bd` CLI) |
| **Spec & Planning** | Speckit |

---

## Game Features & Inspiration

### From Scorched Earth

- **Destructible terrain** — Projectiles deform the landscape on impact. Tanks can fall into craters, slide down slopes, or become buried
- **Turn-based artillery combat** — Adjust angle, power, and weapon selection each turn
- **Wind system** — Variable wind affects projectile trajectories, adding a layer of skill
- **Weapon shop between rounds** — Earn money from kills and damage to buy weapons and defenses
- **Multiple weapon types** — Baby Missile, Missile, MIRV, Napalm, Dirt Bombs, Diggers, Rollers, Death's Head, Funky Bomb, Nuke
- **Shield and defense systems** — Light/Heavy shields, parachutes, fuel for tank movement
- **Tank movement** — Spend fuel to reposition before firing
- **AI opponents** — Multiple difficulty levels from "Sitting Duck" to "Cyborg"
- **Mountain terrain generation** — Procedurally generated landscapes with varying profiles
- **Economy system** — Interest on savings, varying payouts based on difficulty
- **Multiple rounds** — Track cumulative scores across a match

### From Worms Armageddon

- **Ninja Rope / Grappling Hook** — Traversal tool for repositioning (adapted for tanks as a tow cable)
- **Weapon variety and personality** — Holy Hand Grenade, Banana Bomb, Super Sheep, Concrete Donkey-style superweapons with flair and humor
- **Dynamic water** — Rising water levels in sudden death mode
- **Crate drops** — Random weapon and health crates fall from the sky between turns
- **Terrain tools** — Blowtorch, Pneumatic Drill equivalents for tunneling
- **Game schemes** — Highly configurable rulesets (time per turn, starting weapons, wind strength)
- **Replay system** — Watch the last shot replay with camera tracking
- **Team-based play** — Multiple tanks per player with team colors
- **Sudden death** — Escalating pressure when rounds run long (rising water, nuke rain, or health drain)
- **Sound design** — Satisfying explosions, weapon-specific audio, ambient wind
- **Victory celebrations** — Animated victory sequences between rounds

### Auto Tank Originals

- **Modern UI** — Sleek, dark-themed interface inspired by Scorched Earth's iconic gradient skies but with modern design sensibilities: glassmorphism panels, smooth animations, particle effects
- **Responsive canvas** — Full-screen gameplay that scales to any resolution
- **Online multiplayer** — WebSocket-based real-time multiplayer with lobby system
- **Spectator mode** — Watch ongoing matches
- **Custom weapon editor** — Define custom weapons with explosion radius, cluster count, and behavior
- **Terrain themes** — Desert, Arctic, Volcanic, Lunar, Classic SE gradient

---

## UI Design Philosophy

The visual identity channels Scorched Earth's atmosphere — vivid gradient skies, rugged terrain silhouettes, and the satisfying arc of projectile trails — but rendered with modern techniques:

- **Sky gradients** shifting from deep indigo to burning orange, animated with time-of-day progression
- **Terrain** rendered with textured fills, erosion effects on deformation, and debris particles
- **Explosions** using particle systems with bloom, screen shake, and crater shadows
- **HUD** designed as translucent floating panels with clean typography and iconography
- **Weapon selection** as a radial menu with previews and ammo counts
- **Power/angle gauge** rendered as a sleek arc meter on the active tank
- **Scoreboard** as a persistent sidebar with team colors, health bars, and kill counts

---

## Project Constitution

This constitution governs all development on Auto Tank. Every contributor — human or AI — must adhere to these standards. There are no exceptions.

### 1. Test-Driven Development (TDD)

**All features are written test-first.** No production code is written without a failing test that demands it.

- **Red-Green-Refactor**: Write a failing test. Write the minimum code to pass. Refactor with confidence.
- **No untested code ships.** If it isn't tested, it doesn't exist.
- **Tests are first-class citizens.** They receive the same care, naming, and refactoring attention as production code.
- **Test naming convention**: `should [expected behavior] when [condition]` — every test name is a specification.

### 2. Test Coverage

**Minimum 90% line coverage. Target 95%+.**

- Coverage is measured on every commit via CI
- Coverage regressions block merges — you cannot lower the coverage percentage
- Critical paths (physics engine, damage calculation, economy) require **100% branch coverage**
- E2E tests cover all core user flows: game creation, weapon selection, firing, terrain deformation, round completion, multiplayer connection

### 3. Linting & Code Style

**Zero tolerance for lint warnings.** The codebase compiles and lints clean at all times.

- **ESLint** with strict TypeScript rules enabled — no `any` types, no unused variables, no implicit returns
- **Prettier** for consistent formatting — no style debates, ever
- **Strict TypeScript** — `strict: true`, `noUncheckedIndexedAccess: true`, `exactOptionalPropertyTypes: true`
- **Pre-commit hooks** enforce lint + format checks; commits that fail are rejected
- **Import ordering** enforced automatically
- **No `console.log` in production code** — use a structured logger

### 4. Code Quality Standards

- **Single Responsibility** — Every module, class, and function does one thing
- **Pure functions preferred** — Game logic (physics, damage, economy) must be pure and deterministic for testing and replay
- **Explicit over implicit** — No magic strings, no default exports, no barrel files that obscure dependencies
- **Domain-driven naming** — Code reads like the game: `calculateProjectileTrajectory()`, `applyExplosionDamage()`, `deformTerrain()`
- **Small modules** — No file exceeds 300 lines. If it does, it has too many responsibilities.
- **No premature abstraction** — Duplication is better than the wrong abstraction. Extract patterns only after the third occurrence.
- **Error handling** — All errors are typed. No swallowed exceptions. Game state transitions are validated.
- **Documentation** — Public APIs have JSDoc. Architecture decisions are recorded in ADRs. Complex algorithms get inline explanation.

### 5. Architecture Principles

- **Game loop separation** — Physics tick, render frame, and input handling are decoupled
- **Deterministic simulation** — Given the same inputs, the game produces the same results (enables replays and netcode)
- **ECS-inspired design** — Entities (tanks, projectiles, terrain) composed of components, processed by systems
- **Event-driven communication** — Systems communicate through typed events, not direct references
- **State machine for game flow** — Lobby → Setup → Playing → Turn → Firing → Resolution → Shop → Next Round → Victory

### 6. Git & Workflow

- **Atomic commits** — Each commit is a single logical change that passes all tests
- **Conventional commits** — `feat:`, `fix:`, `test:`, `refactor:`, `docs:`, `chore:`
- **Feature branches** — All work happens on branches, merged via PR after review
- **No force pushes to main** — Ever.
- **CI must pass** — No merging with red checks

---

## Task Tracking

All task tracking uses **Beads** (`bd` CLI). No markdown TODOs, no external issue trackers.

```bash
bd ready              # Find available work
bd show <id>          # View issue details
bd update <id> --claim  # Claim work atomically
bd close <id>         # Complete work
bd create --title="..." --description="..." --type=feature --priority=2
```

See [AGENTS.md](./AGENTS.md) for the full beads workflow.

---

## Speckit Integration

This project uses [Speckit](https://github.com/anthropics/speckit) for specification-driven planning and development. All major features begin as specs before implementation:

```
specs/
  001-terrain-generation/
    spec.md          # What and why
    plan.md          # How — technical approach
    tasks.md         # Breakdown into implementable units
    beads-import.md  # Bead creation for task tracking
  002-physics-engine/
  003-weapon-system/
  ...
```

Specs are living documents — they evolve as implementation reveals new constraints. Every spec links to its corresponding beads for traceability.

---

## Project Structure

```
auto-tank/
├── src/
│   ├── engine/            # Core game engine
│   │   ├── physics/       # Projectile physics, collision detection
│   │   ├── terrain/       # Terrain generation and deformation
│   │   ├── weapons/       # Weapon definitions and behaviors
│   │   ├── economy/       # Shop, pricing, inventory
│   │   ├── ai/            # AI opponent strategies
│   │   └── state/         # Game state machine
│   ├── renderer/          # Canvas/WebGL rendering
│   │   ├── sky/           # Sky gradients and weather
│   │   ├── terrain/       # Terrain rendering with textures
│   │   ├── effects/       # Particles, explosions, trails
│   │   └── hud/           # In-game UI overlays
│   ├── ui/                # React UI components
│   │   ├── lobby/         # Game lobby and matchmaking
│   │   ├── shop/          # Weapon shop between rounds
│   │   ├── scoreboard/    # Score display
│   │   └── settings/      # Game configuration
│   ├── network/           # WebSocket multiplayer
│   ├── audio/             # Sound engine and effects
│   └── shared/            # Types, constants, utilities
├── server/                # Game server
├── specs/                 # Speckit specifications
├── tests/
│   ├── unit/              # Unit tests (mirrors src/)
│   ├── integration/       # Cross-system tests
│   └── e2e/               # Playwright browser tests
├── assets/                # Sprites, sounds, fonts
├── .beads/                # Beads issue tracking data
└── CLAUDE.md              # AI agent instructions
```

---

## Getting Started

```bash
# Install dependencies
npm install

# Start development server
npm run dev

# Run tests
npm test

# Run tests in watch mode
npm run test:watch

# Check coverage
npm run test:coverage

# Lint
npm run lint

# Type check
npm run typecheck
```

---

## Contributing

1. Check `bd ready` for available work
2. Claim a bead with `bd update <id> --claim`
3. Write failing tests first
4. Implement until tests pass
5. Refactor while green
6. Ensure `npm run lint && npm test` passes
7. Commit with conventional commit message
8. Close the bead with `bd close <id>`

---

## License

TBD

---

*"The Mother of All Games" — Scorched Earth README, 1991*
