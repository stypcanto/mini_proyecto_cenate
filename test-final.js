/**
 * 🧪 TEST FINAL - Validar que el Estado se muestra completo
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = './test-screenshots-final';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR);
}

async function runFinalTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🧪 TEST FINAL - Validar Estado Completo en Tabla');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Login y navegar
    console.log('🔐 Iniciando sesión...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', '44914706');
    await page.fill('input[type="password"]', '@Styp654321');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    console.log('📋 Navegando a Solicitudes...');
    await page.goto('http://localhost:3000/bolsas/solicitudes', { waitUntil: 'networkidle' });
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    console.log('\n✅ Página cargada. Analizando tabla...\n');

    // Extraer texto del estado de la primera fila
    const firstEstadoCell = await page.locator('table tbody tr:first-child td:nth-child(12)').textContent();
    const firstEstadoBadge = await page.locator('table tbody tr:first-child td:nth-child(12) span').textContent();

    console.log('📊 Primera fila - Columna ESTADO:');
    console.log(`  Texto de celda: "${firstEstadoCell.trim()}"`);
    console.log(`  Texto de badge: "${firstEstadoBadge.trim()}"`);

    // Verificar que NO está truncado
    const isTruncated = firstEstadoBadge.trim() === 'PEN' || firstEstadoBadge.length <= 3;

    if (isTruncated) {
      console.log('\n❌ PROBLEMA: El estado aún está truncado!');
      console.log(`   Esperado: "PENDIENTE_CITA" o similar`);
      console.log(`   Obtenido: "${firstEstadoBadge.trim()}"`);
    } else {
      console.log(`\n✅ ÉXITO: El estado se muestra completo!`);
      console.log(`   ✓ "${firstEstadoBadge.trim()}"`);
    }

    // Contar todas las filas
    const rowCount = await page.locator('table tbody tr').count();
    console.log(`\n📊 Total filas en tabla: ${rowCount}`);

    // Captura
    const tableElement = await page.locator('table');
    await tableElement.screenshot({ path: path.join(SCREENSHOTS_DIR, 'tabla-final.png') });
    console.log('📸 Captura guardada: tabla-final.png');

    // Validar campos en consola
    const validation = await page.evaluate(() => {
      const token = localStorage.getItem('auth.token');
      return {
        token_presente: !!token,
        timestamp: new Date().toISOString()
      };
    });

    console.log('\n✅ Validación completada');
    console.log(`   Token presente: ${validation.token_presente ? '✓' : '✗'}`);
    console.log(`   Timestamp: ${validation.timestamp}`);

    console.log('\n═══════════════════════════════════════════════════════════════');
    if (!isTruncated && rowCount > 0) {
      console.log('✅ ¡TEST FINAL EXITOSO!');
      console.log('   La tabla carga correctamente con estados visibles');
    } else {
      console.log('❌ TEST FALLIDO');
    }
    console.log('═══════════════════════════════════════════════════════════════\n');

    return !isTruncated && rowCount > 0;

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'error.png') });
    return false;
  } finally {
    await browser.close();
  }
}

runFinalTest().then(success => {
  process.exit(success ? 0 : 1);
});
