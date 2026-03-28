import { expect, test } from '@playwright/test';

test('VALIDATION: Full gameplay after firing fix', async ({ page }) => {
  test.setTimeout(120_000);

  const errors: string[] = [];
  page.on('pageerror', (e) => errors.push(e.message));

  await page.goto('/');
  await page.waitForTimeout(1000);

  // Start game
  await page.locator('[data-testid="btn-start"]').click();
  await page.waitForTimeout(300);
  await page.locator('[data-testid="start-game-btn"]').click();
  await page.waitForTimeout(2000);

  const canvas = page.locator('[data-testid="game-canvas"]');
  await canvas.focus();

  const getStatus = async (): Promise<string> => {
    const bar = page.locator('[data-testid="status-bar"]');
    if (await bar.isVisible({ timeout: 500 }).catch(() => false)) {
      return await bar.textContent({ timeout: 1000 }).catch(() => 'status-bar-hidden') ?? '';
    }
    return 'status-bar-hidden';
  };

  const handleShop = async (): Promise<boolean> => {
    const shopBtn = page.locator('[data-testid="shop-ready-btn"]');
    if (await shopBtn.isVisible({ timeout: 500 }).catch(() => false)) {
      await shopBtn.click();
      await page.waitForTimeout(500);
      return true;
    }
    return false;
  };

  const waitForTurnPhase = async (maxWait: number): Promise<string> => {
    const start = Date.now();
    while (Date.now() - start < maxWait) {
      await handleShop();
      const status = await getStatus();
      if (status.includes('AIM') || status.includes('VICTORY')) return status;
      if (status === 'status-bar-hidden') {
        // Check for victory or results screen
        const victory = page.locator('[data-testid="victory-screen"]');
        const results = page.locator('[data-testid="results-screen"]');
        if (await victory.isVisible({ timeout: 200 }).catch(() => false)) return 'VICTORY';
        if (await results.isVisible({ timeout: 200 }).catch(() => false)) return 'RESULTS';
      }
      await page.waitForTimeout(300);
    }
    return await getStatus();
  };

  console.log('=== GAME STARTED ===');
  console.log('Initial status:', await getStatus());

  // Take initial screenshot
  await page.screenshot({ path: 'tests/e2e/exploration/screenshots/v01-game-start.png' });

  // === TEST CONTROLS ===
  console.log('\n--- CONTROLS ---');

  // Angle
  await canvas.press('ArrowLeft');
  await canvas.press('ArrowLeft');
  await canvas.press('ArrowLeft');
  let hud = await page.locator('[data-testid="game-hud"]').textContent() ?? '';
  console.log('After 3x ArrowLeft, HUD contains angle:', hud.match(/(\d+)\u00B0/)?.[1] ?? 'N/A');

  // Power
  await canvas.press('ArrowUp');
  await canvas.press('ArrowUp');
  hud = await page.locator('[data-testid="game-hud"]').textContent() ?? '';
  console.log('After 2x ArrowUp, HUD contains power:', hud.match(/(\d+)%/)?.[1] ?? 'N/A');

  // Weapon toggle
  const toggle = page.locator('[data-testid="weapon-toggle"]');
  if (await toggle.isVisible().catch(() => false)) {
    await toggle.click();
    await page.waitForTimeout(300);
    const picker = page.locator('[data-testid="weapon-picker"]');
    console.log('Weapon picker opened:', await picker.isVisible().catch(() => false));
    await toggle.click(); // close
    await page.waitForTimeout(200);
  }

  // Tab cycling
  await canvas.focus();
  await canvas.press('Tab');
  await page.waitForTimeout(100);
  console.log('Tab cycling works (no crash)');

  // === FIRE ROUND 1 ===
  console.log('\n--- ROUND 1 ---');
  await canvas.press('Space');
  console.log('Fired! Status:', await getStatus());
  await page.screenshot({ path: 'tests/e2e/exploration/screenshots/v02-firing.png' });

  // Wait for resolution
  let status = await waitForTurnPhase(15000);
  console.log('After resolution:', status);
  await page.screenshot({ path: 'tests/e2e/exploration/screenshots/v03-after-fire.png' });

  if (status.includes('VICTORY') || status === 'RESULTS') {
    console.log('Game ended after turn 1!');
  } else {
    // === FIRE ROUNDS 2-5 ===
    for (let round = 2; round <= 8; round++) {
      // Wait for our turn
      status = await waitForTurnPhase(10000);
      if (status.includes('VICTORY') || status === 'RESULTS') {
        console.log(`Game ended at round ${round}`);
        break;
      }

      console.log(`\n--- TURN ${round} ---`);
      console.log('Status:', status);

      // Aim toward center and fire
      await canvas.focus();
      await canvas.press('ArrowRight');
      await canvas.press('ArrowRight');
      await canvas.press('Space');

      // Wait for this turn to resolve
      status = await waitForTurnPhase(10000);
      console.log(`Resolution: ${status}`);

      if (round === 3) {
        await page.screenshot({ path: 'tests/e2e/exploration/screenshots/v04-mid-game.png' });
      }
    }
  }

  // === CHECK FOR VICTORY ===
  const victoryScreen = page.locator('[data-testid="victory-screen"]');
  const resultsScreen = page.locator('[data-testid="results-screen"]');

  if (await victoryScreen.isVisible({ timeout: 2000 }).catch(() => false)) {
    console.log('\n=== VICTORY SCREEN ===');
    const winnerText = await victoryScreen.textContent();
    console.log('Victory text:', winnerText?.substring(0, 100));
    await page.screenshot({ path: 'tests/e2e/exploration/screenshots/v05-victory.png' });

    // Test buttons
    const playAgain = page.locator('[data-testid="btn-play-again"]');
    const mainMenu = page.locator('[data-testid="btn-main-menu"]');
    console.log('Play Again visible:', await playAgain.isVisible().catch(() => false));
    console.log('Main Menu visible:', await mainMenu.isVisible().catch(() => false));

    // Click Play Again
    if (await playAgain.isVisible().catch(() => false)) {
      await playAgain.click();
      await page.waitForTimeout(1000);
      const configVisible = await page.locator('[data-testid="config-screen"]').isVisible().catch(() => false);
      console.log('Returned to config:', configVisible);
    }
  }

  // === PAUSE TEST ===
  // Start another game to test pause
  if (await page.locator('[data-testid="config-screen"]').isVisible().catch(() => false)) {
    await page.locator('[data-testid="start-game-btn"]').click();
    await page.waitForTimeout(2000);
    await canvas.focus();

    await canvas.press('Escape');
    await page.waitForTimeout(500);
    const pauseVisible = await page.locator('[data-testid="pause-overlay"]').isVisible().catch(() => false);
    console.log('\nPause overlay:', pauseVisible);

    if (pauseVisible) {
      await page.screenshot({ path: 'tests/e2e/exploration/screenshots/v06-paused.png' });
      await page.locator('[data-testid="resume-btn"]').click();
      await page.waitForTimeout(500);
      console.log('Resumed:', !(await page.locator('[data-testid="pause-overlay"]').isVisible().catch(() => false)));
    }
  }

  // === ERROR CHECK ===
  console.log('\n=== ERRORS ===');
  console.log(`Total page errors: ${errors.length}`);
  for (const e of errors) console.log('  ERROR:', e);

  console.log('\n=== VALIDATION COMPLETE ===');
  expect(errors.length).toBe(0);
});
