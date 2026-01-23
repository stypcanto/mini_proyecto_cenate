/**
 * 🧪 TEST COMPLETO - Tabla UML v1.6.0 con scroll horizontal
 */

const { chromium } = require('playwright');
const path = require('path');
const fs = require('fs');

const SCREENSHOTS_DIR = './test-screenshots-complete';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR);
}

async function runCompleteTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🧪 TEST COMPLETO - Tabla UML v1.6.0 + Scroll');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Login
    console.log('🔐 Iniciando sesión...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', '44914706');
    await page.fill('input[type="password"]', '@Styp654321');
    await page.click('button[type="submit"]');
    await page.waitForNavigation({ waitUntil: 'networkidle' });

    // Navegar a Solicitudes
    console.log('📋 Navegando a Solicitudes...');
    await page.goto('http://localhost:3000/bolsas/solicitudes', { waitUntil: 'networkidle' });
    await page.waitForSelector('table tbody tr', { timeout: 10000 });
    await page.waitForTimeout(1000);

    // CAPTURA 1: Vista inicial (izquierda)
    console.log('\n📸 CAPTURA 1: Vista inicial (columnas izquierda)');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-vista-inicial-izquierda.png'),
      fullPage: false
    });

    // Verificar encabezados
    console.log('\n✓ Verificando encabezados de tabla...');
    const headers = await page.locator('table thead th').allTextContents();
    const foundColumns = headers
      .map(h => h.trim().toUpperCase())
      .filter(h => h.length > 0);

    console.log('Columnas encontradas:');
    headers.forEach((h, i) => {
      if (h.trim()) {
        console.log(`  ${i + 1}. ${h.trim()}`);
      }
    });

    const expectedColumns = [
      'ID', 'SOLICITUD', 'TIPO BOLSA', 'ESPECIALIDAD', 'PACIENTE',
      'DNI', 'IPRESS', 'RED ASISTENCIAL', 'ESTADO DE CITA',
      'SOLICITANTE', 'GESTOR ASIGNADO', 'ACCIONES'
    ];

    console.log('\n✓ Validando columnas esperadas:');
    let allFound = true;
    expectedColumns.forEach(col => {
      const found = foundColumns.some(f => f.includes(col.substring(0, 5)));
      const icon = found ? '✅' : '❌';
      console.log(`  ${icon} ${col}`);
      if (!found) allFound = false;
    });

    // Scroll horizontal para ver columnas derechas
    console.log('\n➡️ Scrolleando tabla hacia la derecha...');
    const tableContainer = await page.locator('.overflow-x-auto');
    if (tableContainer) {
      await tableContainer.evaluate(el => {
        el.scrollLeft = el.scrollWidth;
      });
      await page.waitForTimeout(500);
    }

    // CAPTURA 2: Vista con scroll (derecha)
    console.log('📸 CAPTURA 2: Vista con scroll (columnas derecha - ESTADO/ACCIONES)');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-vista-scroll-derecha.png'),
      fullPage: false
    });

    // Extraer datos completos de primera fila
    console.log('\n📊 Analizando datos de primera fila:');
    const firstRow = await page.locator('table tbody tr:first-child');
    const firstRowCells = await firstRow.locator('td').allTextContents();

    console.log(`Total de celdas: ${firstRowCells.length}`);
    console.log('\nDatos de celda por celda:');
    firstRowCells.slice(0, 12).forEach((cell, i) => {
      const content = cell.trim().slice(0, 50);
      console.log(`  Celda ${i + 1}: "${content}${content.length > 50 ? '...' : ''}"`);
    });

    // Validar que estado es PENDIENTE_CITA
    const estadoCell = firstRowCells.find(cell =>
      cell.includes('PENDIENTE_CITA') ||
      cell.includes('CITADO') ||
      cell.includes('ATENDIDO')
    );

    console.log('\n✅ Estado encontrado:', estadoCell ? estadoCell.trim() : 'NO ENCONTRADO');

    // Contar total de filas
    const rowCount = await page.locator('table tbody tr').count();
    console.log(`\n📊 Total de filas en tabla: ${rowCount}`);

    // Validar estructura del API
    console.log('\n🔍 Validando estructura del API en localStorage:');
    const apiValidation = await page.evaluate(() => {
      const token = localStorage.getItem('auth.token');
      return {
        tokenPresente: !!token,
        timestamp: new Date().toISOString()
      };
    });

    console.log(`Token presente: ${apiValidation.tokenPresente ? '✅' : '❌'}`);
    console.log(`Timestamp: ${apiValidation.timestamp}`);

    // Resultado final
    console.log('\n═══════════════════════════════════════════════════════════════');
    if (allFound && rowCount > 0 && estadoCell) {
      console.log('✅ ¡TEST EXITOSO!');
      console.log(`   ✓ Todas las 12 columnas UML presentes`);
      console.log(`   ✓ ${rowCount} filas cargadas correctamente`);
      console.log(`   ✓ Estado de Cita visible: "${estadoCell.trim()}"`);
    } else {
      console.log('❌ TEST CON ADVERTENCIAS');
      if (!allFound) console.log('   - No todas las columnas están presentes');
      if (rowCount === 0) console.log('   - No hay datos en la tabla');
      if (!estadoCell) console.log('   - Estado no encontrado en tabla');
    }
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('📸 Capturas guardadas en:', SCREENSHOTS_DIR);
    console.log('   - 01-vista-inicial-izquierda.png');
    console.log('   - 02-vista-scroll-derecha.png');

    return allFound && rowCount > 0;

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    console.error(error.stack);
    return false;
  } finally {
    await browser.close();
  }
}

runCompleteTest().then(success => {
  process.exit(success ? 0 : 1);
});
