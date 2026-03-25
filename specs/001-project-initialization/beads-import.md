# Project Initialization & Scaffolding - Beads

**Feature**: 001-project-initialization
**Generated**: 2026-03-25
**Source**: specs/001-project-initialization/tasks.md

## Root Epic

- **ID**: auto-tank-001
- **Title**: Project Initialization & Scaffolding
- **Type**: epic
- **Priority**: 1
- **Description**: Initialize Auto Tank from bare repo to fully working TypeScript + Vite + Canvas web game scaffold with all quality gates enforced.

## Epics

### Phase 1 — Setup: Package & Build Configuration
- **ID**: auto-tank-001.1
- **Type**: epic
- **Priority**: 1
- **Tasks**: 4

### Phase 2 — Quality Tooling: Lint, Format, Hooks, CI
- **ID**: auto-tank-001.2
- **Type**: epic
- **Priority**: 1
- **Blocks**: Phase 3
- **Tasks**: 4

### Phase 3 — Testing Infrastructure
- **ID**: auto-tank-001.3
- **Type**: epic
- **Priority**: 1
- **Blocks**: Phase 4, Phase 5
- **Tasks**: 3

### Phase 4 — Game Engine Stubs: Types & Architecture
- **ID**: auto-tank-001.4
- **Type**: epic
- **Priority**: 1
- **MVP**: true
- **Tasks**: 6

### Phase 5 — Hello World Canvas: Prove the Stack
- **ID**: auto-tank-001.5
- **Type**: epic
- **Priority**: 1
- **Tasks**: 6

### Phase 6 — Polish: CLAUDE.md & Final Verification
- **ID**: auto-tank-001.6
- **Type**: epic
- **Priority**: 2
- **Depends**: All other phases
- **Tasks**: 2

## Tasks

### Phase 1 — Setup

| T-ID | Title | Path | Bead |
|------|-------|------|------|
| T001 | Initialize package.json with deps, scripts, engines | `package.json`, `.nvmrc` | auto-tank-001.1.1 |
| T002 | Configure strict TypeScript | `tsconfig.json`, `tsconfig.node.json` | auto-tank-001.1.2 |
| T003 | Configure Vite with React plugin | `vite.config.ts`, `index.html` | auto-tank-001.1.3 |
| T004 | Create source directory structure | `src/` | auto-tank-001.1.4 |

### Phase 2 — Quality Tooling

| T-ID | Title | Path | Bead |
|------|-------|------|------|
| T005 | Configure ESLint strict TypeScript rules | `.eslintrc.cjs` | auto-tank-001.2.1 |
| T006 | Configure Prettier | `.prettierrc`, `.prettierignore` | auto-tank-001.2.2 |
| T007 | Set up Husky + lint-staged pre-commit | `.husky/pre-commit`, `.lintstagedrc` | auto-tank-001.2.3 |
| T008 | Create GitHub Actions CI pipeline | `.github/workflows/ci.yml` | auto-tank-001.2.4 |

### Phase 3 — Testing Infrastructure

| T-ID | Title | Path | Bead |
|------|-------|------|------|
| T009 | Configure Vitest with coverage thresholds | `vitest.config.ts` | auto-tank-001.3.1 |
| T010 | Configure Playwright for E2E | `playwright.config.ts` | auto-tank-001.3.2 |
| T011 | Write smoke tests | `tests/unit/smoke.test.ts` | auto-tank-001.3.3 |

### Phase 4 — Game Engine Stubs

| T-ID | Title | Path | Bead |
|------|-------|------|------|
| T012 | Define core game types | `src/shared/types/` | auto-tank-001.4.1 |
| T013 | Create GameStateMachine stub | `src/engine/state/GameStateMachine.ts` | auto-tank-001.4.2 |
| T014 | Create physics engine stub | `src/engine/physics/` | auto-tank-001.4.3 |
| T015 | Create weapon system stub | `src/engine/weapons/` | auto-tank-001.4.4 |
| T016 | Create terrain module stub | `src/engine/terrain/` | auto-tank-001.4.5 |
| T017 | Create economy module stub | `src/engine/economy/` | auto-tank-001.4.6 |

### Phase 5 — Hello World Canvas

| T-ID | Title | Path | Bead |
|------|-------|------|------|
| T018 | Create canvas renderer with sky gradient | `src/renderer/sky/SkyRenderer.ts` | auto-tank-001.5.1 |
| T019 | Add procedural terrain rendering | `src/renderer/terrain/TerrainRenderer.ts` | auto-tank-001.5.2 |
| T020 | Add placeholder tank sprite | `src/renderer/entities/TankRenderer.ts` | auto-tank-001.5.3 |
| T021 | Create React UI chrome (App + HUD) | `src/ui/App.tsx`, `src/ui/hud/GameHUD.tsx` | auto-tank-001.5.4 |
| T022 | Wire entry point and game loop | `src/main.tsx`, `src/engine/GameLoop.ts` | auto-tank-001.5.5 |
| T023 | Write E2E test for canvas rendering | `tests/e2e/canvas-renders.spec.ts` | auto-tank-001.5.6 |

### Phase 6 — Polish

| T-ID | Title | Path | Bead |
|------|-------|------|------|
| T024 | Create CLAUDE.md | `CLAUDE.md` | auto-tank-001.6.1 |
| T025 | Final integration verification | all | auto-tank-001.6.2 |

## Summary

| Phase | Tasks | Priority | Bead |
|-------|-------|----------|------|
| 1: Setup | 4 | 1 | auto-tank-001.1 |
| 2: Quality Tooling | 4 | 1 | auto-tank-001.2 |
| 3: Testing Infrastructure | 3 | 1 | auto-tank-001.3 |
| 4: Game Engine Stubs | 6 | 1 | auto-tank-001.4 |
| 5: Hello World Canvas | 6 | 1 | auto-tank-001.5 |
| 6: Polish | 2 | 2 | auto-tank-001.6 |
| **Total** | **25** | | |

## Dependency Graph

```
Phase 1: Setup (auto-tank-001.1)
    |
    v
Phase 2: Quality Tooling (auto-tank-001.2)
    |
    v
Phase 3: Testing Infra (auto-tank-001.3)
    |
    +---> Phase 4: Engine Stubs (auto-tank-001.4) [all tasks parallel]
    |         |
    |         v
    +---> Phase 5: Hello World Canvas (auto-tank-001.5)
              |
              v
         Phase 6: Polish (auto-tank-001.6)
```

## Improvements

Improvements (Level 4: auto-tank-001.N.M.P) are NOT pre-planned here. They are created
during implementation when bugs, refactors, or extra tests are discovered. See
SKILL.md "Improvements (Post-Planning)" section for the workflow.
