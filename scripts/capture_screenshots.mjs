import { chromium } from 'playwright';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const screenshotsDir = path.resolve(__dirname, '../screenshots');

const viewports = [
  { width: 390, height: 844, name: '390x844' },
  { width: 768, height: 1024, name: '768x1024' },
  { width: 1440, height: 900, name: '1440x900' },
  { width: 1920, height: 1080, name: '1920x1080' },
];

async function run() {
  const browser = await chromium.launch({
    headless: true,
    executablePath: '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
  });
  const errors = [];

  for (const vp of viewports) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
    });
    const page = await context.newPage();

    page.on('console', (msg) => {
      if (msg.type() === 'error') {
        errors.push(`[${vp.name}] ${msg.text()}`);
      }
    });
    page.on('pageerror', (err) => {
      errors.push(`[${vp.name}] Page error: ${err.message}`);
    });

    // Default theme is dark
    await page.goto('http://100.81.175.22:5181', { waitUntil: 'networkidle' });

    // Wait for preloader to finish
    await page.waitForSelector('.preloader-overlay', { state: 'detached', timeout: 10000 });

    // Wait until model is loaded and at least 20 frames have rendered
    await page.waitForFunction(
      () =>
        typeof window.__FRAME_COUNT === 'number' &&
        window.__FRAME_COUNT > 20 &&
        typeof window.__IS_ACTIVE_SCENE_READY === 'function' &&
        window.__IS_ACTIVE_SCENE_READY() === true,
      { timeout: 15000 }
    );

    // Gently move pointer over hero to trigger interaction & fluid wake
    await page.mouse.move(vp.width * 0.45, vp.height * 0.45);
    await page.waitForTimeout(100);
    await page.mouse.move(vp.width * 0.55, vp.height * 0.55);
    await page.waitForTimeout(400);

    // 1. Dark mode - Hero top
    await page.screenshot({
      path: path.join(screenshotsDir, `hero_${vp.name}_dark.png`),
    });

    // 1b. Dark mode - Scrolled down to show glass tail continuing into Manifesto
    await page.evaluate(() => window.scrollTo(0, 260));
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(screenshotsDir, `tail_${vp.name}_dark.png`),
    });

    // Reset scroll to top
    await page.evaluate(() => window.scrollTo(0, 0));
    await page.waitForTimeout(200);

    // 2. Toggle to Light mode
    const toggleBtn = page.locator('.theme-toggle-btn');
    await toggleBtn.click();

    // Wait for theme switch and frames to render in light mode
    await page.waitForFunction(
      () => document.documentElement.getAttribute('data-theme') === 'light'
    );
    await page.waitForTimeout(600);

    // Gently move pointer over hero in light mode
    await page.mouse.move(vp.width * 0.48, vp.height * 0.48);
    await page.waitForTimeout(100);
    await page.mouse.move(vp.width * 0.52, vp.height * 0.52);
    await page.waitForTimeout(400);

    // Light mode - Hero top
    await page.screenshot({
      path: path.join(screenshotsDir, `hero_${vp.name}_light.png`),
    });

    // Light mode - Scrolled down to show glass tail continuing into Manifesto
    await page.evaluate(() => window.scrollTo(0, 260));
    await page.waitForTimeout(400);
    await page.screenshot({
      path: path.join(screenshotsDir, `tail_${vp.name}_light.png`),
    });

    await context.close();
  }

  // Also capture before/after hover comparison on 1440x900
  const comparePage = await browser.newPage({ viewport: { width: 1440, height: 900 } });
  await comparePage.goto('http://100.81.175.22:5181', { waitUntil: 'networkidle' });
  await comparePage.waitForSelector('.preloader-overlay', { state: 'detached', timeout: 10000 });
  await comparePage.waitForFunction(
    () =>
      typeof window.__FRAME_COUNT === 'number' &&
      window.__FRAME_COUNT > 20 &&
      typeof window.__IS_ACTIVE_SCENE_READY === 'function' &&
      window.__IS_ACTIVE_SCENE_READY() === true
  );

  // Before hover (dark)
  await comparePage.screenshot({ path: path.join(screenshotsDir, 'hover_before_dark.png') });
  // Move pointer over center bars
  for (let i = 0; i <= 20; i++) {
    await comparePage.mouse.move(600 + i * 10, 400 + i * 5);
    await comparePage.waitForTimeout(16);
  }
  await comparePage.waitForTimeout(50);
  // After hover (dark)
  await comparePage.screenshot({ path: path.join(screenshotsDir, 'hover_after_dark.png') });

  // Switch to light
  await comparePage.locator('.theme-toggle-btn').click();
  await comparePage.waitForTimeout(400);
  // Move pointer away and let fluid dissipate
  await comparePage.mouse.move(0, 0);
  await comparePage.waitForTimeout(2000);
  // Before hover (light)
  await comparePage.screenshot({ path: path.join(screenshotsDir, 'hover_before_light.png') });
  // Move pointer over center bars in light
  for (let i = 0; i <= 20; i++) {
    await comparePage.mouse.move(600 + i * 10, 400 + i * 5);
    await comparePage.waitForTimeout(16);
  }
  await comparePage.waitForTimeout(50);
  // After hover (light)
  await comparePage.screenshot({ path: path.join(screenshotsDir, 'hover_after_light.png') });

  await comparePage.close();
  await browser.close();

  if (errors.length > 0) {
    console.error('Console errors detected:', errors);
    process.exit(1);
  } else {
    console.log('All screenshots captured successfully with 0 console errors!');
  }
}

run().catch((err) => {
  console.error(err);
  process.exit(1);
});
