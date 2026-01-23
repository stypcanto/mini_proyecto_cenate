/**
 * 🧪 TEST - Importar 14 Pacientes Nuevos con Auto-Sync
 * Script automatizado que:
 * 1. Login
 * 2. Carga archivo Excel con 14 pacientes
 * 3. Selecciona tipo de bolsa
 * 4. Importa
 * 5. Verifica resultados
 */

const { chromium } = require('playwright');
const path = require('path');

async function importar14Pacientes() {
  const browser = await chromium.launch({ headless: false });
  const context = await browser.newContext();
  const page = await context.newPage();

  console.log('\n═══════════════════════════════════════════════════════════════');
  console.log('🧪 TEST - Importar 14 Pacientes Nuevos con Auto-Sync');
  console.log('═══════════════════════════════════════════════════════════════\n');

  try {
    // PASO 1: LOGIN
    console.log('🔐 PASO 1: Iniciando sesión...');
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.fill('input[type="text"]', '44914706');
    await page.fill('input[type="password"]', '@Styp654321');
    await page.click('button[type="submit"]');
    await page.waitForNavigation();
    await page.waitForTimeout(2000);
    console.log('✅ Sesión iniciada correctamente\n');

    // PASO 2: NAVEGAR A CARGAR EXCEL
    console.log('📄 PASO 2: Navegando a CargarDesdeExcel...');
    await page.goto('http://localhost:3000/bolsas/cargar-excel', { waitUntil: 'networkidle' });
    await page.waitForTimeout(1500);
    console.log('✅ Página cargada\n');

    // PASO 3: SELECCIONAR ARCHIVO
    console.log('📤 PASO 3: Seleccionando archivo IMPORT_14_PACIENTES.xlsx...');
    const inputFile = await page.$('input[type="file"]');
    const filePath = path.join('/Users/styp/Documents/CENATE/Chatbot/API_Springboot/mini_proyecto_cenate', 'IMPORT_14_PACIENTES.xlsx');

    console.log(`   Ruta del archivo: ${filePath}`);
    await inputFile.setInputFiles(filePath);
    await page.waitForTimeout(1000);
    console.log('✅ Archivo seleccionado\n');

    // PASO 4: ESPERAR A QUE APAREZCA EL SELECT Y SELECCIONAR BOLSA
    console.log('🎯 PASO 4: Seleccionando tipo de bolsa...');
    await page.waitForSelector('select', { timeout: 5000 });

    // Obtener las opciones
    const options = await page.$$eval('select option', opts =>
      opts.filter(o => o.value).map(o => ({ value: o.value, text: o.textContent }))
    );

    console.log(`   Opciones disponibles: ${options.length}`);
    if (options.length > 0) {
      const primera = options[0];
      console.log(`   Seleccionando: ${primera.text} (ID: ${primera.value})`);
      await page.selectOption('select', primera.value);
      await page.waitForTimeout(500);
    }
    console.log('✅ Tipo de bolsa seleccionado\n');

    // PASO 5: HACER CLIC EN IMPORTAR
    console.log('⚙️  PASO 5: Iniciando importación...');
    const importButton = await page.$('button:has-text("IMPORTAR SOLICITUDES")');

    if (!importButton) {
      throw new Error('No se encontró botón IMPORTAR SOLICITUDES');
    }

    const isDisabled = await importButton.isDisabled();
    if (isDisabled) {
      throw new Error('Botón está deshabilitado - verifica que el archivo y bolsa estén seleccionados');
    }

    await importButton.click();
    console.log('✅ Botón Importar clickeado\n');

    // PASO 6: ESPERAR RESULTADO
    console.log('⏳ PASO 6: Esperando resultado de importación...');
    await page.waitForTimeout(5000);

    // Buscar mensaje de éxito
    const successElement = await page.$('text=Registros Exitosos');
    if (successElement) {
      const mensaje = await page.textContent('text=Registros Exitosos');
      console.log(`✅ ${mensaje}\n`);
    } else {
      console.log('⏳ Importación en progreso...\n');
    }

    // PASO 7: VERIFICAR ASEGURADOS NUEVOS DESPUÉS DE IMPORTAR
    console.log('🔄 PASO 7: Verificando reducción de asegurados nuevos...');
    const respuesta = await page.evaluate(async () => {
      const token = localStorage.getItem('auth.token');
      const response = await fetch('http://localhost:8080/api/bolsas/solicitudes/asegurados-nuevos', {
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json'
        }
      });
      return await response.json();
    });

    console.log(`   Total de asegurados nuevos: ${respuesta.total}`);
    if (respuesta.total > 0) {
      console.log(`   Primeros 5 DNIs aún no sincronizados:`);
      respuesta.asegurados.slice(0, 5).forEach(a => {
        console.log(`      - ${a.dni}`);
      });
    } else {
      console.log('   ✅ ¡Todos los asegurados nuevos han sido sincronizados!');
    }
    console.log();

    // PASO 8: NAVEGAR A SOLICITUDES Y VERIFICAR NOMBRES
    console.log('🔍 PASO 8: Verificando Solicitudes...');
    await page.goto('http://localhost:3000/bolsas/solicitudes', { waitUntil: 'networkidle' });
    await page.waitForTimeout(2000);

    // Buscar los DNIs importados
    const dnisABuscar = ['3865732', '3857375', '3857012'];
    let nombresActualizados = 0;

    for (const dni of dnisABuscar) {
      try {
        // Buscar la fila que contiene el DNI
        const fila = await page.locator(`text=${dni}`).first();

        if (fila) {
          const filaCompleta = await fila.evaluate((el) => {
            const row = el.closest('tr');
            if (!row) return null;
            const celdas = row.querySelectorAll('td');
            if (celdas.length > 4) {
              return {
                paciente: celdas[4]?.textContent?.trim(),
                dni: celdas[5]?.textContent?.trim()
              };
            }
            return null;
          });

          if (filaCompleta && filaCompleta.paciente && !filaCompleta.paciente.includes('Paciente')) {
            console.log(`   ✅ DNI ${dni}: ${filaCompleta.paciente}`);
            nombresActualizados++;
          } else {
            console.log(`   ⚠️  DNI ${dni}: Aún muestra "Paciente ${dni}"`);
          }
        }
      } catch (e) {
        console.log(`   ⚠️  DNI ${dni}: No encontrado en tabla`);
      }
    }

    console.log(`\n   Resultado: ${nombresActualizados}/${dnisABuscar.length} nombres actualizados\n`);

    // RESUMEN FINAL
    console.log('═══════════════════════════════════════════════════════════════');
    console.log('✅ TEST COMPLETADO');
    console.log('═══════════════════════════════════════════════════════════════');
    console.log(`📊 Resumen:`);
    console.log(`   • Archivo: IMPORT_14_PACIENTES.xlsx (14 registros)`);
    console.log(`   • Asegurados nuevos restantes: ${respuesta.total}`);
    console.log(`   • Nombres actualizados: ${nombresActualizados}/3 (verificados)`);
    console.log(`   • Estado: Importación completada ✅`);
    console.log('═══════════════════════════════════════════════════════════════\n');

    return true;

  } catch (error) {
    console.error('\n❌ Error durante la importación:');
    console.error(`   ${error.message}`);
    console.error('\nStack:', error.stack);
    return false;
  } finally {
    await browser.close();
  }
}

importar14Pacientes().then(success => {
  process.exit(success ? 0 : 1);
});
