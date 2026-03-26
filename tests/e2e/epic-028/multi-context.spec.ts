import { expect, test } from '@playwright/test';

test.describe('Multi-Context', () => {
  test('Two browser contexts show main menu independently', async ({ browser }) => {
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();

    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    await page1.goto('/');
    await page2.goto('/');

    // Both should show main menu
    await expect(page1.locator('[data-testid="main-menu"]')).toBeVisible();
    await expect(page2.locator('[data-testid="main-menu"]')).toBeVisible();

    // Both should have canvas
    await expect(page1.locator('[data-testid="game-canvas"]')).toBeVisible();
    await expect(page2.locator('[data-testid="game-canvas"]')).toBeVisible();

    await ctx1.close();
    await ctx2.close();
  });
});
