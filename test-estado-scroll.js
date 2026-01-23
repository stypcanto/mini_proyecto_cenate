/**
 * 🧪 TEST - Scrollear tabla y mostrar columna ESTADO
 */

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const SCREENSHOTS_DIR = './test-screenshots-estado';

if (!fs.existsSync(SCREENSHOTS_DIR)) {
  fs.mkdirSync(SCREENSHOTS_DIR);
}

async function runTest() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🧪 TEST - Scrollear y mostrar columna ESTADO');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Login
    console.log('🔐 Login...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', '44914706');
    await page.fill('input[type="password"]', '@Styp654321');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();

    // Navegar a Solicitudes
    console.log('📋 Navegando a Solicitudes...');
    await page.goto('http://localhost:3000/bolsas/solicitudes', { waitUntil: 'networkidle' });
    await page.waitForSelector('table tbody tr', { timeout: 10000 });

    // Esperar que la tabla esté completamente cargada
    await page.waitForTimeout(2000);

    // CAPTURA 1: Vista inicial (parte izquierda)
    console.log('📸 CAPTURA 1: Vista inicial (izquierda)');
    const table1 = await page.locator('table').boundingBox();
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '01-vista-inicial.png'),
      fullPage: true
    });

    // Scrollear la tabla horizontalmente hacia la derecha
    console.log('➡️ Scrolleando tabla hacia la derecha...');
    const tableContainer = await page.locator('.overflow-x-auto');

    // Scrollear dentro del contenedor de la tabla
    await tableContainer.evaluate(el => {
      el.scrollLeft = el.scrollWidth;
    });

    await page.waitForTimeout(500);

    // CAPTURA 2: Vista con scroll a la derecha (donde está ESTADO)
    console.log('📸 CAPTURA 2: Después del scroll (derecha - ESTADO visible)');
    await page.screenshot({
      path: path.join(SCREENSHOTS_DIR, '02-vista-estado.png'),
      fullPage: true
    });

    // Extraer datos de la columna ESTADO
    console.log('\n📊 Extrayendo datos de ESTADO:');
    const estadoData = await page.evaluate(() => {
      const rows = document.querySelectorAll('table tbody tr');
      const estados = [];

      for (let i = 0; i < Math.min(5, rows.length); i++) {
        const cells = rows[i].querySelectorAll('td');
        const lastCell = cells[cells.length - 4]; // Columna ESTADO (penúltima columna importante)
        if (lastCell) {
          const span = lastCell.querySelector('span');
          const estadoText = span ? span.textContent : 'N/A';
          estados.push({
            fila: i + 1,
            estado: estadoText
          });
        }
      }
      return estados;
    });

    console.log('Primeras 5 filas:');
    estadoData.forEach(item => {
      console.log(`  Fila ${item.fila}: "${item.estado}"`);
    });

    // Validar
    const todoOk = estadoData.every(item => item.estado && item.estado.length > 5);

    console.log('\n═══════════════════════════════════════════════════════════════');
    if (todoOk) {
      console.log('✅ ¡ÉXITO! Los estados se muestran completos');
      console.log(`   Ejemplo: "${estadoData[0].estado}"`);
    } else {
      console.log('❌ Hay problemas con la visualización del estado');
    }
    console.log('═══════════════════════════════════════════════════════════════\n');

    console.log('📸 Capturas guardadas en:', SCREENSHOTS_DIR);
    console.log('   - 01-vista-inicial.png (parte izquierda)');
    console.log('   - 02-vista-estado.png (después de scroll - ESTADO visible)');

    return todoOk;

  } catch (error) {
    console.error('❌ Error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

runTest().then(success => {
  process.exit(success ? 0 : 1);
});
