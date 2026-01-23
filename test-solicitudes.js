/**
 * 🧪 TEST AUTOMATIZADO - Solicitudes de Bolsa v1.6.0
 * Usa Playwright para validar que los datos cargan correctamente
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const CREDENTIALS = {
  username: '44914706',
  password: '@Styp654321'
};

const BASE_URL = 'http://localhost:3000';
const LOGIN_URL = `${BASE_URL}/login`;
const SOLICITUDES_URL = `${BASE_URL}/bolsas/solicitudes`;
const SCREENSHOTS_DIR = './test-screenshots';

// Crear directorio para capturas
if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR);
}

async function runTests() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🧪 TEST AUTOMATIZADO - Solicitudes de Bolsa v1.6.0');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // PASO 1: Ir a login
    console.log('📍 PASO 1: Navegando a login...');
    await page.goto(LOGIN_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '01-login-page.png') });
    console.log('✅ Página de login cargada');

    // PASO 2: Login
    console.log('\n🔐 PASO 2: Iniciando sesión...');
    await page.fill('input[type="text"]', CREDENTIALS.username);
    await page.fill('input[type="password"]', CREDENTIALS.password);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '02-login-filled.png') });

    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' });
    console.log('✅ Login exitoso');

    // PASO 3: Navegar a Solicitudes
    console.log('\n📋 PASO 3: Navegando a Solicitudes de Bolsa...');
    await page.goto(SOLICITUDES_URL, { waitUntil: 'networkidle' });
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '03-solicitudes-loading.png') });
    console.log('✅ Página de solicitudes cargada');

    // PASO 4: Esperar a que la tabla tenga datos
    console.log('\n⏳ PASO 4: Esperando que carguen los datos...');
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    console.log('✅ Tabla con datos encontrada');

    // PASO 5: Contar filas
    console.log('\n📊 PASO 5: Analizando datos de la tabla...');
    const rowCount = await page.locator('table tbody tr').count();
    console.log(`✅ Total filas en tabla: ${rowCount}`);

    if (rowCount === 0) {
      console.error('❌ ERROR: No hay filas en la tabla!');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-error-empty-table.png') });
      return false;
    }

    // PASO 6: Captura de la tabla completa
    console.log('\n📸 PASO 6: Tomando captura de tabla...');
    const tableElement = await page.locator('table');
    await tableElement.screenshot({ path: path.join(SCREENSHOTS_DIR, '04-tabla-completa.png') });
    console.log('✅ Captura de tabla guardada');

    // PASO 7: Obtener datos de las primeras 3 filas
    console.log('\n📋 PASO 7: Extrayendo datos de filas...');
    const filas = await page.locator('table tbody tr').all();

    for (let i = 0; i < Math.min(3, filas.length); i++) {
      const cells = await filas[i].locator('td').all();
      const cellTexts = [];
      for (let cell of cells) {
        cellTexts.push(await cell.textContent());
      }
      console.log(`  Fila ${i + 1}: ${cellTexts.slice(0, 5).join(' | ')}`);
    }

    // PASO 8: Test de API en consola
    console.log('\n🔍 PASO 8: Ejecutando test de API en consola del navegador...');
    const apiTest = await page.evaluate(async () => {
      const token = localStorage.getItem('auth.token');
      const response = await fetch('http://localhost:8080/api/bolsas/solicitudes', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (!response.ok) {
        return { error: `HTTP ${response.status}` };
      }

      const data = await response.json();
      const primera = data[0];

      return {
        total: data.length,
        campos_criticos: {
          cod_estado_cita: primera.cod_estado_cita,
          desc_estado_cita: primera.desc_estado_cita,
          estado_gestion_citas_id: primera.estado_gestion_citas_id,
          paciente_nombre: primera.paciente_nombre,
          paciente_dni: primera.paciente_dni,
          especialidad: primera.especialidad,
          paciente_telefono: primera.paciente_telefono
        },
        campos_todos: Object.keys(primera)
      };
    });

    console.log('\n✅ Respuesta del API:');
    console.log(JSON.stringify(apiTest, null, 2));

    // PASO 9: Validar campos críticos
    console.log('\n✅ PASO 9: Validación de campos críticos...');
    let todoOk = true;

    const camposCriticos = [
      'cod_estado_cita',
      'desc_estado_cita',
      'estado_gestion_citas_id',
      'paciente_nombre',
      'paciente_dni'
    ];

    camposCriticos.forEach(campo => {
      const existe = apiTest.campos_criticos[campo] !== undefined;
      const icono = existe ? '✅' : '❌';
      console.log(`${icono} ${campo}: ${existe ? '✓' : 'FALTA'}`);
      if (!existe) todoOk = false;
    });

    // Captura final
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, '05-test-completo.png') });

    console.log('\n═══════════════════════════════════════════════════════════════');
    if (todoOk && rowCount > 0) {
      console.log('✅ ¡TEST EXITOSO! Todos los campos se cargan correctamente');
      console.log(`   - Total solicitudes: ${apiTest.total}`);
      console.log(`   - Filas en tabla: ${rowCount}`);
      console.log(`   - Primeros campos presentes: ${camposCriticos.join(', ')}`);
    } else {
      console.log('❌ TEST FALLIDO');
      if (rowCount === 0) console.log('   - No hay datos en la tabla');
      if (!todoOk) console.log('   - Faltan campos críticos en el API response');
    }
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log(`📸 Capturas guardadas en: ${SCREENSHOTS_DIR}/`);
    console.log('Archivos:');
    fs.readdirSync(SCREENSHOTS_DIR).forEach(file => {
      console.log(`  - ${file}`);
    });

    return todoOk && rowCount > 0;

  } catch (error) {
    console.error('\n❌ ERROR durante test:', error.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error-screenshot.png') });
    return false;
  } finally {
    await browser.close();
  }
}

// Ejecutar tests
runTests().then(success => {
  process.exit(success ? 0 : 1);
});
