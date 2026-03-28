import { expect, test } from '@playwright/test';

import type { Page } from '@playwright/test';

import { canvasHasContent, launchGame, pressKey } from '../helpers';

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

/** Cycle weapons until smoke tracer is found; return whether it was found. */
async function cycleToSmokeTracer(page: Page): Promise<boolean> {
  for (let i = 0; i < 25; i++) {
    const weaponText = await getWeaponName(page);
    if (weaponText.toLowerCase().includes('smoke') || weaponText.toLowerCase().includes('tracer')) {
      return true;
    }
    await pressKey(page, 'Tab');
  }
  return false;
}

/** Wait for turn phase to return to "AIM & FIRE", handling shop phase if it appears. */
async function waitForTurnPhase(page: Page): Promise<void> {
  await expect(async () => {
    // If shop screen appears, click Ready to proceed
    const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
    if (await shopBtn.isVisible({ timeout: 100 }).catch(() => false)) {
      await shopBtn.click();
    }
    const text = (await page.locator('[data-testid="status-bar"]').textContent()) ?? '';
    expect(text).toContain('AIM & FIRE');
  }).toPass({ timeout: 30_000 });
}

/** Fire and wait for the next turn phase, handling shop if it appears. */
async function fireAndWaitForNextTurn(page: Page): Promise<void> {
  const playerBefore = await getCurrentPlayer(page);
  await pressKey(page, 'Space');

  // Wait for firing/resolution to complete and next turn to start
  // The status goes: AIM & FIRE -> FIRING... -> RESOLVING... -> (shop?) -> AIM & FIRE
  // AND the player name should change
  await expect(async () => {
    // Handle shop phase if it appears between turns
    const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
    if (await shopBtn.isVisible({ timeout: 100 }).catch(() => false)) {
      await shopBtn.click();
    }
    const text = (await page.locator('[data-testid="status-bar"]').textContent()) ?? '';
    const playerNow = await getCurrentPlayer(page);
    // Must be back in turn phase AND player must have changed
    expect(text).toContain('AIM & FIRE');
    expect(playerNow).not.toBe(playerBefore);
  }).toPass({ timeout: 30_000 });
}

test.describe('Epic 045 Behavior: Smoke Tracer Damage & Trail', () => {
  test('Smoke tracer does zero damage — Player 2 survives and can fire', async ({ page }) => {
    test.setTimeout(60_000);
    await launchGame(page);

    // Verify we're in turn phase
    await waitForTurnPhase(page);
    const player1Name = await getCurrentPlayer(page);
    expect(player1Name.length).toBeGreaterThan(0);

    // Cycle to smoke tracer
    const found = await cycleToSmokeTracer(page);
    if (!found) {
      test.info().annotations.push({
        type: 'issue',
        description:
          'Smoke tracer not available in weapon cycle — cannot verify zero-damage behavior.',
      });
      expect(found, 'Smoke tracer must be in starting loadout to test').toBe(true);
      return;
    }

    // Aim toward Player 2: increase angle toward opponent
    await pressKey(page, 'ArrowRight', 40);
    // Max out power for distance
    await pressKey(page, 'ArrowUp', 30);

    // Fire the smoke tracer and wait for Player 2's turn
    await fireAndWaitForNextTurn(page);

    // Verify Player 2 is now active (meaning they survived the smoke tracer)
    const player2Name = await getCurrentPlayer(page);
    expect(player2Name).not.toBe(player1Name);

    // Player 2 should be able to fire — prove they're alive
    await fireAndWaitForNextTurn(page);

    // Game should still be running (HUD visible, no victory screen)
    const hud = page.locator('[data-testid="game-hud"]');
    await expect(hud).toBeVisible();

    // Verify no victory screen appeared (smoke tracer shouldn't kill anyone)
    const victoryScreen = page.locator('[data-testid="victory-screen"]');
    const victoryVisible = await victoryScreen.isVisible().catch(() => false);
    expect(victoryVisible, 'No victory screen should appear — smoke tracer does 0 damage').toBe(
      false,
    );
  });

  test('Smoke tracer trail persists on canvas after firing', async ({ page }) => {
    test.setTimeout(45_000);
    await launchGame(page);
    await waitForTurnPhase(page);

    // Capture canvas pixel data BEFORE firing
    // We use a full-canvas hash since we don't know exact trajectory path
    const snapshotBefore = await page.evaluate(() => {
      const canvas = document.querySelector(
        '[data-testid="game-canvas"]',
      ) as HTMLCanvasElement | null;
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const w = canvas.width;
      const h = canvas.height;
      const data = ctx.getImageData(0, 0, w, h).data;
      // Full canvas hash
      let hash = 0;
      for (let i = 0; i < data.length; i += 4) {
        hash = ((hash << 5) - hash + (data[i] ?? 0) + (data[i + 1] ?? 0) + (data[i + 2] ?? 0)) | 0;
      }
      return { hash, width: w, height: h };
    });

    expect(snapshotBefore).not.toBeNull();

    // Cycle to smoke tracer
    const found = await cycleToSmokeTracer(page);
    if (!found) {
      test.info().annotations.push({
        type: 'issue',
        description: 'Smoke tracer not available — cannot test trail persistence.',
      });
      expect(found, 'Smoke tracer must be available').toBe(true);
      return;
    }

    // Fire and wait for resolution
    await fireAndWaitForNextTurn(page);

    // Small wait for trail rendering to complete
    await page.waitForTimeout(500);

    // Capture canvas pixel data AFTER firing
    const snapshotAfter = await page.evaluate(() => {
      const canvas = document.querySelector(
        '[data-testid="game-canvas"]',
      ) as HTMLCanvasElement | null;
      if (!canvas) return null;
      const ctx = canvas.getContext('2d');
      if (!ctx) return null;
      const w = canvas.width;
      const h = canvas.height;
      const data = ctx.getImageData(0, 0, w, h).data;
      let hash = 0;
      for (let i = 0; i < data.length; i += 4) {
        hash = ((hash << 5) - hash + (data[i] ?? 0) + (data[i + 1] ?? 0) + (data[i + 2] ?? 0)) | 0;
      }
      return { hash, width: w, height: h };
    });

    expect(snapshotAfter).not.toBeNull();

    const hashBefore = snapshotBefore?.hash ?? 0;
    const hashAfter = snapshotAfter?.hash ?? 0;

    test.info().annotations.push({
      type: 'note',
      description: `Canvas hash before: ${hashBefore}, after: ${hashAfter}`,
    });

    // The smoke trail should leave visible marks on the canvas
    // If the hash is identical, the trail is not rendering/persisting
    expect(
      hashBefore !== hashAfter,
      'Canvas should change after smoke tracer fires — trail should persist on screen. ' +
        `Hash before=${hashBefore}, after=${hashAfter}. ` +
        'If identical, the smoke trail rendering may not be implemented.',
    ).toBe(true);

    // Verify canvas still has content
    const hasContent = await canvasHasContent(page);
    expect(hasContent).toBe(true);
  });
});
