import { chromium } from '@playwright/test';
import fs from 'fs';

async function main() {
  const executablePath = '/Users/aiwithnex/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
  const browser = await chromium.launch({ executablePath, args: ['--use-gl=angle'] });
  const consoleMessages = [];

  // Desktop context
  const desktopContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const page = await desktopContext.newPage();

  page.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  page.on('pageerror', err => {
    consoleMessages.push({ type: 'pageerror', text: err.toString() });
  });

  console.log('Navigating to http://localhost:5321/ (desktop)...');
  await page.goto('http://localhost:5321/', { waitUntil: 'networkidle' });
  await page.waitForTimeout(2000);

  // 1. Desktop Dark
  await page.screenshot({ path: '/tmp/hero-shots/desktop-dark-1440x900.png' });
  console.log('Saved desktop-dark-1440x900.png');

  // 2. Desktop Light
  const toggleBtn = page.locator('.theme-toggle-btn');
  await toggleBtn.click();
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/hero-shots/desktop-light-1440x900.png' });
  console.log('Saved desktop-light-1440x900.png');

  // Toggle back to dark
  await toggleBtn.click();
  await page.waitForTimeout(800);

  // 3. Animation frames over a few seconds (desktop close-up or full hero)
  console.log('Capturing animation frames...');
  await page.screenshot({ path: '/tmp/hero-shots/anim-frame-1.png' });
  await page.waitForTimeout(1000);
  await page.screenshot({ path: '/tmp/hero-shots/anim-frame-2.png' });
  await page.waitForTimeout(1200);
  await page.screenshot({ path: '/tmp/hero-shots/anim-frame-3.png' });
  console.log('Saved animation frames 1, 2, 3');

  await desktopContext.close();

  // Mobile context
  const mobileContext = await browser.newContext({
    viewport: { width: 390, height: 844 },
    isMobile: true,
  });
  const mobilePage = await mobileContext.newPage();

  mobilePage.on('console', msg => {
    consoleMessages.push({ type: msg.type(), text: msg.text() });
  });

  console.log('Navigating to http://localhost:5321/ (mobile)...');
  await mobilePage.goto('http://localhost:5321/', { waitUntil: 'networkidle' });
  await mobilePage.waitForTimeout(2000);

  // 4. Mobile Dark
  await mobilePage.screenshot({ path: '/tmp/hero-shots/mobile-dark-390x844.png' });
  console.log('Saved mobile-dark-390x844.png');

  // 5. Mobile Light
  const mobileToggle = mobilePage.locator('.theme-toggle-btn');
  await mobileToggle.click();
  await mobilePage.waitForTimeout(1000);
  await mobilePage.screenshot({ path: '/tmp/hero-shots/mobile-light-390x844.png' });
  console.log('Saved mobile-light-390x844.png');

  await mobileContext.close();
  await browser.close();

  fs.writeFileSync('/tmp/hero-shots/console-errors.json', JSON.stringify(consoleMessages, null, 2));
  console.log('Screenshots complete. Captured', consoleMessages.length, 'console messages.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
