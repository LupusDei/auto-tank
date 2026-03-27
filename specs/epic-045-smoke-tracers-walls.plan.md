# Epic 045: Smoke Tracers & Wall Boundary Modes

**Seed:** `tests/e2e/seed.spec.ts`

### 1. Smoke Tracer Weapon

#### 1.1 Smoke tracer appears in weapon cycle
**Steps:**
1. Navigate to the game page and launch a game via helpers.launchGame
2. Press Tab to cycle through weapons until "smoke-tracer" appears in the HUD weapon field
3. Verify the HUD shows "smoke-tracer" as the selected weapon

#### 1.2 Smoke tracer fires and leaves trail without damage
**Steps:**
1. Launch a game
2. Cycle to smoke-tracer weapon via Tab
3. Set angle to 45° (press ArrowLeft until angle ≈ 45)
4. Fire with Space
5. Wait for projectile phase to complete (watch for turn to advance)
6. Verify no tanks were destroyed (both tanks still visible in HUD)
7. Verify the turn advances to next player

### 2. Wall Boundary Modes (Unit-level — config only)

Wall modes (Open/Wrap/Bounce) are engine-level config. No UI selector exists yet.
Validation is done via unit tests. Skip E2E for this sub-feature.

### 3. Trajectory Preview

#### 3.1 Trajectory preview dots visible during turn
**Steps:**
1. Launch a game
2. Take a screenshot of the canvas
3. Verify the canvas has rendered content (non-black pixels exist)
4. The trajectory preview renders as white dots — verify canvas contains white-ish pixels in the area above the active tank
