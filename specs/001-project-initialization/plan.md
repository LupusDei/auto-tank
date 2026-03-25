# Implementation Plan: Project Initialization & Scaffolding

**Branch**: `001-project-initialization` | **Date**: 2026-03-25
**Epic**: `auto-tank-001` | **Priority**: P1

## Summary

Initialize the Auto Tank project from bare repo to a fully working TypeScript + Vite + Canvas web game scaffold. Every quality gate in the project constitution (TDD, coverage, lint, strict TS) is enforced from the first commit. Stub modules establish the game architecture so all subsequent feature work can proceed in parallel.

## Bead Map

- `auto-tank-001` - Root: Project Initialization & Scaffolding
  - `auto-tank-001.1` - Setup: Package & Build Configuration
    - `auto-tank-001.1.1` - Initialize package.json with scripts and engines
    - `auto-tank-001.1.2` - Configure TypeScript (tsconfig.json, strict mode)
    - `auto-tank-001.1.3` - Configure Vite with Canvas/React setup
    - `auto-tank-001.1.4` - Create source directory structure
  - `auto-tank-001.2` - Quality Tooling: Lint, Format, Hooks, CI
    - `auto-tank-001.2.1` - Configure ESLint with strict TypeScript rules
    - `auto-tank-001.2.2` - Configure Prettier
    - `auto-tank-001.2.3` - Set up pre-commit hooks (Husky + lint-staged)
    - `auto-tank-001.2.4` - Create GitHub Actions CI pipeline
  - `auto-tank-001.3` - Testing Infrastructure
    - `auto-tank-001.3.1` - Configure Vitest with coverage thresholds
    - `auto-tank-001.3.2` - Configure Playwright for E2E
    - `auto-tank-001.3.3` - Write smoke tests proving the setup works
  - `auto-tank-001.4` - Game Engine Stubs: Types & Architecture
    - `auto-tank-001.4.1` - Define core game types (shared/types)
    - `auto-tank-001.4.2` - Create game state machine stub
    - `auto-tank-001.4.3` - Create physics engine stub
    - `auto-tank-001.4.4` - Create weapon system stub
    - `auto-tank-001.4.5` - Create terrain module stub
    - `auto-tank-001.4.6` - Create economy module stub
  - `auto-tank-001.5` - Hello World Canvas: Prove the Stack
    - `auto-tank-001.5.1` - Create canvas renderer with sky gradient
    - `auto-tank-001.5.2` - Add procedural terrain rendering
    - `auto-tank-001.5.3` - Add placeholder tank sprite
    - `auto-tank-001.5.4` - Create React UI chrome (HUD shell)
    - `auto-tank-001.5.5` - Write E2E test proving canvas renders
  - `auto-tank-001.6` - Polish: CLAUDE.md & Final Verification
    - `auto-tank-001.6.1` - Create CLAUDE.md with agent development instructions
    - `auto-tank-001.6.2` - Final integration verification and cleanup

## Technical Context

**Stack**: TypeScript 5.x, Node.js 20+, Vite 6.x, React 19, Vitest, Playwright
**Storage**: N/A (client-side game, server comes later)
**Testing**: Vitest (unit/integration) + Playwright (E2E)
**Constraints**: Must enforce project constitution quality gates from first commit

## Architecture Decision

Vite is chosen over Next.js/Remix because this is a canvas-heavy game, not a document-oriented web app. React is used only for UI chrome (menus, HUD, shop) — the game itself renders to a raw Canvas/WebGL context managed outside React's lifecycle. This separation keeps the game loop performant and React's re-rendering out of the hot path.

## Files Changed

| File | Change |
|------|--------|
| `package.json` | Create with all deps, scripts, engines |
| `tsconfig.json` | Strict TypeScript configuration |
| `tsconfig.node.json` | Node config for Vite/tooling |
| `vite.config.ts` | Vite with React plugin |
| `.eslintrc.cjs` | Strict ESLint config |
| `.prettierrc` | Prettier config |
| `.husky/pre-commit` | Pre-commit hook |
| `.github/workflows/ci.yml` | CI pipeline |
| `vitest.config.ts` | Test configuration with coverage |
| `playwright.config.ts` | E2E test configuration |
| `index.html` | Entry HTML with canvas mount |
| `src/main.tsx` | Application entry point |
| `src/engine/**/*.ts` | Game engine stubs |
| `src/renderer/**/*.ts` | Canvas renderer |
| `src/ui/**/*.tsx` | React UI components |
| `src/shared/**/*.ts` | Shared types and constants |
| `tests/**/*.test.ts` | All test files |
| `CLAUDE.md` | Agent instructions |

## Phase 1: Setup

Initialize package.json, TypeScript config, Vite config, and the directory tree. This is the foundation everything else builds on. No code compiles until this is done.

## Phase 2: Quality Tooling

Configure ESLint, Prettier, Husky pre-commit hooks, and GitHub Actions CI. The constitution requires zero-tolerance lint enforcement from day one, so this must be in place before any game code is written.

## Phase 3: Testing Infrastructure

Set up Vitest with coverage thresholds (90% minimum) and Playwright for E2E. Write initial smoke tests to prove the test infrastructure works.

## Phase 4: Game Engine Stubs

Define the core type system and create stub modules for all engine subsystems: state machine, physics, weapons, terrain, economy. These are typed interfaces with minimal implementations — enough to compile, export, and have a passing test. This establishes the architecture that all feature work builds on.

## Phase 5: Hello World Canvas

Prove the full stack works end-to-end: Vite serves a page → Canvas renders a gradient sky + procedural terrain + tank placeholder → React chrome wraps the canvas. An E2E test verifies the canvas is visible and has rendered content.

## Phase 6: Polish

Create CLAUDE.md with development instructions for AI agents. Run final verification: lint, typecheck, test, coverage, build.

## Parallel Execution

- Phase 1 is sequential (everything depends on it)
- Phase 2 tasks (ESLint, Prettier, Husky, CI) can run in parallel
- Phase 3 depends on Phase 1 completion
- Phase 4 tasks (each engine stub) can ALL run in parallel after Phase 1
- Phase 5 depends on Phases 1, 3, and 4
- Phase 6 depends on everything

## Verification Steps

- [ ] `npm install` completes without errors
- [ ] `npm run dev` opens working dev server
- [ ] `npm run lint` reports zero warnings
- [ ] `npm run typecheck` reports zero errors
- [ ] `npm test` passes all tests with coverage >= 90%
- [ ] `npm run build` produces a production bundle
- [ ] Canvas renders visible sky + terrain + tank on load
- [ ] Pre-commit hook rejects a lint error
