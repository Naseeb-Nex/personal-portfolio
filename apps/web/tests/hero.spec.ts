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
  test('renders headline, subtitle, xylophone canvas, and robot face in bottom-left layout', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');

    // Check headline and subtitle
    const heading = page.locator('.hero-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('AI built for the');
    await expect(heading).toContainText('real world');

    const subtitle = page.locator('.hero-subtitle');
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toHaveText('Engineering the Next Wave of AI');

    // Verify bottom-left positioning on desktop
    const headingBox = await heading.boundingBox();
    expect(headingBox).not.toBeNull();
    if (headingBox) {
      expect(headingBox.x).toBeLessThan(120); // Flush with left margin (56px)
      expect(headingBox.y + headingBox.height).toBeGreaterThan(500); // Sits in bottom-left area of 900px viewport
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

  test('robot tracks pointer to 4 corners and center across the whole window and after scroll', async ({
    page,
  }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    await page.waitForTimeout(600);

    // 1. Move to Top-Left
    await page.mouse.move(20, 20);
    await page.waitForTimeout(300);
    const tlTurn = await page.evaluate(() => {
      const r = (window as unknown as TestRobotWindow).__HERO_ROBOT__;
      return r ? r.getTargetTurn() : null;
    });
    expect(tlTurn).not.toBeNull();
    expect(tlTurn.y).toBeLessThan(0); // Turns left (negative yaw)
    expect(tlTurn.x).toBeLessThan(0); // Tilts up (negative pitch in Three.js camera coord)

    // 2. Move to Top-Right
    await page.mouse.move(1420, 20);
    await page.waitForTimeout(300);
    const trTurn = await page.evaluate(() => {
      const r = (window as unknown as TestRobotWindow).__HERO_ROBOT__;
      return r ? r.getTargetTurn() : null;
    });
    expect(trTurn.y).toBeGreaterThan(0); // Turns right
    expect(trTurn.x).toBeLessThan(0); // Tilts up

    // 3. Move to Bottom-Left
    await page.mouse.move(20, 880);
    await page.waitForTimeout(300);
    const blTurn = await page.evaluate(() => {
      const r = (window as unknown as TestRobotWindow).__HERO_ROBOT__;
      return r ? r.getTargetTurn() : null;
    });
    expect(blTurn.y).toBeLessThan(0); // Turns left
    expect(blTurn.x).toBeGreaterThan(0); // Tilts down

    // 4. Move to Bottom-Right
    await page.mouse.move(1420, 880);
    await page.waitForTimeout(300);
    const brTurn = await page.evaluate(() => {
      const r = (window as unknown as TestRobotWindow).__HERO_ROBOT__;
      return r ? r.getTargetTurn() : null;
    });
    expect(brTurn.y).toBeGreaterThan(0); // Turns right
    expect(brTurn.x).toBeGreaterThan(0); // Tilts down

    // 5. Move to Robot Canvas Center
    const robotBox = await page.locator('.hero-robot-canvas').boundingBox();
    expect(robotBox).not.toBeNull();
    if (robotBox) {
      await page.mouse.move(robotBox.x + robotBox.width / 2, robotBox.y + robotBox.height / 2);
      await page.waitForTimeout(300);
      const centerTurn = await page.evaluate(() => {
        const r = (window as unknown as TestRobotWindow).__HERO_ROBOT__;
        return r ? r.getTargetTurn() : null;
      });
      expect(Math.abs(centerTurn.y)).toBeLessThan(0.08);
      expect(Math.abs(centerTurn.x)).toBeLessThan(0.08);
    }

    // 6. Test tracking after scroll
    await page.mouse.wheel(0, 300);
    await page.waitForTimeout(300);
    await page.mouse.move(100, 200);
    await page.waitForTimeout(300);
    const scrolledTurn = await page.evaluate(() => {
      const r = (window as unknown as TestRobotWindow).__HERO_ROBOT__;
      return r ? r.getTargetTurn() : null;
    });
    expect(scrolledTurn.y).toBeLessThan(0); // Stays responsive to cursor position
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
    await page.waitForTimeout(600);
    await page.evaluate(() => window.scrollTo(0, 0));

    const robotMobile = await page.locator('.hero-robot-canvas').boundingBox();
    expect(robotMobile).not.toBeNull();
    if (robotMobile) {
      expect(Math.abs(robotMobile.width - robotMobile.height)).toBeLessThan(2);
      expect(robotMobile.width).toBeLessThanOrEqual(252);
    }

    // On mobile, robot is placed above the text block
    const headingMobile = await page.locator('.hero-heading').boundingBox();
    expect(headingMobile).not.toBeNull();
    if (robotMobile && headingMobile) {
      expect(robotMobile.y).toBeLessThan(headingMobile.y); // Robot is above text
    }
  });
});
