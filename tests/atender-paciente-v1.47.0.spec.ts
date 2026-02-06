import { test, expect, Page } from '@playwright/test';

/**
 * Test Suite: v1.47.0 "Atender Paciente" Feature
 *
 * This test validates the fix for conditional validation in the backend:
 * - Backend now only requires interconsultaEspecialidad if tieneInterconsulta is true
 * - Backend only requires enfermedades if esCronico is true
 * - Medical actions (Recita, Referencia, Crónico) are OPTIONAL
 *
 * Test Flow:
 * 1. Login as MEDICO role
 * 2. Navigate to "Mis Pacientes" page
 * 3. Open patient status modal
 * 4. Select "Atendido" radio button
 * 5. Verify three optional action buttons appear
 * 6. Do NOT select any actions
 * 7. Click "Confirmar" button
 * 8. Verify request succeeds (HTTP 200)
 * 9. Verify modal closes
 * 10. Verify patient status updates to "Atendido"
 */

const BASE_URL = 'http://localhost:3000';
const API_BASE_URL = 'http://localhost:8080/api';

// Test credentials - Replace with actual test user credentials
const TEST_MEDICO = {
  username: 'medico_test',
  password: 'test123',
  // If you need a real token for testing, replace this
  token: null as string | null
};

test.describe('v1.47.0 - Atender Paciente Feature', () => {
  let page: Page;

  test.beforeEach(async ({ browser }) => {
    page = await browser.newPage();

    // Set up console listeners for debugging
    page.on('console', msg => {
      const type = msg.type();
      if (['error', 'warning'].includes(type)) {
        console.log(`[Browser ${type}]:`, msg.text());
      }
    });

    // Listen for API responses
    page.on('response', response => {
      if (response.url().includes('/gestion-pacientes/') && response.url().includes('/atendido')) {
        console.log(`[API Response] ${response.status()} ${response.url()}`);
      }
    });
  });

  test.afterEach(async () => {
    await page.close();
  });

  /**
   * Helper: Login as MEDICO role
   */
  async function loginAsMedico() {
    await page.goto(`${BASE_URL}/login`);
    await page.waitForLoadState('networkidle');

    // Fill login form
    await page.fill('input[name="username"], input[type="text"]', TEST_MEDICO.username);
    await page.fill('input[name="password"], input[type="password"]', TEST_MEDICO.password);

    // Click login button
    const loginButton = page.locator('button[type="submit"], button:has-text("Iniciar")');
    await loginButton.click();

    // Wait for successful login (redirects to dashboard)
    await page.waitForURL('**/dashboard', { timeout: 10000 });

    // Store token if available
    const token = await page.evaluate(() => localStorage.getItem('token'));
    if (token) {
      TEST_MEDICO.token = token;
    }
  }

  /**
   * Helper: Navigate to Mis Pacientes page
   */
  async function navigateToMisPacientes() {
    // Click on sidebar menu item or direct navigation
    await page.goto(`${BASE_URL}/roles/medico/pacientes`);
    await page.waitForLoadState('networkidle');

    // Verify we're on the correct page
    await expect(page.locator('text=/Mis Pacientes|Pacientes/i')).toBeVisible({ timeout: 5000 });
  }

  /**
   * Main Test: Atender Paciente Without Optional Actions
   */
  test('should successfully mark patient as Atendido without selecting optional actions', async () => {
    // Step 1: Login
    await loginAsMedico();
    console.log('✓ Logged in as MEDICO');

    // Step 2: Navigate to Mis Pacientes page
    await navigateToMisPacientes();
    console.log('✓ Navigated to Mis Pacientes page');

    // Step 3: Wait for patient table to load
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    const patientRows = page.locator('table tbody tr');
    const patientCount = await patientRows.count();

    expect(patientCount).toBeGreaterThan(0);
    console.log(`✓ Found ${patientCount} patient(s) in table`);

    // Step 4: Click on the first patient's status button to open modal
    const firstPatientStatusButton = patientRows.first().locator('button', { hasText: /Pendiente|Citado|Atendido/ });
    await firstPatientStatusButton.click();
    console.log('✓ Clicked patient status button');

    // Step 5: Wait for modal to appear
    const modal = page.locator('div[class*="fixed inset-0"]').filter({ hasText: /Atendido|Pendiente|Deserción/ });
    await expect(modal).toBeVisible({ timeout: 5000 });
    console.log('✓ Patient status modal opened');

    // Step 6: Select "Atendido" radio button
    const atendidoButton = modal.locator('button:has-text("Atendido")');
    await atendidoButton.click();
    console.log('✓ Selected "Atendido" option');

    // Step 7: Verify that the three optional action buttons appear
    await expect(modal.locator('text=/Recita/i')).toBeVisible({ timeout: 3000 });
    await expect(modal.locator('text=/Referencia/i')).toBeVisible({ timeout: 3000 });
    await expect(modal.locator('text=/Crónico/i')).toBeVisible({ timeout: 3000 });
    console.log('✓ Three optional action buttons (Recita, Referencia, Crónico) are visible');

    // Step 8: Do NOT click any of the optional actions (they should remain unselected)
    // Verify default states
    const recitaButton = modal.locator('button:has-text("Recita")');
    const referenciaButton = modal.locator('button:has-text("Referencia")');
    const cronicoButton = modal.locator('button:has-text("Crónico")');

    // Check they are not in active state (should have gray background, not colored)
    await expect(recitaButton).not.toHaveClass(/bg-green-100/);
    await expect(referenciaButton).not.toHaveClass(/bg-blue-100/);
    await expect(cronicoButton).not.toHaveClass(/bg-purple-100/);
    console.log('✓ Optional actions are NOT selected (default state)');

    // Step 9: Capture network request when clicking Confirmar
    const apiRequestPromise = page.waitForRequest(
      request => request.url().includes('/atendido') && request.method() === 'POST',
      { timeout: 5000 }
    );

    const apiResponsePromise = page.waitForResponse(
      response => response.url().includes('/atendido') && response.status() === 200,
      { timeout: 10000 }
    );

    // Click "Confirmar" button
    const confirmarButton = modal.locator('button:has-text("Confirmar")');
    await confirmarButton.click();
    console.log('✓ Clicked "Confirmar" button');

    // Step 10: Wait for API request and verify payload
    try {
      const apiRequest = await apiRequestPromise;
      const requestBody = apiRequest.postDataJSON();

      console.log('📤 Request payload:', JSON.stringify(requestBody, null, 2));

      // Verify payload has correct structure with all options as false/null
      expect(requestBody).toHaveProperty('tieneRecita', false);
      expect(requestBody).toHaveProperty('tieneInterconsulta', false);
      expect(requestBody).toHaveProperty('esCronico', false);
      console.log('✓ Request payload is correct (all optional actions are false)');

      // Step 11: Verify response is 200 OK
      const apiResponse = await apiResponsePromise;
      expect(apiResponse.status()).toBe(200);
      console.log(`✓ API responded with status: ${apiResponse.status()}`);

      // Parse response body
      const responseBody = await apiResponse.json();
      console.log('📥 Response body:', JSON.stringify(responseBody, null, 2));

    } catch (error) {
      console.error('❌ API request/response error:', error);
      throw error;
    }

    // Step 12: Verify modal closes after successful submission
    await expect(modal).not.toBeVisible({ timeout: 5000 });
    console.log('✓ Modal closed after successful submission');

    // Step 13: Verify patient status in table updates to "Atendido"
    // Wait for table to refresh
    await page.waitForTimeout(1000);

    const updatedPatientStatus = patientRows.first().locator('button', { hasText: 'Atendido' });
    await expect(updatedPatientStatus).toBeVisible({ timeout: 5000 });
    console.log('✓ Patient status updated to "Atendido" in table');

    // Step 14: Verify statistics updated (optional)
    const atendidosCount = page.locator('text=/Atendidos/i').locator('..').locator('text=/\\d+/');
    const count = await atendidosCount.textContent();
    expect(parseInt(count || '0')).toBeGreaterThan(0);
    console.log(`✓ Statistics updated: ${count} Atendidos`);
  });

  /**
   * Test: Verify Atendido with only Recita selected
   */
  test('should successfully mark patient as Atendido with only Recita selected', async () => {
    await loginAsMedico();
    await navigateToMisPacientes();

    const patientRows = page.locator('table tbody tr');
    await expect(patientRows.first()).toBeVisible({ timeout: 10000 });

    // Open modal
    const firstPatientStatusButton = patientRows.first().locator('button', { hasText: /Pendiente|Citado/ });

    // If all patients are already Atendido, skip this test
    if (await firstPatientStatusButton.count() === 0) {
      test.skip();
      return;
    }

    await firstPatientStatusButton.click();

    const modal = page.locator('div[class*="fixed inset-0"]').filter({ hasText: /Atendido/ });
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Select Atendido
    const atendidoButton = modal.locator('button:has-text("Atendido")');
    await atendidoButton.click();

    // Select Recita
    const recitaButton = modal.locator('button:has-text("Recita")');
    await recitaButton.click();
    console.log('✓ Selected Recita option');

    // Verify Recita is in active state
    await expect(recitaButton).toHaveClass(/bg-green-100/);

    // Verify Recita details expanded (plazo dropdown should be visible)
    const plazoDropdown = modal.locator('select').filter({ has: page.locator('option:has-text("días")') });
    await expect(plazoDropdown).toBeVisible({ timeout: 3000 });
    console.log('✓ Recita details expanded');

    // Capture API request
    const apiResponsePromise = page.waitForResponse(
      response => response.url().includes('/atendido') && response.status() === 200,
      { timeout: 10000 }
    );

    // Click Confirmar
    const confirmarButton = modal.locator('button:has-text("Confirmar")');
    await confirmarButton.click();

    // Verify response
    const apiResponse = await apiResponsePromise;
    expect(apiResponse.status()).toBe(200);
    console.log('✓ API responded successfully with Recita payload');

    // Verify modal closes
    await expect(modal).not.toBeVisible({ timeout: 5000 });
  });

  /**
   * Test: Error handling when network fails
   */
  test('should show error message when API request fails', async () => {
    await loginAsMedico();
    await navigateToMisPacientes();

    const patientRows = page.locator('table tbody tr');
    await expect(patientRows.first()).toBeVisible({ timeout: 10000 });

    // Open modal
    const firstPatientStatusButton = patientRows.first().locator('button', { hasText: /Pendiente|Citado/ });

    if (await firstPatientStatusButton.count() === 0) {
      test.skip();
      return;
    }

    await firstPatientStatusButton.click();

    const modal = page.locator('div[class*="fixed inset-0"]').filter({ hasText: /Atendido/ });
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Select Atendido
    const atendidoButton = modal.locator('button:has-text("Atendido")');
    await atendidoButton.click();

    // Mock API failure
    await page.route('**/gestion-pacientes/**/atendido', route => {
      route.fulfill({
        status: 500,
        body: JSON.stringify({ message: 'Internal Server Error' })
      });
    });

    // Click Confirmar
    const confirmarButton = modal.locator('button:has-text("Confirmar")');
    await confirmarButton.click();

    // Verify error toast appears
    const errorToast = page.locator('text=/Error al registrar atención/i');
    await expect(errorToast).toBeVisible({ timeout: 5000 });
    console.log('✓ Error message displayed correctly');
  });

  /**
   * Test: Verify modal can be cancelled
   */
  test('should close modal when clicking Cancel button', async () => {
    await loginAsMedico();
    await navigateToMisPacientes();

    const patientRows = page.locator('table tbody tr');
    await expect(patientRows.first()).toBeVisible({ timeout: 10000 });

    // Open modal
    const firstPatientStatusButton = patientRows.first().locator('button');
    await firstPatientStatusButton.click();

    const modal = page.locator('div[class*="fixed inset-0"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Click Cancel button
    const cancelButton = modal.locator('button:has-text("Cancelar")');
    await cancelButton.click();

    // Verify modal closes without API call
    await expect(modal).not.toBeVisible({ timeout: 3000 });
    console.log('✓ Modal closed when Cancel clicked');
  });

  /**
   * Test: Verify X button closes modal
   */
  test('should close modal when clicking X button', async () => {
    await loginAsMedico();
    await navigateToMisPacientes();

    const patientRows = page.locator('table tbody tr');
    await expect(patientRows.first()).toBeVisible({ timeout: 10000 });

    // Open modal
    const firstPatientStatusButton = patientRows.first().locator('button');
    await firstPatientStatusButton.click();

    const modal = page.locator('div[class*="fixed inset-0"]');
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Click X button in header
    const closeButton = modal.locator('button[title="Cerrar"]');
    await closeButton.click();

    // Verify modal closes
    await expect(modal).not.toBeVisible({ timeout: 3000 });
    console.log('✓ Modal closed when X button clicked');
  });

  /**
   * Test: Verify loading state during API request
   */
  test('should show loading state while processing', async () => {
    await loginAsMedico();
    await navigateToMisPacientes();

    const patientRows = page.locator('table tbody tr');
    await expect(patientRows.first()).toBeVisible({ timeout: 10000 });

    // Open modal
    const firstPatientStatusButton = patientRows.first().locator('button', { hasText: /Pendiente|Citado/ });

    if (await firstPatientStatusButton.count() === 0) {
      test.skip();
      return;
    }

    await firstPatientStatusButton.click();

    const modal = page.locator('div[class*="fixed inset-0"]').filter({ hasText: /Atendido/ });
    await expect(modal).toBeVisible({ timeout: 5000 });

    // Select Atendido
    const atendidoButton = modal.locator('button:has-text("Atendido")');
    await atendidoButton.click();

    // Slow down the API to see loading state
    await page.route('**/gestion-pacientes/**/atendido', async route => {
      await new Promise(resolve => setTimeout(resolve, 2000));
      await route.continue();
    });

    // Click Confirmar
    const confirmarButton = modal.locator('button:has-text("Confirmar")');
    await confirmarButton.click();

    // Verify loading state appears
    const loadingText = modal.locator('text=/Procesando/i');
    await expect(loadingText).toBeVisible({ timeout: 1000 });
    console.log('✓ Loading state displayed');

    // Verify button is disabled during processing
    await expect(confirmarButton).toBeDisabled();
    console.log('✓ Confirmar button disabled during processing');
  });
});

/**
 * Accessibility Tests
 */
test.describe('v1.47.0 - Accessibility Tests', () => {
  test('modal should be keyboard navigable', async ({ page }) => {
    // This would require login helper
    // Skipped for now - implement if needed
    test.skip();
  });

  test('modal should have proper aria labels', async ({ page }) => {
    // This would require login helper
    // Skipped for now - implement if needed
    test.skip();
  });
});
