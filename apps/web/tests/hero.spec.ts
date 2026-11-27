import { test, expect } from '@playwright/test';

interface TestRobotWindow {
  __HERO_ROBOT__?: {
    getTargetTurn: () => { x: number; y: number };
    getTurn: () => { x: number; y: number };
    getTargetLook: () => { x: number; y: number };
    getLook: () => { x: number; y: number };
    getExpression: () => string;
    nextExpression: () => void;
  };
}

test.describe('Hero Section with Lilpix Robot', () => {
  test('renders main heading "Engineering the Next Wave of AI" and subheading "AI built for the real world" in bottom-left layout', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Check main heading (h1)
    const heading = page.locator('h1.hero-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('Engineering the');
    await expect(heading).toContainText('Next Wave');
    await expect(heading).toContainText('of AI');

    // Check subheading (p.hero-subheading)
    const subheading = page.locator('.hero-subheading');
    await expect(subheading).toBeVisible();
    await expect(subheading).toHaveText('AI built for the real world');

    // Verify bottom-left positioning on desktop
    const headingBox = await heading.boundingBox();
    expect(headingBox).not.toBeNull();
    if (headingBox) {
      expect(headingBox.x).toBeLessThan(120); // Flush with left margin (56px)
      expect(headingBox.y + headingBox.height).toBeGreaterThan(500); // Sits in bottom-left area
    }

    // Check canvases
    const xyloCanvas = page.locator('.hero-canvas');
    await expect(xyloCanvas).toBeVisible();

    const robotCanvas = page.locator('.hero-robot-canvas');
    await expect(robotCanvas).toBeVisible();

    // Verify robot canvas is square (1:1 aspect ratio)
    const robotBox = await robotCanvas.boundingBox();
    expect(robotBox).not.toBeNull();
    if (robotBox) {
      expect(Math.abs(robotBox.width - robotBox.height)).toBeLessThan(2);
      expect(robotBox.x).toBeGreaterThan(800); // Positioned on the right
    }

    // Check robot wrapper has accessibility label
    const robotWrapper = page.locator('.hero-robot-wrapper');
    await expect(robotWrapper).toBeVisible();
    await expect(robotWrapper).toHaveAttribute('aria-label', /Interactive lilpix 3D robot face/);

    // Initial expression is neutral
    const badge = page.locator('.hero-robot-expression');
    await expect(badge).toHaveText('neutral');

    // Click robot to cycle expression
    await robotWrapper.click();
    await expect(badge).toHaveText('happy');

    // Test theme toggle
    const themeBtn = page.locator('.theme-toggle-btn');
    await expect(themeBtn).toBeVisible();
    await themeBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'light');
    await themeBtn.click();
    await expect(page.locator('html')).toHaveAttribute('data-theme', 'dark');
  });

  test('robot tracks pointer outside canvas but inside hero, across 4 corners, and outside hero when scrolled', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(600);

    // 1. Move outside canvas but inside hero over the text block (left side)
    await page.mouse.move(100, 700);
    await page.waitForTimeout(300);
    const textTurn = await page.evaluate(() => {
      const r = (window as unknown as TestRobotWindow).__HERO_ROBOT__;
      return r ? r.getTargetTurn() : null;
    });
    expect(textTurn).not.toBeNull();
    expect(textTurn!.y).toBeLessThan(0); // Turns left toward the headline
    expect(textTurn!.x).toBeGreaterThan(0); // Tilts down toward the text at the bottom

    // 2. Move outside canvas but inside hero over the center top of hero
    await page.mouse.move(720, 60);
    await page.waitForTimeout(300);
    const topHeroTurn = await page.evaluate(() => {
      const r = (window as unknown as TestRobotWindow).__HERO_ROBOT__;
      return r ? r.getTargetTurn() : null;
    });
    expect(topHeroTurn).not.toBeNull();
    expect(topHeroTurn!.y).toBeLessThan(0); // Robot is on the right, so center is to its left
    expect(topHeroTurn!.x).toBeLessThan(0); // Tilts up toward top of hero

    // 3. Move to 4 corners of window
    // Top-Left corner (0, 0)
    await page.mouse.move(10, 10);
    await page.waitForTimeout(300);
    const tlTurn = await page.evaluate(() => {
      const r = (window as unknown as TestRobotWindow).__HERO_ROBOT__;
      return r ? r.getTargetTurn() : null;
    });
    expect(tlTurn!.y).toBeLessThan(0); // Left
    expect(tlTurn!.x).toBeLessThan(0); // Up

    // Top-Right corner
    await page.mouse.move(1430, 10);
    await page.waitForTimeout(300);
    const trTurn = await page.evaluate(() => {
      const r = (window as unknown as TestRobotWindow).__HERO_ROBOT__;
      return r ? r.getTargetTurn() : null;
    });
    expect(trTurn!.y).toBeGreaterThan(0); // Right
    expect(trTurn!.x).toBeLessThan(0); // Up

    // Bottom-Left corner
    await page.mouse.move(10, 890);
    await page.waitForTimeout(300);
    const blTurn = await page.evaluate(() => {
      const r = (window as unknown as TestRobotWindow).__HERO_ROBOT__;
      return r ? r.getTargetTurn() : null;
    });
    expect(blTurn!.y).toBeLessThan(0); // Left
    expect(blTurn!.x).toBeGreaterThan(0); // Down

    // Bottom-Right corner
    await page.mouse.move(1430, 890);
    await page.waitForTimeout(300);
    const brTurn = await page.evaluate(() => {
      const r = (window as unknown as TestRobotWindow).__HERO_ROBOT__;
      return r ? r.getTargetTurn() : null;
    });
    expect(brTurn!.y).toBeGreaterThan(0); // Right
    expect(brTurn!.x).toBeGreaterThan(0); // Down

    // 4. Center of robot canvas
    const robotBox = await page.locator('.hero-robot-canvas').boundingBox();
    expect(robotBox).not.toBeNull();
    if (robotBox) {
      await page.mouse.move(robotBox.x + robotBox.width / 2, robotBox.y + robotBox.height / 2);
      await page.waitForTimeout(300);
      const centerTurn = await page.evaluate(() => {
        const r = (window as unknown as TestRobotWindow).__HERO_ROBOT__;
        return r ? r.getTargetTurn() : null;
      });
      expect(Math.abs(centerTurn!.y)).toBeLessThan(0.08);
      expect(Math.abs(centerTurn!.x)).toBeLessThan(0.08);
    }

    // 5. Outside the hero when scrolled down into lower sections
    await page.mouse.wheel(0, 800);
    await page.waitForTimeout(400);
    // Cursor in lower section outside the hero
    await page.mouse.move(250, 750);
    await page.waitForTimeout(300);
    const scrolledTurn = await page.evaluate(() => {
      const r = (window as unknown as TestRobotWindow).__HERO_ROBOT__;
      return r ? r.getTargetTurn() : null;
    });
    expect(scrolledTurn).not.toBeNull();
    expect(scrolledTurn!.y).toBeLessThan(0); // Follows pointer while scrolled
  });

  test('preserves 1:1 square canvas aspect ratio on narrow 650x720 and mobile 390x844 viewports', async ({
    page,
  }) => {
    // Narrow 650x720 viewport
    await page.setViewportSize({ width: 650, height: 720 });
    await page.goto('/');
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollTo(0, 0));

    const robot650 = await page.locator('.hero-robot-canvas').boundingBox();
    expect(robot650).not.toBeNull();
    if (robot650) {
      expect(Math.abs(robot650.width - robot650.height)).toBeLessThan(2);
      expect(robot650.width).toBeLessThanOrEqual(302);
    }

    // Mobile 390x844 viewport
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollTo(0, 0));

    const robotMobile = await page.locator('.hero-robot-canvas').boundingBox();
    expect(robotMobile).not.toBeNull();
    if (robotMobile) {
      expect(Math.abs(robotMobile.width - robotMobile.height)).toBeLessThan(2);
      expect(robotMobile.width).toBeLessThanOrEqual(252);
    }

    // On mobile, robot is placed above the text block
    const headingMobile = await page.locator('h1.hero-heading').boundingBox();
    expect(headingMobile).not.toBeNull();
    if (robotMobile && headingMobile) {
      expect(robotMobile.y).toBeLessThan(headingMobile.y); // Robot is above text
    }
  });
});
