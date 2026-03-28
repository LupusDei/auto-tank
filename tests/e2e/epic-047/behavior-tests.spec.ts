import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

import { launchGame, pressKey } from '../helpers';

/**
 * Extract the current weapon name from the HUD.
 */
async function getWeaponName(page: Page): Promise<string> {
  const el = page.locator('[data-testid="weapon-toggle"] .hud-weapon-name');
  return (await el.textContent())?.trim() ?? '';
}

/** Extract current player name from the HUD "Player" field. */
async function getCurrentPlayer(page: Page): Promise<string> {
  const el = page.locator('[data-testid="player-banner"] .hud-player-name');
  if (!(await el.isVisible({ timeout: 1000 }).catch(() => false))) return '';
  return (await el.textContent({ timeout: 1000 }).catch(() => ''))?.trim() ?? '';
}

/** Wait for turn phase ("AIM & FIRE"), handling shop phase if it appears. */
async function waitForTurnPhase(page: Page): Promise<void> {
  await expect(async () => {
    const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
    if (await shopBtn.isVisible({ timeout: 100 }).catch(() => false)) {
      await shopBtn.click();
    }
    const text = (await page.locator('[data-testid="status-bar"]').textContent()) ?? '';
    expect(text).toContain('AIM & FIRE');
  }).toPass({ timeout: 30_000 });
}

/**
 * Capture a full canvas pixel hash for comparison.
 */
async function captureCanvasHash(page: Page): Promise<number> {
  return page.evaluate(() => {
    const canvas = document.querySelector(
      '[data-testid="game-canvas"]',
    ) as HTMLCanvasElement | null;
    if (!canvas) return 0;
    const ctx = canvas.getContext('2d');
    if (!ctx) return 0;
    const w = canvas.width;
    const h = canvas.height;
    const data = ctx.getImageData(0, 0, w, h).data;
    let hash = 0;
    for (let i = 0; i < data.length; i += 4) {
      hash = ((hash << 5) - hash + (data[i] ?? 0) + (data[i + 1] ?? 0) + (data[i + 2] ?? 0)) | 0;
    }
    return hash;
  });
}

test.describe('Epic 047 Behavior: Visual Effects & Weapon Cycling', () => {
  test('Firing produces visible change on canvas (explosion renders)', async ({ page }) => {
    test.setTimeout(45_000);
    await launchGame(page);
    await waitForTurnPhase(page);

    // Capture full canvas state before firing
    const hashBefore = await captureCanvasHash(page);

    // Fire the default weapon and wait for next player's turn
    const playerBefore = await getCurrentPlayer(page);
    await pressKey(page, 'Space');

    await expect(async () => {
      const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
      if (await shopBtn.isVisible({ timeout: 100 }).catch(() => false)) {
        await shopBtn.click();
      }
      const text = (await page.locator('[data-testid="status-bar"]').textContent()) ?? '';
      const playerNow = await getCurrentPlayer(page);
      expect(text).toContain('AIM & FIRE');
      expect(playerNow).not.toBe(playerBefore);
    }).toPass({ timeout: 30_000 });

    await page.waitForTimeout(300);

    // Capture canvas after explosion resolved
    const hashAfter = await captureCanvasHash(page);

    test.info().annotations.push({
      type: 'note',
      description: `Canvas hash before: ${hashBefore}, after: ${hashAfter}`,
    });

    // The canvas MUST look different after a weapon fires and explodes
    expect(
      hashBefore !== hashAfter,
      'Firing a weapon should produce visible changes on the canvas — ' +
        'explosion effects, crater, or projectile trail should alter pixels. ' +
        `Hash before=${hashBefore}, after=${hashAfter}.`,
    ).toBe(true);
  });

  test('Weapon cycle actually changes what weapon is selected', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);
    await waitForTurnPhase(page);

    // Get the initial weapon
    const initialWeapon = await getWeaponName(page);
    expect(initialWeapon.length).toBeGreaterThan(0);

    // Press Tab to cycle
    await pressKey(page, 'Tab');

    const cycledWeapon = await getWeaponName(page);
    expect(cycledWeapon.length).toBeGreaterThan(0);

    test.info().annotations.push({
      type: 'note',
      description: `Initial weapon: "${initialWeapon}", after Tab: "${cycledWeapon}"`,
    });

    // The weapon names MUST be different — Tab actually cycles
    expect(
      cycledWeapon,
      `Weapon should change after Tab press. Got "${initialWeapon}" both times. ` +
        'If only one weapon exists, the starting loadout is too small.',
    ).not.toBe(initialWeapon);

    // Now fire the cycled weapon and verify game continues to next player's turn
    const playerBefore = await getCurrentPlayer(page);
    await pressKey(page, 'Space');

    // Wait for full resolution: back to AIM & FIRE with different player
    await expect(async () => {
      const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
      if (await shopBtn.isVisible({ timeout: 100 }).catch(() => false)) {
        await shopBtn.click();
      }
      const text = (await page.locator('[data-testid="status-bar"]').textContent()) ?? '';
      const playerNow = await getCurrentPlayer(page);
      expect(text).toContain('AIM & FIRE');
      expect(playerNow).not.toBe(playerBefore);
    }).toPass({ timeout: 30_000 });

    // HUD still visible — the cycled weapon fired successfully and game continues
    const hud = page.locator('[data-testid="game-hud"]');
    await expect(hud).toBeVisible();
  });
});
