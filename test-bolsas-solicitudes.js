const { chromium } = require('@playwright/test');
const fs = require('fs');
const path = require('path');

async function runTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  // Crear directorio para screenshots
  const screenshotsDir = './.playwright-test-bolsas';
  if (!fs.existsSync(screenshotsDir)) {
    fs.mkdirSync(screenshotsDir);
  }

  try {
    console.log('=== TEST: Solicitudes de Bolsas ===\n');

    // PASO 1: Navegar a login
    console.log('1. Navegando a http://localhost:3000/bolsas/solicitudes...');
    await page.goto('http://localhost:3000/bolsas/solicitudes', { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(1000);

    let currentUrl = page.url();
    console.log(`   URL actual: ${currentUrl}`);

    // Detectar si necesitamos login
    if (currentUrl.includes('/login')) {
      console.log('   ✓ Redireccionado a login (esperado)');

      // PASO 2: Llenar formulario de login
      console.log('\n2. Ejecutando login...');

      // Esperar campos del formulario
      await page.waitForSelector('input[type="text"]', { timeout: 5000 });

      // Llenar usuario
      const userInput = await page.locator('input[type="text"]').first();
      await userInput.fill('44914706');
      console.log('   ✓ Usuario ingresado');

      await page.waitForTimeout(500);

      // Llenar contraseña
      const passwordInput = await page.locator('input[type="password"]').first();
      await passwordInput.fill('@Cenate2025');
      console.log('   ✓ Contraseña ingresada');

      await page.waitForTimeout(500);

      // Tomar captura del formulario
      await page.screenshot({ path: path.join(screenshotsDir, '01-login-form.png') });

      // Click en botón Iniciar Sesión
      const loginButton = await page.locator('button:has-text("Iniciar Sesión"), button:has-text("Iniciar"), button:has-text("Login")').first();
      await loginButton.click();
      console.log('   ✓ Botón de login clickeado');

      // Esperar a que se procese el login (no necesariamente redirección)
      await page.waitForTimeout(3000);

      // Tomar captura después del click
      await page.screenshot({ path: path.join(screenshotsDir, '02-after-login.png') });

      currentUrl = page.url();
      console.log(`   URL después de login: ${currentUrl}`);

      // Verificar si hay mensaje de error
      const errorMsg = await page.locator('[role="alert"], .error, .alert-error, [class*="error"]').first().isVisible().catch(() => false);
      if (errorMsg) {
        const errorText = await page.locator('[role="alert"], .error, .alert-error, [class*="error"]').first().textContent();
        console.log(`   ⚠ Mensaje de error encontrado: ${errorText}`);
      }

      // Si seguimos en login, intentar esperar más tiempo o usar otro método
      if (currentUrl.includes('/login')) {
        console.log('   ⚠ Aún en página de login, esperando redirección...');
        try {
          await page.waitForURL('**/bolsas/**', { timeout: 10000 });
          console.log('   ✓ Redirección exitosa');
        } catch (e) {
          console.log('   ⚠ No se redirecciono a /bolsas/, intentando cargar página directamente');
          await page.goto('http://localhost:3000/bolsas/solicitudes', { waitUntil: 'domcontentloaded' });
          await page.waitForTimeout(2000);
        }
      }
    } else if (currentUrl.includes('/bolsas')) {
      console.log('   ✓ Ya estamos en /bolsas (ya autenticado)');
    } else {
      console.log(`   ⚠ URL inesperada: ${currentUrl}`);
      await page.goto('http://localhost:3000/bolsas/solicitudes', { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(2000);
    }

    // PASO 3: Esperar que carguen los datos
    console.log('\n3. Esperando que carguen los datos de solicitudes...');
    await page.waitForTimeout(2000);

    let errorInConsole = false;

    // Capturar errores de consola
    page.on('console', msg => {
      if (msg.type() === 'error') {
        console.error(`   ⚠ ERROR EN CONSOLA: ${msg.text()}`);
        errorInConsole = true;
      }
    });

    // Buscar filas de datos
    const rows = await page.locator('tr, [role="row"]').count();
    console.log(`   ✓ Encontradas ${rows} filas en total (incluyendo header)`);

    // PASO 4: Tomar captura de pantalla
    console.log('\n4. Tomando captura de pantalla de la página...');
    const screenshot = path.join(screenshotsDir, '03-bolsas-solicitudes-loaded.png');
    await page.screenshot({ path: screenshot, fullPage: true });
    console.log(`   ✓ Captura guardada en: ${screenshot}`);

    // PASO 5: Ejecutar validación en consola
    console.log('\n5. Ejecutando validación de API en consola del navegador...');

    const validationResult = await page.evaluate(async () => {
      return new Promise(async (resolve) => {
        const token = localStorage.getItem('auth.token');

        console.log('DEBUG: Token en localStorage:', token ? 'presente' : 'ausente');

        if (!token) {
          resolve({ error: 'No se encontró token en localStorage', token: null });
          return;
        }

        try {
          console.log('DEBUG: Llamando a API de bolsas...');
          const response = await fetch('http://localhost:8080/api/bolsas/solicitudes', {
            headers: { 'Authorization': `Bearer ${token}` }
          });

          console.log('DEBUG: API response status:', response.status);

          if (!response.ok) {
            const errorText = await response.text();
            resolve({ error: `API retornó status ${response.status}`, details: errorText });
            return;
          }

          const data = await response.json();
          console.log('DEBUG: API data length:', Array.isArray(data) ? data.length : 'not array');

          if (!Array.isArray(data) || data.length === 0) {
            resolve({ error: 'API no retornó datos', total: 0, data: data });
            return;
          }

          const primera = data[0];
          console.log('DEBUG: Primera solicitud:', JSON.stringify(primera, null, 2));

          resolve({
            total: data.length,
            cod_estado_cita: primera.cod_estado_cita,
            desc_estado_cita: primera.desc_estado_cita,
            estado_gestion_citas_id: primera.estado_gestion_citas_id,
            paciente_nombre: primera.paciente_nombre,
            paciente_dni: primera.paciente_dni,
            paciente_telefono: primera.paciente_telefono,
            especialidad: primera.especialidad,
            bolsa_tipo_id: primera.bolsa_tipo_id,
            fecha_registro: primera.fecha_registro,
            success: true
          });
        } catch (err) {
          console.error('ERROR en evaluación:', err);
          resolve({ error: `Excepción en API: ${err.message}`, stack: err.stack });
        }
      });
    });

    console.log('\n   RESULTADO DE VALIDACIÓN API:');
    console.log('   ' + JSON.stringify(validationResult, null, 2).split('\n').join('\n   '));

    // PASO 6: Validaciones
    console.log('\n6. VALIDACIONES:');

    const validations = {
      'Token presente en localStorage': validationResult.token || validationResult.success ? '✓' : '✗',
      'API retorna datos': validationResult.total > 0 ? '✓' : '✗',
      'cod_estado_cita presente': validationResult.cod_estado_cita !== undefined ? '✓' : '✗',
      'desc_estado_cita presente': validationResult.desc_estado_cita !== undefined ? '✓' : '✗',
      'estado_gestion_citas_id presente': validationResult.estado_gestion_citas_id !== undefined ? '✓' : '✗',
      'paciente_nombre presente': validationResult.paciente_nombre !== undefined ? '✓' : '✗',
      'paciente_dni presente': validationResult.paciente_dni !== undefined ? '✓' : '✗',
      'Sin errores en consola': !errorInConsole ? '✓' : '✗'
    };

    Object.entries(validations).forEach(([label, status]) => {
      console.log(`   ${status} ${label}`);
    });

    // PASO 7: Reporte final
    console.log('\n=== REPORTE FINAL ===');
    const allPassed = Object.values(validations).every(v => v === '✓');

    if (allPassed && validationResult.total > 0) {
      console.log('✓ TODOS LOS TESTS PASARON');
      console.log(`✓ Total de solicitudes: ${validationResult.total}`);
      console.log(`✓ Primera solicitud:`);
      console.log(`  - DNI: ${validationResult.paciente_dni}`);
      console.log(`  - Nombre: ${validationResult.paciente_nombre}`);
      console.log(`  - Estado: ${validationResult.desc_estado_cita || validationResult.cod_estado_cita}`);
      console.log(`  - Especialidad: ${validationResult.especialidad}`);
      console.log(`  - Teléfono: ${validationResult.paciente_telefono}`);
    } else {
      console.log('⚠ ALGUNOS TESTS FALLARON');
      if (validationResult.error) {
        console.log(`✗ Error: ${validationResult.error}`);
        if (validationResult.details) {
          console.log(`   Detalles: ${validationResult.details}`);
        }
      }
      console.log('\nDatos completos de validación:');
      console.log(JSON.stringify(validationResult, null, 2));
    }

    console.log(`\nCaptura de pantalla principal: ${screenshot}`);
    console.log(`\nTodas las capturas guardadas en: ${path.resolve(screenshotsDir)}`);

  } catch (error) {
    console.error(`\n✗ ERROR DURANTE EL TEST: ${error.message}`);
    console.error(error.stack);

    // Tomar captura de error
    try {
      const errorScreenshot = path.join('./.playwright-test-bolsas', 'error-final.png');
      await page.screenshot({ path: errorScreenshot, fullPage: true });
      console.log(`   Captura de error guardada en: ${errorScreenshot}`);
    } catch (screenshotError) {
      console.error('No se pudo guardar captura de error');
    }
  } finally {
    await browser.close();
    console.log('\n✓ Navegador cerrado');
  }
}

runTest().catch(console.error);
