import { expect, test } from '@playwright/test';

import { getCurrentPlayerName, getTestIdText, launchGame, pressKey } from '../helpers';

test.describe('Epic 018: Firing Pipeline', () => {
  test.describe('Weapon Firing', () => {
    test('Space key fires a projectile and changes phase to FIRING', async ({ page }) => {
      await launchGame(page);

      // Verify starting in turn phase
      const statusBefore = await getTestIdText(page, 'status-bar');
      expect(statusBefore).toContain('AIM & FIRE');

      // Fire
      await pressKey(page, 'Space');
      await page.waitForTimeout(100);

      // Phase should change
      const statusAfter = await getTestIdText(page, 'status-bar');
      expect(statusAfter).toContain('FIRING');
    });

    test('Cannot fire twice in same turn', async ({ page }) => {
      await launchGame(page);

      // Fire once
      await pressKey(page, 'Space');
      await page.waitForTimeout(300);

      const statusAfterFirst = await getTestIdText(page, 'status-bar');
      // Status should no longer be AIM & FIRE (could be FIRING or RESOLVING)
      expect(statusAfterFirst).not.toContain('AIM & FIRE');

      // Try firing again — should not crash and status should not revert
      await pressKey(page, 'Space');
      await page.waitForTimeout(100);

      const statusAfterSecond = await getTestIdText(page, 'status-bar');
      expect(statusAfterSecond).not.toContain('AIM & FIRE');
    });
  });

  test.describe('Turn Flow', () => {
    test('Turn advances to next player after firing', async ({ page }) => {
      await launchGame(page);

      // Get current player name
      const player1Name = await getCurrentPlayerName(page);
      expect(player1Name.length).toBeGreaterThan(0);

      // Fire and wait for resolution to complete
      await pressKey(page, 'Space');

      // Wait for player to change
      await expect(async () => {
        const currentPlayer = await getCurrentPlayerName(page);
        expect(currentPlayer).not.toBe(player1Name);
      }).toPass({ timeout: 15000 });
    });

    test('Turn number increments after firing', async ({ page }) => {
      await launchGame(page);

      // Verify Turn 1
      const statusBar = page.locator('[data-testid="status-bar"]');
      await expect(statusBar).toContainText('Turn 1');

      // Fire and wait for full resolution
      await pressKey(page, 'Space');

      // Should now be Turn 2
      await expect(statusBar).toContainText('Turn 2', { timeout: 15000 });
    });
  });

  test.describe('Angle and Power Controls', () => {
    test('Arrow keys adjust angle during turn', async ({ page }) => {
      await launchGame(page);

      // Initial angle should be 45
      const hud = page.locator('[data-testid="game-hud"]');
      await expect(hud).toContainText('45°');

      // Press ArrowLeft 5 times (each decreases by 2)
      await pressKey(page, 'ArrowLeft', 5);
      await expect(hud).toContainText('35°');

      // Press ArrowRight 10 times (increases by 20 from 35 = 55)
      await pressKey(page, 'ArrowRight', 10);
      await expect(hud).toContainText('55°');
    });

    test('Arrow Up/Down adjusts power', async ({ page }) => {
      await launchGame(page);

      const hud = page.locator('[data-testid="game-hud"]');
      await expect(hud).toContainText('75%');

      // Press ArrowUp 3 times (each increases by 3)
      await pressKey(page, 'ArrowUp', 3);
      await expect(hud).toContainText('84%');

      // Press ArrowDown 6 times (each decreases by 3, 84 - 18 = 66)
      await pressKey(page, 'ArrowDown', 6);
      await expect(hud).toContainText('66%');
    });

    test('Controls blocked during firing phase', async ({ page }) => {
      await launchGame(page);

      const hud = page.locator('[data-testid="game-hud"]');
      // Record initial angle
      const initialText = (await hud.textContent()) ?? '';
      const initialAngle = initialText.match(/(\d+)°/)?.[1];

      // Fire to enter firing phase
      await pressKey(page, 'Space');
      await page.waitForTimeout(100);

      // Read angle during firing phase - it should not change
      const duringFiringText = (await hud.textContent()) ?? '';
      const angleDuringFiring = duringFiringText.match(/(\d+)°/)?.[1];

      // Try adjusting angle during firing — should be ignored
      await pressKey(page, 'ArrowLeft', 5);
      await page.waitForTimeout(100);

      const afterPressText = (await hud.textContent()) ?? '';
      const angleAfterPress = afterPressText.match(/(\d+)°/)?.[1];

      // Angle should NOT have changed during firing phase
      if (angleDuringFiring && angleAfterPress) {
        expect(angleAfterPress).toBe(angleDuringFiring);
      }
    });
  });

  test.describe('Visual Verification', () => {
    test('Canvas renders game elements', async ({ page }) => {
      await launchGame(page);

      // Canvas should be visible and have content
      const canvas = page.locator('[data-testid="game-canvas"]');
      await expect(canvas).toBeVisible();

      // Check canvas has non-black pixels
      const hasContent = await page.evaluate(() => {
        const el = document.querySelector(
          '[data-testid="game-canvas"]',
        ) as HTMLCanvasElement | null;
        if (!el) return false;
        const ctx = el.getContext('2d');
        if (!ctx) return false;
        const data = ctx.getImageData(0, 0, el.width, el.height).data;
        for (let i = 0; i < data.length; i += 4) {
          if ((data[i] ?? 0) > 0 || (data[i + 1] ?? 0) > 0 || (data[i + 2] ?? 0) > 0) {
            return true;
          }
        }
        return false;
      });
      expect(hasContent).toBe(true);
    });
  });
});
