# Epic 018: Firing Pipeline — Space to Boom

**Seed:** `tests/e2e/seed.spec.ts`

### 1. Weapon Firing

#### 1.1 Space key fires a projectile
**Steps:**
1. Navigate to the game page at /
2. Wait for canvas to render (data-testid="game-canvas" visible)
3. Wait for status bar to show "AIM & FIRE" (data-testid="status-bar")
4. Press Space key
5. Verify status bar changes to "FIRING..." within 500ms

#### 1.2 Cannot fire twice in same turn
**Steps:**
1. Navigate to the game page
2. Press Space to fire
3. Wait for status bar to show "FIRING..."
4. Press Space again
5. Verify no additional projectile spawns (status still shows "FIRING...")

### 2. Turn Flow

#### 2.1 Turn advances after firing
**Steps:**
1. Navigate to the game page
2. Verify HUD shows "Player 1" (data-testid="game-hud")
3. Press Space to fire
4. Wait for status bar to show "AIM & FIRE" again (turn resolved, ~2-3 seconds)
5. Verify HUD now shows "Player 2"

#### 2.2 Turn number increments
**Steps:**
1. Navigate to the game page
2. Verify status bar contains "Turn 1"
3. Press Space to fire
4. Wait for status bar to contain "Turn 2" (after resolution completes)

### 3. Angle and Power Controls

#### 3.1 Arrow keys adjust angle during turn
**Steps:**
1. Navigate to the game page
2. Read initial angle from HUD (should be "45°")
3. Press ArrowLeft 5 times
4. Verify HUD angle decreased (should be "35°")
5. Press ArrowRight 10 times
6. Verify HUD angle increased (should be "55°")

#### 3.2 Arrow Up/Down adjusts power
**Steps:**
1. Navigate to the game page
2. Read initial power from HUD (should be "75%")
3. Press ArrowUp 3 times
4. Verify HUD power increased (should be "84%")
5. Press ArrowDown 6 times
6. Verify HUD power decreased (should be "66%")

#### 3.3 Controls blocked during firing phase
**Steps:**
1. Navigate to the game page
2. Press Space to fire
3. While status shows "FIRING...", press ArrowLeft 5 times
4. After turn resolves and Player 2 active, verify angle is at Player 2's default (not modified)

### 4. Visual Verification

#### 4.1 Canvas renders game elements
**Steps:**
1. Navigate to the game page
2. Verify canvas element is visible
3. Take screenshot
4. Verify canvas has non-black pixels (content rendered)
