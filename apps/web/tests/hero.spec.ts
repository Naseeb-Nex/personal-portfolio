import { test, expect } from '@playwright/test';

test.describe('Hero Section with Lilpix Robot', () => {
  test('renders headline, subtitle, xylophone canvas, and robot face', async ({ page }) => {
    await page.goto('/');

    // Check headline and subtitle
    const heading = page.locator('.hero-heading');
    await expect(heading).toBeVisible();
    await expect(heading).toContainText('AI built for the');
    await expect(heading).toContainText('real world');

    const subtitle = page.locator('.hero-subtitle');
    await expect(subtitle).toBeVisible();
    await expect(subtitle).toHaveText('Engineering the Next Wave of AI');

    // Check canvases
    const xyloCanvas = page.locator('.hero-canvas');
    await expect(xyloCanvas).toBeVisible();

    const robotCanvas = page.locator('.hero-robot-canvas');
    await expect(robotCanvas).toBeVisible();

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
});
