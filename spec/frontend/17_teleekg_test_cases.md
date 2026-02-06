# Plan de Pruebas: Flujo End-to-End TeleEKG v1.51.0

**Versión:** 1.0
**Estado:** ✅ Listo para Testing
**Fecha:** 2026-02-06

---

## 📋 Resumen Ejecutivo

Plan completo de pruebas para validar el flujo end-to-end TeleEKG (Upload → Listar → Recibidas) implementado en v1.51.0.

**Cobertura:**
- 7 Test Cases principales
- 35+ verificaciones específicas
- Debugging guide incluido
- Checklist de compilación y funcionalidad

---

## 🎯 Test Cases

### TEST CASE 1: Upload → Listar (Redirección automática)

**Objetivo:** Verificar que después de subir imágenes, se redirige automáticamente a listar con filtro aplicado

**Pasos:**
```
1. Ir a http://localhost:3000/teleekgs/upload
2. Verificar: Breadcrumb muestra "Cargar EKG" (azul) → "Mis EKGs" (gris) → "CENATE" (gris)
3. Seleccionar 4-10 imágenes ECG
4. Ingresar DNI: 12345678
5. Click en "Cargar EKGs"
6. Esperar 2-3 segundos...
```

**Verificaciones esperadas:**
- ✅ Toast: "✅ 6 EKGs cargados exitosamente"
- ✅ Redirección automática a `/teleekgs/listar`
- ✅ Toast: "✅ 6 EKGs subidos correctamente"
- ✅ Tabla filtrada solo por DNI 12345678
- ✅ 6 imágenes visibles en la tabla
- ✅ Breadcrumb actualizado: "Cargar EKG" (verde) → "Mis EKGs" (azul) → "CENATE" (gris)

**Tiempo estimado:** 2-3 minutos

---

### TEST CASE 2: Auto-filtrado por DNI

**Objetivo:** Verificar que después de upload, tabla se filtra automáticamente

**Verificaciones:**
- ✅ Campo busca contiene: "12345678" (auto-llenado)
- ✅ Tabla SOLO muestra paciente con DNI 12345678
- ✅ Otros pacientes no aparecen (si existen)
- ✅ Badge de estado: "ENVIADA" (amarillo)

**Tiempo estimado:** 1 minuto

---

### TEST CASE 3: Botón "Ver en CENATE"

**Objetivo:** Abrir vista consolidada en nueva pestaña

**Pasos:**
```
1. En tabla de /teleekgs/listar
2. Buscar fila con paciente DNI 12345678
3. Click en botón morado "👁️ Ver en CENATE" (ExternalLink icon)
```

**Verificaciones esperadas:**
- ✅ Se abre nueva pestaña/ventana
- ✅ URL: `http://localhost:3000/teleecg/recibidas?dni=12345678`
- ✅ Se ve vista consolidada CENATE
- ✅ Breadcrumb en paso 3: "Cargar EKG" (verde) → "Mis EKGs" (verde) → "CENATE" (azul)
- ✅ Mismas 6 imágenes visibles
- ✅ Estados transformados: "PENDIENTE" (no "ENVIADA")

**Tiempo estimado:** 1-2 minutos

---

### TEST CASE 4: Breadcrumb Navegable

**Objetivo:** Verificar que breadcrumb funciona como navegación

**Pasos - Desde /teleekgs/upload:**
```
1. Click en "Mis EKGs" (paso 2 del breadcrumb)
   → Navega a /teleekgs/listar
   → Breadcrumb actualiza: paso 2 azul (actual)

2. Click en "CENATE - Recibidas" (paso 3 del breadcrumb)
   → Navega a /teleecg/recibidas
   → Breadcrumb actualiza: paso 3 azul (actual)

3. Click en "Cargar EKG" (paso 1 del breadcrumb)
   → Navega a /teleekgs/upload
   → Breadcrumb actualiza: paso 1 azul (actual)
```

**Verificaciones:**
- ✅ Navegación fluida entre las 3 vistas
- ✅ Breadcrumb siempre indica ubicación actual (azul)
- ✅ Breadcrumb muestra pasos completados (verde)
- ✅ Breadcrumb muestra pasos pendientes (gris)
- ✅ Barra de progreso se actualiza (0%, 33%, 66%, 100%)

**Tiempo estimado:** 2 minutos

---

### TEST CASE 5: Auto-refresh en CENATE

**Objetivo:** Verificar sincronización automática cada 30 segundos

**Setup:**
```
Navegador 1: Abierto en http://localhost:3000/teleecg/recibidas
Navegador 2: Abierto en http://localhost:3000/teleekgs/upload
```

**Pasos:**
```
1. En Navegador 1: Anotar número total en card "Total EKGs"
   (ej: "Total: 10")

2. En Navegador 2: Subir nuevas imágenes
   - DNI: 87654321
   - Cantidad: 3 imágenes
   - Click "Cargar EKGs"
   - Esperar toast de confirmación

3. En Navegador 1: Esperar máximo 30 segundos (sin refrescar)

4. Verificar cambios:
```

**Verificaciones esperadas:**
- ✅ Sin refrescar manual, card "Total EKGs" actualiza (ej: 10 → 13)
- ✅ Tabla se actualiza con nuevas 3 imágenes
- ✅ Nueva fila: DNI 87654321 con 3 imágenes
- ✅ Estados correctos: PENDIENTE
- ✅ Estadísticas se recalculan automáticamente

**Tiempo estimado:** 45 segundos

---

### TEST CASE 6: Estados Transformados

**Objetivo:** Verificar que ENVIADA en BD aparece como PENDIENTE en CENATE

**Pasos:**
```
1. Subir imágenes (van como ENVIADA a BD)
2. Ir a /teleecg/recibidas
3. Ver tabla de imágenes recibidas
```

**Verificaciones:**
- ✅ Estado mostrado: "PENDIENTE" (amarillo)
- ✅ NO muestra "ENVIADA"
- ✅ Después de evaluar (click botón Evaluar):
  - ✅ Estado cambia a "ATENDIDA" (verde) si es normal
  - ✅ Estado cambia a "OBSERVADA" (rojo) si es anormal

**Tiempo estimado:** 2 minutos

---

### TEST CASE 7: Flujo Completo End-to-End

**Objetivo:** Verificar todo el flujo junto

**Pasos secuenciales:**
```
1. PASO 1: Upload
   ├─ Ir a /teleekgs/upload
   ├─ Seleccionar 5 imágenes
   ├─ DNI: 11111111
   ├─ Click "Cargar EKGs"
   └─ ✅ Redirige a /teleekgs/listar automáticamente

2. PASO 2: Listar (IPRESS)
   ├─ ✅ Toast: "✅ 5 EKGs subidos correctamente"
   ├─ ✅ Tabla filtrada por DNI 11111111
   ├─ ✅ 5 imágenes visibles
   ├─ ✅ Breadcrumb: paso 2 azul
   ├─ ✅ Botón "Ver en CENATE" visible
   └─ Click en "Ver en CENATE"

3. PASO 3: Recibidas (CENATE)
   ├─ Nueva pestaña abre: /teleecg/recibidas
   ├─ ✅ Mismas 5 imágenes visibles
   ├─ ✅ Estados: "PENDIENTE"
   ├─ ✅ Breadcrumb: paso 3 azul
   ├─ ✅ Cards de estadísticas actualizadas
   └─ Click en botón "Evaluar" (primera imagen)

4. PASO 4: Evaluación
   ├─ Modal abre: "Evaluar Imagen"
   ├─ Seleccionar: NORMAL (o ANORMAL)
   ├─ Descripción: "EKG normal" (opcional)
   ├─ Click "Guardar"
   └─ ✅ Toast: "✅ EKG evaluada como NORMAL"

5. PASO 5: Resultado
   ├─ ✅ Estado cambia: PENDIENTE → ATENDIDA (verde)
   ├─ ✅ Cards actualizan:
   │  ├─ Total: 5
   │  ├─ Pendientes: 4
   │  ├─ Observadas: 0
   │  └─ Atendidas: 1
   ├─ ✅ 30 segundos después (auto-refresh)
   │  └─ Todos los cambios persisten
   └─ ✅ FIN DEL FLUJO COMPLETO
```

**Tiempo estimado:** 5-7 minutos

---

## 🎯 Checklist de Verificación

### Compilación
- [ ] `npm run build` sin errores
- [ ] `npm start` corre sin errores
- [ ] DevTools (F12) sin errores en console

### Funcionalidad
- [ ] Upload redirige automáticamente
- [ ] Auto-filtrado por DNI funciona
- [ ] Breadcrumb navegable
- [ ] Botón "Ver en CENATE" abre nueva pestaña
- [ ] Auto-refresh en CENATE (esperar 30s)
- [ ] Estados transformados correctamente
- [ ] Evaluación guarda correctamente

### UX/UI
- [ ] Breadcrumb visible en las 3 vistas
- [ ] Progreso visual (barra) funciona
- [ ] Toast messages claros
- [ ] Colores consistentes (azul, verde, gris)
- [ ] Responsive en móvil

### Performance
- [ ] Auto-refresh no causa lag
- [ ] Tabla se actualiza suavemente
- [ ] Sin errores de red en DevTools

---

## 📊 Logs a Verificar en Console

### RegistroPacientes.jsx
```javascript
// Línea 40-48: Detectar redirección desde upload
if (location.state?.mensaje) {
  console.log("✅ Detectada redirección desde upload");
  console.log("Mensaje:", location.state.mensaje);
  console.log("DNI:", location.state.numDoc);
}
```

### TeleECGRecibidas.jsx
```javascript
// Línea 72-85: Auto-refresh iniciado
console.log("✅ Auto-refresh iniciado (cada 30s)");

// Cada 30 segundos:
console.log("🔄 Auto-refresh: recargando datos...");
```

---

## 🔧 Debugging (si falla algo)

### Si Upload NO redirige
- Verificar: `useNavigate` está importado correctamente en línea 2
- Verificar: `navigate()` se llama después de `setEnviado(true)` (línea 236-245)
- Verificar: timeout es 2000ms (2 segundos)
- Revisar console.log en DevTools (F12)

### Si auto-filtrado NO funciona
- Verificar: `useLocation` está importado en línea 1
- Verificar: `location.state` contiene datos (console.log)
- Verificar: `setSearchTerm(numDoc)` se ejecuta (línea 46)
- Revisar si viene de upload (check location.state?.mensaje)

### Si Breadcrumb NO aparece
- Verificar: TeleEKGBreadcrumb.jsx existe en frontend/src/components/teleecgs/
- Verificar: Import correcto en las 3 vistas
- Verificar: Componente está dentro del return JSX (antes de tabla/stats)
- Verificar: Sin errores de path en import

### Si auto-refresh NO funciona
- Verificar: Interval en 30000ms (30 segundos)
- Verificar: cargarEKGs() y cargarEstadisticasGlobales() se llaman
- Verificar: Cleanup function retorna clearInterval(interval)
- Revisar console.log durante los 30 segundos
- Abrir DevTools (F12) → Network → filtrar por `/api/teleekgs`

---

## ✅ Sign-off

Una vez verificados todos los test cases:

```
Flujo End-to-End TeleEKG v1.51.0
✅ PROBADO Y APROBADO
📅 Fecha: ________________
👤 QA: ____________________
🖊️ Firma: ____________________

Test Cases Pasados: 7/7
Verificaciones Completadas: 35+
Bugs Encontrados: ___________
Comentarios: ________________________________
```

---

## 📚 Documentación Relacionada

- **Spec completo:** [`spec/frontend/16_teleekg_workflow_end_to_end.md`](spec/frontend/16_teleekg_workflow_end_to_end.md)
- **Changelog:** [`checklist/01_Historial/01_changelog.md#v1510-2026-02-06`](checklist/01_Historial/01_changelog.md)
- **CLAUDE.md:** Sección v1.51.0

---

**Documento creado:** 2026-02-06
**Última actualización:** 2026-02-06
**Estado:** ✅ Listo para Testing
