import { expect, test } from '@playwright/test';

import { getTestIdText, launchGame, pressKey } from '../helpers';

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
      await page.waitForTimeout(100);

      const statusAfterFirst = await getTestIdText(page, 'status-bar');
      expect(statusAfterFirst).toContain('FIRING');

      // Try firing again — should still be in FIRING phase, not change
      await pressKey(page, 'Space');
      await page.waitForTimeout(100);

      const statusAfterSecond = await getTestIdText(page, 'status-bar');
      expect(statusAfterSecond).toContain('FIRING');
    });
  });

  test.describe('Turn Flow', () => {
    test('Turn advances to Player 2 after firing', async ({ page }) => {
      await launchGame(page);

      // Verify Player 1 active
      const hud = page.locator('[data-testid="game-hud"]');
      await expect(hud).toContainText('Player 1');

      // Fire and wait for resolution to complete
      await pressKey(page, 'Space');
      await page.waitForTimeout(4000); // Wait for projectile arc + resolution delay

      // Should now be Player 2's turn
      await expect(hud).toContainText('Player 2');
    });

    test('Turn number increments after firing', async ({ page }) => {
      await launchGame(page);

      // Verify Turn 1
      const statusBar = page.locator('[data-testid="status-bar"]');
      await expect(statusBar).toContainText('Turn 1');

      // Fire and wait for full resolution
      await pressKey(page, 'Space');
      await page.waitForTimeout(4000);

      // Should now be Turn 2
      await expect(statusBar).toContainText('Turn 2');
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

      // Fire to enter firing phase
      await pressKey(page, 'Space');
      await page.waitForTimeout(100);

      // Try adjusting angle during firing — should be ignored
      await pressKey(page, 'ArrowLeft', 5);

      // Wait for resolution and turn change to Player 2
      await page.waitForTimeout(4000);

      // Player 2 should have default angle (135), not modified
      const hud = page.locator('[data-testid="game-hud"]');
      await expect(hud).toContainText('135°');
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
