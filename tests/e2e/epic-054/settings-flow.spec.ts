import { expect, test } from '@playwright/test';

test.describe('Epic 054: Settings Flow', () => {
  test('Settings screen is accessible and navigable', async ({ page }) => {
    // 1. Navigate to /
    await page.goto('/');
    await page.waitForTimeout(500);

    // 2. Verify main menu is visible
    const mainMenu = page.locator('[data-testid="main-menu"]');
    await expect(mainMenu).toBeVisible({ timeout: 5_000 });

    // 3. Click Settings button in main menu
    const settingsBtn = page.locator('[data-testid="btn-settings"]');
    await expect(settingsBtn).toBeVisible();
    await settingsBtn.click();

    // 4. Verify settings screen appears
    const settingsScreen = page.locator('[data-testid="settings-screen"]');
    await expect(settingsScreen).toBeVisible({ timeout: 3_000 });

    // 5. Change a slider value (volume slider)
    const volumeSlider = page.locator('[data-testid="volume-slider"]');
    await expect(volumeSlider).toBeVisible();

    // Get current value, then change it
    const currentValue = await volumeSlider.inputValue();
    const newValue = currentValue === '50' ? '75' : '50';
    await volumeSlider.fill(newValue);

    const updatedValue = await volumeSlider.inputValue();
    expect(updatedValue).toBe(newValue);

    test.info().annotations.push({
      type: 'note',
      description: `Volume slider changed from ${currentValue} to ${updatedValue}`,
    });

    // Also verify SFX slider exists
    const sfxSlider = page.locator('[data-testid="sfx-slider"]');
    await expect(sfxSlider).toBeVisible();

    // Verify toggles exist
    const damageToggle = page.locator('[data-testid="damage-numbers-toggle"]');
    await expect(damageToggle).toBeVisible();

    // 6. Click Back button
    const backBtn = page.locator('[data-testid="btn-back"]');
    await expect(backBtn).toBeVisible();
    await backBtn.click();

    // 7. Verify main menu appears again
    await expect(mainMenu).toBeVisible({ timeout: 3_000 });
  });
});
