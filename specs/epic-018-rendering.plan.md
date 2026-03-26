# Epic 018: Canvas Rendering Pipeline

**Seed:** `tests/e2e/seed.spec.ts`

Canvas2D rendering pipeline: sky gradient, terrain polygon, tank rendering,
HUD overlay, active game loop.

### 1. Sky Rendering

#### 1.1 Sky gradient is visible
**Steps:**
1. Navigate to the game page
2. Wait for the canvas to render
3. Verify the top portion of the canvas has a gradient (not solid black)
4. Use page.evaluate() to sample pixel color at (400, 10) — should NOT be pure black (0,0,0)

### 2. Terrain Rendering

#### 2.1 Terrain polygon is drawn
**Steps:**
1. Navigate to the game page
2. Use page.evaluate() to sample pixel color at (400, 500) — lower portion of canvas
3. Verify the color is green-ish (terrain fill color is #4a7c2e for classic theme)
4. The green area should NOT extend all the way to the top — terrain has a height profile

#### 2.2 Terrain has irregular height
**Steps:**
1. Navigate to the game page
2. Use page.evaluate() to sample colors at y=300 for x=100, x=300, x=500
3. Not all three should be the same — some should be sky, some terrain
4. This proves the terrain has hills/valleys, not a flat line

### 3. Tank Rendering

#### 3.1 Two tanks are visible on canvas
**Steps:**
1. Navigate to the game page
2. Use page.evaluate() to sample pixel at approximately (240, 270) — near where the red tank should be (~30% of 800px width)
3. Verify the pixel is reddish (tank body color for red team is #e74c3c)
4. Sample pixel at approximately (560, 310) — near where the blue tank should be (~70%)
5. Verify the pixel is bluish (tank body color for blue team is #3498db)

### 4. HUD Overlay

#### 4.1 HUD panel is visible
**Steps:**
1. Navigate to the game page
2. Verify element with data-testid="game-hud" exists and is visible

#### 4.2 HUD shows all required fields
**Steps:**
1. Navigate to the game page
2. Read text content of data-testid="game-hud"
3. Verify it contains "Player"
4. Verify it contains a degree symbol (°) for angle
5. Verify it contains "%" for power
6. Verify it contains an arrow (→ or ←) for wind
7. Verify it contains "Missile" or another weapon name

### 5. Game Loop

#### 5.1 Canvas is actively rendering
**Steps:**
1. Navigate to the game page
2. Take a screenshot of the canvas
3. Wait 500ms
4. Take another screenshot
5. The page should not have crashed — canvas still visible
6. Verify the game loop is running (page is responsive)
