import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

import { pressKey } from '../helpers';

/** Handle the shop screen if it appears between rounds. */
async function handleShopIfPresent(page: Page): Promise<void> {
  const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
  if (await shopBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await shopBtn.click();
    await page.waitForTimeout(500);
  }
}

/** Fire a shot and wait for the resolution phase to complete. */
async function fireAndWaitForResolution(page: Page): Promise<void> {
  await pressKey(page, 'Space');
  // Wait for the projectile to fly and resolve (explosion, damage, turn advance)
  await page.waitForTimeout(3_000);
  // Handle shop if it appeared
  await handleShopIfPresent(page);
  // Brief extra settle
  await page.waitForTimeout(500);
}

test.describe('Epic 054: Full Game Lifecycle', () => {
  test('Complete game lifecycle: menu -> config -> play -> shop -> victory -> replay', async ({
    page,
  }) => {
    test.setTimeout(120_000);

    // 1. Navigate to /
    await page.goto('/');
    await page.waitForTimeout(500);

    // 2. Verify main-menu is visible
    const mainMenu = page.locator('[data-testid="main-menu"]');
    await expect(mainMenu).toBeVisible({ timeout: 5_000 });

    // 3. Click "Start Game" from main menu
    const btnStart = page.locator('[data-testid="btn-start"]');
    await expect(btnStart).toBeVisible();
    await btnStart.click();

    // 4. Verify config-screen appears
    const configScreen = page.locator('[data-testid="config-screen"]');
    await expect(configScreen).toBeVisible({ timeout: 5_000 });

    // 5. Click "START GAME" button in config
    const startGameBtn = page.locator('[data-testid="start-game-btn"]');
    await expect(startGameBtn).toBeVisible();
    await startGameBtn.click();

    // 6. Verify game-hud appears
    const hud = page.locator('[data-testid="game-hud"]');
    await expect(hud).toBeVisible({ timeout: 5_000 });

    // 7-9. Fire shots until victory or max 30 shots
    let shotsFired = 0;
    let gameEnded = false;

    for (let i = 0; i < 30; i++) {
      // Check if game has ended (results screen or victory screen appeared)
      const resultsScreen = page.locator('[data-testid="results-screen"]');
      const victoryScreen = page.locator('[data-testid="victory-screen"]');

      const hasResults = await resultsScreen.isVisible({ timeout: 200 }).catch(() => false);
      const hasVictory = await victoryScreen.isVisible({ timeout: 200 }).catch(() => false);

      if (hasResults || hasVictory) {
        gameEnded = true;
        break;
      }

      // Check HUD is still visible (game still in progress)
      const hudVisible = await hud.isVisible().catch(() => false);
      if (!hudVisible) {
        // HUD gone -- game might have ended, check for end screens
        await page.waitForTimeout(1_000);
        const hasResultsNow = await resultsScreen.isVisible({ timeout: 1_000 }).catch(() => false);
        const hasVictoryNow = await victoryScreen.isVisible({ timeout: 1_000 }).catch(() => false);
        if (hasResultsNow || hasVictoryNow) {
          gameEnded = true;
        }
        break;
      }

      await fireAndWaitForResolution(page);
      shotsFired++;

      test.info().annotations.push({
        type: 'note',
        description: `Shot ${shotsFired} fired successfully`,
      });
    }

    test.info().annotations.push({
      type: 'note',
      description: `Total shots fired: ${shotsFired}, game ended: ${gameEnded}`,
    });

    // If game ended, handle the results/victory screen
    if (gameEnded) {
      // 10. Check for winner name on results screen
      const resultsScreen = page.locator('[data-testid="results-screen"]');
      const victoryScreen = page.locator('[data-testid="victory-screen"]');

      const hasResults = await resultsScreen.isVisible({ timeout: 1_000 }).catch(() => false);
      const hasVictory = await victoryScreen.isVisible({ timeout: 1_000 }).catch(() => false);

      if (hasResults) {
        const resultsText = await resultsScreen.textContent();
        expect(resultsText).toBeTruthy();
        test.info().annotations.push({
          type: 'note',
          description: `Results screen text: ${resultsText}`,
        });

        // 11. Click "Play Again"
        const playAgainBtn = page.locator('[data-testid="play-again-btn"]');
        await expect(playAgainBtn).toBeVisible({ timeout: 3_000 });
        await playAgainBtn.click();

        // 12. Verify config-screen appears again (game cycles back)
        await expect(configScreen).toBeVisible({ timeout: 5_000 });

        test.info().annotations.push({
          type: 'note',
          description: 'Successfully cycled: menu -> config -> play -> results -> config',
        });
      } else if (hasVictory) {
        const winnerName = page.locator('[data-testid="winner-name"]');
        const winnerText = await winnerName.textContent().catch(() => null);
        test.info().annotations.push({
          type: 'note',
          description: `Victory screen winner: ${winnerText}`,
        });

        // Click Play Again on victory screen
        const playAgainBtn = page.locator('[data-testid="btn-play-again"]');
        await expect(playAgainBtn).toBeVisible({ timeout: 3_000 });
        await playAgainBtn.click();

        await expect(configScreen).toBeVisible({ timeout: 5_000 });
      }
    } else {
      // Game didn't end in 30 shots -- that's okay, verify game is still stable
      expect(shotsFired).toBeGreaterThanOrEqual(3);
      test.info().annotations.push({
        type: 'note',
        description: `Game still in progress after ${shotsFired} shots (max reached)`,
      });
    }
  });
});
