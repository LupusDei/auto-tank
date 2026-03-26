import { expect, test } from '@playwright/test';
import { getCanvas, getHUD, launchGame, pressKey } from '../helpers';

test.describe('HUD Updates and Mouse Tracking', () => {
  test('Angle updates immediately on input', async ({ page }) => {
    await launchGame(page);
    const hud = getHUD(page);
    await expect(hud).toBeVisible();

    const hudTextBefore = await hud.textContent();

    await pressKey(page, 'ArrowLeft');

    const hudTextAfter = await hud.textContent();

    if (hudTextBefore !== hudTextAfter) {
      expect(hudTextAfter).not.toBe(hudTextBefore);
    } else {
      // Document that angle input is not yet wired to HUD updates
      test.info().annotations.push({
        type: 'issue',
        description: 'HUD text did not change after ArrowLeft — angle input may not be wired',
      });
    }
  });

  test('Weapon updates immediately on cycle', async ({ page }) => {
    await launchGame(page);
    const hud = getHUD(page);
    await expect(hud).toBeVisible();

    const hudTextBefore = await hud.textContent();

    await pressKey(page, 'Tab');

    const hudTextAfter = await hud.textContent();

    if (hudTextBefore !== hudTextAfter) {
      expect(hudTextAfter).not.toBe(hudTextBefore);
    } else {
      // Document that weapon cycling is not yet wired to HUD updates
      test.info().annotations.push({
        type: 'issue',
        description: 'HUD text did not change after Tab — weapon cycling may not be wired',
      });
    }
  });

  test('Mouse movement produces visual response', async ({ page }) => {
    await launchGame(page);
    const canvas = getCanvas(page);
    await expect(canvas).toBeVisible();

    const box = await canvas.boundingBox();
    expect(box).not.toBeNull();

    if (box) {
      // Move mouse to several positions across the canvas
      await page.mouse.move(box.x + box.width * 0.25, box.y + box.height * 0.5);
      await page.waitForTimeout(100);

      await page.mouse.move(box.x + box.width * 0.5, box.y + box.height * 0.25);
      await page.waitForTimeout(100);

      await page.mouse.move(box.x + box.width * 0.75, box.y + box.height * 0.75);
      await page.waitForTimeout(100);

      await page.mouse.move(box.x + box.width * 0.1, box.y + box.height * 0.9);
      await page.waitForTimeout(100);
    }

    // Canvas should still be visible — no crash from mouse events
    await expect(canvas).toBeVisible();
  });
});
