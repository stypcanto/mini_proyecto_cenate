import { test, expect } from '@playwright/test';

test.describe('Debug Desktop TeleEKG', () => {
  test('Capture what is actually on the page', async ({ page }) => {
    // Set desktop viewport
    await page.setViewportSize({ width: 1400, height: 900 });

    console.log('\n🌐 Navigating to http://localhost:3000/teleekgs/upload');
    const response = await page.goto('http://localhost:3000/teleekgs/upload', { waitUntil: 'networkidle' });
    console.log(`Response status: ${response?.status()}`);

    // Wait for page to be fully loaded
    await page.waitForTimeout(3000);

    // Get current URL
    const currentUrl = page.url();
    console.log(`Current URL: ${currentUrl}`);

    // Check if redirected to login
    if (currentUrl.includes('login') || currentUrl.includes('auth')) {
      console.log('⚠️ Redirected to login page - authentication required');
    }

    // Get page title
    const title = await page.title();
    console.log(`Page title: ${title}`);

    // Get all visible text
    const bodyText = await page.locator('body').textContent();
    const preview = bodyText?.substring(0, 300) || 'No content';
    console.log(`\nPage content preview:\n${preview}`);

    // Check for UploadFormWrapper elements
    console.log('\n🔍 Checking for UploadFormWrapper elements:');

    const hasPasos = await page.locator('text=3 Pasos').count() > 0;
    const hasCargarEkgs = await page.locator('text=Cargar Electrocardiogramas').count() > 0;
    const hasConsejos = await page.locator('text=Consejos útiles').count() > 0;

    console.log(`  - "3 Pasos" text: ${hasPasos ? '✅' : '❌'}`);
    console.log(`  - "Cargar Electrocardiogramas" text: ${hasCargarEkgs ? '✅' : '❌'}`);
    console.log(`  - "Consejos útiles" text: ${hasConsejos ? '✅' : '❌'}`);

    // Check for form elements
    console.log('\n🔍 Checking for Form Elements:');
    const hasFileInput = await page.locator('input[type="file"]').count() > 0;
    const hasDniInput = await page.locator('input[placeholder*="DNI"], input[placeholder*="Documento"], input[placeholder*="num"]').count() > 0;

    console.log(`  - File input: ${hasFileInput ? '✅' : '❌'}`);
    console.log(`  - DNI input: ${hasDniInput ? '✅' : '❌'}`);

    // Take full screenshot
    console.log('\n📸 Taking full page screenshot...');
    await page.screenshot({ path: '/tmp/debug-full-page.png', fullPage: true });
    console.log('✅ Screenshot saved: /tmp/debug-full-page.png');

    // Take viewport screenshot
    console.log('📸 Taking viewport screenshot...');
    await page.screenshot({ path: '/tmp/debug-viewport.png' });
    console.log('✅ Screenshot saved: /tmp/debug-viewport.png');

    // List all h1-h3 headings
    console.log('\n📋 Headings found on page:');
    const headings = await page.locator('h1, h2, h3').all();
    for (const heading of headings) {
      const text = await heading.textContent();
      console.log(`  - ${text}`);
    }

    // Get HTML structure of upload section
    console.log('\n🏗️ Checking HTML structure:');
    const uploadSection = await page.locator('div:has-text("Cargar")').first();
    if (await uploadSection.isVisible()) {
      const html = await uploadSection.innerHTML();
      console.log(`Upload section HTML length: ${html.length} chars`);
    }
  });
});
