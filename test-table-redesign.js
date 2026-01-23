/**
 * 🧪 TEST - Verificar rediseño de tabla v1.6.0
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = './test-screenshots-redesign';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR);
}

async function runTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🧪 TEST - Rediseño de Tabla v1.6.0');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Login
    console.log('🔐 Iniciando sesión...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', '44914706');
    await page.fill('input[type="password"]', '@Styp654321');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    // Navegar a Solicitudes
    console.log('📋 Navegando a Solicitudes...');
    await page.goto('http://localhost:3000/bolsas/solicitudes', { waitUntil: 'networkidle' });
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // Verificar encabezados
    console.log('\n✓ Verificando encabezados de tabla...');
    const headers = await page.locator('table thead th').allTextContents();
    console.log('Columnas encontradas:');
    headers.forEach((h, i) => {
      if (h.trim()) {
        console.log(`  ${i + 1}. ${h.trim()}`);
      }
    });

    // Verificar que tenga las columnas esperadas
    const expectedColumns = [
      'ID', 'SOLICITUD', 'TIPO BOLSA', 'ESPECIALIDAD', 'PACIENTE',
      'DNI', 'IPRESS', 'RED ASISTENCIAL', 'ESTADO DE CITA',
      'SOLICITANTE', 'GESTOR ASIGNADO', 'ACCIONES'
    ];

    const foundColumns = headers
      .map(h => h.trim().toUpperCase())
      .filter(h => h.length > 0);

    console.log('\n✓ Validando columnas esperadas:');
    expectedColumns.forEach(col => {
      const found = foundColumns.some(f => f.includes(col.substring(0, 5)));
      const icon = found ? '✅' : '❌';
      console.log(`  ${icon} ${col}`);
    });

    // Captura de la tabla
    console.log('\n📸 Capturando tabla...');
    const table = await page.locator('table');
    await table.screenshot({ path: path.join(SCREENSHOTS_DIR, 'tabla-redesign.png') });

    // Extraer datos de primeras 3 filas
    console.log('\n📊 Datos de primeras 3 filas:');
    const rows = await page.locator('table tbody tr').all();

    for (let i = 0; i < Math.min(3, rows.length); i++) {
      const cells = await rows[i].locator('td').allTextContents();
      const cellsClean = cells.map(c => c.trim()).filter(c => c && c.length > 0);

      console.log(`\nFila ${i + 1}:`);
      console.log(`  ID: ${cellsClean[1] || 'N/A'}`);
      console.log(`  Solicitud: ${cellsClean[2] || 'N/A'}`);
      console.log(`  Tipo Bolsa: ${cellsClean[3] || 'N/A'}`);
      console.log(`  Especialidad: ${cellsClean[4] || 'N/A'}`);
      console.log(`  Paciente: ${cellsClean[5] || 'N/A'}`);
      console.log(`  DNI: ${cellsClean[6] || 'N/A'}`);
      console.log(`  IPRESS: ${cellsClean[7] || 'N/A'}`);
      console.log(`  Red: ${cellsClean[8] || 'N/A'}`);
      console.log(`  Estado: ${cellsClean[9] || 'N/A'}`);
    }

    console.log('\n═══════════════════════════════════════════════════════════════');
    console.log('✅ Test completado');
    console.log('📸 Captura guardada: test-screenshots-redesign/tabla-redesign.png');
    console.log('═══════════════════════════════════════════════════════════════\n');

    return true;

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

runTest().then(success => {
  process.exit(success ? 0 : 1);
});
