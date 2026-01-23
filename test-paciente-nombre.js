/**
 * 🧪 TEST - Verificar estructura de paciente_nombre en API
 */

const { chromium } = require('playwright');

async function testPacienteNombre() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🧪 TEST - Verificar paciente_nombre en API');
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

    // Obtener los datos del API directamente
    console.log('\n🔍 Obteniendo datos del API...');
    const apiData = await page.evaluate(async () => {
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
      if (data.length > 0) {
        const primera = data[0];
        return {
          total: data.length,
          primeras_3_pacientes: [
            {
              id: data[0].id_solicitud || data[0].id,
              paciente_nombre: data[0].paciente_nombre,
              paciente_dni: data[0].paciente_dni,
              num_solicitud: data[0].numero_solicitud
            },
            {
              id: data[1].id_solicitud || data[1].id,
              paciente_nombre: data[1].paciente_nombre,
              paciente_dni: data[1].paciente_dni,
              num_solicitud: data[1].numero_solicitud
            },
            {
              id: data[2].id_solicitud || data[2].id,
              paciente_nombre: data[2].paciente_nombre,
              paciente_dni: data[2].paciente_dni,
              num_solicitud: data[2].numero_solicitud
            }
          ],
          campos_completos_primera: Object.keys(data[0])
        };
      }
      return { error: 'Sin datos' };
    });

    console.log('\n📊 Respuesta del API:');
    console.log(JSON.stringify(apiData, null, 2));

    if (apiData.primeras_3_pacientes) {
      console.log('\n✅ Datos de Pacientes:');
      apiData.primeras_3_pacientes.forEach((p, idx) => {
        console.log(`\n  Paciente ${idx + 1}:`);
        console.log(`    ID: ${p.id}`);
        console.log(`    Nombre: ${p.paciente_nombre}`);
        console.log(`    DNI: ${p.paciente_dni}`);
        console.log(`    Solicitud: ${p.num_solicitud}`);
      });
    }

    console.log('\n═══════════════════════════════════════════════════════════════\n');
    return true;

  } catch (error) {
    console.error('\n❌ Error:', error.message);
    return false;
  } finally {
    await browser.close();
  }
}

testPacienteNombre().then(success => {
  process.exit(success ? 0 : 1);
});
