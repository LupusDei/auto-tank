import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

import { launchGame, pressKey } from '../helpers';

/**
 * Extract the current weapon name from the HUD.
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

/** Extract current player name from the HUD "Player" field. */
async function getCurrentPlayer(page: Page): Promise<string> {
  return page.evaluate(() => {
    const hud = document.querySelector('[data-testid="game-hud"]');
    if (!hud) return '';
    const divs = Array.from(hud.querySelectorAll('div'));
    for (const div of divs) {
      if (div.textContent?.trim() === 'Player') {
        const next = div.nextElementSibling;
        if (next) return next.textContent?.trim() ?? '';
      }
    }
    return '';
  });
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
  }).toPass({ timeout: 15_000 });
}

/** Cycle to a weapon containing the given substring. */
async function cycleToWeapon(page: Page, target: string): Promise<boolean> {
  for (let i = 0; i < 25; i++) {
    const weaponText = await getWeaponName(page);
    if (weaponText.toLowerCase().includes(target.toLowerCase())) {
      return true;
    }
    await pressKey(page, 'Tab');
  }
  return false;
}

/**
 * Fire and measure wall-clock time until the player changes
 * (turn fully resolves and next player's turn begins).
 */
async function fireAndMeasureResolution(page: Page): Promise<number> {
  const playerBefore = await getCurrentPlayer(page);
  const startTime = Date.now();

  await pressKey(page, 'Space');

  // Wait until we're back in AIM & FIRE phase with a different player
  // Handle shop phase if it appears between turns
  await expect(async () => {
    const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
    if (await shopBtn.isVisible({ timeout: 100 }).catch(() => false)) {
      await shopBtn.click();
    }
    const text = (await page.locator('[data-testid="status-bar"]').textContent()) ?? '';
    const playerNow = await getCurrentPlayer(page);
    expect(text).toContain('AIM & FIRE');
    expect(playerNow).not.toBe(playerBefore);
  }).toPass({ timeout: 20_000 });

  return Date.now() - startTime;
}

test.describe('Epic 046 Behavior: Grenade Resolution Time & State Changes', () => {
  test('Grenade takes longer to resolve than a missile (bouncing fuse)', async ({ page }) => {
    test.setTimeout(90_000);
    await launchGame(page);
    await waitForTurnPhase(page);

    // Fire the default weapon (missile) and measure resolution time
    const defaultWeapon = await getWeaponName(page);
    test.info().annotations.push({
      type: 'note',
      description: `Default weapon: "${defaultWeapon}"`,
    });

    const missileTime = await fireAndMeasureResolution(page);
    test.info().annotations.push({
      type: 'note',
      description: `Missile resolution time: ${missileTime}ms`,
    });

    // Now it's Player 2's turn — fire quickly to get back to Player 1
    await waitForTurnPhase(page);
    const p2Time = await fireAndMeasureResolution(page);
    test.info().annotations.push({
      type: 'note',
      description: `Player 2 turn resolution: ${p2Time}ms`,
    });

    // Now Player 1 again — cycle to grenade
    await waitForTurnPhase(page);
    const foundGrenade = await cycleToWeapon(page, 'grenade');
    if (!foundGrenade) {
      test.info().annotations.push({
        type: 'issue',
        description:
          'Grenade not available in weapon cycle. Cannot compare resolution times. ' +
          'Add grenade to starting loadout.',
      });
      expect(foundGrenade, 'Grenade must be available to test bounce timing').toBe(true);
      return;
    }

    const grenadeTime = await fireAndMeasureResolution(page);
    test.info().annotations.push({
      type: 'note',
      description:
        `Grenade resolution time: ${grenadeTime}ms vs Missile: ${missileTime}ms. ` +
        `Difference: ${grenadeTime - missileTime}ms`,
    });

    // Grenade should take longer because it bounces (3s fuse) vs missile instant impact
    expect(
      grenadeTime,
      `Grenade (${grenadeTime}ms) should take longer than missile (${missileTime}ms) — ` +
        'grenade has a 3s fuse and bounces before detonating. ' +
        'If grenade resolves faster, the bounce/fuse timing is not implemented.',
    ).toBeGreaterThan(missileTime);
  });

  test('Firing actually changes game state — terrain or damage occurs', async ({ page }) => {
    test.setTimeout(45_000);
    await launchGame(page);
    await waitForTurnPhase(page);

    // Capture full canvas pixel hash BEFORE firing
    const hashBefore = await page.evaluate(() => {
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

    // Aim toward terrain near opponent
    await pressKey(page, 'ArrowRight', 20);
    await pressKey(page, 'ArrowUp', 10);

    // Fire and wait for next player's turn
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
    }).toPass({ timeout: 15_000 });

    // Small render delay
    await page.waitForTimeout(300);

    // Capture canvas hash AFTER firing
    const hashAfter = await page.evaluate(() => {
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

    test.info().annotations.push({
      type: 'note',
      description: `Canvas hash before: ${hashBefore}, after: ${hashAfter}`,
    });

    // Firing must change the game visually — crater in terrain, explosion marks,
    // tank health bar changes, or damage numbers
    expect(
      hashBefore !== hashAfter,
      'Firing a weapon should change the canvas (crater in terrain, explosion marks, etc). ' +
        `Hash before=${hashBefore}, after=${hashAfter}. ` +
        'If identical, terrain destruction or explosion rendering may not be working.',
    ).toBe(true);
  });
});
