import { expect, test } from '@playwright/test';

test.describe('Multi-Context', () => {
  test('Two browser contexts load independently', async ({ browser }) => {
    const ctx1 = await browser.newContext();
    const ctx2 = await browser.newContext();

    const page1 = await ctx1.newPage();
    const page2 = await ctx2.newPage();

    await page1.goto('/');
    await page2.goto('/');

    await expect(page1.locator('[data-testid="game-canvas"]')).toBeVisible();
    await expect(page2.locator('[data-testid="game-canvas"]')).toBeVisible();

    await expect(page1.locator('[data-testid="game-hud"]')).toBeVisible();
    await expect(page2.locator('[data-testid="game-hud"]')).toBeVisible();

    const hudTextBefore = await page2.locator('[data-testid="game-hud"]').textContent();

    await page1.keyboard.press('ArrowLeft');

    const hudTextAfter = await page2.locator('[data-testid="game-hud"]').textContent();
    expect(hudTextAfter).toBe(hudTextBefore);

    await ctx1.close();
    await ctx2.close();
  });
});
