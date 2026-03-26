# Epic 028: E2E Test Infrastructure

**Seed:** `tests/e2e/seed.spec.ts`

Browser-based E2E tests proving the game works as users experience it.
Infrastructure, page load, stability, and multi-context support.

### 1. Infrastructure

#### 1.1 Game page loads successfully
**Steps:**
1. Navigate to the game page (/)
2. Verify the page title contains "Auto Tank"
3. Verify no JavaScript console errors are thrown during load
4. Canvas element with data-testid="game-canvas" is visible

#### 1.2 Canvas renders non-transparent content
**Steps:**
1. Navigate to the game page
2. Wait 500ms for rendering
3. Use page.evaluate() to get canvas ImageData and check that at least one pixel is not pure black/transparent
4. Assert content was rendered

### 2. HUD Overlay

#### 2.1 HUD is visible and contains game data
**Steps:**
1. Navigate to the game page
2. Verify data-testid="game-hud" is visible
3. Verify it contains text for Player, Angle, Power, Wind, Weapon

### 3. Stability

#### 3.1 Rapid keyboard input does not crash the game
**Steps:**
1. Navigate to the game page
2. Rapidly press ArrowUp, ArrowDown, ArrowLeft, ArrowRight, Space, Tab — 10 times each in sequence
3. Verify canvas is still visible after all input
4. Verify HUD is still visible

#### 3.2 Page handles resize without crash
**Steps:**
1. Navigate to the game page
2. Resize the viewport to 640x480
3. Wait 500ms
4. Resize back to 800x600
5. Verify canvas is still visible

### 4. Multi-Context

#### 4.1 Two browser contexts load independently
**Steps:**
1. Open two separate browser contexts
2. Navigate both to the game page
3. Verify both have visible canvas elements
4. Verify both have visible HUD elements
5. Press ArrowLeft in context 1
6. Verify context 2 is unaffected — HUD values unchanged
7. Close both contexts
