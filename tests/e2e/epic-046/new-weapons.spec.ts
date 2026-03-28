import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

import { getTestIdText, launchGame, pressKey } from '../helpers';

/**
 * Extract the current weapon name from the HUD.
 * The GameHUD renders HUDItem components with label "Weapon" followed by the value.
 */
async function getWeaponName(page: Page): Promise<string> {
  const el = page.locator('[data-testid="weapon-toggle"] .hud-weapon-name');
  return (await el.textContent())?.trim() ?? '';
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

/** Cycle weapons until a target weapon is found; return whether it was found. */
async function cycleToWeapon(
  page: Page,
  targetSubstring: string,
  maxPresses: number,
): Promise<boolean> {
  for (let i = 0; i < maxPresses; i++) {
    await pressKey(page, 'Tab');
    const weaponText = await getWeaponName(page);
    if (weaponText.toLowerCase().includes(targetSubstring)) {
      return true;
    }
  }
  return false;
}

test.describe('Epic 046: Grenades, Shotgun & Melee', () => {
  test('New weapons appear in weapon cycle', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);

    const weapons = await collectAllWeapons(page, 25);

    const expected = ['grenade', 'shotgun', 'punch', 'bat'];
    const missing: string[] = [];
    for (const name of expected) {
      const found = [...weapons].some((w) => w.includes(name));
      if (!found) {
        missing.push(name);
      }
    }

    if (missing.length > 0) {
      test.info().annotations.push({
        type: 'issue',
        description:
          `Missing weapons not wired into starting loadout: ${missing.join(', ')}. ` +
          `Available weapons: ${[...weapons].join(', ')}. ` +
          'Fix: add missing weapon types to getStartingLoadout() in src/engine/economy/index.ts',
      });
    }
    expect(missing).toEqual([]);
  });

  test('Grenade can be fired and turn advances', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);

    const found = await cycleToWeapon(page, 'grenade', 25);

    if (!found) {
      test.info().annotations.push({
        type: 'issue',
        description: 'Grenade not available in weapon cycle — not wired into starting loadout.',
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

    // Verify HUD still visible (game didn't crash)
    const hud = page.locator('[data-testid="game-hud"]');
    await expect(hud).toBeVisible();
  });

  test('Shotgun can be fired and turn advances', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);

    const found = await cycleToWeapon(page, 'shotgun', 25);

    if (!found) {
      test.info().annotations.push({
        type: 'issue',
        description: 'Shotgun not available in weapon cycle — not wired into starting loadout.',
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

    // Verify HUD still visible (game didn't crash)
    const hud = page.locator('[data-testid="game-hud"]');
    await expect(hud).toBeVisible();
  });
});
