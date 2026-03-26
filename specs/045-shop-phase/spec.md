# Epic 045: Shop Phase Between Rounds

## Problem
Players earn money from damage and kills but have no way to spend it. The economy system is fully implemented (Shop.ts, WeaponInventory.ts, NewWeapons.ts tiers/pricing, DefenseShop.ts) but there is no shop phase in the game flow.

## User Stories

### US1: Player Can Buy Weapons Between Rounds (Priority: P1)
**As a** player who just finished a round,
**I want to** spend my earned money on weapons and equipment,
**So that** I can choose my loadout for the next round.

**Acceptance Criteria:**
- After resolution phase, a shop screen appears before the next round
- Shop displays all available weapons with tier colors, prices, and descriptions
- Player can buy weapons if they can afford them
- Purchase limits per tier are enforced (legendaries max 1, commons max 5)
- Defense items (shields, parachutes, fuel) are also purchasable
- Player's money balance updates in real-time as they buy
- A "Ready" button advances to the next round
- Purchased inventory persists into the next round

### US2: AI Auto-Shops (Priority: P2)
**As a** player vs AI,
**I want** AI opponents to also buy weapons between rounds,
**So that** the game is fair and AI uses varied weapons.

**Acceptance Criteria:**
- AI players automatically purchase weapons during shop phase
- AI buys weapons appropriate to their budget (no overspending)
- AI prioritizes higher-tier weapons when affordable
- AI shopping happens instantly (no delay needed)

### US3: Shop Timer (Priority: P3)
**As a** multiplayer player,
**I want** a time limit on the shop phase,
**So that** no one holds up the game indefinitely.

**Acceptance Criteria:**
- Shop phase has a configurable timer (default 30s)
- Timer visible on shop screen
- When timer expires, shop closes automatically

## Success Criteria
- Players can spend accumulated money on weapons/defenses
- Purchased weapons appear in the weapon cycle during gameplay
- AI opponents buy weapons and use them
- Economy feels meaningful — earning money matters
