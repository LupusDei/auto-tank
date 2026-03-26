# Plan: Settings System Wiring

## Architecture

### Settings Flow
`SettingsScreen` → `App state` → `GameManager` / `SoundManager` / `Render callbacks`

The settings object needs to flow from App.tsx down to:
1. SoundManager (audio)
2. Render callback (visual toggles)
3. GameManager (accessibility flags)

### Key Files
- `src/ui/App.tsx` — Pass settings to GameManager + render
- `src/ui/screens/SettingsScreen.tsx` — Add missing controls
- `src/ui/screens/settingsDefaults.ts` — Default values
- `src/audio/SoundManager.ts` — Wire volume controls
- `src/engine/accessibility/AccessibilitySettings.ts` — Wire reduced motion

### Phases

#### Phase 1: Wire Audio (P1)
Pass settings to SoundManager. Initialize SoundManager in App on first user interaction. Apply volume on change.

#### Phase 2: Wire Visual Toggles (P1)
Pass settings to render callback. Conditionally render damage numbers and screen shake based on settings flags.

#### Phase 3: Complete Settings UI (P1)
Add missing controls: musicVolume slider, showKillFeed toggle, reducedMotion toggle.

#### Phase 4: Accessibility (P2)
Wire reducedMotion to disable particles and shake. Detect system prefers-reduced-motion.

#### Phase 5: E2E Tests (P2)
Test: change setting → verify effect visible (or not visible).

## Bead Map
- `auto-tank-046` - Root epic: Settings System Wiring
  - `auto-tank-046.1` - Wire audio settings to SoundManager
  - `auto-tank-046.2` - Wire visual toggle settings to render pipeline
  - `auto-tank-046.3` - Complete settings UI (missing controls)
  - `auto-tank-046.4` - Wire accessibility / reduced motion
  - `auto-tank-046.5` - E2E tests for settings effects
