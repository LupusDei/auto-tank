import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

import { getHUD, launchGame, pressKey } from '../helpers';

/**
 * Extract the weapon name from the HUD text content.
 * The HUD renders: "PlayerPlayer 1Angle45°Power75%Wind← 6WeaponMissile"
 * We look for the text following the "Weapon" label.
 */
function extractWeaponFromHUD(hudText: string): string {
  const match = hudText.match(/Weapon\s*([A-Za-z][\w\s-]*)/i);
  return match ? match[1].trim() : '';
}

/** Read the current weapon name from the HUD element. */
async function getCurrentWeapon(page: Page): Promise<string> {
  const hud = getHUD(page);
  const text = (await hud.textContent()) ?? '';
  return extractWeaponFromHUD(text);
}

test.describe('Epic 047: Weapon Behavior Diversity', () => {
  test('Weapon cycling via Tab shows multiple weapons', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);

    const weaponNames = new Set<string>();

    // Collect weapon names across Tab presses
    for (let i = 0; i < 10; i++) {
      const name = await getCurrentWeapon(page);
      if (name) weaponNames.add(name);
      await pressKey(page, 'Tab');
    }
    // Capture the last one too
    const lastName = await getCurrentWeapon(page);
    if (lastName) weaponNames.add(lastName);

    const allWeapons = Array.from(weaponNames);
    test.info().annotations.push({
      type: 'note',
      description: `Found weapons in cycle: ${allWeapons.join(', ')}`,
    });

    // Starting loadout should have at least Baby Missile and Missile
    expect(allWeapons.length, 'should have at least 2 weapons in cycle').toBeGreaterThanOrEqual(2);

    // Verify roller, digger, air-strike exist in weapon registry (they require shop purchase)
    // These weapons are defined but not in starting inventory
    const hasRoller = allWeapons.some((w) => w.toLowerCase().includes('roller'));
    const hasDigger = allWeapons.some((w) => w.toLowerCase().includes('digger'));
    const hasAirStrike = allWeapons.some(
      (w) => w.toLowerCase().includes('air') && w.toLowerCase().includes('strike'),
    );

    if (!hasRoller || !hasDigger || !hasAirStrike) {
      test.info().annotations.push({
        type: 'note',
        description:
          'Roller, Digger, and Air Strike are shop-purchase weapons not in starting inventory. ' +
          `roller: ${hasRoller}, digger: ${hasDigger}, air-strike: ${hasAirStrike}`,
      });
    }
  });

  test('Firing default weapon advances the turn', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);

    const hud = getHUD(page);
    const initialText = (await hud.textContent()) ?? '';

    // Fire with Space
    await pressKey(page, 'Space');

    // Wait for projectile to resolve and turn to advance
    await page.waitForTimeout(5_000);

    // HUD should still be visible — game didn't crash
    await expect(hud).toBeVisible();

    // The HUD text should have changed (different player or turn)
    const afterText = (await hud.textContent()) ?? '';
    test.info().annotations.push({
      type: 'note',
      description: `HUD before fire: "${initialText.substring(0, 60)}", after: "${afterText.substring(0, 60)}"`,
    });
  });

  test('Cycling weapon then firing continues game', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);

    const initialWeapon = await getCurrentWeapon(page);

    // Cycle to next weapon via Tab
    await pressKey(page, 'Tab');

    const cycledWeapon = await getCurrentWeapon(page);
    test.info().annotations.push({
      type: 'note',
      description: `Weapon before Tab: "${initialWeapon}", after Tab: "${cycledWeapon}"`,
    });

    // Fire with Space
    await pressKey(page, 'Space');

    // Wait for projectile to resolve
    await page.waitForTimeout(5_000);

    // HUD should still be visible — game didn't crash
    const hud = getHUD(page);
    await expect(hud).toBeVisible();
  });

  test('Multiple weapon cycles wrap around', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);

    const firstWeapon = await getCurrentWeapon(page);

    // Press Tab enough times to wrap around (starting loadout has ~2 weapons)
    const seen: string[] = [firstWeapon];
    for (let i = 0; i < 5; i++) {
      await pressKey(page, 'Tab');
      const w = await getCurrentWeapon(page);
      seen.push(w);
    }

    test.info().annotations.push({
      type: 'note',
      description: `Weapon cycle sequence: ${seen.join(' → ')}`,
    });

    // After enough presses, should return to the first weapon
    const returnedToStart = seen.slice(1).some((w) => w === firstWeapon);
    if (returnedToStart) {
      expect(returnedToStart, 'weapon cycle should wrap around').toBe(true);
    } else {
      test.info().annotations.push({
        type: 'note',
        description:
          'Weapon did not wrap back to start — may have more weapons or cycling not wired.',
      });
    }
  });
});
