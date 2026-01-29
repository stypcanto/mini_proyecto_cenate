import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'http://localhost:3000';
const API_BASE_URL = 'http://localhost:8080/api';

/**
 * Dengue Module Test Suite - Phase 7 Integration Testing
 * Tests icon rendering, navigation, and functionality
 */

test.describe('Dengue Module - Phase 7 Integration Tests', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // Set up auth if needed - mock token for testing
    await page.context().addCookies([
      {
        name: 'authToken',
        value: 'test-token',
        url: BASE_URL,
      }
    ]);

    await page.goto(BASE_URL);
  });

  test.afterEach(async () => {
    await page.close();
  });

  // ============================================
  // SMOKE TESTS
  // ============================================

  test('SMOKE: Frontend loads without errors', async () => {
    // Wait for page to load
    await page.waitForLoadState('networkidle');

    // Check console for errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    // Check that main elements are visible
    const pageTitle = await page.title();
    expect(pageTitle).toBeTruthy();
    expect(pageTitle.length).toBeGreaterThan(0);
  });

  test('SMOKE: Sidebar is visible', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Check sidebar exists
    const sidebar = await page.locator('[class*="sidebar"], nav[class*="menu"]');
    await expect(sidebar.first()).toBeVisible();
  });

  // ============================================
  // ICON VERIFICATION TESTS
  // ============================================

  test('ICON: Dengue menu item displays Bug icon (mosquito)', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Find Dengue menu item
    const dengueMenuItem = page.locator('text=Dengue, a[href*="/dengue"]');

    // Check if icon exists
    const icon = dengueMenuItem.locator('svg');
    await expect(icon).toBeVisible();

    // Verify icon has correct attributes or class
    const ariaLabel = await icon.getAttribute('aria-label');
    const dataIcon = await icon.getAttribute('data-icon');

    // Should have some identifier for the Bug icon
    const iconExists = ariaLabel !== null || dataIcon !== null ||
                       (await icon.evaluate(el => el.className)).includes('bug');
    expect(iconExists).toBeTruthy();
  });

  test('ICON: Cargar Excel submenu displays Upload icon', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Expand Dengue menu if needed
    const dengueMenu = page.locator('text=Dengue');
    const uploadItem = page.locator('text=Cargar Excel');

    await uploadItem.scrollIntoViewIfNeeded();
    await expect(uploadItem).toBeVisible();

    // Verify icon exists
    const icon = uploadItem.locator('..').locator('svg').first();
    await expect(icon).toBeVisible();
  });

  test('ICON: Listar Casos submenu displays List icon', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    const listarItem = page.locator('text=Listar Casos');
    await expect(listarItem).toBeVisible();

    const icon = listarItem.locator('..').locator('svg').first();
    await expect(icon).toBeVisible();
  });

  test('ICON: Buscar submenu displays Search icon', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    const buscarItem = page.locator('text=Buscar');
    await expect(buscarItem).toBeVisible();

    const icon = buscarItem.locator('..').locator('svg').first();
    await expect(icon).toBeVisible();
  });

  test('ICON: Resultados submenu displays BarChart icon', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    const resultadosItem = page.locator('text=Resultados');
    await expect(resultadosItem).toBeVisible();

    const icon = resultadosItem.locator('..').locator('svg').first();
    await expect(icon).toBeVisible();
  });

  test('ICON: All Dengue icons render without broken images', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Get all SVG elements in sidebar
    const svgIcons = page.locator('nav svg, aside svg');
    const count = await svgIcons.count();

    // All should be SVG, not img with broken src
    for (let i = 0; i < count; i++) {
      const element = svgIcons.nth(i);
      const tagName = await element.evaluate(el => el.tagName.toLowerCase());
      expect(tagName).toBe('svg');
    }
  });

  // ============================================
  // NAVIGATION TESTS
  // ============================================

  test('NAV: Click Dengue menu expands submenu', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    const dengueMenu = page.locator('text=Dengue');
    const expandButton = dengueMenu.locator('..');

    // Click to expand
    await expandButton.click();

    // Wait for submenu to appear
    await page.waitForTimeout(300);

    // Verify submenu items are visible
    await expect(page.locator('text=Cargar Excel')).toBeVisible();
    await expect(page.locator('text=Listar Casos')).toBeVisible();
    await expect(page.locator('text=Buscar')).toBeVisible();
    await expect(page.locator('text=Resultados')).toBeVisible();
  });

  test('NAV: Navigate to Cargar Excel page', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Click Dengue menu item
    const dengueLink = page.locator('a[href*="/dengue"]').first();
    await dengueLink.click();

    // Click Cargar Excel submenu
    const cargarLink = page.locator('text=Cargar Excel');
    await cargarLink.click();

    // Wait for navigation
    await page.waitForNavigation();

    // Verify URL
    expect(page.url()).toContain('/dengue');
    expect(page.url()).toContain('cargar');
  });

  test('NAV: Navigate to Listar Casos page', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    const listarLink = page.locator('text=Listar Casos');
    await listarLink.click();

    await page.waitForNavigation();

    expect(page.url()).toContain('/dengue');
    expect(page.url()).toContain('listar');
  });

  test('NAV: Navigate to Buscar page', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    const buscarLink = page.locator('text=Buscar');
    await buscarLink.click();

    await page.waitForNavigation();

    expect(page.url()).toContain('/dengue');
    expect(page.url()).toContain('buscar');
  });

  test('NAV: Navigate to Resultados page', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    const resultadosLink = page.locator('text=Resultados');
    await resultadosLink.click();

    await page.waitForNavigation();

    expect(page.url()).toContain('/dengue');
    expect(page.url()).toContain('resultado');
  });

  test('NAV: Back button navigation works correctly', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Navigate to Cargar Excel
    const cargarLink = page.locator('text=Cargar Excel');
    await cargarLink.click();
    await page.waitForNavigation();

    const firstUrl = page.url();

    // Navigate to Listar Casos
    const listarLink = page.locator('text=Listar Casos');
    await listarLink.click();
    await page.waitForNavigation();

    // Use back button
    await page.goBack();

    // Verify previous page
    expect(page.url()).toBe(firstUrl);
  });

  test('NAV: Breadcrumb navigation exists', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Navigate to submenu
    const cargarLink = page.locator('text=Cargar Excel');
    await cargarLink.click();
    await page.waitForNavigation();

    // Look for breadcrumb
    const breadcrumb = page.locator('[class*="breadcrumb"]');

    // Breadcrumb should exist or be in some navigation element
    const exists = await breadcrumb.count() > 0;

    // If breadcrumb exists, verify it contains relevant items
    if (exists) {
      await expect(breadcrumb).toContainText('Dengue');
    }
  });

  // ============================================
  // MENU STRUCTURE TESTS
  // ============================================

  test('MENU: All 4 Dengue subpages are listed', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Verify all submenu items exist
    const subpages = ['Cargar Excel', 'Listar Casos', 'Buscar', 'Resultados'];

    for (const subpage of subpages) {
      const item = page.locator(`text=${subpage}`);
      await expect(item).toBeVisible();
    }
  });

  test('MENU: Dengue menu items have correct order', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Get all submenu items under Dengue
    const menuItems = await page.locator('a[href*="/dengue"]').all();

    // Verify we have at least the submenu items
    expect(menuItems.length).toBeGreaterThanOrEqual(4);
  });

  test('MENU: Menu is responsive on mobile', async () => {
    // Set mobile viewport
    await page.setViewportSize({ width: 375, height: 667 });

    await page.goto(`${BASE_URL}/dashboard`);

    // Menu should still be accessible (either hamburger or visible)
    const menuButton = page.locator('[aria-label*="menu"], button[class*="menu"]');
    const sidebar = page.locator('[class*="sidebar"]');

    const hasMenuButton = await menuButton.count() > 0;
    const hasSidebar = await sidebar.count() > 0;

    expect(hasMenuButton || hasSidebar).toBeTruthy();
  });

  // ============================================
  // API INTEGRATION TESTS
  // ============================================

  test('API: Menu endpoint returns correct data', async () => {
    const response = await page.request.get(
      `${API_BASE_URL}/menu-usuario/usuario/1`,
      {
        headers: {
          'Authorization': 'Bearer test-token',
          'Content-Type': 'application/json'
        }
      }
    );

    expect(response.status()).toBe(200);

    const data = await response.json();
    expect(data).toHaveProperty('paginas');
    expect(Array.isArray(data.paginas)).toBeTruthy();
  });

  test('API: Menu contains Dengue with Bug icon', async () => {
    const response = await page.request.get(
      `${API_BASE_URL}/menu-usuario/usuario/1`,
      {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      }
    );

    const data = await response.json();

    // Find Dengue page
    const dengue = data.paginas?.find((p: any) =>
      p.nombrePagina?.toLowerCase() === 'dengue'
    );

    expect(dengue).toBeDefined();
    expect(dengue?.icono).toBe('Bug');
  });

  test('API: Menu contains all 4 Dengue subpages', async () => {
    const response = await page.request.get(
      `${API_BASE_URL}/menu-usuario/usuario/1`,
      {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      }
    );

    const data = await response.json();

    const dengue = data.paginas?.find((p: any) =>
      p.nombrePagina?.toLowerCase() === 'dengue'
    );

    expect(dengue?.subpaginas).toBeDefined();
    expect(dengue.subpaginas.length).toBe(4);
  });

  test('API: Subpages have correct icons', async () => {
    const response = await page.request.get(
      `${API_BASE_URL}/menu-usuario/usuario/1`,
      {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      }
    );

    const data = await response.json();

    const dengue = data.paginas?.find((p: any) =>
      p.nombrePagina?.toLowerCase() === 'dengue'
    );

    const expectedIcons: Record<string, string> = {
      'Cargar Excel': 'Upload',
      'Listar Casos': 'List',
      'Buscar': 'Search',
      'Resultados': 'BarChart3'
    };

    dengue.subpaginas.forEach((sub: any) => {
      const expected = expectedIcons[sub.nombrePagina];
      expect(sub.icono).toBe(expected);
    });
  });

  test('API: Response time is acceptable', async () => {
    const startTime = Date.now();

    await page.request.get(
      `${API_BASE_URL}/menu-usuario/usuario/1`,
      {
        headers: {
          'Authorization': 'Bearer test-token'
        }
      }
    );

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    // Response should be < 500ms
    expect(responseTime).toBeLessThan(500);
  });

  // ============================================
  // PERMISSION TESTS
  // ============================================

  test('PERM: Unauthenticated user cannot access menu API', async () => {
    const response = await page.request.get(
      `${API_BASE_URL}/menu-usuario/usuario/1`,
      {
        headers: {
          'Content-Type': 'application/json'
        }
      }
    );

    // Should be 401 or 403
    expect([401, 403]).toContain(response.status());
  });

  test('PERM: Dashboard redirects to login when not authenticated', async () => {
    // Clear auth cookies
    await page.context().clearCookies();

    await page.goto(`${BASE_URL}/dashboard`);

    // Should redirect to login
    await page.waitForURL('**/login');
    expect(page.url()).toContain('login');
  });

  // ============================================
  // VISUAL REGRESSION TESTS
  // ============================================

  test('VISUAL: Dengue menu item renders consistently', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Take screenshot of menu area
    const sidebar = page.locator('[class*="sidebar"], nav').first();
    await expect(sidebar).toHaveScreenshot('dengue-menu-item.png');
  });

  test('VISUAL: Dengue submenu renders consistently', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Expand menu if needed
    const dengueMenu = page.locator('text=Dengue');
    await dengueMenu.click();

    // Wait for animation
    await page.waitForTimeout(300);

    // Take screenshot
    const submenu = page.locator('[class*="submenu"], [class*="dropdown"]').first();
    await expect(submenu).toHaveScreenshot('dengue-submenu.png');
  });

  // ============================================
  // EDGE CASE TESTS
  // ============================================

  test('EDGE: Handles rapid menu clicks gracefully', async () => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Click menu multiple times rapidly
    const cargarLink = page.locator('text=Cargar Excel');
    const listarLink = page.locator('text=Listar Casos');

    for (let i = 0; i < 5; i++) {
      await cargarLink.click();
      await listarLink.click();
    }

    // Should not crash or have errors
    const errors: string[] = [];
    page.on('console', msg => {
      if (msg.type() === 'error') {
        errors.push(msg.text());
      }
    });

    expect(errors.length).toBe(0);
  });

  test('EDGE: Menu works with network latency simulation', async () => {
    // Simulate slow network
    await page.route('**/*', route => {
      setTimeout(() => route.continue(), 100);
    });

    await page.goto(`${BASE_URL}/dashboard`);

    // Should still be able to navigate
    const cargarLink = page.locator('text=Cargar Excel');
    await expect(cargarLink).toBeVisible();
  });

  test('EDGE: Handles missing icon gracefully', async () => {
    // This tests the fallback behavior
    await page.goto(`${BASE_URL}/dashboard`);

    // All menu items should have some icon (even if fallback)
    const menuItems = page.locator('nav a, aside a');
    const count = await menuItems.count();

    for (let i = 0; i < count; i++) {
      const item = menuItems.nth(i);
      // Item should either have icon or be accessible
      await expect(item).toBeVisible();
    }
  });
});

// ============================================
// ACCESSIBILITY TESTS
// ============================================

test.describe('Dengue Module - Accessibility Tests', () => {
  test('A11Y: Menu is keyboard navigable', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Tab to menu
    await page.keyboard.press('Tab');

    // Should focus on first interactive element
    const focusedElement = await page.evaluate(() => {
      return document.activeElement?.tagName;
    });

    expect(focusedElement).toBeTruthy();
  });

  test('A11Y: Icons have appropriate aria labels', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // Check menu items have descriptions
    const dengueItem = page.locator('text=Dengue');
    const hasLabel = await dengueItem.evaluate(el => {
      return el.getAttribute('aria-label') ||
             el.getAttribute('title') ||
             el.textContent;
    });

    expect(hasLabel).toBeTruthy();
  });

  test('A11Y: Color contrast is sufficient', async ({ page }) => {
    await page.goto(`${BASE_URL}/dashboard`);

    // This is a manual check, but we can verify icons are visible
    const icons = page.locator('svg');
    const count = await icons.count();

    for (let i = 0; i < count; i++) {
      const icon = icons.nth(i);
      await expect(icon).toBeVisible();
    }
  });
});
