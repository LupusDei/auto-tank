import { expect, test } from '@playwright/test';
import { launchGame } from './helpers';

test.describe('Settings E2E', () => {
  test('should load game without console errors', async ({ page }) => {
    const errors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') errors.push(msg.text());
    });

    await launchGame(page);
    await page.waitForTimeout(500);

    // Filter out known non-critical errors
    const critical = errors.filter((e) => !e.includes('[EventBus]'));
    expect(critical).toHaveLength(0);
  });

  test('should respond to escape key', async ({ page }) => {
    await launchGame(page);
    await page.keyboard.press('Escape');
    await page.waitForTimeout(100);
    // Game should still be visible (escape might open menu but not crash)
    const canvas = page.locator('[data-testid="game-canvas"]');
    await expect(canvas).toBeVisible();
  });
});
