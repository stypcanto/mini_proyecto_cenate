/**
 * 🧪 TEST - Verificar endpoint de asegurados nuevos
 */

const { chromium } = require('playwright');

async function testAseguradosNuevos() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🧪 TEST - Endpoint de Asegurados Nuevos');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // Login
    console.log('🔐 Iniciando sesión...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', '44914706');
    await page.fill('input[type="password"]', '@Styp654321');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await page.waitForTimeout(2000);

    // Obtener asegurados nuevos del API
    console.log('\n🔍 Obteniendo asegurados nuevos desde API...');
    const aseguradosNuevos = await page.evaluate(async () => {
      const token = localStorage.getItem('auth.token');
      const response = await fetch('http://localhost:8080/api/bolsas/solicitudes/asegurados-nuevos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });

      if (response.ok) {
        return await response.json();
      }
      return { error: `HTTP ${response.status}` };
    });

    console.log('\n📊 Respuesta del API:');
    console.log(JSON.stringify(aseguradosNuevos, null, 2));

    console.log('\n═══════════════════════════════════════════════════════════════');
    if (aseguradosNuevos.total && aseguradosNuevos.total > 0) {
      console.log('✅ ¡ÉXITO! Endpoint retorna asegurados nuevos');
      console.log(`   Total encontrados: ${aseguradosNuevos.total}`);
      console.log('\n   Asegurados nuevos detectados:');
      aseguradosNuevos.asegurados.forEach((a, i) => {
        console.log(`   ${i + 1}. DNI: ${a.dni}`);
        console.log(`      Estado: ${a.estado_actual}`);
        console.log(`      Solicitudes: ${a.solicitudes_con_este_dni}`);
        console.log(`      Primera solicitud: ${new Date(a.fecha_primera_solicitud).toLocaleDateString('es-PE')}`);
      });
    } else if (aseguradosNuevos.total === 0) {
      console.log('✅ API funciona correctamente');
      console.log(`   No hay asegurados nuevos: ${aseguradosNuevos.mensaje}`);
    } else {
      console.log('❌ Error en API:', aseguradosNuevos.error);
    }
    console.log('═══════════════════════════════════════════════════════════════\n');

    return true;

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testAseguradosNuevos().then(success => {
  process.exit(success ? 0 : 1);
});
