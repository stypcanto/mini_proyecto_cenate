# Guía de Testing - Mejoras UX/Accesibilidad
## ModalDetalleSolicitud v1.58.0

---

## 🧪 Tests Manuales

### Test 1: Header Sticky en Tabla
**Paso 1:** Abrir el modal de Detalle de Solicitud
**Paso 2:** Hacer scroll hacia abajo en la tabla de especialidades
**Paso 3:** Observar que el header de columnas permanece visible
✅ **Esperado:** Header azul oscuro siempre visible

---

### Test 2: Cards Compactas (Resumen/Fechas)
**Paso 1:** Abrir modal de solicitud
**Paso 2:** Comparar tamaño de cards RESUMEN y FECHAS
**Paso 3:** Verificar que ocupan menos espacio vertical
✅ **Esperado:** ~40px menos de altura vs. versión anterior

---

### Test 3: Contraste de Badges WCAG AA
**Paso 1:** Abrir DevTools → Inspect → elemento badge
**Paso 2:** Usar herramienta WebAIM Contrast Checker
**Paso 3:** Medir ratio de contraste de badges

**Badges a verificar:**
- PENDIENTE: Fondo amarillo claro + texto amarillo oscuro
- ASIGNADO: Fondo verde claro + texto verde oscuro
- NO PROCEDE: Fondo rojo claro + texto rojo oscuro

✅ **Esperado:** Todos los ratios ≥ 4.5:1

**Comando rápido (Chrome DevTools):**
```javascript
// Copiar en console
const badge = document.querySelector('[class*="yellow-50"]');
// Verificar contrast ratio en Lighthouse → Accessibility
```

---

### Test 4: Cierre con ESC
**Paso 1:** Abrir modal de solicitud
**Paso 2:** Presionar tecla ESC
**Paso 3:** Modal debe cerrarse
✅ **Esperado:** Modal desaparece, vuelve a tabla de solicitudes

---

### Test 5: Cierre con Click Fuera
**Paso 1:** Abrir modal de solicitud
**Paso 2:** Click en el área gris oscura afuera del modal
**Paso 3:** Modal debe cerrarse
✅ **Esperado:** Modal desaparece sin acción

---

### Test 6: Debounce en Búsqueda
**Paso 1:** Abrir modal de solicitud
**Paso 2:** Ir a campo "Buscar especialidad..."
**Paso 3:** Escribir rápidamente: "cardiologia"
**Paso 4:** Observar spinner girando mientras se espera
**Paso 5:** Después de 300ms, tabla se filtra

✅ **Esperado:**
- Spinner visible mientras se digita rápido
- Sin filtrado inmediato
- Después de 300ms sin digitar, aparecen resultados

---

### Test 7: Tooltips Descriptivos
**Paso 1:** Hacer hover sobre:
- Botón "Añadir/Editar" observación
- Botón "Ver" observación
- Botón checkmark (aprobar)
- Botón X (rechazar)
- Botón "Ver Fechas"
- Botón "Exportar"

**Paso 2:** Esperar a que aparezca tooltip
✅ **Esperado:** Tooltip oscuro con texto descriptivo aparece al hover

---

### Test 8: Iconos en Teleconsulta
**Paso 1:** Abrir modal de solicitud
**Paso 2:** Mirar columnas TELECONSULTA y TELECONSULTORIO
**Paso 3:** Verificar:
- ✓ (check verde) cuando la especialidad tiene teleconsulta
- — (guión gris) cuando NO tiene

✅ **Esperado:** Iconos visuales en lugar de pills "Sí/No"

---

### Test 9: Action Bar Flotante
**Paso 1:** Abrir solicitud con estado ENVIADO
**Paso 2:** Hacer scroll hacia arriba/abajo en tabla
**Paso 3:** Seleccionar algunos checkboxes de especialidades
**Paso 4:** Observar action bar azul con botones de acción
**Paso 5:** Hacer scroll dentro de la tabla

✅ **Esperado:** Action bar permanece visible (sticky) al hacer scroll

---

### Test 10: Atributos ARIA y Accesibilidad
**Paso 1:** Abrir DevTools → Inspector
**Paso 2:** Click en elemento modal
**Paso 3:** Verificar atributos:

```html
<div
  ref={modalRef}
  tabIndex={-1}
  role="dialog"
  aria-modal="true"
  aria-labelledby="modal-title"
  focus:outline-none
>
```

**Paso 4:** Verificar con lector de pantalla (ej. NVDA/JAWS)
✅ **Esperado:** Anunciado como "Dialog" con título "Detalle de Solicitud"

---

## 📊 Tests Automatizados

### Lighthouse (Chrome DevTools)
1. Abrir DevTools (F12)
2. Tab → Lighthouse
3. Seleccionar "Accessibility"
4. Click "Analyze page load"

✅ **Esperados:**
- Accessibility: ≥ 95
- ARIA labels presentes
- Contrast ratios ✓

### WebAIM Contrast Checker
1. https://webaim.org/resources/contrastchecker/
2. Seleccionar badge color de fondo
3. Seleccionar badge color de texto
4. Verificar ratio ≥ 4.5:1

### Keyboard Navigation
**Paso 1:** Sin usar mouse, presionar Tab repetidamente
**Paso 2:** Verificar que se navega por:
1. Input de búsqueda
2. Select de filtro
3. Botones de fila
4. Botón cerrar

✅ **Esperado:** Focus visible en cada elemento

---

## 🔍 Verificación en Browser

### Firefox DevTools
```
Inspector → Accessibility → Check for issues
```

### Chrome DevTools
```
Lighthouse → Accessibility
Axe DevTools Extension (recomendado)
```

### Safari
```
Develop → Accessibility Inspector
```

---

## 📱 Responsive Testing

### Desktop (1920x1080)
✅ Verificar que todo funciona correctamente

### Tablet (768x1024)
✅ Verificar que modal es responsive

### Mobile (375x667)
✅ Verificar que modal se adapta con `max-w-6xl`

---

## 🐛 Checklist de Defectos a Evitar

- [ ] Search input no tiene debounce
- [ ] Tooltips no aparecen
- [ ] Action bar no es sticky
- [ ] ESC no cierra modal
- [ ] Badges sin suficiente contraste
- [ ] Teleicons muestran "Sí/No" en vez de checkmarks
- [ ] Modal no previene scroll del body
- [ ] Spinner de search no aparece

---

## 📝 Notas de Testing

**Browsers probados:**
- Chrome 120+
- Firefox 121+
- Safari 17+
- Edge 120+

**Resoluciones:**
- 1920x1080 (Desktop)
- 1366x768 (Laptop)
- 768x1024 (Tablet)
- 375x667 (Mobile)

**Lectores de pantalla:**
- NVDA (Windows)
- JAWS (Windows)
- VoiceOver (macOS/iOS)

---

## ✅ Aprobación Final

Marcar cuando se hayan completado todos los tests:

- [ ] Tests manuales (1-10) completados
- [ ] Tests de accesibilidad (Lighthouse ≥95)
- [ ] Contraste de badges verificado (≥4.5:1)
- [ ] Keyboard navigation funciona
- [ ] ESC cierra modal
- [ ] Search debounce funciona
- [ ] Tooltips aparecen
- [ ] Action bar sticky funciona
- [ ] Iconos reemplazan pills
- [ ] Responsive en 3 breakpoints

**Estado:** 🔴 Pendiente → 🟡 En Progreso → 🟢 Completado

---

**Fecha de Testing:**
**Tester:**
**Resultado:** ✅ / ❌
