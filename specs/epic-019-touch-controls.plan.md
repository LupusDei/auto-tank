# Epic 019: Mobile Touch Controls

**Seed:** `tests/e2e/seed.spec.ts`

### 1. Touch Control Visibility

#### 1.1 Touch controls render during gameplay
**Steps:**
1. Navigate to game page, launch game through menu/config
2. Verify touch control bar is visible (data-testid="touch-controls")
3. Verify all 6 buttons present: btn-angle-left, btn-angle-right, btn-power-up, btn-power-down, btn-fire, btn-cycle-weapon

#### 1.2 Touch controls have correct labels
**Steps:**
1. Launch game
2. Verify FIRE button contains text "FIRE"
3. Verify WPN button contains text "WPN"

### 2. Touch Button Functionality

#### 2.1 FIRE button fires weapon
**Steps:**
1. Launch game
2. Verify status bar shows "AIM & FIRE"
3. Click the FIRE button (data-testid="btn-fire")
4. Verify status bar changes to "FIRING..."

#### 2.2 Angle buttons adjust angle
**Steps:**
1. Launch game
2. Read initial angle from HUD (should be 45°)
3. Click btn-angle-left 5 times
4. Verify HUD angle decreased to 35°
5. Click btn-angle-right 10 times
6. Verify HUD angle is 55°

#### 2.3 Power buttons adjust power
**Steps:**
1. Launch game
2. Read initial power from HUD (should be 75%)
3. Click btn-power-up 3 times
4. Verify HUD power increased to 84%
5. Click btn-power-down 6 times
6. Verify HUD power is 66%

#### 2.4 Weapon cycle button changes weapon
**Steps:**
1. Launch game
2. Read initial weapon from HUD (should be "Missile")
3. Click btn-cycle-weapon
4. Verify HUD weapon name changed (no longer "Missile")

### 3. Disabled State

#### 3.1 Buttons disabled during firing phase
**Steps:**
1. Launch game
2. Click FIRE button
3. Verify status shows "FIRING..."
4. Check that touch controls have reduced opacity (disabled state)
