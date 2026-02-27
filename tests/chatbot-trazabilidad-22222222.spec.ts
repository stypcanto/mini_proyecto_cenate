import { test, expect, Page } from '@playwright/test';
import path from 'path';

const SCREENSHOT_DIR = path.resolve(__dirname, '../.playwright-mcp');

/**
 * Chatbot Trazabilidad CENATE — cuenta 22222222 / @Prueba654321
 *
 * Flujo completo:
 * 1. Home sin login → verificar que el botón 🤖 NO aparece
 * 2. Login con 22222222 / @Prueba654321
 * 3. Dashboard → verificar URL + botón 🤖 visible
 * 4. Abrir chatbot → verificar mensaje de bienvenida + sugerencias
 * 5. Enviar "Historial DNI 08643806" → capturar respuesta IA
 */

test.describe('Chatbot Trazabilidad CENATE - cuenta 22222222', () => {

  // ─────────────────────────────────────────────────────────────────────────
  // PASO 1: Home pública — el botón 🤖 NO debe aparecer
  // ─────────────────────────────────────────────────────────────────────────
  test('paso 1 — home pública NO muestra botón chatbot', async ({ page }) => {
    await page.goto('http://localhost:3000', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/trazab-01-home-sin-login.png` });

    console.log('URL actual:', page.url());
    console.log('Título:', await page.title());

    // El botón chatbot no debe existir o no ser visible
    const chatbotBtn = page.locator('button:has-text("🤖")');
    const isVisible = await chatbotBtn.isVisible({ timeout: 3000 }).catch(() => false);
    console.log('Botón 🤖 visible en home pública:', isVisible);

    expect(isVisible).toBe(false);
  });

  // ─────────────────────────────────────────────────────────────────────────
  // PASOS 2-5: Login → Dashboard → Chatbot → Historial DNI
  // ─────────────────────────────────────────────────────────────────────────
  test('pasos 2-5 — login, chatbot, historial DNI 08643806', async ({ page }) => {

    // ── PASO 2: Login ────────────────────────────────────────────────────────
    await page.goto('http://localhost:3000/login', { waitUntil: 'networkidle' });
    await page.screenshot({ path: `${SCREENSHOT_DIR}/trazab-02-login-page.png` });
    console.log('PASO 2 — URL login:', page.url());

    // Llenar username
    const usernameSelectors = [
      'input[name="nameUser"]',
      'input[name="username"]',
      'input[type="text"]',
    ];
    let usernameFilled = false;
    for (const sel of usernameSelectors) {
      const el = page.locator(sel).first();
      if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
        await el.fill('22222222');
        usernameFilled = true;
        console.log(`  Username llenado con: ${sel}`);
        break;
      }
    }
    if (!usernameFilled) {
      const inputs = page.locator('input');
      await inputs.first().fill('22222222');
      console.log('  Username llenado con primer input (fallback)');
    }

    // Llenar password
    const passwordEl = page.locator('input[type="password"]').first();
    if (await passwordEl.isVisible({ timeout: 2000 }).catch(() => false)) {
      await passwordEl.fill('@Prueba654321');
      console.log('  Password llenado');
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/trazab-03-credentials-filled.png` });

    // Hacer clic en botón submit
    const submitEl = page.locator('button[type="submit"], button:has-text("Ingresar"), button:has-text("Login"), button:has-text("Iniciar")').first();
    if (await submitEl.isVisible({ timeout: 2000 }).catch(() => false)) {
      await submitEl.click();
      console.log('  Submit clickeado');
    } else {
      await page.keyboard.press('Enter');
      console.log('  Submit via Enter (fallback)');
    }

    // ── PASO 3: Dashboard ────────────────────────────────────────────────────
    await page.waitForLoadState('networkidle', { timeout: 30000 });
    await page.waitForTimeout(3000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/trazab-04-dashboard.png` });

    const dashboardUrl = page.url();
    const pageTitle = await page.title();
    console.log('\nPASO 3 — URL tras login:', dashboardUrl);
    console.log('  Título de página:', pageTitle);

    // El login debería haber redirigido fuera de /login
    expect(dashboardUrl).not.toContain('/login');

    // ── PASO 3b: Verificar botón 🤖 ──────────────────────────────────────────
    console.log('\nPASO 3b — Buscando botón 🤖 en dashboard...');

    // Intento directo con emoji
    let chatbotBtn = page.locator('button:has-text("🤖")');
    let chatbotVisible = await chatbotBtn.isVisible({ timeout: 5000 }).catch(() => false);

    // Si no encontró con emoji, buscar por clase/atributo relacionado con chatbot
    if (!chatbotVisible) {
      const altSelectors = [
        '[class*="chatbot"]',
        '[class*="floating"]',
        '[id*="chatbot"]',
        'button[aria-label*="chatbot"]',
        'button[aria-label*="Chatbot"]',
        'button[aria-label*="asistente"]',
        'button[title*="CENATE"]',
        'button[title*="Asistente"]',
      ];
      for (const sel of altSelectors) {
        const el = page.locator(sel).first();
        if (await el.isVisible({ timeout: 2000 }).catch(() => false)) {
          chatbotBtn = el;
          chatbotVisible = true;
          console.log(`  Botón chatbot encontrado con selector alternativo: ${sel}`);
          break;
        }
      }
    }

    // Intentar búsqueda por posición (bottom-right)
    if (!chatbotVisible) {
      console.log('  Buscando botón flotante por posición bottom-right...');
      const allButtons = page.locator('button');
      const buttonCount = await allButtons.count();
      const viewport = page.viewportSize();
      console.log(`  Total botones en página: ${buttonCount}`);

      for (let i = 0; i < buttonCount; i++) {
        const btn = allButtons.nth(i);
        const box = await btn.boundingBox().catch(() => null);
        if (box && viewport) {
          const isBottomRight = box.x > viewport.width * 0.6 && box.y > viewport.height * 0.6;
          if (isBottomRight) {
            const text = await btn.textContent().catch(() => '');
            const cls = await btn.getAttribute('class').catch(() => '');
            console.log(`  Botón bottom-right ${i}: texto="${text}" class="${cls?.substring(0, 80)}"`);
          }
        }
      }
    }

    console.log('  Botón 🤖 visible en dashboard:', chatbotVisible);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/trazab-05-chatbot-button-check.png` });

    if (!chatbotVisible) {
      // Reportar estado actual y contexto antes de fallar
      const html = await page.content();
      const hasLoginForm = html.includes('type="password"') || html.includes('Iniciar sesión');
      console.log('\n=== DIAGNÓSTICO ===');
      console.log('  ¿Sigue en pantalla de login?:', hasLoginForm);
      console.log('  URL actual:', page.url());
      // Intentar extraer rol desde localStorage/sessionStorage
      const storage = await page.evaluate(() => {
        return {
          localStorage: JSON.stringify(localStorage),
          sessionStorage: JSON.stringify(sessionStorage),
        };
      });
      console.log('  localStorage (primeros 500):', storage.localStorage.substring(0, 500));
      console.log('  sessionStorage (primeros 500):', storage.sessionStorage.substring(0, 500));

      throw new Error(
        `Botón 🤖 del chatbot NO encontrado en dashboard.\nURL actual: ${dashboardUrl}\nVerifica que la cuenta 22222222 tiene acceso al chatbot de trazabilidad.`
      );
    }

    // ── PASO 4: Abrir chatbot ────────────────────────────────────────────────
    await chatbotBtn.click();
    await page.waitForTimeout(3000); // Extra wait for panel to fully render
    await page.screenshot({ path: `${SCREENSHOT_DIR}/trazab-06-chatbot-abierto.png`, fullPage: false });
    console.log('\nPASO 4 — Chatbot abierto');

    // Verificar mensaje de bienvenida — extraer texto real del DOM
    const fullContent = await page.content();

    // Intentar capturar el texto exacto del mensaje de bienvenida del bot
    const botMessages = await page.locator('[class*="bot"], [class*="Bot"]').allTextContents().catch(() => []);
    const welcomeRealText = botMessages.join(' ').trim();
    console.log('  Texto de mensajes bot extraído:', welcomeRealText.substring(0, 300) || '(no extraído via selector)');

    // Buscar texto de bienvenida en el HTML
    const welcomePatterns = [
      '¡Hola', 'Hola', 'Bienvenido', 'bienvenido', 'Asistente', 'CENATE',
      'trazabilidad', 'Trazabilidad', 'puedo ayudarte', 'ayudarte',
      'asistente de trazabilidad', 'Preguntame', 'historial de pacientes',
    ];
    const welcomeTexts: string[] = [];
    for (const pattern of welcomePatterns) {
      if (fullContent.includes(pattern)) {
        welcomeTexts.push(pattern);
      }
    }
    console.log('  Palabras de bienvenida encontradas en HTML:', welcomeTexts.join(', ') || 'Ninguna detectada');

    // Extraer sugerencias reales (botones en el panel de sugerencias)
    const suggestionButtons = await page.locator('button').allTextContents().catch(() => []);
    const chatSuggestions = suggestionButtons.filter(t =>
      t.includes('DNI') || t.includes('Historial') || t.includes('cita') || t.includes('Trazabilidad')
    );
    console.log('  Sugerencias (botones con DNI/Historial/cita):', chatSuggestions.join(' | ') || 'Ninguna detectada');

    // Fallback: buscar por patterns en HTML
    const suggestionPatterns = ['Historial DNI', '¿Puede nueva cita', 'Trazabilidad completa', 'Inconsistencias DNI'];
    const suggestionsFound: string[] = [];
    for (const pat of suggestionPatterns) {
      if (fullContent.includes(pat)) {
        suggestionsFound.push(pat);
      }
    }
    console.log('  Sugerencias encontradas en HTML:', suggestionsFound.join(' | ') || 'Ninguna detectada');

    // ── PASO 5: Enviar "Historial DNI 08643806" ──────────────────────────────
    console.log('\nPASO 5 — Enviando: "Historial DNI 08643806"');

    const chatInputSelectors = [
      // Exact placeholder from ChatbotTrazabilidad.jsx
      'textarea[placeholder*="Escribe tu consulta"]',
      'textarea[placeholder*="Escribe"]',
      // Fallback selectors
      'textarea[placeholder*="consulta"]',
      'textarea[placeholder*="mensaje"]',
      'textarea[placeholder*="Mensaje"]',
      'textarea[placeholder*="pregunta"]',
      'input[placeholder*="Escribe"]',
      'input[placeholder*="mensaje"]',
      'input[placeholder*="Mensaje"]',
      'input[placeholder*="pregunta"]',
      'input[type="text"]:visible',
      '[contenteditable="true"]',
    ];

    let chatInput = null;
    for (const sel of chatInputSelectors) {
      const el = page.locator(sel).last();
      if (await el.isVisible({ timeout: 3000 }).catch(() => false)) {
        chatInput = el;
        console.log(`  Input encontrado con: ${sel}`);
        break;
      }
    }

    if (!chatInput) {
      await page.screenshot({ path: `${SCREENSHOT_DIR}/trazab-07-no-input.png` });
      throw new Error('No se encontró el campo de input del chatbot después de abrirlo.');
    }

    await chatInput.fill('Historial DNI 08643806');
    await page.screenshot({ path: `${SCREENSHOT_DIR}/trazab-07-mensaje-escrito.png` });

    // Capturar respuestas de red relacionadas con chatbot/trazabilidad
    const apiResponses: { url: string; status: number; body: string }[] = [];
    page.on('response', async (response) => {
      const url = response.url();
      if (
        url.includes('chatbot') ||
        url.includes('trazabilidad') ||
        url.includes('historial') ||
        url.includes('ai') ||
        url.includes('spring')
      ) {
        const status = response.status();
        const body = await response.text().catch(() => '(no se pudo leer)');
        apiResponses.push({ url, status, body: body.substring(0, 1000) });
        console.log(`  API response: ${status} ${url}`);
        console.log(`  Body (primeros 500): ${body.substring(0, 500)}`);
      }
    });

    // Enviar mensaje
    const sendBtn = page.locator('button[type="submit"], button[aria-label*="enviar"], button[aria-label*="Enviar"], button:has-text("Enviar")').last();
    if (await sendBtn.isVisible({ timeout: 2000 }).catch(() => false)) {
      await sendBtn.click();
      console.log('  Mensaje enviado via botón');
    } else {
      await chatInput.press('Enter');
      console.log('  Mensaje enviado via Enter');
    }

    await page.screenshot({ path: `${SCREENSHOT_DIR}/trazab-08-mensaje-enviado.png` });

    // ── Esperar respuesta del chatbot (hasta 45 segundos) ────────────────────
    console.log('  Esperando respuesta IA (hasta 45 segundos)...');

    // Esperar que desaparezca cualquier indicador de "typing"
    try {
      await page.waitForFunction(
        () => {
          const typingIndicators = document.querySelectorAll('[class*="typing"], [class*="loading"], [class*="spinner"]');
          return typingIndicators.length === 0;
        },
        { timeout: 45000 }
      );
    } catch {
      console.log('  Timeout esperando fin de loading — continuando de todos modos');
    }

    // Espera adicional para que la respuesta se renderice
    await page.waitForTimeout(5000);
    await page.screenshot({ path: `${SCREENSHOT_DIR}/trazab-09-respuesta-final.png` });

    // Analizar contenido final
    const finalContent = await page.content();

    const dniMentioned =
      finalContent.includes('08643806') ||
      finalContent.includes('historial') ||
      finalContent.includes('Historial') ||
      finalContent.includes('paciente') ||
      finalContent.includes('Paciente');

    const errorMentioned =
      finalContent.includes('Error') ||
      finalContent.includes('error') ||
      finalContent.includes('credits') ||
      finalContent.includes('créditos') ||
      finalContent.includes('Anthropic') ||
      finalContent.includes('500');

    console.log('\n=== RESULTADO FINAL ===');
    console.log('  URL tras login:', dashboardUrl);
    console.log('  Botón 🤖 visible:', chatbotVisible);
    console.log('  Mensaje de bienvenida detectado:', welcomeTexts.join(', ') || 'No detectado');
    console.log('  Sugerencias detectadas:', suggestionsFound.join(', ') || 'No detectadas');
    console.log('  Respuesta menciona DNI/historial/paciente:', dniMentioned);
    console.log('  Respuesta contiene errores:', errorMentioned);
    if (apiResponses.length > 0) {
      console.log('  API responses capturadas:');
      for (const r of apiResponses) {
        console.log(`    ${r.status} ${r.url}`);
      }
    } else {
      console.log('  No se capturaron llamadas API de chatbot/trazabilidad');
    }

    // Aserciones finales
    expect(chatbotVisible).toBe(true);
  });
});
