# Feature Specification: Project Initialization & Scaffolding

**Feature Branch**: `001-project-initialization`
**Created**: 2026-03-25
**Status**: Draft

## User Scenarios & Testing

### User Story 1 - Developer Bootstraps Project (Priority: P1)

A developer clones the repo, runs `npm install` and `npm run dev`, and sees a working Vite dev server with a canvas-based game screen rendering a gradient sky, terrain silhouette, and a placeholder tank. The full toolchain (TypeScript, linting, testing) works out of the box.

**Why this priority**: Nothing else can happen until the project compiles and runs.

**Independent Test**: Clone fresh, `npm install && npm run dev` opens browser with canvas rendering.

**Acceptance Scenarios**:

1. **Given** a fresh clone, **When** `npm install` is run, **Then** all dependencies install without errors
2. **Given** installed deps, **When** `npm run dev` is run, **Then** Vite serves the app at localhost with HMR
3. **Given** the dev server running, **When** the browser loads, **Then** a full-screen canvas renders a gradient sky and terrain
4. **Given** the project, **When** `npm run lint` is run, **Then** zero warnings and zero errors
5. **Given** the project, **When** `npm test` is run, **Then** Vitest runs and all tests pass with coverage output

---

### User Story 2 - Developer Runs Quality Gates (Priority: P1)

A developer makes a change and the pre-commit hook validates lint + typecheck + tests automatically. CI runs the same checks on push. Coverage thresholds are enforced.

**Why this priority**: The constitution mandates quality gates from day one.

**Independent Test**: Make a deliberate lint error, attempt commit — it must be rejected.

**Acceptance Scenarios**:

1. **Given** a staged file with a lint error, **When** `git commit` is attempted, **Then** the pre-commit hook rejects it
2. **Given** the CI config, **When** a push triggers CI, **Then** lint, typecheck, test, and coverage checks run
3. **Given** the coverage config, **When** tests run, **Then** coverage below 90% causes a failure

---

### User Story 3 - Developer Writes First Game Code (Priority: P1)

A developer picks up a game feature bead and finds well-organized stub modules for the engine, renderer, UI, and shared types. The architecture is clear and the type system guides them.

**Why this priority**: Stubs with types establish the architecture and make all subsequent work parallelizable.

**Independent Test**: Import any engine module — it compiles, exports typed interfaces, and has a passing test.

**Acceptance Scenarios**:

1. **Given** the engine directory, **When** a developer imports `src/engine/state/GameStateMachine`, **Then** it exports a typed state machine with game states
2. **Given** the physics module, **When** imported, **Then** it exports trajectory calculation function signatures
3. **Given** the shared types, **When** imported, **Then** core game types (Tank, Weapon, Terrain, GameState) are available

---

### Edge Cases

- What happens if Node.js version is wrong? → `.nvmrc` and `engines` field enforce version.
- What if Playwright browsers aren't installed? → `npm run test:e2e` runs `npx playwright install` first.

## Requirements

### Functional Requirements

- **FR-001**: Project MUST compile with `strict: true` TypeScript with zero errors
- **FR-002**: Project MUST lint clean with zero warnings using ESLint strict config
- **FR-003**: Project MUST run tests via Vitest with coverage reporting
- **FR-004**: Project MUST serve via Vite with HMR in development
- **FR-005**: Project MUST render an HTML5 Canvas with a visible scene on load
- **FR-006**: Project MUST enforce pre-commit quality gates (lint + typecheck + test)
- **FR-007**: Project MUST include CI pipeline configuration (GitHub Actions)
- **FR-008**: Project MUST have Playwright configured for E2E testing
- **FR-009**: Project MUST define core game type interfaces in shared modules

## Success Criteria

- **SC-001**: `npm install && npm run dev` works on a fresh clone in under 60 seconds
- **SC-002**: `npm run lint && npm run typecheck && npm test` all pass with zero errors
- **SC-003**: Test coverage reports are generated and thresholds are enforced
- **SC-004**: Canvas renders visible content (sky gradient + terrain) on page load
- **SC-005**: All stub modules have at least one passing test
