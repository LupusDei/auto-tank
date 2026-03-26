import { expect, test } from '@playwright/test';

test.describe('Auto Tank', () => {
  test('seed', async ({ page }) => {
    await page.goto('/');
    await expect(page.locator('[data-testid="game-canvas"]')).toBeVisible();
    await expect(page.locator('[data-testid="game-hud"]')).toBeVisible();
  });
});
