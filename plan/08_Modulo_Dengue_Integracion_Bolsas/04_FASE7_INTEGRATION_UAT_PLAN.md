# 🚀 Fase 7: Integration Testing & UAT

**Estado:** 🟡 PENDIENTE (Listo para iniciar)
**Versión:** 1.0.0

---

## 📋 Resumen

Phase 7 consiste en 3 actividades principales:
1. **Integration Testing** - Backend + Frontend + Database
2. **Performance Testing** - Validar tiempos
3. **UAT** - Validación con usuario final (Coronado Davila Fernando)

---

## 🧪 PARTE 1: Integration Testing (Backend + Frontend)

### 1.1 Testing del Upload con Excel Real

**Prerequisitos:**
- ✅ Archivo: `Atendidos Dengue CENATE 2026-01-27.xlsx` (6,548 registros)
- ✅ Backend corriendo en localhost:8080
- ✅ Frontend corriendo en localhost:3000
- ✅ Database PostgreSQL accesible

**Pasos de Test:**

```
PASO 1: Navegar a http://localhost:3000/dengue/dashboard
  ✅ Ver header "Módulo Dengue" con 🦟
  ✅ Ver 4 tabs disponibles (Cargar, Listar, Buscar, Resultados deshabilitado)

PASO 2: Click en tab "Cargar Excel"
  ✅ Ver zona de drop
  ✅ Ver instrucciones
  ✅ Ver tabla de ejemplo

PASO 3: Cargar archivo Atendidos Dengue CENATE 2026-01-27.xlsx
  ✅ Drag & drop el archivo
  ✅ Ver preview del archivo
  ✅ Click en "Cargar Excel"
  ✅ Ver indicador de progreso

PASO 4: Esperar respuesta del backend
  ✅ Resultado exitoso o con errores
  ✅ Ver tab "Resultados" ahora activo
  ✅ Cambio automático a tab de resultados

PASO 5: Ver reporte de validación
  ✅ Tarjeta "Total Procesados": 6548
  ✅ Tarjeta "Insertados": X (nuevo)
  ✅ Tarjeta "Actualizados": Y (duplicado)
  ✅ Tarjeta "Errores": Z
  ✅ Tarjeta "Tasa de Éxito": XX%
  ✅ Barra de progreso con segmentos

PASO 6: Expandir errores (si los hay)
  ✅ Ver lista de primeros 20 errores
  ✅ Ver indicador "X errores más"
```

**Éxito esperado:**
- Importación completa < 10 segundos
- 0 errores o errores documentados
- Tab "Listar" muestra casos cargados

---

### 1.2 Testing del Listado de Casos

**Pasos de Test:**

```
PASO 1: Click en tab "Listar Casos"
  ✅ Ver tabla con casos dengue
  ✅ Ver header con columnas
  ✅ Ver colores de CIE-10:
     - Amarillo (A97.0)
     - Verde (A97.1)
     - Rojo (A97.2)

PASO 2: Verificar columnas mostradas (11 columnas)
  ✅ DNI
  ✅ Nombre
  ✅ Sexo
  ✅ CAS (código)
  ✅ CIE-10 (con color)
  ✅ IPRESS
  ✅ Red Asistencial
  ✅ Fecha Atención (dd/mm/yyyy)
  ✅ Fecha Síntomas (dd/mm/yyyy)
  ✅ Semana Epidemiológica
  ✅ Estado

PASO 3: Verificar leyenda de colores
  ✅ A97.0 - Fiebre Amarilla (Amarillo)
  ✅ A97.1 - Dengue (Verde)
  ✅ A97.2 - Dengue Hemorrágico (Rojo)

PASO 4: Verificar estadísticas rápidas
  ✅ Total registros: (próximo a 6548)
  ✅ Dengue (A97.1): X (mayor cantidad)
  ✅ Dengue Hemorrágico (A97.2): X
  ✅ Fiebre Amarilla (A97.0): X

PASO 5: Probar paginación
  ✅ Cambiar tamaño: 10 → 30 → 50 → 100
  ✅ Navegar: Primera → Anterior → Siguiente → Última
  ✅ Indicador: "Página 1 de X" actualiza

PASO 6: Probar ordenamiento
  ✅ Cambiar "Ordenar por": fechaSolicitud → DNI → CIE-10
  ✅ Botón toggle: DESC ⬇️ → ASC ⬆️
  ✅ Tabla se reordena correctamente
```

**Éxito esperado:**
- Tabla muestra >= 6000 casos
- Colores correctos por CIE-10
- Paginación funciona suavemente
- Ordenamiento responde en <500ms

---

### 1.3 Testing de Búsqueda y Filtros

**Pasos de Test:**

```
PASO 1: Click en tab "Buscar"
  ✅ Ver filtros: DNI + CIE-10
  ✅ Ver botones: Buscar, Limpiar

PASO 2: Búsqueda por DNI
  - Escribir: "00370941" (ej: PARDO SANDOVAL CESAR)
  ✅ Click "Buscar"
  ✅ Tabla muestra solo casos con ese DNI
  ✅ Página vuelve a 1
  ✅ Resultado único o múltiple (según datos)

PASO 3: Búsqueda por CIE-10
  - Seleccionar: "A97.0" (Fiebre Amarilla)
  ✅ Click "Buscar"
  ✅ Tabla muestra solo A97.0
  ✅ Leyenda muestra solo amarillo
  ✅ Estadísticas: todos con A97.0

PASO 4: Búsqueda combinada
  - DNI: "00370941"
  - CIE-10: "A97.1"
  ✅ Click "Buscar"
  ✅ Tabla muestra intersection
  ✅ Resultado más restrictivo

PASO 5: Limpiar filtros
  ✅ Click "Limpiar"
  ✅ Campos vaciados
  ✅ Tabla vuelve a mostrar todos
  ✅ Totales recalculados
```

**Éxito esperado:**
- Búsqueda por DNI devuelve resultados correctos
- Búsqueda por CIE-10 filtra por tipo
- Combinadas devuelven intersection
- Limpiar restaura el estado inicial

---

### 1.4 Testing de Deduplicación

**Verificación en BD:**

```sql
-- Verificar que DNI + fecha_atencion es unique
SELECT paciente_dni, fecha_atencion, COUNT(*) as duplicados
FROM dim_solicitud_bolsa
WHERE id_bolsa = 2
GROUP BY paciente_dni, fecha_atencion
HAVING COUNT(*) > 1;

-- Esperado: 0 filas (sin duplicados)

-- Ver últimas inserciones/actualizaciones
SELECT id_solicitud, paciente_dni, dx_main, fecha_atencion, fecha_creacion
FROM dim_solicitud_bolsa
WHERE id_bolsa = 2
ORDER BY fecha_creacion DESC
LIMIT 20;
```

**Éxito esperado:**
- No hay duplicados (DNI + fecha es unique)
- Registros con actualizaciones recientes
- dx_main contiene A97.0, A97.1, A97.2

---

## ⚡ PARTE 2: Performance Testing

### 2.1 Tiempo de Upload

**Métrica:** Tiempo desde click "Cargar Excel" hasta recibir resultado

**Requisito:** < 10 segundos para 6,548 registros

**Cómo medir:**
1. Abrir DevTools (F12)
2. Tab "Network" o "Performance"
3. Iniciar carga del Excel
4. Esperar hasta que se complete
5. Registrar tiempoMs del response JSON

**Script de test (opcional):**
```javascript
console.time('Upload Excel');
await dengueService.cargarExcelDengue(archivo, usuarioId);
console.timeEnd('Upload Excel');
```

**Éxito esperado:**
- ✅ < 10 segundos ideal
- ⚠️ < 20 segundos aceptable
- ❌ > 20 segundos = optimizar índices

---

### 2.2 Tiempo de Listado

**Métrica:** Tiempo desde request GET hasta renderizar tabla

**Requisito:** < 2 segundos para cargar página 1 (30 casos)

**Cómo medir:**
1. Tab "Listar Casos"
2. Abrir DevTools → Performance tab
3. Click en record
4. Esperar a que cargue la tabla
5. Stop recording
6. Ver "Rendering" time en resumen

**Éxito esperado:**
- Tiempo GET: < 200ms
- Tiempo rendering: < 300ms
- Total: < 500ms

---

### 2.3 Paginación

**Métrica:** Tiempo cambiar de página (30 → 60 registros)

**Requisito:** < 300ms

**Cómo medir:**
```javascript
console.time('Page Change');
// Click siguiente página
console.timeEnd('Page Change');
```

---

## 👤 PARTE 3: UAT (User Acceptance Testing)

### 3.1 Usuarios de Prueba

**Coronado Davila Fernando** (asumido como usuario principal)
- Rol: COORDINADOR / ADMIN
- Tarea: Validar flujo completo de dengue
- Requisitos de acceso: /dengue/dashboard

### 3.2 Checklist UAT

#### ✅ Usabilidad General
- [ ] Interfaz intuitiva (sin necesidad de entrenamiento)
- [ ] Colores significativos (rojo = grave, verde = normal)
- [ ] Botones claramente identificables
- [ ] Mensajes de error útiles
- [ ] Tiempos de respuesta aceptables

#### ✅ Upload
- [ ] Pueden subir archivo Excel
- [ ] Validación clara de formato
- [ ] Indicador de progreso visible
- [ ] Resultado mostrado en página
- [ ] Pueden descargar reporte

#### ✅ Tabla de Casos
- [ ] Columnas dengue-específicas visibles
- [ ] Datos coinciden con Excel original
- [ ] Colores de CIE-10 correctos
- [ ] Fechas formateadas correctamente
- [ ] Performance aceptable con 6000+ registros

#### ✅ Búsqueda
- [ ] Filtro por DNI funciona
- [ ] Filtro por CIE-10 funciona
- [ ] Búsqueda combinada correcta
- [ ] Limpiar filtros restaura estado

#### ✅ Paginación
- [ ] Navegar entre páginas sin problemas
- [ ] Tamaño de página editable
- [ ] Indicador de página útil

#### ✅ Reporte
- [ ] Estadísticas visibles y correctas
- [ ] Errores listados (si los hay)
- [ ] Imprimible

### 3.3 Feedback del Usuario

**Preguntas para Coronado:**

```
1. ¿Es la interfaz intuitiva? ¿Necesita cambios en UX?
2. ¿Los colores ayudan a identificar tipos de dengue?
3. ¿Puede encontrar fácilmente los casos?
4. ¿El tiempo de upload es aceptable?
5. ¿Falta alguna columna o dato importante?
6. ¿Recomendaría cambios en el layout?
7. ¿Es útil el reporte de validación?
8. ¿Necesita exportar a Excel desde la tabla?
```

---

## 📊 Métricas de Éxito (Phase 7)

| Métrica | Objetivo | Actual | Estado |
|---------|----------|--------|--------|
| Upload < 10s | 6,548 registros | TBD | ⏳ |
| Listado < 2s | First page load | TBD | ⏳ |
| No duplicados | 0 en BD | TBD | ⏳ |
| UAT Pass | 100% | TBD | ⏳ |
| Performance | < 300ms/page | TBD | ⏳ |

---

## 🔧 Troubleshooting

### Problema: Upload falla con error 400

**Posibles causas:**
- Archivo no es .xlsx válido
- Nombre de columnas no coincide
- Faltan campos requeridos

**Solución:**
1. Validar archivo con Excel
2. Revisar logs del backend
3. Recrear archivo si es necesario

---

### Problema: Tabla cargada pero vacía

**Posibles causas:**
- Query SQL no filtra correctamente id_bolsa = 2
- Registros insertados con id_bolsa diferente
- Filtro de activo = false

**Solución:**
1. Validar query en repository
2. Revisar insert statement en service
3. Verificar índices

---

### Problema: Performance lenta (>20s upload)

**Posibles causas:**
- N+1 queries en backend
- Índices faltantes en tabla
- Conexión DB lenta

**Solución:**
1. Revisar query logs
2. Agregar índices en (`paciente_dni`, `fecha_atencion`)
3. Implementar batch insert

---

## 📝 Documentación Requerida (Post-UAT)

- [ ] Screenshot de tabla llena
- [ ] Screenshot de reporte exitoso
- [ ] Manual de usuario (paso a paso)
- [ ] Troubleshooting guide
- [ ] API documentation (Swagger)
- [ ] Performance baseline (tiempos reales)

---

## 🎯 Entrada a Producción

**Pre-requisitos:**
- ✅ Todas las pruebas pasan
- ✅ UAT aprobado
- ✅ Performance dentro de límites
- ✅ Zero blocker bugs
- ✅ Documentación completa

**Post-deployment:**
- [ ] Monitorear logs por errores
- [ ] Validar integridad de datos
- [ ] Comunicar usuarios
- [ ] Soporte disponible

---

## 📅 Timeline Estimado

| Actividad | Duración | Status |
|-----------|----------|--------|
| Integration Testing | 2-3 horas | ⏳ |
| Performance Testing | 1 hora | ⏳ |
| UAT | 1-2 horas | ⏳ |
| Fixes (si aplica) | 1-2 horas | ⏳ |
| **Total** | **5-8 horas** | ⏳ |

---

**Siguiente paso:** Ejecutar Phase 7 y registrar resultados en este documento.
