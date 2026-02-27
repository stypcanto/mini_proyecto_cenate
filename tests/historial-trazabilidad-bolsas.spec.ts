import { test, expect, Page } from '@playwright/test';
import * as path from 'path';
import * as fs from 'fs';

const BASE_URL = 'http://localhost:3000';
const SCREENSHOTS_DIR = path.join(__dirname, '..', '.playwright-mcp');

test.setTimeout(90000);

async function save(page: Page, name: string): Promise<void> {
  if (!fs.existsSync(SCREENSHOTS_DIR)) fs.mkdirSync(SCREENSHOTS_DIR, { recursive: true });
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, `${name}.png`), fullPage: false });
  console.log(`📸 ${name}.png`);
}

test('Historial trazabilidad — flujo completo', async ({ page }) => {

  // ── 1. LOGIN ─────────────────────────────────────────────────────────────
  console.log('\n=== 1. LOGIN ===');
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  await page.waitForTimeout(1500);
  await save(page, 'h01-landing');

  // Clic en "Iniciar sesión" si existe
  const btnLogin = page.locator('button:has-text("Iniciar sesión"), a:has-text("Iniciar sesión")').first();
  if (await btnLogin.count() > 0) {
    await btnLogin.click();
    await page.waitForTimeout(1500);
  }
  await save(page, 'h02-login-form');

  // Llenar credenciales
  const userInput = page.locator('input[type="text"]:visible, input[placeholder*="DNI"]:visible').first();
  const passInput = page.locator('input[type="password"]:visible').first();

  if (await userInput.count() > 0 && await passInput.count() > 0) {
    await userInput.fill('44914706');
    await passInput.fill('@Styp654321');
    await save(page, 'h03-creds-filled');
    await page.locator('button[type="submit"], button:has-text("Ingresar"), button:has-text("Iniciar")').first().click();
    await page.waitForTimeout(4000);
  }

  await save(page, 'h04-after-login');
  console.log('URL después de login:', page.url());

  // ── 2. SIDEBAR — expandir "Bolsas de Pacientes" ──────────────────────────
  console.log('\n=== 2. EXPANDIR BOLSAS EN SIDEBAR ===');
  await save(page, 'h05-sidebar');

  // Clic en "Bolsas de Pacientes" (botón colapsable del sidebar)
  const bolsasMenu = page.locator('button:has-text("Bolsas"), span:has-text("Bolsas de Pacientes"), li:has-text("Bolsas de Pacientes")').first();
  const bolsasMenuCount = await bolsasMenu.count();
  console.log(`Menú "Bolsas de Pacientes" encontrado: ${bolsasMenuCount}`);

  if (bolsasMenuCount > 0) {
    await bolsasMenu.click();
    await page.waitForTimeout(1500);
    await save(page, 'h05b-bolsas-expanded');

    // Ahora buscar el link de Solicitudes dentro del submenú
    const solicitudLink = page.locator('a[href*="solicitud"], a:has-text("Solicitudes"), a:has-text("Recepción")').first();
    const solCount = await solicitudLink.count();
    console.log(`Link de Solicitudes encontrado: ${solCount}`);

    if (solCount > 0) {
      await solicitudLink.click();
      await page.waitForTimeout(3000);
      await save(page, 'h06-bolsas-page');
      console.log('URL bolsas:', page.url());
    } else {
      // Listar qué apareció después de expandir
      const subLinks = await page.$$eval('nav a, aside a', (links) =>
        links.map(l => ({ text: (l as HTMLElement).innerText?.trim(), href: (l as HTMLAnchorElement).href })).filter(l => l.text)
      );
      console.log('Sub-links tras expandir:', JSON.stringify(subLinks, null, 2));
      await page.goto(`${BASE_URL}/bolsas/solicitudes`, { waitUntil: 'domcontentloaded' });
      await page.waitForTimeout(3000);
      await save(page, 'h06-bolsas-direct');
      console.log('URL actual:', page.url());
    }
  } else {
    console.log('Menú Bolsas no encontrado — URL directa');
    await page.goto(`${BASE_URL}/bolsas/solicitudes`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(3000);
    await save(page, 'h06-bolsas-direct');
    console.log('URL actual:', page.url());
  }

  // ── 3. ESPERAR TABLA ─────────────────────────────────────────────────────
  console.log('\n=== 3. ESPERAR TABLA ===');
  await page.waitForTimeout(4000);
  console.log('URL actual:', page.url());

  // Si fue redirigido al home, intentar URL de solicitudes atendidas
  if (page.url() === `${BASE_URL}/` || page.url() === BASE_URL) {
    console.log('Redirigido al home — intentando /bolsas/solicitudesatendidas...');
    await page.goto(`${BASE_URL}/bolsas/solicitudesatendidas`, { waitUntil: 'domcontentloaded' });
    await page.waitForTimeout(4000);
    console.log('URL después de redirect:', page.url());
  }

  // Presionar Escape para cerrar cualquier chatbot/modal abierto
  await page.keyboard.press('Escape');
  await page.waitForTimeout(500);

  // Screenshot de la tabla
  await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'h07-tabla-full.png'), fullPage: true });
  console.log('📸 h07-tabla-full.png (página completa)');
  await save(page, 'h07b-tabla-viewport');

  // Listar todos los botones en filas de tabla para diagnóstico
  const tableButtons = await page.$$eval('tr button, td button', (btns) =>
    btns.slice(0, 20).map(b => ({
      title: (b as HTMLElement).title,
      text: (b as HTMLElement).innerText?.trim().substring(0, 30),
      hasSvg: !!b.querySelector('svg'),
    }))
  );
  console.log('Botones en tabla:', JSON.stringify(tableButtons, null, 2));

  // Buscar botón historial por title — SOLO dentro de <tr> (filas de la tabla)
  const histBtn = page.locator('tr button[title*="istorial"], td button[title*="istorial"]').first();
  const histCount = await histBtn.count();
  console.log(`Botones historial encontrados: ${histCount}`);


  if (histCount > 0) {
    console.log('\n✅ Botón historial encontrado — haciendo clic...');
    await histBtn.click();
    await page.waitForTimeout(2000);
    await save(page, 'h08-modal-abierto');

    // ── 4. TABS DEL MODAL ──────────────────────────────────────────────────
    console.log('\n=== 4. TABS DEL MODAL ===');
    const tabs = page.locator('button:has-text("Historial"), button:has-text("Datos")');
    const tabCount = await tabs.count();
    console.log(`Tabs encontradas: ${tabCount}`);

    for (let i = 0; i < tabCount; i++) {
      console.log(`  Tab: "${await tabs.nth(i).textContent()}"`);
    }

    // Clic en pestaña Historial
    const histTab = page.locator('button:has-text("Historial")').first();
    if (await histTab.count() > 0) {
      await histTab.click();
      await page.waitForTimeout(2000);
      await save(page, 'h09-historial-tab');
      await page.screenshot({ path: path.join(SCREENSHOTS_DIR, 'h10-historial-full.png'), fullPage: true });
      console.log('📸 h10-historial-full.png');

      // Leer contenido del timeline
      const bodyText = await page.locator('body').textContent() || '';
      const eventos = ['INGRESO', 'ASIGNACION', 'CITA_AGENDADA', 'ATENCIÓN', 'ANULACION', 'Ingreso', 'Asignación', 'Cita agendada', 'Atención', 'Anulación', 'Pendiente', 'Citado'];
      console.log('\n📋 Eventos detectados en el timeline:');
      for (const e of eventos) {
        if (bodyText.includes(e)) console.log(`  ✅ ${e}`);
      }
    }
  } else {
    console.log('\n❌ Botón historial NO encontrado.');
    console.log('Puede que el usuario no tenga acceso a bolsas/solicitudes.');
    console.log('URL actual:', page.url());
  }

  await save(page, 'h99-final');
  console.log('\n=== TEST FINALIZADO ===');
});
