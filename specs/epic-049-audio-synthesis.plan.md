# Epic 049: Rich Audio Synthesis

**Seed:** `tests/e2e/seed.spec.ts`

### 1. Audio System

#### 1.1 Game loads without audio errors
**Steps:**
1. Navigate to the game page
2. Launch a game via helpers.launchGame
3. Listen for console errors related to AudioContext
4. Verify no errors occur

#### 1.2 Firing triggers without audio crash
**Steps:**
1. Launch a game
2. Press Space to fire
3. Verify no uncaught exceptions in console
4. Wait for turn to advance
5. Verify game continues normally

Note: Audio synthesis testing is primarily done via unit tests (mocked AudioContext).
E2E tests verify the audio system doesn't crash the game, not sound output quality.
