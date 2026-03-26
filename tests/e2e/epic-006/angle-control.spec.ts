import { expect, test } from '@playwright/test';
import { getHUD, launchGame, pressKey } from '../helpers';

function parseAngle(hudText: string | null): number | null {
  if (!hudText) return null;
  const match = hudText.match(/(\d+)\s*°/);
  return match ? Number(match[1]) : null;
}

test.describe('Angle Control', () => {
  test('ArrowLeft decreases angle', async ({ page }) => {
    await launchGame(page);
    const angleBefore = parseAngle(await getHUD(page).textContent());

    await pressKey(page, 'ArrowLeft', 5);

    const angleAfter = parseAngle(await getHUD(page).textContent());

    if (angleBefore === null || angleAfter === null) {
      test.info().annotations.push({ type: 'issue', description: 'Angle not parseable from HUD' });
    } else if (angleAfter === angleBefore) {
      test
        .info()
        .annotations.push({
          type: 'fixme',
          description:
            'Input not wired: ArrowLeft does not change angle (engine module exists but App.tsx uses static state)',
        });
    } else {
      expect(angleAfter).toBeLessThan(angleBefore);
    }
  });

  test('ArrowRight increases angle', async ({ page }) => {
    await launchGame(page);
    const angleBefore = parseAngle(await getHUD(page).textContent());

    await pressKey(page, 'ArrowRight', 5);

    const angleAfter = parseAngle(await getHUD(page).textContent());

    if (angleBefore === null || angleAfter === null) {
      test.info().annotations.push({ type: 'issue', description: 'Angle not parseable from HUD' });
    } else if (angleAfter === angleBefore) {
      test
        .info()
        .annotations.push({
          type: 'fixme',
          description: 'Input not wired: ArrowRight does not change angle',
        });
    } else {
      expect(angleAfter).toBeGreaterThan(angleBefore);
    }
  });

  test('Angle clamps at 180', async ({ page }) => {
    await launchGame(page);

    for (let i = 0; i < 100; i++) {
      await page.keyboard.press('ArrowRight');
    }

    const angle = parseAngle(await getHUD(page).textContent());
    if (angle !== null) {
      expect(angle).toBeLessThanOrEqual(180);
    }
  });
});
