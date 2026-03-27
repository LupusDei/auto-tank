# Epic 048: Terrain Visual Polish & Water

**Seed:** `tests/e2e/seed.spec.ts`

### 1. Terrain Rendering

#### 1.1 Terrain renders with gradient fill
**Steps:**
1. Launch a game via helpers.launchGame
2. Take a canvas screenshot
3. Sample pixels in the terrain area (lower half of canvas)
4. Verify terrain pixels are not a single flat color — there should be variation (gradient)

#### 1.2 Canvas renders terrain with surface detail
**Steps:**
1. Launch a game
2. Verify canvas has rendered content (non-transparent pixels)
3. The terrain surface should have detail marks — verify pixels along the terrain surface line aren't all identical

### 2. Water

#### 2.1 Canvas renders without errors
**Steps:**
1. Launch a game
2. Verify no console errors during rendering
3. Verify canvas has content
4. Verify the game loop is running (HUD updates on key press)
