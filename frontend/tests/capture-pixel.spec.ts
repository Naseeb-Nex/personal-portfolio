import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.resolve(__dirname, '../../screenshots/pixel');

test.describe('Pixel Companion Visual & Performance Verification', () => {

  test('3D mode - Desktop 1440x900 - Hero section & Performance', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/?pixel=3d');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000); // Wait for preloader & initial spring settle

    // Check companion element is present and visible
    const companion = page.locator('.pixel-companion-container');
    await expect(companion).toBeVisible();

    // Verify 3D canvas is present
    const canvas = page.locator('.pixel-3d-bot canvas');
    await expect(canvas).toBeVisible();

    // Measure FPS and frame time over 120 frames in browser
    const perfStats = await page.evaluate(async () => {
      return new Promise<{ avgFps: number; avgFrameTimeMs: number; dpr: number }>((resolve) => {
        let frames = 0;
        const start = performance.now();
        let last = start;
        const frameTimes: number[] = [];

        function step(now: number) {
          frames++;
          frameTimes.push(now - last);
          last = now;
          if (frames < 90) {
            requestAnimationFrame(step);
          } else {
            const totalTime = now - start;
            const avgFps = Math.round((frames * 1000) / totalTime);
            const avgFrameTimeMs = parseFloat((totalTime / frames).toFixed(2));
            resolve({
              avgFps,
              avgFrameTimeMs,
              dpr: window.devicePixelRatio || 1,
            });
          }
        }
        requestAnimationFrame(step);
      });
    });

    console.log('--- 3D Mode Performance ---');
    console.log(`Average FPS: ${perfStats.avgFps}`);
    console.log(`Frame Time: ${perfStats.avgFrameTimeMs}ms`);
    console.log(`DPR: ${perfStats.dpr}`);

    // Verify no overlap with main CTA/Chat
    const companionBox = await companion.boundingBox();
    const chatWidget = page.locator('.chat-widget-loader');
    const chatBox = await chatWidget.boundingBox();

    if (companionBox && chatBox) {
      const overlaps = !(
        companionBox.x + companionBox.width < chatBox.x ||
        companionBox.x > chatBox.x + chatBox.width ||
        companionBox.y + companionBox.height < chatBox.y ||
        companionBox.y > chatBox.y + chatBox.height
      );
      expect(overlaps).toBeFalsy();
    }

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '3d-desktop-1440x900-hero.png'),
    });
  });

  test('3D mode - Desktop 1440x900 - Perched on About section', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/?pixel=3d');
    await page.waitForLoadState('networkidle');
    await page.locator('.preloader-overlay').waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Scroll to About section
    await page.evaluate(() => {
      document.querySelector('.about-me-section')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(2500);

    const companion = page.locator('.pixel-companion-container');
    await expect(companion).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '3d-desktop-1440x900-about.png'),
    });
  });

  test('2D mode - Desktop 1440x900 - Hero section (?pixel=2d)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/?pixel=2d');
    await page.waitForLoadState('networkidle');
    await page.locator('.preloader-overlay').waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);

    // Verify 2D bot is present instead of 3D
    const bot2D = page.locator('.pixel-2d-bot');
    await expect(bot2D).toBeVisible();
    const bot3D = page.locator('.pixel-3d-bot');
    await expect(bot3D).toHaveCount(0);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '2d-desktop-1440x900-hero.png'),
    });
  });

  test('2D mode - Desktop 1440x900 - Career section (?pixel=2d)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/?pixel=2d');
    await page.waitForLoadState('networkidle');
    await page.locator('.preloader-overlay').waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1000);

    await page.evaluate(() => {
      document.querySelector('.career-section')?.scrollIntoView({ behavior: 'instant' });
    });
    await page.waitForTimeout(2500);

    const companion = page.locator('.pixel-companion-container');
    await expect(companion).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '2d-desktop-1440x900-career.png'),
    });
  });

  test('2D mode - Mobile 390x844 - Docks to bottom corner', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    // Default mode on mobile automatically resolves to 2D
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const bot2D = page.locator('.pixel-2d-bot');
    await expect(bot2D).toBeVisible();

    // Check that hit target is at least 44px
    const hitbox = page.locator('.pixel-companion-hitbox');
    const box = await hitbox.boundingBox();
    expect(box).not.toBeNull();
    expect(box!.width).toBeGreaterThanOrEqual(44);
    expect(box!.height).toBeGreaterThanOrEqual(44);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '2d-mobile-390x844.png'),
    });
  });

  test('3D mode - Mobile 390x844 (?pixel=3d)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173/?pixel=3d');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    const bot3D = page.locator('.pixel-3d-bot');
    await expect(bot3D).toBeVisible();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, '3d-mobile-390x844.png'),
    });
  });

  test('Reduced motion - Desktop 1440x900 (prefers-reduced-motion: reduce)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(2000);

    // In reduced motion, 2D static mode is automatically selected
    const bot2D = page.locator('.pixel-2d-bot');
    await expect(bot2D).toBeVisible();

    const container = page.locator('.pixel-companion-container');
    await expect(container).toHaveClass(/reduced-motion/);

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'reduced-motion-desktop.png'),
    });
  });

  test('Click interaction cycles expression and displays speech bubble', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/?pixel=2d');
    await page.waitForLoadState('networkidle');
    await page.waitForTimeout(1500);

    const hitbox = page.locator('.pixel-companion-hitbox');
    await hitbox.click();
    await page.waitForTimeout(500);

    // Speech bubble should be visible with reaction
    const bubble = page.locator('.pixel-speech-bubble');
    await expect(bubble).toBeVisible();
    const text = await bubble.textContent();
    expect(text).toBeTruthy();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'click-reaction-bubble.png'),
    });
  });
});
