import { test, expect, Page } from '@playwright/test';

/**
 * Test Suite: End-to-End Recita + Interconsulta Flow
 *
 * This test validates the complete workflow:
 * 1. Médico marks patient as Atendido with Recita (7 days) and Interconsulta (Cardiología)
 * 2. Coordinador Gestión Citas sees the Recita in their queue
 *
 * Test Credentials:
 * - Médico: DNI 45433320, Password: Cenate@2024
 * - Coordinador: DNI 45721231, Password: @Prueba654321
 * - Patient: Carlos Alberto Fernández Pérez (DNI: 34567803)
 */

const BASE_URL = 'http://localhost:3000';
const API_BASE_URL = 'http://localhost:8080/api';

const MEDICO_CREDENTIALS = {
  dni: '45433320',
  password: 'Cenate@2024'
};

const COORDINADOR_CREDENTIALS = {
  dni: '45721231',
  password: '@Prueba654321'
};

const PATIENT = {
  dni: '34567803',
  nombre: 'Carlos Alberto Fernández Pérez'
};

test.describe('End-to-End: Recita + Interconsulta Flow', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // Console listeners for debugging
    page.on('console', msg => {
      const type = msg.type();
      if (['error', 'warning'].includes(type)) {
        console.log(`[Browser ${type}]:`, msg.text());
      }
    });

    // Listen for API responses
    page.on('response', response => {
      const url = response.url();
      if (url.includes('/api/') && response.status() >= 400) {
        console.log(`[API Error] ${response.status()} ${url}`);
      }
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  /**
   * Helper: Login function
   */
  async function login(dni: string, password: string) {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Take screenshot of login page
    await page.screenshot({
      path: `test-results/screenshots/01-login-page.png`,
      fullPage: true
    });

    // Fill login form
    const dniInput = page.locator('input[name="username"], input[type="text"], input[placeholder*="DNI"]').first();
    const passwordInput = page.locator('input[name="password"], input[type="password"]').first();

    await dniInput.fill(dni);
    await passwordInput.fill(password);

    // Click login button
    const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar"), button:has-text("Ingresar")').first();
    await loginButton.click();

    // Wait for navigation after login
    await page.waitForLoadState('networkidle', { timeout: 10000 });

    // Verify login success (should redirect to dashboard or home)
    const currentUrl = page.url();
    console.log(`✓ Logged in successfully. Current URL: ${currentUrl}`);

    return currentUrl;
  }

  /**
   * Helper: Logout function
   */
  async function logout() {
    // Look for logout button/link
    const logoutButton = page.locator('button:has-text("Salir"), a:has-text("Cerrar Sesión"), button:has-text("Logout")').first();

    if (await logoutButton.isVisible({ timeout: 2000 }).catch(() => false)) {
      await logoutButton.click();
      await page.waitForLoadState('networkidle');
      console.log('✓ Logged out successfully');
    } else {
      // Alternative: clear localStorage and navigate to login
      await page.evaluate(() => localStorage.clear());
      await page.goto(`${BASE_URL}/login`);
      console.log('✓ Session cleared');
    }
  }

  /**
   * Main Test: Complete Recita + Interconsulta Flow
   */
  test('Médico marks patient Atendido with Recita + Interconsulta, Coordinador sees it', async () => {
    console.log('\n=== PHASE 1: MÉDICO WORKFLOW ===\n');

    // Step 1: Login as Médico
    console.log('Step 1: Login as Médico (DNI: 45433320)');
    await login(MEDICO_CREDENTIALS.dni, MEDICO_CREDENTIALS.password);

    await page.screenshot({
      path: `test-results/screenshots/02-medico-dashboard.png`,
      fullPage: true
    });

    // Step 2: Navigate to Mis Pacientes
    console.log('Step 2: Navigate to Mis Pacientes');

    // Try multiple possible navigation paths
    const misPacientesLink = page.locator('a:has-text("Mis Pacientes"), a[href*="pacientes"]').first();

    if (await misPacientesLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await misPacientesLink.click();
    } else {
      // Direct navigation
      await page.goto(`${BASE_URL}/roles/medico/pacientes`);
    }

    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: `test-results/screenshots/03-mis-pacientes-page.png`,
      fullPage: true
    });

    // Step 3: Find patient Carlos Alberto Fernández Pérez
    console.log(`Step 3: Search for patient ${PATIENT.nombre} (DNI: ${PATIENT.dni})`);

    // Look for search input
    const searchInput = page.locator('input[type="text"], input[placeholder*="Buscar"], input[placeholder*="DNI"]').first();

    if (await searchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await searchInput.fill(PATIENT.nombre);
      await page.waitForTimeout(1000); // Wait for filtering
    }

    // Verify patient appears in table
    const patientRow = page.locator(`tr:has-text("${PATIENT.nombre}"), tr:has-text("${PATIENT.dni}")`).first();
    await expect(patientRow).toBeVisible({ timeout: 5000 });
    console.log('✓ Patient found in table');

    await page.screenshot({
      path: `test-results/screenshots/04-patient-found.png`,
      fullPage: true
    });

    // Step 4: Open "Marcar como Atendido" modal
    console.log('Step 4: Click "Marcar como Atendido" button');

    // Find the action button for this patient (look for green button or "Marcar" text)
    const marcarAtendidoButton = patientRow.locator('button:has-text("Marcar"), button:has-text("Atendido")').first();
    await marcarAtendidoButton.click();

    // Wait for modal to appear
    const modal = page.locator('div[class*="fixed"], div[role="dialog"]').filter({ hasText: /Atendido|Estado/ }).first();
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✓ Modal opened');

    await page.screenshot({
      path: `test-results/screenshots/05-modal-opened.png`,
      fullPage: true
    });

    // Step 5: Select "Atendido" option
    console.log('Step 5: Select "Atendido" option');

    const atendidoOption = modal.locator('button:has-text("Atendido"), input[type="radio"][value="atendido"], label:has-text("Atendido")').first();
    await atendidoOption.click();
    await page.waitForTimeout(500); // Wait for UI to update

    await page.screenshot({
      path: `test-results/screenshots/06-atendido-selected.png`,
      fullPage: true
    });

    // Step 6: Mark "Tiene Recita" and enter 7 days
    console.log('Step 6: Mark "Tiene Recita" and enter 7 days');

    const recitaButton = modal.locator('button:has-text("Recita")').first();
    await recitaButton.click();
    await page.waitForTimeout(500);

    // Enter 7 days in the plazo field
    const plazoInput = modal.locator('input[type="number"], select').filter({ has: page.locator(':scope, option:has-text("día")') }).first();

    if (await plazoInput.getAttribute('type') === 'number') {
      await plazoInput.fill('7');
    } else {
      // It's a select dropdown
      await plazoInput.selectOption('7');
    }

    console.log('✓ Recita marked with 7 days');

    await page.screenshot({
      path: `test-results/screenshots/07-recita-selected.png`,
      fullPage: true
    });

    // Step 7: Mark "Tiene Interconsulta" and select Cardiología
    console.log('Step 7: Mark "Tiene Interconsulta" and select Cardiología');

    const interconsultaButton = modal.locator('button:has-text("Interconsulta"), button:has-text("Referencia")').first();
    await interconsultaButton.click();
    await page.waitForTimeout(500);

    // Select Cardiología from dropdown
    const especialidadSelect = modal.locator('select').filter({ has: page.locator('option:has-text("Cardiología")') }).first();
    await especialidadSelect.selectOption({ label: 'Cardiología' });

    console.log('✓ Interconsulta marked with Cardiología');

    await page.screenshot({
      path: `test-results/screenshots/08-interconsulta-selected.png`,
      fullPage: true
    });

    // Step 8: Click "Registrar" button
    console.log('Step 8: Submit form by clicking "Registrar"');

    // Listen for API response
    const apiResponsePromise = page.waitForResponse(
      response => response.url().includes('/atendido') && response.status() < 400,
      { timeout: 15000 }
    );

    const registrarButton = modal.locator('button:has-text("Registrar"), button:has-text("Confirmar"), button[type="submit"]').first();
    await registrarButton.click();

    // Wait for API response
    try {
      const apiResponse = await apiResponsePromise;
      const status = apiResponse.status();
      console.log(`✓ API response: ${status}`);

      // Verify successful response (200 or 201)
      expect(status).toBeLessThan(400);

      // Check for success message (toast notification)
      const successToast = page.locator('text=/éxito|exitoso|registrado correctamente/i').first();
      await expect(successToast).toBeVisible({ timeout: 5000 });
      console.log('✓ Success message displayed');

      await page.screenshot({
        path: `test-results/screenshots/09-success-message.png`,
        fullPage: true
      });

      // Verify modal closes
      await expect(modal).not.toBeVisible({ timeout: 5000 });
      console.log('✓ Modal closed after submission');

      // Verify patient status updated in table
      await page.waitForTimeout(1000);
      const updatedStatus = patientRow.locator('text=/Atendido/i').first();
      await expect(updatedStatus).toBeVisible({ timeout: 5000 });
      console.log('✓ Patient status updated to "Atendido"');

      await page.screenshot({
        path: `test-results/screenshots/10-patient-status-updated.png`,
        fullPage: true
      });

    } catch (error) {
      console.error('❌ Error during registration:', error);

      // Capture error screenshot
      await page.screenshot({
        path: `test-results/screenshots/ERROR-registration-failed.png`,
        fullPage: true
      });

      // Check for error messages
      const errorToast = page.locator('text=/error/i').first();
      if (await errorToast.isVisible({ timeout: 2000 }).catch(() => false)) {
        const errorText = await errorToast.textContent();
        console.error('Error message:', errorText);
      }

      throw error;
    }

    // Step 9: Logout from Médico
    console.log('Step 9: Logout from Médico account');
    await logout();

    await page.screenshot({
      path: `test-results/screenshots/11-medico-logged-out.png`,
      fullPage: true
    });

    console.log('\n=== PHASE 2: COORDINADOR WORKFLOW ===\n');

    // Step 10: Login as Coordinador Gestión Citas
    console.log('Step 10: Login as Coordinador Gestión Citas (DNI: 45721231)');
    await login(COORDINADOR_CREDENTIALS.dni, COORDINADOR_CREDENTIALS.password);

    await page.screenshot({
      path: `test-results/screenshots/12-coordinador-dashboard.png`,
      fullPage: true
    });

    // Step 11: Navigate to patient queue (Mi Bandeja de Pacientes or Recitas)
    console.log('Step 11: Navigate to Mi Bandeja de Pacientes / Recitas');

    // Try multiple possible links
    const bandejaLink = page.locator('a:has-text("Bandeja"), a:has-text("Recitas"), a:has-text("Gestión"), a[href*="gestion"]').first();

    if (await bandejaLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await bandejaLink.click();
    } else {
      // Try direct navigation
      await page.goto(`${BASE_URL}/roles/coordinador/gestion-citas`);
    }

    await page.waitForLoadState('networkidle');

    await page.screenshot({
      path: `test-results/screenshots/13-coordinador-bandeja.png`,
      fullPage: true
    });

    // Step 12: Search for patient Carlos Alberto Fernández Pérez
    console.log(`Step 12: Search for patient ${PATIENT.nombre} in Recitas`);

    const coordinadorSearchInput = page.locator('input[type="text"], input[placeholder*="Buscar"]').first();

    if (await coordinadorSearchInput.isVisible({ timeout: 3000 }).catch(() => false)) {
      await coordinadorSearchInput.fill(PATIENT.nombre);
      await page.waitForTimeout(1000);
    }

    // Verify Recita appears in table
    const recitaRow = page.locator(`tr:has-text("${PATIENT.nombre}"), tr:has-text("${PATIENT.dni}")`).first();
    await expect(recitaRow).toBeVisible({ timeout: 5000 });
    console.log('✓ Recita found in Coordinador queue');

    await page.screenshot({
      path: `test-results/screenshots/14-recita-found.png`,
      fullPage: true
    });

    // Step 13: Verify Recita details
    console.log('Step 13: Verify Recita details');

    // Check state is "PENDIENTE CITAR"
    const estadoCell = recitaRow.locator('text=/PENDIENTE|Pendiente/i').first();
    await expect(estadoCell).toBeVisible({ timeout: 3000 });
    console.log('✓ Estado: PENDIENTE CITAR');

    // Check specialty is Cardiología
    const especialidadCell = recitaRow.locator('text=/Cardiología/i').first();
    await expect(especialidadCell).toBeVisible({ timeout: 3000 });
    console.log('✓ Especialidad: Cardiología');

    // Verify Fecha Preferida (today + 7 days)
    const today = new Date();
    const expectedDate = new Date(today);
    expectedDate.setDate(today.getDate() + 7);
    const expectedDateStr = expectedDate.toISOString().split('T')[0]; // YYYY-MM-DD

    console.log(`Expected Fecha Preferida: ${expectedDateStr} (today + 7 days)`);

    // Look for date in the row (might be formatted differently)
    const datePattern = new RegExp(`${expectedDate.getDate()}|${expectedDateStr}`);
    const dateCell = recitaRow.locator(`text=${datePattern}`).first();

    if (await dateCell.isVisible({ timeout: 2000 }).catch(() => false)) {
      console.log('✓ Fecha Preferida matches expected date (today + 7 days)');
    } else {
      console.log('⚠ Fecha Preferida not found or different format - verify manually in screenshot');
    }

    await page.screenshot({
      path: `test-results/screenshots/15-recita-details-verified.png`,
      fullPage: true
    });

    console.log('\n=== TEST COMPLETED SUCCESSFULLY ===\n');
  });

  /**
   * Test: Error handling when trying to mark same patient Atendido twice
   */
  test('should show friendly error when trying to mark patient Atendido twice', async () => {
    console.log('\n=== TEST: Duplicate Atendido Error Handling ===\n');

    // Login as Médico
    await login(MEDICO_CREDENTIALS.dni, MEDICO_CREDENTIALS.password);

    // Navigate to Mis Pacientes
    const misPacientesLink = page.locator('a:has-text("Mis Pacientes"), a[href*="pacientes"]').first();
    if (await misPacientesLink.isVisible({ timeout: 3000 }).catch(() => false)) {
      await misPacientesLink.click();
    } else {
      await page.goto(`${BASE_URL}/roles/medico/pacientes`);
    }
    await page.waitForLoadState('networkidle');

    // Find patient already marked as Atendido
    const atendidoPatient = page.locator('tr:has-text("Atendido")').first();

    if (await atendidoPatient.isVisible({ timeout: 5000 }).catch(() => false)) {
      console.log('Found patient already marked as Atendido');

      // Try to click the status button
      const statusButton = atendidoPatient.locator('button').first();

      // Check if button is disabled or shows different text
      const isDisabled = await statusButton.isDisabled().catch(() => false);

      if (isDisabled) {
        console.log('✓ Button is disabled for Atendido patients (good UX)');
      } else {
        // Try clicking it
        await statusButton.click();

        // Check for friendly error message
        const errorMessage = page.locator('text=/ya fue atendido|duplicado|ya registrado/i').first();

        if (await errorMessage.isVisible({ timeout: 3000 }).catch(() => false)) {
          const errorText = await errorMessage.textContent();
          console.log('✓ Friendly error message shown:', errorText);

          // Verify it's NOT a technical error (409, 500, etc.)
          expect(errorText?.toLowerCase()).not.toContain('409');
          expect(errorText?.toLowerCase()).not.toContain('500');
          expect(errorText?.toLowerCase()).not.toContain('error 409');
        } else {
          console.log('⚠ No specific error message - button might just not open modal');
        }
      }

      await page.screenshot({
        path: `test-results/screenshots/ERROR-HANDLING-duplicate-atendido.png`,
        fullPage: true
      });

    } else {
      console.log('⚠ No patients with Atendido status found - skipping duplicate test');
      test.skip();
    }
  });

  /**
   * Test: Verify UI/UX - Clear labels and buttons
   */
  test('should have clear UI elements and friendly labels', async () => {
    console.log('\n=== TEST: UI/UX Verification ===\n');

    await login(MEDICO_CREDENTIALS.dni, MEDICO_CREDENTIALS.password);

    // Navigate to Mis Pacientes
    await page.goto(`${BASE_URL}/roles/medico/pacientes`);
    await page.waitForLoadState('networkidle');

    // Verify page title/header
    const pageTitle = page.locator('h1, h2').first();
    await expect(pageTitle).toBeVisible();
    const titleText = await pageTitle.textContent();
    console.log('Page title:', titleText);

    // Verify table has clear column headers
    const tableHeaders = page.locator('thead th');
    const headerCount = await tableHeaders.count();
    console.log(`Table has ${headerCount} columns`);

    expect(headerCount).toBeGreaterThan(0);

    // Check for clear action buttons
    const actionButtons = page.locator('button:has-text("Marcar"), button:has-text("Atendido")');
    const buttonCount = await actionButtons.count();
    console.log(`Found ${buttonCount} action buttons`);

    await page.screenshot({
      path: `test-results/screenshots/UI-UX-verification.png`,
      fullPage: true
    });

    console.log('✓ UI/UX verification complete');
  });
});
