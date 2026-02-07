import { test } from '@playwright/test';

test('Diagnose /teleekgs/ipress-workspace layout', async ({ page }) => {
  page.setViewportSize({ width: 1400, height: 900 });

  console.log('\n🔍 === DIAGNÓSTICO DE LAYOUT ===\n');

  // Solo tomar screenshot sin navegar (el usuario ya está logueado)
  // Simular que estamos en localhost:3000/teleekgs/ipress-workspace

  // Verificar si la página actual muestra contenido
  const bodyText = await page.locator('body').textContent();

  if (!bodyText || bodyText.includes('login') || bodyText.includes('Login')) {
    console.log('⚠️ Página de login detectada - usuario no autenticado en Playwright');
    console.log('📝 Por favor accede manualmente a localhost:3000/teleekgs/ipress-workspace en tu navegador');
    return;
  }

  console.log('✅ Página cargada (usuario autenticado manualmente)');

  // ============================================
  // ANALIZAR ESTRUCTURA DE PÁGINA
  // ============================================

  console.log('\n🏗️ Analizando estructura HTML:');

  // Buscar divs principales
  const allDivs = await page.locator('div').count();
  console.log(`  Total divs: ${allDivs}`);

  // Buscar main sections
  const mainContent = await page.locator('main').first();
  const hasMain = await mainContent.isVisible();
  console.log(`  <main> element: ${hasMain ? 'SÍ' : 'NO'}`);

  // ============================================
  // BUSCAR ELEMENTOS ESPECÍFICOS
  // ============================================

  console.log('\n🔎 Buscando elementos:');

  // Headers/titles
  const h1Count = await page.locator('h1').count();
  const h2Count = await page.locator('h2').count();
  const h3Count = await page.locator('h3').count();

  console.log(`  H1 tags: ${h1Count}`);
  console.log(`  H2 tags: ${h2Count}`);
  console.log(`  H3 tags: ${h3Count}`);

  // Mostrar primeros 5 headings
  const allHeadings = await page.locator('h1, h2, h3, h4').all();
  console.log(`  Primeros headings:`);
  for (let i = 0; i < Math.min(5, allHeadings.length); i++) {
    const text = await allHeadings[i].textContent();
    const tag = await allHeadings[i].evaluate(el => el.tagName);
    console.log(`    ${i + 1}. <${tag}> ${text?.substring(0, 60)}`);
  }

  // ============================================
  // VERIFICAR LAYOUT
  // ============================================

  console.log('\n📐 Verificando layout:');

  // Buscar grid
  const gridElements = await page.locator('[class*="grid"]').all();
  console.log(`  Grid elements encontrados: ${gridElements.length}`);

  // Buscar split-view específico (grid-cols-[40%_60%])
  const splitView = await page.locator('[class*="grid-cols-\\[40%"]').count();
  console.log(`  Split-view (40%/60%): ${splitView > 0 ? 'SÍ ✅' : 'NO ❌'}`);

  // Buscar componentes de upload
  const uploadSection = await page.locator('text=Cargar, text=Upload, text=upload').first();
  const hasUploadSection = await uploadSection.isVisible().catch(() => false);
  console.log(`  Upload section: ${hasUploadSection ? 'SÍ ✅' : 'NO ❌'}`);

  // ============================================
  // VERIFICAR SI ES OLD VS NEW COMPONENT
  // ============================================

  console.log('\n🔄 Detectando componente:');

  const hasNewUploadWrapper = await page.locator('text=3 Pasos').count() > 0;
  const hasOldForm = await page.locator('text=Información del Paciente').count() > 0;

  if (hasNewUploadWrapper) {
    console.log('  ✅ Detectado: UploadFormWrapper (NUEVO)');
  } else if (hasOldForm) {
    console.log('  ❌ Detectado: Formulario VIEJO (PROBLEMA)');
  } else {
    console.log('  ⚠️ Desconocido - no se reconoce el componente');
  }

  // ============================================
  // TOMAR SCREENSHOT
  // ============================================

  console.log('\n📸 Tomando screenshot de diagnóstico...');
  await page.screenshot({
    path: '/tmp/diagnose-ipress-layout.png',
    fullPage: false  // Solo viewport, no fullPage
  });
  console.log('✅ Screenshot guardado: /tmp/diagnose-ipress-layout.png');

  // ============================================
  // REPORTE FINAL
  // ============================================

  console.log('\n' + '='.repeat(50));
  console.log('📊 REPORTE DE DIAGNÓSTICO');
  console.log('='.repeat(50));

  if (hasNewUploadWrapper) {
    console.log('✅ IPRESSWorkspace parece estar renderizado correctamente');
    console.log('   Si ves "desordenado", es un problema de CSS/layout');
  } else if (hasOldForm) {
    console.log('❌ PROBLEMA ENCONTRADO:');
    console.log('   - Se está mostrando formulario ANTIGUO');
    console.log('   - Causa: Ruta redirigiendo incorrectamente');
    console.log('   - Solución: Revisar componentRegistry y rutas');
  }

  console.log('\n💡 Próximos pasos:');
  console.log('  1. Revisar la URL en navegador');
  console.log('  2. Abrir DevTools (F12) y buscar errores en Console');
  console.log('  3. Verificar que /teleekgs/ipress-workspace no está redirigiendo');
});
