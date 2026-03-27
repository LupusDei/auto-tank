import { canvasHasContent, launchGame } from '../helpers';
import { expect, test } from '@playwright/test';

test.describe('Epic 048: Terrain & Water Rendering', () => {
  test('Canvas renders terrain with content', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);

    const hasContent = await canvasHasContent(page);

    if (!hasContent) {
      test.info().annotations.push({
        type: 'note',
        description: 'Canvas has no non-transparent pixels. Terrain rendering may not be wired.',
      });
    }

    expect(hasContent, 'canvas should have rendered terrain content').toBe(true);

    // Take screenshot for visual verification
    await page.screenshot({ path: 'tests/e2e/screenshots/epic-048-terrain.png' });
  });

  test('Game renders without console errors', async ({ page }) => {
    test.setTimeout(30_000);

    const consoleErrors: string[] = [];
    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        consoleErrors.push(msg.text());
      }
    });

    await launchGame(page);

    // Wait for rendering to stabilize
    await page.waitForTimeout(2_000);

    // Filter out non-critical errors (e.g., favicon, dev server noise)
    const criticalErrors = consoleErrors.filter(
      (err) =>
        !err.includes('favicon') &&
        !err.includes('404') &&
        !err.includes('DevTools') &&
        !err.includes('net::ERR'),
    );

    if (criticalErrors.length > 0) {
      test.info().annotations.push({
        type: 'note',
        description: `Console errors found: ${criticalErrors.join(' | ')}`,
      });
    }

    expect(criticalErrors, 'no critical console errors during rendering').toHaveLength(0);
  });
});
