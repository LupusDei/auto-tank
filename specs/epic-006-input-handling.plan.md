# Epic 006: Input Handling & Tank Control System

**Seed:** `tests/e2e/seed.spec.ts`

Player controls for an artillery game: keyboard input for aiming, power adjustment, weapon selection, firing, and tank movement. All input should be reflected in the HUD and on the canvas.

### 1. Keyboard Capture

#### 1.1 Page stability on arrow key press
**Steps:**
1. Navigate to the game page
2. Wait for the canvas and HUD to be visible
3. Press ArrowLeft key
4. Verify the page does not crash — canvas remains visible
5. Verify HUD remains visible

### 2. Angle Control

#### 2.1 ArrowLeft decreases angle
**Steps:**
1. Navigate to the game page and note the Angle value in the HUD
2. Press ArrowLeft 5 times with a pause between each
3. Verify the Angle value in the HUD has decreased from the starting value

#### 2.2 ArrowRight increases angle
**Steps:**
1. Navigate to the game page and note the Angle value in the HUD
2. Press ArrowRight 5 times
3. Verify the Angle value in the HUD has increased from the starting value

#### 2.3 Angle clamps at maximum (180°)
**Steps:**
1. Navigate to the game page
2. Press ArrowRight 100 times rapidly
3. Verify the Angle value does not exceed 180°

### 3. Power Control

#### 3.1 ArrowUp increases power
**Steps:**
1. Navigate to the game page and note the Power percentage in the HUD
2. Press ArrowUp 5 times
3. Verify the Power percentage has increased

#### 3.2 ArrowDown decreases power
**Steps:**
1. Navigate to the game page and note the Power percentage in the HUD
2. Press ArrowDown 5 times
3. Verify the Power percentage has decreased

#### 3.3 Power clamps at maximum (100%)
**Steps:**
1. Navigate to the game page
2. Press ArrowUp 100 times rapidly
3. Verify the Power value does not exceed 100%

### 4. Weapon Selection

#### 4.1 Tab cycles to next weapon
**Steps:**
1. Navigate to the game page and note the Weapon name in the HUD
2. Press Tab once
3. Verify the Weapon name has changed to a different weapon

#### 4.2 Tab wraps around weapon list
**Steps:**
1. Navigate to the game page and note the starting Weapon name
2. Press Tab repeatedly (at least 10 times)
3. Verify the Weapon name eventually returns to the original weapon

### 5. Firing

#### 5.1 Space fires a projectile
**Steps:**
1. Navigate to the game page with tanks visible on terrain
2. Press Space
3. Wait 3 seconds observing the canvas
4. Verify a projectile appeared and flew through the air

### 6. Tank Movement

#### 6.1 A key moves tank left
**Steps:**
1. Navigate to the game page with a tank visible on terrain
2. Press 'a' key 5 times
3. Verify the tank moved to the left on the canvas

#### 6.2 D key moves tank right
**Steps:**
1. Navigate to the game page with a tank visible on terrain
2. Press 'd' key 5 times
3. Verify the tank moved to the right on the canvas

### 7. HUD Real-time Updates

#### 7.1 Angle updates immediately on input
**Steps:**
1. Navigate to the game page and note the Angle value
2. Press ArrowLeft once
3. Verify the Angle value updates immediately in the HUD

#### 7.2 Weapon updates immediately on cycle
**Steps:**
1. Navigate to the game page and note the Weapon name
2. Press Tab once
3. Verify the Weapon name updates immediately in the HUD

### 8. Mouse Tracking

#### 8.1 Mouse movement produces visual response
**Steps:**
1. Navigate to the game page with the canvas visible
2. Move the mouse cursor across the canvas area
3. Verify something responds to mouse position (aiming line, crosshair, or cursor change)
