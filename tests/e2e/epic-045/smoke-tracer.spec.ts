import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

import { canvasHasContent, getTestIdText, launchGame, pressKey } from '../helpers';

/**
 * Extract the current weapon name from the HUD.
 * The GameHUD renders HUDItem components with label "Weapon" followed by the value.
 */
async function getWeaponName(page: Page): Promise<string> {
  return page.evaluate(() => {
    const hud = document.querySelector('[data-testid="game-hud"]');
    if (!hud) return '';
    const divs = Array.from(hud.querySelectorAll('div'));
    for (const div of divs) {
      if (div.textContent?.trim() === 'Weapon') {
        const next = div.nextElementSibling;
        if (next) return next.textContent?.trim() ?? '';
      }
    }
    return '';
  });
}

/** Collect all weapons available via Tab cycling. */
async function collectAllWeapons(page: Page, maxPresses: number): Promise<Set<string>> {
  const weapons = new Set<string>();
  const initial = await getWeaponName(page);
  weapons.add(initial.toLowerCase());

  for (let i = 0; i < maxPresses; i++) {
    await pressKey(page, 'Tab');
    const weaponText = await getWeaponName(page);
    weapons.add(weaponText.toLowerCase());
  }
  return weapons;
}

test.describe('Epic 045: Smoke Tracers & Walls', () => {
  test('Smoke tracer appears in weapon cycle', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);

    const weapons = await collectAllWeapons(page, 20);

    const found = [...weapons].some((w) => w.includes('smoke') || w.includes('tracer'));
    if (!found) {
      test.info().annotations.push({
        type: 'issue',
        description:
          'Smoke tracer weapon is defined in NewWeapons.ts but not included in starting loadout. ' +
          `Available weapons: ${[...weapons].join(', ')}. ` +
          'Fix: add smoke-tracer to getStartingLoadout() in src/engine/economy/index.ts',
      });
    }
    expect(found).toBe(true);
  });

  test('Smoke tracer fires without destroying tanks', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);

    // Cycle to smoke-tracer
    let found = false;
    for (let i = 0; i < 20; i++) {
      await pressKey(page, 'Tab');
      const weaponText = await getWeaponName(page);
      if (
        weaponText.toLowerCase().includes('smoke') ||
        weaponText.toLowerCase().includes('tracer')
      ) {
        found = true;
        break;
      }
    }

    if (!found) {
      test.info().annotations.push({
        type: 'issue',
        description:
          'Smoke tracer not available in weapon cycle — cannot test firing. ' +
          'Feature not wired: add to starting loadout.',
      });
      test.skip();
      return;
    }

    const statusBefore = await getTestIdText(page, 'status-bar');

    // Fire
    await pressKey(page, 'Space');

    // Wait for turn to advance (status bar text changes)
    await expect(async () => {
      const statusAfter = await getTestIdText(page, 'status-bar');
      expect(statusAfter).not.toBe(statusBefore);
    }).toPass({ timeout: 10_000 });

    // Verify no victory screen — HUD still visible
    const hud = page.locator('[data-testid="game-hud"]');
    await expect(hud).toBeVisible();
  });

  test('Trajectory preview renders on canvas', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);

    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});
