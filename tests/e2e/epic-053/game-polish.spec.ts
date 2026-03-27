import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

import { launchGame, pressKey } from '../helpers';

/** Get the current player name from the HUD. */
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

/** Handle the shop screen if it appears between rounds. */
async function handleShopIfPresent(page: Page): Promise<void> {
  const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
  if (await shopBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await shopBtn.click();
    await page.waitForTimeout(500);
  }
}

/** Fire and wait for the next player's turn. */
async function fireAndWaitForNextTurn(page: Page): Promise<void> {
  const playerBefore = await getCurrentPlayer(page);
  await pressKey(page, 'Space');

  await expect(async () => {
    await handleShopIfPresent(page);
    const text = (await page.locator('[data-testid="status-bar"]').textContent()) ?? '';
    const playerNow = await getCurrentPlayer(page);
    expect(text).toContain('AIM & FIRE');
    expect(playerNow).not.toBe(playerBefore);
  }).toPass({ timeout: 15_000 });
}

/** Compute a simple hash of canvas pixel data. */
async function getCanvasHash(page: Page): Promise<number> {
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

test.describe('Epic 053: Game Polish', () => {
  test('Canvas updates during firing phase', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);

    // Capture canvas hash before firing
    const hashBefore = await getCanvasHash(page);

    // Fire a weapon
    await pressKey(page, 'Space');

    // Wait ~1 second into the firing phase for projectile/explosion rendering
    await page.waitForTimeout(1_000);

    // Capture canvas hash during/after firing
    const hashDuring = await getCanvasHash(page);

    test.info().annotations.push({
      type: 'note',
      description: `Canvas hash before firing: ${hashBefore}, during/after firing: ${hashDuring}`,
    });

    // The canvas should have changed — projectile trail, explosion, terrain deformation
    expect(
      hashBefore !== hashDuring,
      'Canvas should update during firing phase (projectile trail, explosion effects). ' +
        `Hash before=${hashBefore}, during=${hashDuring}. ` +
        'If identical, the rendering pipeline may not be drawing firing effects.',
    ).toBe(true);
  });

  test('Multiple rounds of play remain stable', async ({ page }) => {
    test.setTimeout(60_000);
    await launchGame(page);

    const hud = page.locator('[data-testid="game-hud"]');
    await expect(hud).toBeVisible();

    let shotsCompleted = 0;

    for (let i = 0; i < 8; i++) {
      try {
        await fireAndWaitForNextTurn(page);
        shotsCompleted++;
      } catch {
        // Game may have ended (victory) — check if HUD disappeared
        const hudVisible = await hud.isVisible().catch(() => false);
        if (!hudVisible) {
          // Check for victory/game-over screen
          const bodyText = await page.locator('body').textContent();
          const hasVictory =
            bodyText?.toLowerCase().includes('victory') || bodyText?.toLowerCase().includes('wins');
          test.info().annotations.push({
            type: 'note',
            description: hasVictory
              ? `Game ended with victory after ${shotsCompleted} shots.`
              : `Game HUD disappeared after ${shotsCompleted} shots — possible game end.`,
          });
          // Game ending is a valid outcome
          break;
        }
        throw new Error(`Turn ${i + 1} failed to advance and game is still running`);
      }

      // Verify HUD remains visible after each shot
      await expect(hud).toBeVisible();
    }

    test.info().annotations.push({
      type: 'note',
      description: `Completed ${shotsCompleted} shots across multiple rounds. Game remained stable throughout.`,
    });

    expect(shotsCompleted, 'Should complete at least a few rounds of play').toBeGreaterThanOrEqual(
      2,
    );
  });
});
