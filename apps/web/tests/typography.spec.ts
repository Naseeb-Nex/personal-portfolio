import { test, expect } from '@playwright/test';

test.describe('Typography Design Tokens', () => {
  test('matches design tokens at desktop viewport (1440px)', async ({ page }) => {
    await page.setViewportSize({ width: 1440, height: 900 });
    await page.goto('/');
    // Wait for preloader to finish and detach
    await page.waitForSelector('.preloader-overlay', { state: 'detached', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // 1. Manifesto Heading (display-lg: 62px)
    const manifesto = page.locator('.manifesto-text');
    await expect(manifesto).toBeVisible();
    const manifestoStyles = await manifesto.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight };
    });
    expect(manifestoStyles.fontFamily).toContain('Stack Sans Notch');
    expect(manifestoStyles.fontSize).toBe('62px'); // --text-display-lg-size

    // 2. About Heading (display-lg: 62px)
    const aboutHeading = page.locator('.about-heading');
    await expect(aboutHeading).toBeVisible();
    const aboutStyles = await aboutHeading.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontFamily: cs.fontFamily, fontSize: cs.fontSize, fontWeight: cs.fontWeight };
    });
    expect(aboutStyles.fontFamily).toContain('Stack Sans Notch');
    expect(aboutStyles.fontSize).toBe('62px'); // --text-display-lg-size

    // 3. About Body Text (body-lg: 18px)
    const aboutBody = page.locator('.about-right p').first();
    await expect(aboutBody).toBeVisible();
    const aboutBodyStyles = await aboutBody.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontFamily: cs.fontFamily, fontSize: cs.fontSize };
    });
    expect(aboutBodyStyles.fontFamily).toContain('Inter');
    expect(aboutBodyStyles.fontSize).toBe('18px'); // --text-body-lg-size

    // 4. Career Title (display-lg: 62px)
    const careerTitle = page.locator('.career-title');
    await expect(careerTitle).toBeVisible();
    const careerStyles = await careerTitle.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontFamily: cs.fontFamily, fontSize: cs.fontSize };
    });
    expect(careerStyles.fontFamily).toContain('Stack Sans Notch');
    expect(careerStyles.fontSize).toBe('62px'); // --text-display-lg-size

    // 5. Career Copy (supporting: Geist, body-lg: 18px)
    const careerCopy = page.locator('.career-info-box p').first();
    await expect(careerCopy).toBeVisible();
    const careerCopyStyles = await careerCopy.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontFamily: cs.fontFamily, fontSize: cs.fontSize };
    });
    expect(careerCopyStyles.fontFamily).toContain('Geist');
    expect(careerCopyStyles.fontSize).toBe('18px'); // --text-body-lg-size

    // 6. Contact Title (display-xxl: 110px)
    const contactTitle = page.locator('.contact-title');
    await expect(contactTitle).toBeVisible();
    const contactStyles = await contactTitle.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontFamily: cs.fontFamily, fontSize: cs.fontSize };
    });
    expect(contactStyles.fontFamily).toContain('Stack Sans Notch');
    expect(contactStyles.fontSize).toBe('110px'); // --text-display-xxl-size

    // 7. Buttons / CTAs (button: 14px)
    const contactSocial = page.locator('.contact-socials a').first();
    await expect(contactSocial).toBeVisible();
    const btnStyles = await contactSocial.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize };
    });
    expect(btnStyles.fontSize).toBe('14px'); // --text-button-size
  });

  test('matches responsive scale step-downs at mobile viewport (390px)', async ({ page }) => {
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    // Wait for preloader to finish and detach
    await page.waitForSelector('.preloader-overlay', { state: 'detached', timeout: 10000 }).catch(() => {});
    await page.waitForTimeout(1000);

    // Contact Title steps down: 110px -> 32px (mobile display-xxl)
    const contactTitle = page.locator('.contact-title');
    await expect(contactTitle).toBeVisible();
    const contactStyles = await contactTitle.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize };
    });
    expect(contactStyles.fontSize).toBe('32px'); // --text-display-xxl-size @ <=480px

    // Manifesto Text steps down: 62px -> 24px (mobile display-lg)
    const manifesto = page.locator('.manifesto-text');
    await expect(manifesto).toBeVisible();
    const manifestoStyles = await manifesto.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize };
    });
    expect(manifestoStyles.fontSize).toBe('24px'); // --text-display-lg-size @ <=480px

    // About Heading steps down: 62px -> 24px (mobile display-lg)
    const aboutHeading = page.locator('.about-heading');
    await expect(aboutHeading).toBeVisible();
    const aboutStyles = await aboutHeading.evaluate((el) => {
      const cs = window.getComputedStyle(el);
      return { fontSize: cs.fontSize };
    });
    expect(aboutStyles.fontSize).toBe('24px'); // --text-display-lg-size @ <=480px
  });
});
