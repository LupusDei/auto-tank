import type { Locator, Page } from '@playwright/test';

/** Navigate to the game and wait for canvas to render. */
export async function launchGame(page: Page): Promise<void> {
  await page.goto('/');
  await page.locator('[data-testid="game-canvas"]').waitFor({ state: 'visible' });
  await page.waitForTimeout(200); // Allow first render
}

/** Get the game canvas locator. */
export function getCanvas(page: Page): Locator {
  return page.locator('[data-testid="game-canvas"]');
}

/** Get the HUD locator. */
export function getHUD(page: Page): Locator {
  return page.locator('[data-testid="game-hud"]');
}

/** Simulate a keyboard press on the page. */
export async function pressKey(page: Page, key: string, times = 1): Promise<void> {
  for (let i = 0; i < times; i++) {
    await page.keyboard.press(key);
    await page.waitForTimeout(50);
  }
}

/** Click at a specific position on the canvas. */
export async function clickCanvas(page: Page, x: number, y: number): Promise<void> {
  const canvas = getCanvas(page);
  await canvas.click({ position: { x, y } });
}

/** Check if canvas has rendered non-transparent pixels. */
export async function canvasHasContent(page: Page): Promise<boolean> {
  return page.evaluate(() => {
    const canvas = document.querySelector(
      '[data-testid="game-canvas"]',
    ) as HTMLCanvasElement | null;
    if (!canvas) return false;
    const ctx = canvas.getContext('2d');
    if (!ctx) return false;
    const data = ctx.getImageData(0, 0, canvas.width, canvas.height).data;
    for (let i = 0; i < data.length; i += 4) {
      if ((data[i] ?? 0) > 0 || (data[i + 1] ?? 0) > 0 || (data[i + 2] ?? 0) > 0) {
        return true;
      }
    }
    return false;
  });
}

/** Wait for a data-testid element to appear. */
export async function waitForTestId(page: Page, testId: string, timeout = 5000): Promise<Locator> {
  const locator = page.locator(`[data-testid="${testId}"]`);
  await locator.waitFor({ state: 'visible', timeout });
  return locator;
}

/** Take a screenshot of a specific element. */
export async function screenshotElement(page: Page, testId: string, name: string): Promise<void> {
  const element = page.locator(`[data-testid="${testId}"]`);
  await element.screenshot({ path: `tests/e2e/screenshots/${name}.png` });
}

/** Get text content of a data-testid element. */
export async function getTestIdText(page: Page, testId: string): Promise<string> {
  const el = page.locator(`[data-testid="${testId}"]`);
  return (await el.textContent()) ?? '';
}
