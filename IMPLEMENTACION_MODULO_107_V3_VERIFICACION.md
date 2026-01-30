# Implementación Módulo 107 v3.0 - Guía de Verificación y Testing

> Documento de referencia para verificar e2e que la migración del Módulo 107 se completó exitosamente
>
> **Fecha:** 2026-01-29
> **Versión:** 3.0.0
> **Status:** ✅ LISTA PARA PRUEBAS

---

## 📋 Checklist de Verificación Rápida

### ✅ Backend - Base de Datos

- [ ] **V3_3_0__migrar_bolsa_107_a_solicitud_bolsa.sql ejecutado**
  - Ubicación: `backend/src/main/resources/db/migration/`
  - Cambios: Inserta datos de `bolsa_107_item` → `dim_solicitud_bolsa`
  - Verifica: `SELECT COUNT(*) FROM dim_solicitud_bolsa WHERE id_bolsa = 107;` ≈ original count

- [ ] **Índices creados (4 índices nuevos)**
  ```sql
  SELECT * FROM pg_indexes
  WHERE tablename = 'dim_solicitud_bolsa'
  AND indexname LIKE '%modulo107%';
  ```
  Esperado: 4 índices (`idx_modulo107_busqueda`, `_nombre`, `_fecha`, `_ipress`)

- [ ] **Stored Procedure fn_procesar_bolsa_107_v3() existe**
  ```sql
  SELECT proname FROM pg_proc WHERE proname = 'fn_procesar_bolsa_107_v3';
  ```

### ✅ Backend - API

- [ ] **SolicitudBolsaRepository.java actualizado (6 nuevos métodos)**
  - `findAllModulo107Casos()`
  - `buscarModulo107Casos()`
  - `estadisticasModulo107PorEspecialidad()`
  - `estadisticasModulo107PorEstado()`
  - `kpisModulo107()`
  - `evolucionTemporalModulo107()`

- [ ] **Bolsa107Controller.java actualizado (3 nuevos endpoints)**
  - `GET /api/bolsa107/pacientes` ← Listado
  - `GET /api/bolsa107/pacientes/buscar` ← Búsqueda
  - `GET /api/bolsa107/estadisticas` ← Dashboard

- [ ] **Backend compila sin errores**
  ```bash
  cd backend && ./gradlew clean build
  ```

### ✅ Frontend - Servicios

- [ ] **formulario107Service.js actualizado (3 nuevas funciones)**
  - `listarPacientesModulo107()`
  - `buscarPacientesModulo107()`
  - `obtenerEstadisticasModulo107()`

### ✅ Frontend - Componentes

- [ ] **3 nuevos componentes React creados**
  - `ListadoPacientes.jsx` - Tabla con paginación
  - `BusquedaAvanzada.jsx` - Filtros + búsqueda
  - `EstadisticasModulo107.jsx` - Dashboard con KPIs

- [ ] **Listado107.jsx refactorizado con 5 tabs**
  - Tab 1: Cargar Excel (funcionalidad existente)
  - Tab 2: Historial (funcionalidad existente)
  - Tab 3: Listado (NUEVO)
  - Tab 4: Búsqueda (NUEVO)
  - Tab 5: Estadísticas (NUEVO)

---

## 🧪 Plan de Pruebas Detallado

### 1️⃣ Pruebas de Base de Datos

#### Test 1.1: Migración de Datos
```bash
# Comparar conteos
SELECT COUNT(*) as original FROM bolsa_107_item;
SELECT COUNT(*) as migrado FROM dim_solicitud_bolsa WHERE id_bolsa = 107;
# Deben ser iguales (más o menos registros duplicados filtrados)
```

**Criterio de Éxito:** `migrado >= original * 0.95` (permite pérdida mínima por validación)

#### Test 1.2: Integridad de Datos
```sql
-- Verificar mapeo de columnas
SELECT
  b.numero_documento,
  b.paciente,
  b.sexo,
  d.paciente_dni,
  d.paciente_nombre,
  d.paciente_sexo
FROM bolsa_107_item b
LEFT JOIN dim_solicitud_bolsa d
  ON b.numero_documento = d.paciente_dni
  AND d.id_bolsa = 107
LIMIT 10;
```

**Criterio de Éxito:** Todos los campos mapeados correctamente

#### Test 1.3: Índices en Uso
```sql
-- Crear un WHERE que use el índice
EXPLAIN ANALYZE
SELECT * FROM dim_solicitud_bolsa
WHERE id_bolsa = 107
  AND paciente_dni = '12345678'
  AND activo = true;
```

**Criterio de Éxito:** Query plan menciona `idx_modulo107_busqueda`

#### Test 1.4: Foreign Keys
```sql
-- Verificar FK a dim_estados_gestion_citas
SELECT COUNT(*) as missing_states
FROM dim_solicitud_bolsa d
LEFT JOIN dim_estados_gestion_citas s
  ON d.estado_gestion_citas_id = s.id_estado_cita
WHERE d.id_bolsa = 107 AND d.activo = true
AND s.id_estado_cita IS NULL;
```

**Criterio de Éxito:** Count = 0 (sin FK faltantes)

---

### 2️⃣ Pruebas de Backend - API

#### Test 2.1: Endpoint Listado Pacientes
```bash
curl -s -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/bolsa107/pacientes?page=0&size=10" | jq .

# Esperado:
# {
#   "total": <número>,
#   "page": 0,
#   "size": 10,
#   "totalPages": <número>,
#   "pacientes": [...]
# }
```

**Criterio de Éxito:**
- Status HTTP: 200
- Response contiene array "pacientes"
- Cada paciente tiene: paciente_dni, paciente_nombre, estado

#### Test 2.2: Endpoint Búsqueda con Filtros
```bash
# Búsqueda por DNI
curl -s -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/bolsa107/pacientes/buscar?dni=12345678&page=0&size=10" | jq .

# Búsqueda con múltiples filtros
curl -s -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/bolsa107/pacientes/buscar?nombre=JUAN&estadoId=1&page=0&size=10" | jq .
```

**Criterio de Éxito:**
- Status HTTP: 200
- Response contiene solo pacientes que coinciden filtros
- Si no hay resultados, "total": 0 y "pacientes": []

#### Test 2.3: Endpoint Estadísticas
```bash
curl -s -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/bolsa107/estadisticas" | jq .

# Esperado:
# {
#   "kpis": {
#     "total_pacientes": <int>,
#     "atendidos": <int>,
#     "pendientes": <int>,
#     "tasa_completacion": <float>,
#     ...
#   },
#   "distribucion_estado": [...],
#   "distribucion_especialidad": [...],
#   "top_10_ipress": [...],
#   "evolucion_temporal": [...]
# }
```

**Criterio de Éxito:**
- Status HTTP: 200
- Contiene todos los 5 campos: kpis, distribucion_estado, distribucion_especialidad, top_10_ipress, evolucion_temporal
- kpis tiene al menos: total_pacientes, atendidos, pendientes, cancelados

#### Test 2.4: Performance (Respuesta < 2 segundos)
```bash
# Medir tiempo de respuesta
time curl -s -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/bolsa107/pacientes?page=0&size=100" > /dev/null

# Esperado: real = <2s
```

**Criterio de Éxito:** Tiempo de respuesta < 2 segundos

#### Test 2.5: Error Handling
```bash
# Sin autenticación
curl -s "http://localhost:8080/api/bolsa107/pacientes" | jq .
# Esperado: 401 Unauthorized

# Con parámetros inválidos
curl -s -H "Authorization: Bearer YOUR_JWT_TOKEN" \
  "http://localhost:8080/api/bolsa107/pacientes?page=abc" | jq .
# Esperado: 400 Bad Request con mensaje de error
```

**Criterio de Éxito:** Respuestas apropiadas con mensajes de error claros

---

### 3️⃣ Pruebas de Frontend

#### Test 3.1: Navegación de Tabs
```javascript
// En browser console o Playwright test
1. Navegar a /modulo107/dashboard
2. Verificar que carga la página
3. Click en Tab "Cargar Excel" → debe mostrar zona de upload
4. Click en Tab "Historial" → debe mostrar lista de cargas
5. Click en Tab "Listado" → debe mostrar tabla de pacientes
6. Click en Tab "Búsqueda" → debe mostrar formulario de búsqueda
7. Click en Tab "Estadísticas" → debe mostrar KPIs y gráficos
```

**Criterio de Éxito:** Todos los tabs cargan sin errores en consola

#### Test 3.2: Component: ListadoPacientes
```javascript
// Esperado:
1. Tabla con 6 columnas: DNI, Nombre, Sexo, Fecha, IPRESS, Estado
2. Paginación: botones Anterior/Siguiente funcionan
3. Contador: "Página 1 de N" actualiza correctamente
4. Loading state: muestra spinner mientras carga
5. Empty state: muestra mensaje si no hay pacientes
```

**Criterio de Éxito:** Todos los elementos funcionan, datos se muestran correctamente

#### Test 3.3: Component: BusquedaAvanzada
```javascript
// Teste cada filtro:
1. Ingresa DNI "12345678" → click Buscar → muestra resultados
2. Ingresa Nombre "JUAN" → click Buscar → case-insensitive funciona
3. Selecciona IPRESS "001" → click Buscar → filtra correctamente
4. Selecciona Estado "PENDIENTE" → click Buscar → filtra correctamente
5. Ingresa fecha desde/hasta → click Buscar → rango de fechas funciona
6. Click "Limpiar" → todos los filtros se resetean
```

**Criterio de Éxito:** Todos los filtros funcionan independientemente y combinados

#### Test 3.4: Component: EstadisticasModulo107
```javascript
// Verificar cada sección:
1. KPI Cards (5):
   - Total Pacientes: muestra número
   - Atendidos: muestra número + tasa_completacion
   - Pendientes: muestra número + pendientes_vencidas
   - Cancelados: muestra número + tasa_abandono
   - Horas Promedio: muestra número

2. Tabla "Distribución por Estado":
   - Muestra lista de estados con conteos
   - Columnas: Estado, Total, Porcentaje

3. Tabla "Top 10 IPRESS":
   - Muestra top 10 IPRESS
   - Columnas: IPRESS, Pacientes, Atendidos

4. Tabla "Evolución Temporal":
   - Muestra datos de últimos 30 días
   - Columnas: Fecha, Total, Atendidas, Pendientes, Canceladas
```

**Criterio de Éxito:** Todas las secciones cargan datos y se muestran correctamente

#### Test 3.5: Formulario107Service - Funciones
```javascript
// En browser console:
import {
  listarPacientesModulo107,
  buscarPacientesModulo107,
  obtenerEstadisticasModulo107
} from '@/services/formulario107Service';

// Test 1: listar
const result1 = await listarPacientesModulo107(0, 30);
console.log(result1.total, result1.pacientes.length); // ✓

// Test 2: buscar
const result2 = await buscarPacientesModulo107({ dni: '12345678' });
console.log(result2.total); // ✓

// Test 3: estadísticas
const result3 = await obtenerEstadisticasModulo107();
console.log(result3.kpis.total_pacientes); // ✓
```

**Criterio de Éxito:** Todas las funciones retornan datos correctamente

---

### 4️⃣ Pruebas de Integración E2E

#### Test 4.1: Flujo Completo - Importación a Visualización
```
1. Subir archivo Excel a "Cargar Excel" tab
2. Ver estado OK en "Historial" tab
3. Ver pacientes en "Listado" tab
4. Buscar paciente específico en "Búsqueda" tab
5. Ver estadísticas actualizadas en "Estadísticas" tab
```

**Criterio de Éxito:** Todos los datos fluyen correctamente entre módulos

#### Test 4.2: Búsqueda → Resultados → Estadísticas
```
1. Tab "Búsqueda"
2. Filtrar por especialidad "PSICOLOGIA"
3. Ver X resultados
4. Tab "Estadísticas"
5. Verificar que "PSICOLOGIA" en distribución_especialidad tiene count = X
```

**Criterio de Éxito:** Datos consistentes entre búsqueda y estadísticas

#### Test 4.3: Performance con 10,000 Pacientes
```bash
# Si hay datos suficientes:
# Medir tiempo de:
1. Listar primera página (30 registros): < 500ms
2. Búsqueda específica: < 1000ms
3. Estadísticas completas: < 2000ms
```

**Criterio de Éxito:** Tiempos dentro de los límites

---

## 🔍 Debugging y Troubleshooting

### Problema: "endpoint not found" (404)

**Causa:** Endpoints no están en el controlador
**Solución:**
1. Verifica que `Bolsa107Controller.java` tiene los 3 endpoints
2. Backend compiló sin errores: `./gradlew build`
3. Servidor reiniciado después del build

### Problema: "No such table: dim_solicitud_bolsa" en SQL

**Causa:** Migración no se ejecutó
**Solución:**
1. Verifica que `V3_3_0__...sql` está en `backend/src/main/resources/db/migration/`
2. Nombre debe ser V3_3_0 (versión 3.3.0)
3. Ejecuta manualmente si es necesario:
   ```bash
   PGPASSWORD=Essalud2025 psql -h 10.0.89.13 -U postgres -d maestro_cenate \
     -f V3_3_0__migrar_bolsa_107_a_solicitud_bolsa.sql
   ```

### Problema: "Component not found" (React)

**Causa:** Componentes nuevos no se importan
**Solución:**
1. Verifica que existen:
   - `ListadoPacientes.jsx`
   - `BusquedaAvanzada.jsx`
   - `EstadisticasModulo107.jsx`
   En: `frontend/src/pages/roles/coordcitas/`
2. Verifica imports en `Listado107.jsx`
3. Reinicia dev server: `npm start`

### Problema: "TypeError: Cannot read property 'pacientes' of undefined"

**Causa:** Respuesta de API es vacía o formato incorrecto
**Solución:**
1. Verifica que el endpoint retorna JSON con estructura correcta
2. En browser DevTools → Network → ver respuesta exacta
3. Verifica que el Backend está retornando `ResponseEntity.ok(response)`

---

## 📝 Reporte de Ejecución

### Template para documentar resultados:

```
## Ejecución de Pruebas - [FECHA]

### Status Global: ✅ APROBADO / ⚠️ CON NOTAS / ❌ RECHAZADO

### Resumen
- Backend: ✅ / ⚠️ / ❌
- Frontend: ✅ / ⚠️ / ❌
- Base de Datos: ✅ / ⚠️ / ❌
- Integración E2E: ✅ / ⚠️ / ❌

### Detalles por Componente

#### Base de Datos
- [x] Migración completada
- [x] Índices creados
- [x] SP funciona
- Observaciones: ...

#### Backend
- [x] Endpoints activos
- [x] Búsqueda funciona
- [x] Estadísticas correctas
- Observaciones: ...

#### Frontend
- [x] Tabs navegan correctamente
- [x] Componentes cargan datos
- [x] Búsqueda filtra correctamente
- Observaciones: ...

### Issues Encontrados
1. [SEVERIDAD] Descripción
   - Impacto: ...
   - Solución: ...

### Performance Metrics
- Listar pacientes (30): XXXms
- Búsqueda: XXXms
- Estadísticas: XXXms
- Average: XXXms

### Conclusiones
[Narrativa final sobre la calidad y readiness]
```

---

## 🎯 Checklist de Despliegue

Antes de hacer push a producción:

- [ ] Todas las pruebas pasadas (✅ 4/4)
- [ ] Sin errores en logs backend
- [ ] Sin errores en console frontend
- [ ] Base de datos migrada correctamente
- [ ] Backup de `bolsa_107_item` realizado
- [ ] Script de rollback documentado
- [ ] Documentación actualizada
- [ ] Changelog registrado
- [ ] Team notificado de la migración
- [ ] Fecha de rollback en calendario (si es necesario)

---

## 📞 Soporte y Contacto

**Si encuentras issues:**

1. Revisar este documento (testing guide)
2. Revisar documentación principal: `spec/backend/10_modules_other/03_modulo_formulario_107.md`
3. Revisar changelog: `checklist/01_Historial/01_changelog.md`
4. Contactar al equipo de desarrollo

**Documentos de Referencia:**
- Especificación: `spec/backend/10_modules_other/03_modulo_formulario_107.md`
- Estadísticas: `spec/backend/10_modules_other/03_modulo_formulario_107_v3_estadisticas.md`
- Migration Script: `backend/src/main/resources/db/migration/V3_3_0__...sql`
- Changelog: `checklist/01_Historial/01_changelog.md`

---

**Versión:** 3.0.0
**Última actualización:** 2026-01-29
**Estado:** ✅ LISTO PARA PRUEBAS
