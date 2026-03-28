import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

import { launchGame } from '../helpers';

/** Extract the current weapon name from the HUD weapon toggle. */
async function getCurrentWeaponName(page: Page): Promise<string> {
  const el = page.locator('[data-testid="weapon-toggle"] .hud-weapon-name');
  return (await el.textContent())?.trim() ?? '';
}

test.describe('Epic 054: Weapon Cycling', () => {
  test('All starting weapons appear in weapon cycle', async ({ page }) => {
    test.setTimeout(60_000);
    await launchGame(page);

    const weaponNames = new Set<string>();

    // Get the initial weapon
    const initialWeapon = await getCurrentWeaponName(page);
    if (initialWeapon) {
      weaponNames.add(initialWeapon);
    }

    test.info().annotations.push({
      type: 'note',
      description: `Initial weapon: "${initialWeapon}"`,
    });

    // Use canvas.press('Tab') to trigger weapon cycling
    const canvas = page.locator('[data-testid="game-canvas"]');
    await canvas.focus();
    await page.waitForTimeout(200);

    for (let i = 0; i < 25; i++) {
      await canvas.press('Tab');
      await page.waitForTimeout(150);
      const weaponName = await getCurrentWeaponName(page);
      if (weaponName) {
        weaponNames.add(weaponName);
      }
    }

    test.info().annotations.push({
      type: 'note',
      description: `Found ${weaponNames.size} unique weapons: ${[...weaponNames].join(', ')}`,
    });

    // Verify at least 7 weapons in the starting loadout
    expect(
      weaponNames.size,
      `Expected at least 7 unique weapons in the starting loadout, found ${weaponNames.size}: ${[...weaponNames].join(', ')}`,
    ).toBeGreaterThanOrEqual(7);

    // Verify specific expected starting weapons (using short names from weaponDisplay.ts)
    const expectedWeapons = [
      'baby',
      'missile',
      'tracer',
      'grenade',
      'shotgun',
      'punch',
      'bat',
    ];

    // Normalize: lowercase, strip symbols (∞), replace dashes with spaces
    const normalizedNames = [...weaponNames].map((w) =>
      w.toLowerCase().replace(/[∞]/g, '').replace(/-/g, ' ').trim(),
    );

    for (const expected of expectedWeapons) {
      const found = normalizedNames.some(
        (w) => w.includes(expected) || expected.includes(w),
      );
      if (!found) {
        test.info().annotations.push({
          type: 'note',
          description: `Warning: Expected weapon "${expected}" not found in cycle. Available: ${[...weaponNames].join(', ')}`,
        });
      }
      expect(
        found,
        `Expected weapon "${expected}" to appear in weapon cycle. Found weapons: ${[...weaponNames].join(', ')}`,
      ).toBe(true);
    }
  });
});
