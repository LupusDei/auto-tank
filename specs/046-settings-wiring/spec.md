# Epic 046: Settings System Wiring

## Problem
The settings screen exists and persists values in React state, but none of the settings actually affect gameplay. Volume sliders do nothing. Damage number toggle is cosmetic. Camera shake toggle is ignored. Two settings (musicVolume, showKillFeed) have no UI controls at all.

## User Stories

### US1: Audio Settings Work (Priority: P1)
**As a** player adjusting volume,
**I want** the volume sliders to actually control game audio,
**So that** I can play at a comfortable volume.

**Acceptance Criteria:**
- Master volume slider controls SoundManager.volume
- SFX volume slider scales individual sound effect volume
- Music volume slider added to UI + controls background music volume
- Muting master volume silences everything

### US2: Visual Settings Work (Priority: P1)
**As a** player who finds effects distracting,
**I want** to toggle damage numbers and camera shake,
**So that** I can customize the visual experience.

**Acceptance Criteria:**
- Show Damage Numbers toggle enables/disables floating damage popups
- Camera Shake toggle enables/disables screen shake on explosions
- Show Kill Feed toggle added to UI + controls kill celebration popups

### US3: Accessibility Settings (Priority: P2)
**As a** player with motion sensitivity,
**I want** a reduced motion option,
**So that** particles, shake, and animations are minimized.

**Acceptance Criteria:**
- Reduced Motion toggle in settings
- When enabled: disables particles, screen shake, and animated transitions
- Respects system prefers-reduced-motion media query as default

## Success Criteria
- Every setting in the UI has a visible effect on the game
- No orphan settings (all have UI controls)
- Accessibility preferences are respected
