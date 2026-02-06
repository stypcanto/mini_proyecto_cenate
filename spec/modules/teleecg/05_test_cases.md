# ✅ Test Cases - TeleEKG v1.51.0

**Versión:** v1.51.0
**Tiempo total de testing:** ~15 minutos
**Coverage:** 7 test cases + 35+ verificaciones

---

## 📋 Test Case 1: Upload → Listar

**Tiempo:** 2-3 minutos

### Pasos
1. Ir a `http://localhost:3000/teleekgs/upload`
2. Verificar Breadcrumb: Paso 1 azul
3. Seleccionar 4-10 imágenes ECG
4. Ingresar DNI: 12345678
5. Click "Cargar EKGs"

### Verificaciones
- ✅ Toast: "✅ X EKGs cargados exitosamente"
- ✅ Redirección automática a `/teleekgs/listar`
- ✅ Toast: "✅ X EKGs subidos correctamente"
- ✅ Tabla filtrada por DNI 12345678
- ✅ Imágenes visibles en tabla
- ✅ Breadcrumb actualizado: paso 2 azul
- ✅ Campo búsqueda contiene DNI
- ✅ Badge estado: "ENVIADA ✈️"

---

## 📋 Test Case 2: Auto-filtrado por DNI

**Tiempo:** 1 minuto

### Pasos
1. Estar en `/teleekgs/listar` después del upload

### Verificaciones
- ✅ Tabla SOLO muestra paciente con DNI 12345678
- ✅ Otros pacientes NO aparecen
- ✅ Badge estado: "ENVIADA ✈️"
- ✅ Contador: "X EKGs" correcto

---

## 📋 Test Case 3: Botón "Ver en CENATE"

**Tiempo:** 1-2 minutos

### Pasos
1. En `/teleekgs/listar`
2. Locali za fila con DNI 12345678
3. Click botón morado (ExternalLink icon)

### Verificaciones
- ✅ Se abre nueva pestaña
- ✅ URL contiene: `/teleecg/recibidas`
- ✅ Mismas 6 imágenes visibles
- ✅ Estados transformados: "PENDIENTE ⏳"
- ✅ Breadcrumb paso 3: azul

---

## 📋 Test Case 4: Breadcrumb Navegable

**Tiempo:** 2 minutos

### Pasos (desde `/teleekgs/upload`)
1. Click en "Mis EKGs" → Navega a `/teleekgs/listar`
2. Click en "CENATE" → Navega a `/teleecg/recibidas`
3. Click en "Cargar EKG" → Navega a `/teleekgs/upload`

### Verificaciones
- ✅ Navegación fluida (sin errores)
- ✅ Breadcrumb siempre indica ubicación actual
- ✅ Colores correctos: Azul (actual), Verde (completado), Gris (pendiente)
- ✅ Barra de progreso se actualiza
- ✅ Links funcionales

---

## 📋 Test Case 5: Auto-refresh en CENATE

**Tiempo:** 45 segundos

### Setup
```
Navegador 1: http://localhost:3000/teleecg/recibidas
Navegador 2: http://localhost:3000/teleekgs/upload
```

### Pasos
1. En Navegador 1: Anotar total en card (ej: "Total: 10")
2. En Navegador 2: Subir 3 nuevas imágenes (DNI: 87654321)
3. En Navegador 1: Esperar 30 segundos (sin refrescar)

### Verificaciones
- ✅ Card "Total" actualiza: 10 → 13
- ✅ Nueva fila aparece en tabla
- ✅ DNI 87654321 visible
- ✅ Estados correctos: "PENDIENTE ⏳"
- ✅ Estadísticas actualizadas
- ✅ Sin loading visible (silencioso)

---

## 📋 Test Case 6: Estados Transformados

**Tiempo:** 1-2 minutos

### Pasos
1. Subir imágenes (estado BD: ENVIADA)
2. Ir a `/teleecg/recibidas` (CENATE)
3. Verificar tabla

### Verificaciones
- ✅ Estado mostrado: "PENDIENTE ⏳" (NO "ENVIADA")
- ✅ Después de evaluar:
  - ✅ NORMAL → "ATENDIDA ✅" (verde)
  - ✅ ANORMAL → "OBSERVADA 👁️" (naranja)

---

## 📋 Test Case 7: Flujo Completo End-to-End

**Tiempo:** 5-7 minutos

### Pasos Secuenciales

```
PASO 1: Upload
├─ Ir a /teleekgs/upload
├─ Seleccionar 5 imágenes
├─ DNI: 11111111
├─ Click "Cargar EKGs"
└─ ✅ Redirige a /teleekgs/listar

PASO 2: Listar (IPRESS)
├─ Toast: "✅ 5 EKGs subidos correctamente"
├─ Tabla filtrada por DNI 11111111
├─ 5 imágenes visibles
├─ Breadcrumb: paso 2 azul
└─ Click "Ver en CENATE"

PASO 3: Recibidas (CENATE)
├─ Nueva pestaña abre
├─ Mismas 5 imágenes visibles
├─ Estados: "PENDIENTE ⏳"
├─ Breadcrumb: paso 3 azul
└─ Click "Evaluar" (primera imagen)

PASO 4: Evaluación
├─ Modal abre
├─ Selecciona NORMAL
├─ Ingresa descripción
├─ Click "Guardar"
└─ Toast: "✅ EKG evaluada como NORMAL"

PASO 5: Resultado
├─ Estado: "PENDIENTE ⏳" → "ATENDIDA ✅"
├─ Cards actualizan
├─ Esperar 30s (auto-refresh)
└─ ✅ Cambios persisten
```

### Verificaciones Finales
- ✅ Flujo sin errores
- ✅ Todos los toasts correctos
- ✅ Redirecciones automáticas
- ✅ Estados correctos en cada etapa
- ✅ Auto-refresh funciona
- ✅ Breadcrumb actualiza correctamente

---

## 🎯 Checklist General

### Compilación
- [ ] `npm run build` sin errores
- [ ] `npm start` corre sin warnings
- [ ] DevTools sin errores (F12)

### Frontend
- [ ] Todos los componentes cargan
- [ ] Sin errores de TypeScript
- [ ] Responsive en móvil

### Funcionalidad
- [ ] Upload redirige automáticamente
- [ ] Auto-filtrado funciona
- [ ] Breadcrumb navegable
- [ ] Botón CENATE abre nueva pestaña
- [ ] Auto-refresh en CENATE
- [ ] Estados transformados
- [ ] Evaluación guarda

### Performance
- [ ] Sin lag durante auto-refresh
- [ ] Tabla actualiza suavemente
- [ ] Sin errores de red (DevTools)

### UX/UI
- [ ] Breadcrumb visible en todas partes
- [ ] Toasts claros y útiles
- [ ] Colores consistentes
- [ ] Responsive en móvil

---

## 📊 Logs a Verificar (Console)

### Esperado en console.log

```javascript
// Upload exitoso
✅ Detectada redirección desde upload
Mensaje: ✅ 6 EKGs subidos correctamente
DNI: 12345678

// Auto-refresh iniciado
✅ Auto-refresh iniciado (cada 30s)

// Cada 30 segundos
🔄 Auto-refresh: recargando datos...
```

---

## 🔧 Troubleshooting Durante Testing

### Si upload NO redirige
1. Verificar: `useNavigate` está importado (línea 2)
2. Verificar: `navigate()` se ejecuta (línea 236-245)
3. Ver console.log en DevTools (F12)
4. Check toast message aparece

### Si auto-filtrado NO funciona
1. Verificar: `useLocation` está importado
2. Verificar: `location.state` no es null (console.log)
3. Check: `setSearchTerm()` se ejecuta

### Si Breadcrumb NO aparece
1. Verificar: Archivo existe en `/components/teleecgs/`
2. Verificar: Import correcto en las 3 vistas
3. Verificar: Componente dentro de JSX

### Si auto-refresh NO sincroniza
1. Verificar: Interval es 30000ms
2. Abrir DevTools → Network
3. Filtrar por `/api/teleekgs`
4. Ver requests cada 30s

---

## ✅ Sign-off Template

```
═══════════════════════════════════════════════════════════
FLUJO END-TO-END TELEEKG v1.51.0
✅ PROBADO Y APROBADO
═══════════════════════════════════════════════════════════

Fecha de Testing:        ____/____/______
Nombre del QA:           _____________________
Firma:                   _____________________

Test Cases Pasados:      7/7 ✅
Verificaciones:          35+ ✅
Bugs Encontrados:        ___
Comentarios:             _____________________
                         _____________________

Performance:
- Upload tiempo:         ____ segundos
- Redirección:           ____ segundos
- Auto-refresh:          ✅ Funciona (cada 30s)

Browsers Testeados:
- [ ] Chrome
- [ ] Firefox
- [ ] Safari
- [ ] Edge

Dispositivos:
- [ ] Desktop
- [ ] Tablet
- [ ] Mobile

Listo para Producción:   ☐ SÍ  ☐ NO

═══════════════════════════════════════════════════════════
```

---

**Test Cases - TeleEKG Completo** ✅
