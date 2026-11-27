import { chromium } from '@playwright/test';
import fs from 'fs';

const VIEWPORTS = [
  { name: '1920x1080', width: 1920, height: 1080, mobile: false },
  { name: '1440x900', width: 1440, height: 900, mobile: false },
  { name: '1280x720', width: 1280, height: 720, mobile: false },
  { name: '650x720', width: 650, height: 720, mobile: false },
  { name: '390x844', width: 390, height: 844, mobile: true },
];

async function main() {
  const executablePath =
    '/Users/aiwithnex/Library/Caches/ms-playwright/chromium-1243/chrome-mac-arm64/Google Chrome for Testing.app/Contents/MacOS/Google Chrome for Testing';
  const browser = await chromium.launch({ executablePath, args: ['--use-gl=angle'] });
  const consoleMessages = [];

  fs.mkdirSync('/tmp/hero-shots', { recursive: true });

  for (const vp of VIEWPORTS) {
    const context = await browser.newContext({
      viewport: { width: vp.width, height: vp.height },
      isMobile: vp.mobile,
    });
    const page = await context.newPage();

    page.on('console', msg => {
      consoleMessages.push({ viewport: vp.name, type: msg.type(), text: msg.text() });
    });

    console.log(`Capturing ${vp.name}...`);
    await page.goto('http://localhost:5321/', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Dark
    const darkPath = `/tmp/hero-shots/desktop-dark-${vp.name}.png`;
    await page.screenshot({ path: darkPath });
    console.log(`Saved ${darkPath}`);

    // Light
    const toggleBtn = page.locator('.theme-toggle-btn');
    if (await toggleBtn.isVisible()) {
      await toggleBtn.click();
      await page.waitForTimeout(1000);
      const lightPath = `/tmp/hero-shots/desktop-light-${vp.name}.png`;
      await page.screenshot({ path: lightPath });
      console.log(`Saved ${lightPath}`);
    }

    await context.close();
  }

  // Animation frames & Cursor tracking on 1440x900
  const trackingContext = await browser.newContext({
    viewport: { width: 1440, height: 900 },
  });
  const trackingPage = await trackingContext.newPage();
  await trackingPage.goto('http://localhost:5321/', { waitUntil: 'networkidle' });
  await trackingPage.waitForTimeout(2000);

  // Animation frames (idle float + blink)
  console.log('Capturing animation frames...');
  await trackingPage.screenshot({ path: '/tmp/hero-shots/anim-frame-1.png' });
  await trackingPage.waitForTimeout(1000);
  await trackingPage.screenshot({ path: '/tmp/hero-shots/anim-frame-2.png' });
  await trackingPage.waitForTimeout(1200);
  await trackingPage.screenshot({ path: '/tmp/hero-shots/anim-frame-3.png' });

  // Cursor tracking tests & screenshots
  console.log('Capturing cursor tracking screenshots...');

  // Top-Left
  await trackingPage.mouse.move(30, 30);
  await trackingPage.waitForTimeout(600);
  await trackingPage.screenshot({ path: '/tmp/hero-shots/cursor-top-left.png' });
  console.log('Saved cursor-top-left.png');

  // Top-Right
  await trackingPage.mouse.move(1410, 30);
  await trackingPage.waitForTimeout(600);
  await trackingPage.screenshot({ path: '/tmp/hero-shots/cursor-top-right.png' });
  console.log('Saved cursor-top-right.png');

  // Bottom-Left
  await trackingPage.mouse.move(30, 870);
  await trackingPage.waitForTimeout(600);
  await trackingPage.screenshot({ path: '/tmp/hero-shots/cursor-bottom-left.png' });
  console.log('Saved cursor-bottom-left.png');

  // Bottom-Right
  await trackingPage.mouse.move(1410, 870);
  await trackingPage.waitForTimeout(600);
  await trackingPage.screenshot({ path: '/tmp/hero-shots/cursor-bottom-right.png' });
  console.log('Saved cursor-bottom-right.png');

  // Center (over robot)
  const robotBox = await trackingPage.locator('.hero-robot-canvas').boundingBox();
  if (robotBox) {
    await trackingPage.mouse.move(robotBox.x + robotBox.width / 2, robotBox.y + robotBox.height / 2);
    await trackingPage.waitForTimeout(600);
    await trackingPage.screenshot({ path: '/tmp/hero-shots/cursor-center.png' });
    console.log('Saved cursor-center.png');
  }

  await trackingContext.close();
  await browser.close();

  // Create comprehensive index.html
  const html = `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <title>Hero Section Verification & Cursor Tracking Gallery</title>
  <style>
    body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; background: #0a0a0a; color: #ededed; padding: 2.5rem; margin: 0; }
    h1 { margin-bottom: 0.5rem; font-size: 2rem; }
    p { color: #a1a1aa; margin-top: 0; margin-bottom: 2rem; }
    h2 { font-size: 1.3rem; margin-top: 2rem; margin-bottom: 1rem; color: #f4f4f5; border-bottom: 1px solid #262626; padding-bottom: 0.5rem; }
    .grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(380px, 1fr)); gap: 1.5rem; margin-bottom: 2rem; }
    .card { background: #141414; border: 1px solid #262626; border-radius: 12px; padding: 1.25rem; display: flex; flex-direction: column; }
    .card h3 { font-size: 1rem; margin-top: 0; margin-bottom: 0.75rem; color: #d4d4d8; }
    img { width: 100%; height: auto; border-radius: 8px; border: 1px solid #333; margin-top: auto; }
    a { color: #ff8800; text-decoration: none; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <h1>Hero Section Lilpix Robot Verification Gallery</h1>
  <p>Bottom-left headline layout, glowing square eyes, 360° full-window cursor tracking, design system adherence.</p>

  <h2>Cursor Tracking (Top-Left, Top-Right, Bottom-Left, Bottom-Right, Center)</h2>
  <div class="grid">
    <div class="card">
      <h3>Cursor: Top-Left (Head tilts up & turns left)</h3>
      <a href="cursor-top-left.png" target="_blank"><img src="cursor-top-left.png" alt="Cursor Top Left"></a>
    </div>
    <div class="card">
      <h3>Cursor: Top-Right (Head tilts up & turns right)</h3>
      <a href="cursor-top-right.png" target="_blank"><img src="cursor-top-right.png" alt="Cursor Top Right"></a>
    </div>
    <div class="card">
      <h3>Cursor: Bottom-Left (Head tilts down & turns left)</h3>
      <a href="cursor-bottom-left.png" target="_blank"><img src="cursor-bottom-left.png" alt="Cursor Bottom Left"></a>
    </div>
    <div class="card">
      <h3>Cursor: Bottom-Right (Head tilts down & turns right)</h3>
      <a href="cursor-bottom-right.png" target="_blank"><img src="cursor-bottom-right.png" alt="Cursor Bottom Right"></a>
    </div>
    <div class="card">
      <h3>Cursor: Center (Facing directly forward)</h3>
      <a href="cursor-center.png" target="_blank"><img src="cursor-center.png" alt="Cursor Center"></a>
    </div>
  </div>

  <h2>Responsive Viewports (Dark & Light Modes)</h2>
  <div class="grid">
    <div class="card">
      <h3>1920x1080 (Dark)</h3>
      <a href="desktop-dark-1920x1080.png" target="_blank"><img src="desktop-dark-1920x1080.png" alt="1920x1080 Dark"></a>
    </div>
    <div class="card">
      <h3>1920x1080 (Light)</h3>
      <a href="desktop-light-1920x1080.png" target="_blank"><img src="desktop-light-1920x1080.png" alt="1920x1080 Light"></a>
    </div>
    <div class="card">
      <h3>1440x900 (Dark)</h3>
      <a href="desktop-dark-1440x900.png" target="_blank"><img src="desktop-dark-1440x900.png" alt="1440x900 Dark"></a>
    </div>
    <div class="card">
      <h3>1440x900 (Light)</h3>
      <a href="desktop-light-1440x900.png" target="_blank"><img src="desktop-light-1440x900.png" alt="1440x900 Light"></a>
    </div>
    <div class="card">
      <h3>1280x720 (Dark)</h3>
      <a href="desktop-dark-1280x720.png" target="_blank"><img src="desktop-dark-1280x720.png" alt="1280x720 Dark"></a>
    </div>
    <div class="card">
      <h3>1280x720 (Light)</h3>
      <a href="desktop-light-1280x720.png" target="_blank"><img src="desktop-light-1280x720.png" alt="1280x720 Light"></a>
    </div>
    <div class="card">
      <h3>650x720 Narrow Window (Dark - Square Eyes Verified)</h3>
      <a href="desktop-dark-650x720.png" target="_blank"><img src="desktop-dark-650x720.png" alt="650x720 Dark"></a>
    </div>
    <div class="card">
      <h3>650x720 Narrow Window (Light - Square Eyes Verified)</h3>
      <a href="desktop-light-650x720.png" target="_blank"><img src="desktop-light-650x720.png" alt="650x720 Light"></a>
    </div>
    <div class="card">
      <h3>390x844 Mobile (Dark - Robot on top, Text bottom-left)</h3>
      <a href="desktop-dark-390x844.png" target="_blank"><img src="desktop-dark-390x844.png" alt="390x844 Dark"></a>
    </div>
    <div class="card">
      <h3>390x844 Mobile (Light)</h3>
      <a href="desktop-light-390x844.png" target="_blank"><img src="desktop-light-390x844.png" alt="390x844 Light"></a>
    </div>
  </div>

  <h2>Animation Frames (Idle Float & Blinking)</h2>
  <div class="grid">
    <div class="card">
      <h3>Animation Frame 1</h3>
      <a href="anim-frame-1.png" target="_blank"><img src="anim-frame-1.png" alt="Anim Frame 1"></a>
    </div>
    <div class="card">
      <h3>Animation Frame 2</h3>
      <a href="anim-frame-2.png" target="_blank"><img src="anim-frame-2.png" alt="Anim Frame 2"></a>
    </div>
    <div class="card">
      <h3>Animation Frame 3</h3>
      <a href="anim-frame-3.png" target="_blank"><img src="anim-frame-3.png" alt="Anim Frame 3"></a>
    </div>
  </div>
</body>
</html>`;

  fs.writeFileSync('/tmp/hero-shots/index.html', html);
  fs.writeFileSync('/tmp/hero-shots/console-errors.json', JSON.stringify(consoleMessages, null, 2));
  console.log('Screenshots and index.html generated successfully.');
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
