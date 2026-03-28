import { expect, test } from '@playwright/test';

test('EXPLORATION: Full Gameplay', async ({ page }) => {
  test.setTimeout(120_000);

  // Navigate and start game
  await page.goto('/');
  await page.waitForTimeout(500);

  await page.locator('[data-testid="btn-start"]').click();
  await page.waitForTimeout(300);
  await page.locator('[data-testid="start-game-btn"]').click();
  await page.waitForTimeout(1000);

  const canvas = page.locator('[data-testid="game-canvas"]');
  await expect(canvas).toBeVisible();
  await canvas.focus();

  await page.screenshot({ path: 'tests/e2e/exploration/screenshots/10-game-start.png' });

  // === HUD CHECKS ===
  const hud = page.locator('[data-testid="game-hud"]');
  await expect(hud).toBeVisible();

  const banner = page.locator('[data-testid="player-banner"]');
  console.log(`Player banner text: "${await banner.textContent()}"`);

  const statusBar = page.locator('[data-testid="status-bar"]');
  console.log(`Status bar: "${await statusBar.textContent()}"`);

  const weaponToggle = page.locator('[data-testid="weapon-toggle"]');
  await expect(weaponToggle).toBeVisible();

  // === CONTROLS TEST ===
  let hudText = await hud.textContent() ?? '';
  const angleMatch1 = hudText.match(/(\d+)\u00B0/);
  console.log(`Initial angle: ${angleMatch1 ? angleMatch1[1] : 'NOT FOUND'}`);

  // Press ArrowLeft 3 times
  for (let i = 0; i < 3; i++) {
    await canvas.press('ArrowLeft');
    await page.waitForTimeout(30);
  }
  hudText = await hud.textContent() ?? '';
  const angleMatch2 = hudText.match(/(\d+)\u00B0/);
  console.log(`After 3x ArrowLeft: ${angleMatch2 ? angleMatch2[1] : 'NOT FOUND'}`);
  console.log(`Angle changed: ${angleMatch1?.[1] !== angleMatch2?.[1]}`);

  // Power control
  for (let i = 0; i < 3; i++) {
    await canvas.press('ArrowUp');
    await page.waitForTimeout(30);
  }

  // Tab cycling
  await canvas.press('Tab');
  await page.waitForTimeout(50);

  // === FIRING ===
  await page.screenshot({ path: 'tests/e2e/exploration/screenshots/13-before-fire.png' });

  await canvas.press('Space');
  await page.waitForTimeout(500);

  const statusAfterFire = await statusBar.textContent().catch(() => 'status-bar-gone');
  console.log(`Status after fire: "${statusAfterFire}"`);
  await page.screenshot({ path: 'tests/e2e/exploration/screenshots/14-during-fire.png' });

  // Wait for resolution
  await page.waitForTimeout(4000);
  await page.screenshot({ path: 'tests/e2e/exploration/screenshots/15-after-resolution.png' });

  // Handle shop phase if it appeared
  const shopReadyBtn = page.locator('[data-testid="shop-ready-btn"]');
  if (await shopReadyBtn.isVisible({ timeout: 1000 }).catch(() => false)) {
    console.log('Shop phase appeared, clicking ready');
    await shopReadyBtn.click();
    await page.waitForTimeout(500);
  }

  // Wait for second turn
  await page.waitForTimeout(1000);

  // Handle shop again if needed
  if (await shopReadyBtn.isVisible({ timeout: 500 }).catch(() => false)) {
    await shopReadyBtn.click();
    await page.waitForTimeout(300);
  }

  const statusTurn2 = await statusBar.textContent().catch(() => 'status-bar-gone');
  console.log(`Status turn 2: "${statusTurn2}"`);

  if (statusTurn2.includes('AIM')) {
    await canvas.press('Space');
    await page.waitForTimeout(2000);
  }

  await page.screenshot({ path: 'tests/e2e/exploration/screenshots/16-turn2.png' });

  console.log('\n=== GAMEPLAY EXPLORATION COMPLETE ===');
});
