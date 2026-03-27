# Epic 046: Grenades, Shotgun & Melee Weapons

**Seed:** `tests/e2e/seed.spec.ts`

### 1. Weapon Selection — New Weapons Available

#### 1.1 Grenade appears in weapon cycle
**Steps:**
1. Launch a game via helpers.launchGame
2. Press Tab repeatedly (up to 15 times) to cycle through weapons
3. After each Tab press, read the HUD weapon field text
4. Verify "grenade" appears at least once during the cycle

#### 1.2 Shotgun appears in weapon cycle
**Steps:**
1. Launch a game
2. Press Tab repeatedly to cycle through weapons
3. Verify "shotgun" appears in the HUD weapon field

#### 1.3 Fire Punch appears in weapon cycle
**Steps:**
1. Launch a game
2. Press Tab repeatedly to cycle through weapons
3. Verify "fire-punch" appears in the HUD weapon field

#### 1.4 Baseball Bat appears in weapon cycle
**Steps:**
1. Launch a game
2. Press Tab repeatedly to cycle through weapons
3. Verify "baseball-bat" appears in the HUD weapon field

### 2. Grenade Firing

#### 2.1 Grenade can be fired
**Steps:**
1. Launch a game
2. Cycle to grenade weapon
3. Press Space to fire
4. Verify the game enters firing phase (fire button becomes disabled or HUD updates)
5. Wait for turn to advance
6. Verify next player's turn begins

### 3. Shotgun Firing

#### 3.1 Shotgun can be fired
**Steps:**
1. Launch a game
2. Cycle to shotgun weapon
3. Press Space to fire
4. Wait for turn to advance
5. Verify game continues normally
