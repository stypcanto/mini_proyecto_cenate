import { test } from '@playwright/test';

test('Diagnose /teleekgs/ipress-workspace page', async ({ page, context }) => {
  // Obtener cookies de login si existen
  const cookies = await context.cookies();

  page.setViewportSize({ width: 1400, height: 900 });

  console.log('\n🔍 === DIAGNÓSTICO DE PÁGINA ===\n');

  // Navegar a la página
  console.log('📍 Navegando a: http://localhost:3000/teleekgs/ipress-workspace');
  const response = await page.goto('http://localhost:3000/teleekgs/ipress-workspace', { waitUntil: 'networkidle' });
  console.log(`Response status: ${response?.status()}`);

  await page.waitForTimeout(2000);

  // URL actual
  const currentUrl = page.url();
  console.log(`\n📌 URL Actual: ${currentUrl}`);

  // Title
  const title = await page.title();
  console.log(`📄 Título de página: ${title}`);

  // ============================================
  // BUSCAR COMPONENTES CLAVE
  // ============================================

  console.log('\n🔎 Buscando componentes de IPRESSWorkspace:');

  const hasUploadFormWrapper = await page.locator('text=3 Pasos para cargar').count() > 0;
  const hasIPRESSWorkspaceHeader = await page.locator('text=Gestión de Electrocardiogramas').count() > 0;
  const hasSplitView = await page.locator('[class*="grid-cols"]').count() > 0;
  const hasBreadcrumb = await page.locator('text=Cargar EKG').count() > 0;

  console.log(`  ✅ "3 Pasos para cargar": ${hasUploadFormWrapper ? 'SÍ' : 'NO'}`);
  console.log(`  ✅ "Gestión de Electrocardiogramas": ${hasIPRESSWorkspaceHeader ? 'SÍ' : 'NO'}`);
  console.log(`  ✅ Split-view (grid): ${hasSplitView ? 'SÍ' : 'NO'}`);
  console.log(`  ✅ Breadcrumb: ${hasBreadcrumb ? 'SÍ' : 'NO'}`);

  console.log('\n🔎 Buscando componentes de página VIEJA:');

  const hasOldForm = await page.locator('text=Información del Paciente').count() > 0;
  const hasDNIInput = await page.locator('placeholder=Ingresa 8 digitos').count() > 0;
  const hasSelectImagesText = await page.locator('text=Selecciona Imágenes del EKG').count() > 0;

  console.log(`  ❌ "Información del Paciente": ${hasOldForm ? 'PRESENTE (PROBLEMA)' : 'no'}`);
  console.log(`  ❌ DNI input "Ingresa 8 digitos": ${hasDNIInput ? 'PRESENTE (PROBLEMA)' : 'no'}`);
  console.log(`  ❌ "Selecciona Imágenes del EKG": ${hasSelectImagesText ? 'PRESENTE (PROBLEMA)' : 'no'}`);

  // ============================================
  // VERIFICAR ESTRUCTURA GENERAL
  // ============================================

  console.log('\n🏗️ Estructura de página:');

  // Obtener todos los h1, h2, h3
  const headings = await page.locator('h1, h2, h3').all();
  console.log(`  Headings encontrados: ${headings.length}`);
  for (let i = 0; i < Math.min(5, headings.length); i++) {
    const text = await headings[i].textContent();
    console.log(`    ${i + 1}. ${text}`);
  }

  // Obtener la clase del main content
  const mainContent = await page.locator('main, [role="main"], .main').first();
  if (await mainContent.isVisible()) {
    const classes = await mainContent.getAttribute('class');
    console.log(`  Main content classes: ${classes?.substring(0, 100)}...`);
  }

  // ============================================
  // TOMAR SCREENSHOT
  // ============================================

  console.log('\n📸 Tomando screenshot...');
  await page.screenshot({ path: '/tmp/diagnose-ipress-workspace.png', fullPage: true });
  console.log('✅ Screenshot guardado: /tmp/diagnose-ipress-workspace.png');

  // ============================================
  // RESUMEN
  // ============================================

  console.log('\n📊 === RESUMEN DEL DIAGNÓSTICO ===');

  if (hasIPRESSWorkspaceHeader && hasUploadFormWrapper) {
    console.log('✅ IPRESSWorkspace se está renderizando correctamente');
  } else if (hasOldForm || hasDNIInput) {
    console.log('❌ Se está mostrando un componente ANTIGUO en lugar de IPRESSWorkspace');
    console.log('   Causa probable: Ruta redirigiendo a componente incorrecto');
  } else {
    console.log('⚠️ No se reconoce qué componente se está mostrando');
  }

  // ============================================
  // INFORMACIÓN DE DEBUG
  // ============================================

  console.log('\n🐛 Información de debug:');
  console.log(`  Viewport: 1400x900`);
  console.log(`  URL: ${currentUrl}`);
  console.log(`  Status: ${response?.status()}`);

  // Verificar si hay errores en console
  const consoleErrors: string[] = [];
  page.on('console', msg => {
    if (msg.type() === 'error') {
      consoleErrors.push(msg.text());
    }
  });

  await page.waitForTimeout(1000);

  if (consoleErrors.length > 0) {
    console.log(`  ⚠️ Console errors: ${consoleErrors.length}`);
    consoleErrors.slice(0, 3).forEach(err => {
      console.log(`     - ${err.substring(0, 80)}`);
    });
  } else {
    console.log(`  ✅ Sin errores en console`);
  }
});
