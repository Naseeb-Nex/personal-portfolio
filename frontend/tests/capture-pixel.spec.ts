import { test, expect } from '@playwright/test';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const SCREENSHOT_DIR = path.resolve(__dirname, '../../screenshots/pixel');

test.describe('Pixel Companion Visual & Performance Verification', () => {

  test('3D mode - Desktop 1440x900 - Hero, About, Career (Dark & Light) & Performance', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/?pixel=3d');
    await page.waitForLoadState('networkidle');
    await page.locator('.preloader-overlay').waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const companion = page.locator('.pixel-companion-container');
    await expect(companion).toBeVisible();

    const canvas = page.locator('.pixel-3d-bot canvas');
    await expect(canvas).toBeVisible();

    // Measure FPS and frame time over 90 frames in real browser loop
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

    // Verify no overlap with phase labels or chat widget
    const companionBox = await companion.boundingBox();
    const chatWidget = page.locator('.chat-widget-loader');
    const chatBox = await chatWidget.boundingBox();

    if (companionBox && chatBox) {
      const overlapsChat = !(
        companionBox.x + companionBox.width < chatBox.x ||
        companionBox.x > chatBox.x + chatBox.width ||
        companionBox.y + companionBox.height < chatBox.y ||
        companionBox.y > chatBox.y + chatBox.height
      );
      expect(overlapsChat).toBeFalsy();
    }

    // 1. Hero Dark
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-desktop-1440x900-hero-dark.png') });
    // Legacy filename compatibility
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-desktop-1440x900-hero.png') });

    // 2. Hero Light
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-desktop-1440x900-hero-light.png') });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

    // 3. About Dark
    await page.evaluate(() => {
      document.querySelector('.about-me-section')?.scrollIntoView({ behavior: 'instant' });
      (window as unknown as { __pixelBrain?: { perchOnVisibleSection: () => void } }).__pixelBrain?.perchOnVisibleSection();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-desktop-1440x900-about-dark.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-desktop-1440x900-about.png') });

    // 4. About Light
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-desktop-1440x900-about-light.png') });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

    // 5. Career Dark
    await page.evaluate(() => {
      document.querySelector('.career-section')?.scrollIntoView({ behavior: 'instant' });
      (window as unknown as { __pixelBrain?: { perchOnVisibleSection: () => void } }).__pixelBrain?.perchOnVisibleSection();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-desktop-1440x900-career-dark.png') });

    // 6. Career Light
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-desktop-1440x900-career-light.png') });
  });

  test('2D mode - Desktop 1440x900 - Hero, About, Career (Dark & Light) (?pixel=2d)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/?pixel=2d');
    await page.waitForLoadState('networkidle');
    await page.locator('.preloader-overlay').waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const bot2D = page.locator('.pixel-2d-bot');
    await expect(bot2D).toBeVisible();
    const bot3D = page.locator('.pixel-3d-bot');
    await expect(bot3D).toHaveCount(0);

    // 1. Hero Dark & Light
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-desktop-1440x900-hero-dark.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-desktop-1440x900-hero.png') });

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-desktop-1440x900-hero-light.png') });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

    // 2. About Dark & Light
    await page.evaluate(() => {
      document.querySelector('.about-me-section')?.scrollIntoView({ behavior: 'instant' });
      (window as unknown as { __pixelBrain?: { perchOnVisibleSection: () => void } }).__pixelBrain?.perchOnVisibleSection();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-desktop-1440x900-about-dark.png') });

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-desktop-1440x900-about-light.png') });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

    // 3. Career Dark & Light
    await page.evaluate(() => {
      document.querySelector('.career-section')?.scrollIntoView({ behavior: 'instant' });
      (window as unknown as { __pixelBrain?: { perchOnVisibleSection: () => void } }).__pixelBrain?.perchOnVisibleSection();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-desktop-1440x900-career-dark.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-desktop-1440x900-career.png') });

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-desktop-1440x900-career-light.png') });
  });

  test('2D mode - Mobile 390x844 - Hero, About, Career (Dark & Light)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.locator('.preloader-overlay').waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const bot2D = page.locator('.pixel-2d-bot');
    await expect(bot2D).toBeVisible();

    // 1. Mobile Hero Dark & Light
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-mobile-390x844-hero-dark.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-mobile-390x844-hero.png') });

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-mobile-390x844-hero-light.png') });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

    // 2. Mobile About Dark & Light
    await page.evaluate(() => {
      document.querySelector('.about-me-section')?.scrollIntoView({ behavior: 'instant' });
      (window as unknown as { __pixelBrain?: { perchOnVisibleSection: () => void } }).__pixelBrain?.perchOnVisibleSection();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-mobile-390x844-about-dark.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-mobile-390x844-about.png') });

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-mobile-390x844-about-light.png') });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

    // 3. Mobile Career Dark & Light
    await page.evaluate(() => {
      document.querySelector('.career-section')?.scrollIntoView({ behavior: 'instant' });
      (window as unknown as { __pixelBrain?: { perchOnVisibleSection: () => void } }).__pixelBrain?.perchOnVisibleSection();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-mobile-390x844-career-dark.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-mobile-390x844-career.png') });

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '2d-mobile-390x844-career-light.png') });
  });

  test('3D mode - Mobile 390x844 - Hero, About, Career (Dark & Light) (?pixel=3d)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('http://localhost:5173/?pixel=3d');
    await page.waitForLoadState('networkidle');
    await page.locator('.preloader-overlay').waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(2000);

    const bot3D = page.locator('.pixel-3d-bot');
    await expect(bot3D).toBeVisible();

    // 1. Mobile 3D Hero Dark & Light
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-mobile-390x844-hero-dark.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-mobile-390x844-hero.png') });

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-mobile-390x844-hero-light.png') });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

    // 2. Mobile 3D About Dark & Light
    await page.evaluate(() => {
      document.querySelector('.about-me-section')?.scrollIntoView({ behavior: 'instant' });
      (window as unknown as { __pixelBrain?: { perchOnVisibleSection: () => void } }).__pixelBrain?.perchOnVisibleSection();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-mobile-390x844-about-dark.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-mobile-390x844-about.png') });

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-mobile-390x844-about-light.png') });
    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'dark'));

    // 3. Mobile 3D Career Dark & Light
    await page.evaluate(() => {
      document.querySelector('.career-section')?.scrollIntoView({ behavior: 'instant' });
      (window as unknown as { __pixelBrain?: { perchOnVisibleSection: () => void } }).__pixelBrain?.perchOnVisibleSection();
    });
    await page.waitForTimeout(2000);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-mobile-390x844-career-dark.png') });
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-mobile-390x844-career.png') });

    await page.evaluate(() => document.documentElement.setAttribute('data-theme', 'light'));
    await page.waitForTimeout(400);
    await page.screenshot({ path: path.join(SCREENSHOT_DIR, '3d-mobile-390x844-career-light.png') });
  });

  test('Reduced motion - Desktop 1440x900 (prefers-reduced-motion: reduce)', async ({ page }) => {
    await page.emulateMedia({ reducedMotion: 'reduce' });
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.locator('.preloader-overlay').waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);

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
    await page.locator('.preloader-overlay').waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const hitbox = page.locator('.pixel-companion-hitbox');
    await hitbox.click();
    await page.waitForTimeout(500);

    const bubble = page.locator('.pixel-speech-bubble');
    await expect(bubble).toBeVisible();
    const text = await bubble.textContent();
    expect(text).toBeTruthy();

    await page.screenshot({
      path: path.join(SCREENSHOT_DIR, 'click-reaction-bubble.png'),
    });
  });

  test('Auto-switch verification: low-power device selection', async ({ page }) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'deviceMemory', { get: () => 2 });
      Object.defineProperty(navigator, 'hardwareConcurrency', { get: () => 2 });
    });

    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('http://localhost:5173/');
    await page.waitForLoadState('networkidle');
    await page.locator('.preloader-overlay').waitFor({ state: 'detached', timeout: 8000 }).catch(() => {});
    await page.waitForTimeout(1500);

    const bot2D = page.locator('.pixel-2d-bot');
    await expect(bot2D).toBeVisible();
    const bot3D = page.locator('.pixel-3d-bot');
    await expect(bot3D).toHaveCount(0);
  });
});
