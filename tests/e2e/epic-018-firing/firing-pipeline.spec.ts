import { canvasHasContent, getCanvas, getHUD, getCurrentPlayerName, launchGame, pressKey } from '../helpers';
import { expect, test } from '@playwright/test';

test.describe('Firing Pipeline (Space to Boom)', () => {
  test.describe('Weapon Firing', () => {
    test('Space key fires and changes status to FIRING', async ({ page }) => {
      await launchGame(page);

      // Verify initial state is "turn" phase
      const statusBar = page.locator('[data-testid="status-bar"]');
      await expect(statusBar).toContainText('AIM & FIRE');

      // Fire
      await page.keyboard.press('Space');
      await page.waitForTimeout(500);

      // Status should have changed from AIM & FIRE
      const statusText = await statusBar.textContent();
      expect(statusText).not.toContain('AIM & FIRE');
    });

    test('Cannot fire twice in same turn', async ({ page }) => {
      await launchGame(page);

      await page.keyboard.press('Space');
      await page.waitForTimeout(300);

      // Status should no longer be AIM & FIRE
      const statusBar = page.locator('[data-testid="status-bar"]');
      const statusText = await statusBar.textContent();
      expect(statusText).not.toContain('AIM & FIRE');

      // Second space should be ignored — status should not revert
      await page.keyboard.press('Space');
      await page.waitForTimeout(300);

      const text = await statusBar.textContent();
      expect(text).not.toContain('AIM & FIRE');
    });
  });

  test.describe('Turn Flow', () => {
    test('Turn advances to next player after firing', async ({ page }) => {
      await launchGame(page);

      const player1Name = await getCurrentPlayerName(page);
      expect(player1Name.length).toBeGreaterThan(0);

      // Fire and wait for turn to resolve
      await page.keyboard.press('Space');
      await expect(async () => {
        const currentPlayer = await getCurrentPlayerName(page);
        expect(currentPlayer).not.toBe(player1Name);
      }).toPass({ timeout: 20000 });
    });

    test('Turn number increments after resolution', async ({ page }) => {
      await launchGame(page);

      const statusBar = page.locator('[data-testid="status-bar"]');
      await expect(statusBar).toContainText('Turn 1');

      await page.keyboard.press('Space');
      await expect(statusBar).toContainText('Turn 2', { timeout: 15000 });
    });

    test('Player cycles back to first player after both fire', async ({ page }) => {
      await launchGame(page);

      const player1Name = await getCurrentPlayerName(page);

      // Player 1 fires
      await page.keyboard.press('Space');
      await expect(async () => {
        // Handle shop if it appears between rounds
        const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
        if (await shopBtn.isVisible({ timeout: 100 }).catch(() => false)) {
          await shopBtn.click();
        }
        const current = await getCurrentPlayerName(page);
        expect(current).not.toBe(player1Name);
      }).toPass({ timeout: 20000 });

      const player2Name = await getCurrentPlayerName(page);

      // Player 2 fires
      await page.keyboard.press('Space');
      await expect(async () => {
        // Handle shop if it appears between rounds
        const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
        if (await shopBtn.isVisible({ timeout: 100 }).catch(() => false)) {
          await shopBtn.click();
        }
        const current = await getCurrentPlayerName(page);
        expect(current).not.toBe(player2Name);
      }).toPass({ timeout: 20000 });
    });
  });

  test.describe('Controls During Phases', () => {
    test('Arrow keys adjust angle during turn phase', async ({ page }) => {
      await launchGame(page);

      const hud = getHUD(page);
      const initialText = await hud.textContent();
      const initialAngle = initialText?.match(/(\d+)°/)?.[1];

      await pressKey(page, 'ArrowLeft', 5);

      const afterText = await hud.textContent();
      const afterAngle = afterText?.match(/(\d+)°/)?.[1];

      if (initialAngle && afterAngle) {
        expect(Number(afterAngle)).toBeLessThan(Number(initialAngle));
      }
    });

    test('Controls blocked during firing phase', async ({ page }) => {
      await launchGame(page);

      // Fire
      await page.keyboard.press('Space');
      await page.waitForTimeout(100);

      // Try to adjust angle during FIRING phase
      const hud = getHUD(page);
      const duringFiringText = await hud.textContent();
      const angleDuringFiring = duringFiringText?.match(/(\d+)°/)?.[1];

      await pressKey(page, 'ArrowLeft', 5);
      await page.waitForTimeout(50);

      const afterPressText = await hud.textContent();
      const angleAfterPress = afterPressText?.match(/(\d+)°/)?.[1];

      // Angle should NOT have changed during firing phase
      if (angleDuringFiring && angleAfterPress) {
        expect(angleAfterPress).toBe(angleDuringFiring);
      }
    });
  });

  test.describe('Visual Verification', () => {
    test('Canvas renders game elements', async ({ page }) => {
      await launchGame(page);
      const hasContent = await canvasHasContent(page);
      expect(hasContent).toBe(true);
    });

    test('Status bar and HUD remain visible throughout fire cycle', async ({ page }) => {
      await launchGame(page);

      await expect(getCanvas(page)).toBeVisible();
      await expect(getHUD(page)).toBeVisible();
      await expect(page.locator('[data-testid="status-bar"]')).toBeVisible();

      // Fire and check canvas stays visible during firing
      await page.keyboard.press('Space');
      await page.waitForTimeout(1000);

      await expect(getCanvas(page)).toBeVisible();

      // Wait for resolution - game may enter shop or victory
      await page.waitForTimeout(5000);

      // Canvas should always remain visible regardless of game phase
      await expect(getCanvas(page)).toBeVisible();

      // Handle shop phase if it appeared
      const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
      if (await shopBtn.isVisible({ timeout: 500 }).catch(() => false)) {
        await shopBtn.click();
        await page.waitForTimeout(500);
      }
    });
  });
});
