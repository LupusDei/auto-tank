import { expect, test } from '@playwright/test';

test('EXPLORATION: Main Menu', async ({ page }) => {
  test.setTimeout(60_000);

  await page.goto('/');
  await page.waitForTimeout(2000);

  // 1. Verify main menu renders
  const menu = page.locator('[data-testid="main-menu"]');
  await expect(menu).toBeVisible();
  await page.screenshot({ path: 'tests/e2e/exploration/screenshots/01-main-menu.png' });

  // 2. Check title
  const title = page.locator('.main-menu-title');
  await expect(title).toContainText('AUTO TANK');

  // 3. Check animated background canvas exists
  const bgCanvas = menu.locator('canvas');
  const canvasExists = await bgCanvas.count();
  console.log(`Background canvas: ${canvasExists > 0 ? 'YES' : 'MISSING'}`);

  // 4. Check multiplayer button is disabled
  const mpBtn = page.locator('[data-testid="btn-multiplayer"]');
  const isDisabled = await mpBtn.isDisabled();
  console.log(`Multiplayer disabled: ${isDisabled}`);

  // 5. Check "SOON" badge
  const badge = mpBtn.locator('.coming-soon-badge');
  console.log(`Coming Soon badge visible: ${await badge.isVisible()}`);

  // 6. Click Settings
  await page.locator('[data-testid="btn-settings"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/e2e/exploration/screenshots/02-settings.png' });

  // 7. Verify settings screen
  const settingsVisible = await page.locator('.settings-screen').isVisible().catch(() => false);
  console.log(`Settings screen visible: ${settingsVisible}`);

  // 8. Go back to menu
  const backBtn = page.locator('text=Back').or(page.locator('[data-testid="back-btn"]'));
  if (await backBtn.isVisible().catch(() => false)) {
    await backBtn.click();
    await page.waitForTimeout(500);
  } else {
    console.log('WARNING: No Back button found in settings');
  }

  // 9. Click Start Game -> Config screen
  await page.locator('[data-testid="btn-start"]').click();
  await page.waitForTimeout(500);
  await page.screenshot({ path: 'tests/e2e/exploration/screenshots/03-config.png' });

  // 10. Config screen checks
  const configScreen = page.locator('[data-testid="config-screen"]');
  await expect(configScreen).toBeVisible();

  // Check theme dropdown
  const themeSelect = page.locator('[data-testid="theme-select"]');
  console.log(`Theme select visible: ${await themeSelect.isVisible()}`);
  console.log(`Theme value: ${await themeSelect.inputValue()}`);

  // Change theme to desert
  await themeSelect.selectOption('desert');
  console.log(`Theme changed to: ${await themeSelect.inputValue()}`);

  // Check rounds input
  const roundsInput = page.locator('[data-testid="rounds-input"]');
  console.log(`Rounds value: ${await roundsInput.inputValue()}`);

  // Check AI difficulty
  const aiSelect = page.locator('[data-testid="ai-difficulty-select"]');
  console.log(`AI difficulty: ${await aiSelect.inputValue()}`);

  // Check player names - are they random generals?
  const player0 = page.locator('[data-testid="player-name-0"]');
  const player1 = page.locator('[data-testid="player-name-1"]');
  const name0 = await player0.inputValue();
  const name1 = await player1.inputValue();
  console.log(`Player 1 name: "${name0}"`);
  console.log(`Player 2 name: "${name1}"`);
  const isGeneral = !name0.startsWith('Player');
  console.log(`Names are generals (not "Player N"): ${isGeneral}`);

  // Add a player
  const addBtn = page.locator('[data-testid="add-player-btn"]');
  if (await addBtn.isVisible()) {
    await addBtn.click();
    await page.waitForTimeout(300);
    const player2 = page.locator('[data-testid="player-name-2"]');
    console.log(`3rd player added: ${await player2.isVisible()}`);
    console.log(`3rd player name: "${await player2.inputValue()}"`);

    // Remove the 3rd player
    const removeBtn = page.locator('[data-testid="remove-player-2"]');
    if (await removeBtn.isVisible()) {
      await removeBtn.click();
      await page.waitForTimeout(200);
    }
  }

  // Check Back button
  const configBack = configScreen.locator('text=Back').or(configScreen.locator('.config-back-btn'));
  console.log(`Config Back button exists: ${await configBack.isVisible().catch(() => false)}`);

  await page.screenshot({ path: 'tests/e2e/exploration/screenshots/04-config-filled.png' });

  console.log('\n=== MENU EXPLORATION COMPLETE ===');
});
