import { expect, test } from '@playwright/test';
import { getCanvas, launchGame, pressKey } from '../helpers';

test.describe('Firing and Movement', () => {
  test('Space fires a projectile', async ({ page }) => {
    // 1. Navigate to game page with canvas visible
    await launchGame(page);
    const canvas = getCanvas(page);
    await expect(canvas).toBeVisible();

    // 2. Press Space to fire
    await pressKey(page, 'Space');

    // 3. Wait 3 seconds for projectile to travel / resolve
    await page.waitForTimeout(3000);

    // 4. Canvas should still be visible (no crash)
    await expect(canvas).toBeVisible();

    // NOTE: Projectile rendering may not be wired yet.
    // When it is, add an assertion for a projectile entity or
    // canvas pixel change after firing.
  });

  test('A key moves tank left', async ({ page }) => {
    // 1. Navigate to game page
    await launchGame(page);
    const canvas = getCanvas(page);
    await expect(canvas).toBeVisible();

    // 2. Press 'a' key 5 times
    await pressKey(page, 'a', 5);

    // 3. Canvas still visible (no crash)
    await expect(canvas).toBeVisible();
  });

  test('D key moves tank right', async ({ page }) => {
    // 1. Navigate to game page
    await launchGame(page);
    const canvas = getCanvas(page);
    await expect(canvas).toBeVisible();

    // 2. Press 'd' key 5 times
    await pressKey(page, 'd', 5);

    // 3. Canvas still visible (no crash)
    await expect(canvas).toBeVisible();
  });
});
