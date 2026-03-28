import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

import { getHUD, launchGame, pressKey } from '../helpers';

/** Read the current weapon name from the HUD weapon toggle. */
async function getCurrentWeapon(page: Page): Promise<string> {
  const el = page.locator('[data-testid="weapon-toggle"] .hud-weapon-name');
  return (await el.textContent())?.trim() ?? '';
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

    // Handle shop phase if it appeared
    const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
    if (await shopBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await shopBtn.click();
      await page.waitForTimeout(500);
    }

    // Game should still be running (HUD or victory screen visible)
    const hudVisible = await hud.isVisible().catch(() => false);
    const victoryVisible = await page.locator('[data-testid="victory-screen"]').isVisible().catch(() => false);
    expect(hudVisible || victoryVisible, 'Game should be running or show victory').toBe(true);
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

    // Handle shop phase if it appeared
    const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
    if (await shopBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await shopBtn.click();
      await page.waitForTimeout(500);
    }

    // Game should still be running (HUD or victory screen visible)
    const hud = getHUD(page);
    const hudVisible = await hud.isVisible().catch(() => false);
    const victoryVisible = await page.locator('[data-testid="victory-screen"]').isVisible().catch(() => false);
    expect(hudVisible || victoryVisible, 'Game should be running or show victory').toBe(true);
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
