# Plan: Shop Phase Between Rounds

## Architecture

### Phase Flow Change
Current: `resolution → turn (next round)`
New: `resolution → shop → turn (next round)`

### Key Files
- `src/engine/GameManager.ts` — Add 'shop' phase, transition logic
- `src/ui/App.tsx` — Render ShopScreen when phase='shop', handle purchases
- `src/ui/shop/ShopScreen.tsx` — NEW: Shop UI component
- `src/engine/economy/Shop.ts` — EXISTING: buyWeapon, processPurchases
- `src/engine/weapons/WeaponInventory.ts` — EXISTING: ammo tracking
- `src/engine/weapons/NewWeapons.ts` — EXISTING: tier/pricing data
- `src/engine/defense/DefenseShop.ts` — EXISTING: defense items

### Phases

#### Phase 1: Shop Phase in GameManager (P1)
Wire 'shop' phase into GameManager state machine. After resolution, transition to 'shop'. Track per-player inventory in GameManager.

#### Phase 2: Shop UI (P1)
Create ShopScreen React component. Display weapons by tier, defense items, player balance. Buy button per item. Ready button to advance.

#### Phase 3: Wire Shop to App (P1)
Render ShopScreen in App.tsx during shop phase. Pass callbacks for buying, update inventory, advance when ready.

#### Phase 4: AI Auto-Shop (P2)
When shop phase starts and current player is AI, auto-purchase weapons. Then mark AI as ready. Simple budget-based heuristic.

#### Phase 5: E2E Tests (P2)
Playwright tests: start game → play round → shop appears → buy weapon → next round uses it.

## Parallel Opportunities
- Phase 1 and Phase 2 can be built in parallel
- Phase 4 depends on Phase 1+3

## Bead Map
- `auto-tank-045` - Root epic: Shop Phase Between Rounds
  - `auto-tank-045.1` - GameManager shop phase + inventory tracking
  - `auto-tank-045.2` - ShopScreen UI component
  - `auto-tank-045.3` - Wire shop to App.tsx
  - `auto-tank-045.4` - AI auto-shop logic
  - `auto-tank-045.5` - E2E tests for shop flow
