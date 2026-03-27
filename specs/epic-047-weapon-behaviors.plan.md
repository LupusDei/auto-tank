# Epic 047: Weapon Behavior Diversity

**Seed:** `tests/e2e/seed.spec.ts`

### 1. New Weapons in Cycle

#### 1.1 Roller appears in weapon cycle
**Steps:**
1. Launch a game via helpers.launchGame
2. Press Tab repeatedly (up to 20 times) to cycle through all weapons
3. After each Tab press, read the HUD weapon field
4. Verify "roller" appears at least once

#### 1.2 Digger appears in weapon cycle
**Steps:**
1. Launch a game
2. Cycle through weapons with Tab
3. Verify "digger" appears in weapon field

#### 1.3 Air Strike appears in weapon cycle
**Steps:**
1. Launch a game
2. Cycle through weapons with Tab
3. Verify "air-strike" appears in weapon field

### 2. Roller Weapon

#### 2.1 Roller can be fired and turn completes
**Steps:**
1. Launch a game
2. Cycle to roller weapon
3. Fire with Space
4. Wait up to 5 seconds for firing phase to complete
5. Verify game advances to next turn

### 3. Digger Weapon

#### 3.1 Digger can be fired and turn completes
**Steps:**
1. Launch a game
2. Cycle to digger weapon
3. Fire with Space
4. Wait for turn to advance
5. Verify game continues

### 4. Air Strike

#### 4.1 Air strike can be fired and turn completes
**Steps:**
1. Launch a game
2. Cycle to air-strike weapon
3. Fire with Space
4. Wait for firing phase (may take longer due to child projectiles)
5. Verify turn advances
