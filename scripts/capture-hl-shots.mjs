import { chromium } from '@playwright/test';
import fs from 'fs';

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080, mobile: false },
  { name: '1440x900', width: 1440, height: 900, mobile: false },
  { name: '1280x720', width: 1280, height: 720, mobile: false },
  { name: '650x720', width: 650, height: 720, mobile: false },
  { name: '390x844', width: 390, height: 844, mobile: true },
];

async function run() {
  const executablePath =
    '/Users/aiwithnex/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
  const browser = await chromium.launch({ executablePath, args: ['--use-gl=angle'] });

  const metrics = [];

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.mobile,
    });
    const page = await context.newPage();

    await page.goto('http://localhost:5341/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);

    // Dark mode shot & inspection
    const darkInfo = await page.evaluate(() => {
      const h1 = document.querySelector('h1.hero-heading');
      const accent = document.querySelector('.hero-heading-accent');
      const sub = document.querySelector('.hero-subheading');
      const chat = document.querySelector('.chat-input-wrapper') || document.querySelector('.chat-widget');
      const robot = document.querySelector('.hero-robot-wrapper');

      const h1Rect = h1?.getBoundingClientRect();
      const accentRect = accent?.getBoundingClientRect();
      const subRect = sub?.getBoundingClientRect();
      const chatRect = chat?.getBoundingClientRect();
      const robotRect = robot?.getBoundingClientRect();

      // Check text content and inner lines
      const computed = window.getComputedStyle(h1);
      return {
        h1: {
          text: h1?.innerText,
          fontSize: computed.fontSize,
          lineHeight: computed.lineHeight,
          rect: h1Rect,
        },
        accent: {
          text: accent?.innerText,
          rect: accentRect,
        },
        sub: {
          rect: subRect,
        },
        chat: {
          rect: chatRect,
        },
        robot: {
          rect: robotRect,
        },
      };
    });

    const darkPath = `/tmp/hl-shots/${vp.name}-dark.png`;
    await page.screenshot({ path: darkPath, fullPage: false });
    console.log(`Saved ${darkPath}`, JSON.stringify(darkInfo.h1));

    // Light mode
    const toggleBtn = page.locator('.theme-toggle-btn');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(600);
      const lightPath = `/tmp/hl-shots/${vp.name}-light.png`;
      await page.screenshot({ path: lightPath, fullPage: false });
      console.log(`Saved ${lightPath}`);
    }

    metrics.push({ vp: vp.name, darkInfo });
    await context.close();
  }

  await browser.close();
  console.log('Screenshots complete.');
}

run().catch(err => {
  console.error(err);
  process.exit(1);
});
