# Tasks: Project Initialization & Scaffolding

**Input**: Design documents from `/specs/001-project-initialization/`
**Epic**: `auto-tank-001`

## Format: `[ID] [P?] [Story] Description`

- **T-IDs** (T001, T002): Sequential authoring IDs for this document
- **Bead IDs** (auto-tank-001.N.M): Assigned in beads-import.md after bead creation
- **[P]**: Can run in parallel (different files, no deps)
- **[Story]**: User story label (US1, US2, US3)

## Phase 1: Setup

**Purpose**: Package, TypeScript, Vite, and directory structure — nothing compiles without this.

- [ ] T001 [US1] Initialize package.json with dependencies, scripts, engines field, and .nvmrc in `package.json`, `.nvmrc`
- [ ] T002 [US1] Configure strict TypeScript in `tsconfig.json`, `tsconfig.node.json`
- [ ] T003 [US1] Configure Vite with React plugin in `vite.config.ts`, `index.html`
- [ ] T004 [US1] Create full source directory tree with index barrel files in `src/`

---

## Phase 2: Quality Tooling

**Purpose**: Lint, format, hooks, and CI — constitution enforcement from day one.

- [ ] T005 [P] [US2] Configure ESLint with strict TypeScript rules — no `any`, no unused vars, import ordering in `.eslintrc.cjs`
- [ ] T006 [P] [US2] Configure Prettier with project formatting rules in `.prettierrc`, `.prettierignore`
- [ ] T007 [US2] Set up Husky pre-commit hooks with lint-staged in `.husky/pre-commit`, `.lintstagedrc`
- [ ] T008 [P] [US2] Create GitHub Actions CI pipeline (lint, typecheck, test, coverage, build) in `.github/workflows/ci.yml`

**Checkpoint**: Quality gates active — all subsequent code must pass lint + typecheck

---

## Phase 3: Testing Infrastructure

**Purpose**: Vitest, Playwright, and coverage enforcement — TDD requires this before writing game code.

- [ ] T009 [US2] Configure Vitest with Istanbul coverage, 90% threshold in `vitest.config.ts`
- [ ] T010 [P] [US2] Configure Playwright for E2E testing in `playwright.config.ts`, `tests/e2e/`
- [ ] T011 [US1] Write initial smoke tests (TypeScript compiles, Vite builds, imports resolve) in `tests/unit/smoke.test.ts`

**Checkpoint**: Test infrastructure ready — TDD can begin

---

## Phase 4: Game Engine Stubs

**Goal**: Establish game architecture via typed interfaces and minimal stub implementations.
**Independent Test**: Every stub module exports typed interfaces and has a passing test.

- [ ] T012 [P] [US3] Define core game types — Tank, Weapon, Terrain, GameState, Player, Projectile in `src/shared/types/`
- [ ] T013 [P] [US3] Create GameStateMachine stub with typed states and transitions in `src/engine/state/GameStateMachine.ts`
- [ ] T014 [P] [US3] Create physics engine stub — trajectory calc, collision detection interfaces in `src/engine/physics/`
- [ ] T015 [P] [US3] Create weapon system stub — weapon registry, damage model interfaces in `src/engine/weapons/`
- [ ] T016 [P] [US3] Create terrain module stub — generation, deformation interfaces in `src/engine/terrain/`
- [ ] T017 [P] [US3] Create economy module stub — shop, pricing, inventory interfaces in `src/engine/economy/`

**Checkpoint**: Architecture established — all engine modules importable with typed interfaces

---

## Phase 5: Hello World Canvas

**Goal**: Prove the full stack works: Vite → Canvas → visible rendered scene.
**Independent Test**: Browser loads, canvas visible, gradient sky + terrain + tank rendered.

- [ ] T018 [US1] Create canvas renderer with animated gradient sky in `src/renderer/sky/SkyRenderer.ts`
- [ ] T019 [US1] Add procedural terrain generation and rendering in `src/renderer/terrain/TerrainRenderer.ts`
- [ ] T020 [US1] Add placeholder tank sprite rendering in `src/renderer/entities/TankRenderer.ts`
- [ ] T021 [P] [US1] Create React UI chrome — App shell with canvas mount and HUD overlay in `src/ui/App.tsx`, `src/ui/hud/GameHUD.tsx`
- [ ] T022 [US1] Wire everything into main entry point and game loop in `src/main.tsx`, `src/engine/GameLoop.ts`
- [ ] T023 [US1] Write E2E test verifying canvas renders visible content in `tests/e2e/canvas-renders.spec.ts`

**Checkpoint**: Stack proven end-to-end — browser shows game scene

---

## Phase 6: Polish & Cross-Cutting

- [ ] T024 [P] Create CLAUDE.md with development workflow, commands, and architecture guide in `CLAUDE.md`
- [ ] T025 Final integration verification — lint, typecheck, test, coverage, build all pass

---

## Dependencies

- Setup (Phase 1) → blocks all other phases
- Quality Tooling (Phase 2) → blocks Phase 3 (tests need lint config)
- Testing Infrastructure (Phase 3) → blocks Phase 4 (stubs need tests), Phase 5 (E2E)
- Phase 4 (stubs) → blocks Phase 5 (canvas uses engine types)
- Phase 5 (canvas) → blocks Phase 6 (final verification)
- All phases → block Phase 6

## Parallel Opportunities

- T005, T006, T008 within Phase 2 (different config files)
- T009, T010 within Phase 3 (different test frameworks)
- T012-T017 ALL parallel within Phase 4 (independent stub modules)
- T021 parallel with T018-T020 within Phase 5 (React UI vs canvas renderers)
- After Phase 1, Phases 2 and some of 4 can overlap (types don't need lint config)
