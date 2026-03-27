import { expect, test } from '@playwright/test';

test.describe('Epic 054: Config Options', () => {
  test('Config screen options work correctly', async ({ page }) => {
    test.setTimeout(30_000);

    // 1. Navigate to / and click through to config
    await page.goto('/');
    await page.waitForTimeout(500);

    const mainMenu = page.locator('[data-testid="main-menu"]');
    await expect(mainMenu).toBeVisible({ timeout: 5_000 });

    const btnStart = page.locator('[data-testid="btn-start"]');
    await btnStart.click();

    const configScreen = page.locator('[data-testid="config-screen"]');
    await expect(configScreen).toBeVisible({ timeout: 5_000 });

    // 2. Change theme dropdown to "desert"
    const themeSelect = page.locator('[data-testid="theme-select"]');
    await expect(themeSelect).toBeVisible();
    await themeSelect.selectOption('desert');

    const selectedTheme = await themeSelect.inputValue();
    expect(selectedTheme).toBe('desert');

    // 3. Change rounds input to 3
    const roundsInput = page.locator('[data-testid="rounds-input"]');
    await expect(roundsInput).toBeVisible();
    await roundsInput.fill('3');

    const selectedRounds = await roundsInput.inputValue();
    expect(selectedRounds).toBe('3');

    // 4. Count initial player name inputs
    const initialPlayerInputs = page.locator('[data-testid^="player-name-"]');
    const initialCount = await initialPlayerInputs.count();

    test.info().annotations.push({
      type: 'note',
      description: `Initial player count: ${initialCount}`,
    });

    // 5. Add a player
    const addPlayerBtn = page.locator('[data-testid="add-player-btn"]');
    await expect(addPlayerBtn).toBeVisible();
    await addPlayerBtn.click();
    await page.waitForTimeout(300);

    // 6. Verify player count increased by 1
    const updatedPlayerInputs = page.locator('[data-testid^="player-name-"]');
    const updatedCount = await updatedPlayerInputs.count();
    expect(updatedCount).toBe(initialCount + 1);

    test.info().annotations.push({
      type: 'note',
      description: `Player count after adding: ${updatedCount}`,
    });

    // 7. Click START GAME
    const startGameBtn = page.locator('[data-testid="start-game-btn"]');
    await expect(startGameBtn).toBeVisible();
    await startGameBtn.click();

    // 8. Verify game starts with HUD visible
    const hud = page.locator('[data-testid="game-hud"]');
    await expect(hud).toBeVisible({ timeout: 5_000 });

    // Verify canvas is rendering
    const canvas = page.locator('[data-testid="game-canvas"]');
    await expect(canvas).toBeVisible();
  });
});
