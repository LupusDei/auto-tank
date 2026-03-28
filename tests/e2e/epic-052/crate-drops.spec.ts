import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

import { launchGame, pressKey } from '../helpers';

/** Get the current player name from the HUD. */
async function getCurrentPlayer(page: Page): Promise<string> {
  const el = page.locator('[data-testid="player-banner"] .hud-player-name');
  if (!(await el.isVisible({ timeout: 1000 }).catch(() => false))) return '';
  return (await el.textContent({ timeout: 1000 }).catch(() => ''))?.trim() ?? '';
}

/** Handle the shop screen if it appears between rounds. */
async function handleShopIfPresent(page: Page): Promise<void> {
  const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
  if (await shopBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await shopBtn.click();
    await page.waitForTimeout(500);
  }
}

/** Fire and wait for the turn to resolve (next turn or game end). */
async function fireAndWaitForResolution(page: Page): Promise<boolean> {
  const statusBefore = (await page.locator('[data-testid="status-bar"]').textContent()) ?? '';
  const turnMatch = statusBefore.match(/Turn\s+(\d+)/);
  const turnBefore = turnMatch ? parseInt(turnMatch[1], 10) : 0;
  const playerBefore = await getCurrentPlayer(page);

  await pressKey(page, 'Space');

  // Wait for either: turn number advances, player changes, or game ends
  await expect(async () => {
    await handleShopIfPresent(page);

    // Check for victory/game-over
    const victoryEl = page.locator('[data-testid="victory-screen"], [data-testid="game-over"]');
    if (
      await victoryEl
        .first()
        .isVisible({ timeout: 100 })
        .catch(() => false)
    ) {
      return; // Game ended — pass
    }

    const text = (await page.locator('[data-testid="status-bar"]').textContent()) ?? '';
    expect(text).toContain('AIM & FIRE');

    // Either the turn number changed or the player changed
    const newTurnMatch = text.match(/Turn\s+(\d+)/);
    const turnNow = newTurnMatch ? parseInt(newTurnMatch[1], 10) : 0;
    const playerNow = await getCurrentPlayer(page);
    const turnAdvanced = turnNow > turnBefore || playerNow !== playerBefore;
    expect(
      turnAdvanced,
      `Turn should advance: turn ${turnBefore}->${turnNow}, player ${playerBefore}->${playerNow}`,
    ).toBe(true);
  }).toPass({ timeout: 30_000 });

  // Return whether game is still going
  const hud = page.locator('[data-testid="game-hud"]');
  return hud.isVisible().catch(() => false);
}

test.describe('Epic 052: Crate Drops', () => {
  test('Game continues after multiple turns without crashing', async ({ page }) => {
    test.setTimeout(120_000);
    await launchGame(page);

    const hud = page.locator('[data-testid="game-hud"]');
    await expect(hud).toBeVisible();

    const toastMessages: string[] = [];
    let shotsCompleted = 0;

    for (let i = 0; i < 6; i++) {
      const gameStillGoing = await fireAndWaitForResolution(page);
      shotsCompleted++;

      // Check for any toast notifications (crate drops may show toasts)
      const toasts = page.locator('[data-testid="toast"], [role="alert"], .toast');
      const toastCount = await toasts.count();
      for (let t = 0; t < toastCount; t++) {
        const text = await toasts.nth(t).textContent();
        if (text) toastMessages.push(text.trim());
      }

      if (!gameStillGoing) break;

      // Verify HUD is still present
      await expect(hud).toBeVisible();
    }

    test.info().annotations.push({
      type: 'note',
      description:
        `Completed ${shotsCompleted} shots across alternating turns. ` +
        (toastMessages.length > 0
          ? `Toast notifications observed: [${toastMessages.join('; ')}]`
          : 'No toast notifications observed (crate drops are 30% chance).'),
    });

    // Verify game is still functional (HUD, victory, or canvas visible)
    const hudVisible = await hud.isVisible().catch(() => false);
    const victoryVisible = await page.locator('[data-testid="victory-screen"]').isVisible().catch(() => false);
    const canvasVisible = await page.locator('[data-testid="game-canvas"]').isVisible().catch(() => false);
    expect(hudVisible || victoryVisible || canvasVisible, 'Game should still be running or show victory/canvas').toBe(true);
  });

  test('Between-turn events do not break game flow', async ({ page }) => {
    test.setTimeout(120_000);
    await launchGame(page);

    const hud = page.locator('[data-testid="game-hud"]');
    await expect(hud).toBeVisible();

    for (let shot = 0; shot < 4; shot++) {
      // Verify HUD is visible and responsive before firing
      await expect(hud).toBeVisible();

      // Read angle before adjustment
      const angleBefore = await page.evaluate(() => {
        const hud = document.querySelector('[data-testid="game-hud"]');
        if (!hud) return '';
        const divs = Array.from(hud.querySelectorAll('div'));
        for (const div of divs) {
          if (div.textContent?.trim() === 'Angle') {
            const next = div.nextElementSibling;
            if (next) return next.textContent?.trim() ?? '';
          }
        }
        return '';
      });

      // Adjust angle to verify controls still work
      await pressKey(page, 'ArrowLeft', 3);

      const angleAfter = await page.evaluate(() => {
        const hud = document.querySelector('[data-testid="game-hud"]');
        if (!hud) return '';
        const divs = Array.from(hud.querySelectorAll('div'));
        for (const div of divs) {
          if (div.textContent?.trim() === 'Angle') {
            const next = div.nextElementSibling;
            if (next) return next.textContent?.trim() ?? '';
          }
        }
        return '';
      });

      // Angle should have changed (controls are responsive)
      expect(
        angleAfter !== angleBefore,
        `Shot ${shot + 1}: Angle controls should respond. Before: "${angleBefore}", After: "${angleAfter}"`,
      ).toBe(true);

      // Fire and wait for turn resolution
      const gameStillGoing = await fireAndWaitForResolution(page);
      if (!gameStillGoing) break;

      test.info().annotations.push({
        type: 'note',
        description: `Shot ${shot + 1}: Angle changed from "${angleBefore}" to "${angleAfter}", turn advanced successfully.`,
      });
    }

    // Final verification — game is still in a valid state
    const hudVisible = await hud.isVisible().catch(() => false);
    const victoryVisible = await page.locator('[data-testid="victory-screen"]').isVisible().catch(() => false);
    const canvasVisible = await page.locator('[data-testid="game-canvas"]').isVisible().catch(() => false);
    expect(hudVisible || victoryVisible || canvasVisible, 'Game should still be running or ended normally').toBe(true);
  });
});
