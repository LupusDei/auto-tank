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

## Path Aliases

- `@/` → `src/`
- `@engine/` → `src/engine/`
- `@renderer/` → `src/renderer/`
- `@ui/` → `src/ui/`
- `@shared/` → `src/shared/`

## Task Tracking

Use `bd` (beads) for all tracking. See AGENTS.md for full workflow.

```bash
bd ready              # Find work
bd update <id> --claim # Claim it
bd close <id>         # Done
```

## E2E Test Pipeline (Playwright Agents)

Every epic MUST have E2E tests generated via the Playwright agent pipeline.
This is a mandatory part of completing any epic — unit tests alone are not sufficient.

### Overview

The project uses Playwright's official Claude Code agent integration (`npx playwright init-agents --loop=claude`).
Three sub-agents are available:

- **`playwright-test-planner`** — explores the live app, writes a test plan
- **`playwright-test-generator`** — executes steps in a real browser, writes `.spec.ts` files
- **`playwright-test-healer`** — runs tests and fixes failures

### Step-by-Step: E2E Tests for an Epic

#### 1. Write the test plan spec

Create `specs/epic-<NNN>-<name>.plan.md` with given/when/then use cases for the epic.
Format:

```markdown
# Epic NNN: Epic Name

**Seed:** `tests/e2e/seed.spec.ts`

### 1. Feature Group Name

#### 1.1 Specific test case name
**Steps:**
1. Navigate to the game page
2. Perform action (e.g., press ArrowLeft 5 times)
3. Verify expected outcome (e.g., Angle value in HUD decreased)
```

Each test case should be specific and verifiable — not vague. Include exact
keys to press, exact HUD fields to check, exact visual elements to verify.

#### 2. Generate E2E test files

Spawn `playwright-test-generator` sub-agents for each test group.
Run them in parallel when the test cases are independent:

```
Agent(
  name="playwright-test-generator",
  prompt="""<generate>
    <test-suite>Feature Group Name</test-suite>
    <test-name>Specific test case</test-name>
    <test-file>tests/e2e/epic-NNN/feature-group.spec.ts</test-file>
    <seed-file>tests/e2e/seed.spec.ts</seed-file>
    <body>
    1. Step one
    2. Step two
    3. Verify outcome
    </body>
  </generate>"""
)
```

Multiple test cases can go in one `<body>` block if they belong to the
same describe group — just list them as "Test 1", "Test 2", etc.

Generated specs go in `tests/e2e/epic-<NNN>/`.

#### 3. Run the generated tests

```bash
npx playwright test tests/e2e/epic-<NNN>/
```

#### 4. Fix failures

For each failing test, determine the root cause:

- **Not wired**: The engine module exists and passes unit tests, but the
  App shell (`src/ui/App.tsx`) doesn't connect it to the UI. Fix by wiring
  the module into the App — do NOT delete or weaken the test.
- **Broken**: The feature is wired but produces wrong results. Fix the
  implementation.
- **Bad test**: The generated test has incorrect assertions or selectors.
  Fix the test to match actual behavior.

Re-run until all tests pass. Use the `playwright-test-healer` agent if needed:

```
Agent(
  name="playwright-test-healer",
  prompt="<heal>Run all tests in tests/e2e/epic-NNN/ and fix the failing ones.</heal>"
)
```

#### 5. Commit

```bash
git add specs/epic-NNN-*.plan.md tests/e2e/epic-NNN/
git commit -m "test: E2E specs for epic NNN via Playwright agent pipeline"
```

### File Structure

```
specs/
  epic-006-input-handling.plan.md     # Test plan (given/when/then)
  epic-018-rendering.plan.md
tests/e2e/
  seed.spec.ts                        # Base seed (navigate + verify canvas)
  helpers.ts                          # Shared helpers (launchGame, pressKey, etc.)
  epic-006/                           # Generated E2E specs per epic
    keyboard-capture.spec.ts
    angle-control.spec.ts
    ...
  epic-018/
    sky-rendering.spec.ts
    ...
```

### Rules

- Every epic gets a `specs/epic-NNN-*.plan.md` AND `tests/e2e/epic-NNN/*.spec.ts`
- Tests must use helpers from `tests/e2e/helpers.ts` — do not duplicate utility code
- Tests that find unwired features should annotate via `test.info().annotations`
  rather than silently passing — the test documents expected behavior
- Do NOT skip or delete tests because the feature isn't wired yet — fix the wiring
- Run `npx playwright test` to verify before pushing

## Pre-Push Checklist
```bash
npm run build && npm test && npm run test:coverage
```
All three must pass. No exceptions.
