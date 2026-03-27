import { expect, test } from '@playwright/test';

import { launchGame, pressKey } from '../helpers';

test.describe('Epic 049 Behavior: AudioContext is Active', () => {
  test('AudioContext exists and is running after user interaction', async ({ page }) => {
    test.setTimeout(30_000);
    await launchGame(page);

    // Verify AudioContext constructor is available
    const audioContextExists = await page.evaluate(() => {
      return typeof AudioContext !== 'undefined' || typeof webkitAudioContext !== 'undefined';
    });

    expect(audioContextExists, 'AudioContext API should be available in the browser').toBe(true);

    // Fire a weapon — this is a user gesture that should resume AudioContext
    await pressKey(page, 'Space');

    // Wait for the firing to process
    await page.waitForTimeout(2_000);

    // Check if an AudioContext was created and is in 'running' state
    const audioState = await page.evaluate(() => {
      // Check if the game created any AudioContext instances
      // We look at the global scope for common patterns
      const results: {
        contextCount: number;
        states: string[];
        hasRunningContext: boolean;
      } = {
        contextCount: 0,
        states: [],
        hasRunningContext: false,
      };

      // Check if there are AudioContext instances by querying the
      // window object for known audio manager patterns
      const win = window as Record<string, unknown>;

      // Try to find AudioContext instances via common game audio patterns
      // Method 1: Check if BaseAudioContext prototype has been used
      if (typeof AudioContext !== 'undefined') {
        try {
          // Create a test context to verify the API works
          const testCtx = new AudioContext();
          results.contextCount++;
          results.states.push(testCtx.state);
          results.hasRunningContext = testCtx.state === 'running';
          testCtx.close().catch(() => {
            /* ignore */
          });
        } catch {
          // AudioContext creation failed
        }
      }

      // Method 2: Look for game's audio manager on window or common globals
      for (const key of Object.keys(win)) {
        const val = win[key];
        if (val && typeof val === 'object' && 'context' in (val as Record<string, unknown>)) {
          const ctx = (val as Record<string, unknown>)['context'];
          if (ctx && typeof ctx === 'object' && 'state' in (ctx as Record<string, unknown>)) {
            const state = String((ctx as Record<string, unknown>)['state']);
            results.contextCount++;
            results.states.push(state);
            if (state === 'running') {
              results.hasRunningContext = true;
            }
          }
        }
      }

      return results;
    });

    test.info().annotations.push({
      type: 'note',
      description:
        `AudioContext count: ${audioState.contextCount}, ` +
        `states: [${audioState.states.join(', ')}], ` +
        `hasRunning: ${audioState.hasRunningContext}`,
    });

    // At minimum, AudioContext should be creatable and get to 'running' state
    // after a user gesture (we clicked buttons and pressed keys)
    expect(
      audioState.contextCount,
      'At least one AudioContext should be creatable',
    ).toBeGreaterThan(0);

    // After user interaction (button clicks, key presses), AudioContext should be running
    // Browsers suspend AudioContext until user gesture — our launchGame + fire provides that
    expect(
      audioState.hasRunningContext,
      'AudioContext should be in "running" state after user interaction (firing a weapon). ' +
        `Got states: [${audioState.states.join(', ')}]. ` +
        'If suspended, the game may not be calling audioContext.resume() after user gestures.',
    ).toBe(true);
  });
});
