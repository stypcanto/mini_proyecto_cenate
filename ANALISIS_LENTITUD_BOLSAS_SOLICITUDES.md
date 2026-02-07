# 🔍 Análisis: Lentitud en `/bolsas/solicitudes`

**Fecha:** 2026-02-06
**Problema:** Página demora mucho en cargar
**Causa Raíz:** Excesivas llamadas a BD sin caching ni paginación

---

## 📊 Diagnóstico

### 🔴 El Problema

En `/bolsas/solicitudes`, al cargar la página, se ejecutan **~11 HTTP requests** de forma SECUENCIAL Y EN PARALELO:

```
Frontend (Solicitudes.jsx)
    ↓
[Efecto 1] cargarCatalogos()
    → 5 requests paralelos

[Efecto 1.5] cargarEspecialidades()
    → 1 request

[Efecto 2.6] estadísticas en paralelo
    → 4 requests paralelos

[Efecto 2] cargarSolicitudesConFiltros()
    → 1 request (con JOIN pesado)

TOTAL: ~11 requests de BD
```

### 🔴 Consultas SQL Ineficientes

Cada estadística hace un **FULL TABLE SCAN** sin índices:

#### Query 1: `obtenerKpis()` - LA MÁS PESADA
```sql
SELECT
    COUNT(sb.id_solicitud),
    COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END),
    COUNT(CASE WHEN dgc.desc_estado_cita = 'PENDIENTE' THEN 1 END),
    -- ... más CASE WHEN
    AVG(EXTRACT(EPOCH FROM (sb.fecha_actualizacion - sb.fecha_solicitud)) / 3600),
    COUNT(CASE WHEN dgc.desc_estado_cita = 'PENDIENTE'
        AND sb.fecha_solicitud < NOW() - INTERVAL '7 days' THEN 1 END)
FROM dim_solicitud_bolsa sb
LEFT JOIN dim_estados_gestion_citas dgc
    ON sb.estado_gestion_citas_id = dgc.id_estado_cita
WHERE sb.activo = true
```

**Problemas:**
- ❌ JOIN sin índice en `estado_gestion_citas_id`
- ❌ Operaciones de fecha (`EXTRACT EPOCH`) sin índices
- ❌ Múltiples CASE WHEN (12+ condiciones)
- ❌ Full table scan: O(n) donde n = total solicitudes
- ❌ Se ejecuta **CADA vez** que se carga la página
- ❌ Sin caching de resultados

#### Query 2-4: Estadísticas por tipo bolsa, IPRESS, tipo cita

Similares a la anterior, pero con:
- Window functions: `ROW_NUMBER() OVER (ORDER BY ...)`
- GROUP BY complejos
- ROW_NUMBER = ordenamiento extra que requiere escanear toda la tabla primero

Ejemplo:
```sql
SELECT sb.codigo_ipress, di.desc_ipress, dr.desc_red,
    COUNT(sb.id_solicitud),
    COUNT(CASE WHEN dgc.desc_estado_cita = 'ATENDIDO' THEN 1 END),
    ROUND(... / NULLIF(COUNT(sb.id_solicitud), 0), 2),
    ROW_NUMBER() OVER (ORDER BY COUNT(sb.id_solicitud) DESC) as ranking
FROM dim_solicitud_bolsa sb
LEFT JOIN dim_ipress di ON sb.codigo_ipress = di.cod_ipress
LEFT JOIN dim_red dr ON di.id_red = dr.id_red
LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
WHERE sb.activo = true AND sb.codigo_ipress IS NOT NULL
GROUP BY sb.codigo_ipress, di.desc_ipress, dr.desc_red
ORDER BY total DESC
```

---

## 📈 Impacto de Performance

### Tiempo Actual (ESTIMADO)
```
Catálogos (5 requests):        800ms (serial)
  - obtenerEstadosGestion()    ~150ms
  - obtenerIpress()            ~200ms
  - obtenerRedes()             ~150ms
  - obtenerGestorasDisponibles() ~100ms
  - obtenerTiposBolsasActivosPublic() ~100ms

Especialidades:               ~100ms

Estadísticas (4 paralelos):   ~800ms (el máximo de los 4)
  - obtenerKpis()             ~300ms ← LA MÁS LENTA
  - obtenerEstadisticasPorIpress() ~250ms (JOIN + GROUP BY + ROW_NUMBER)
  - obtenerEstadisticasPorTipoCita() ~150ms
  - obtenerEstadisticasPorTipoBolsa() ~150ms

Solicitudes con filtros:      ~500ms

TOTAL: ~2-3 SEGUNDOS
```

### Problema Real
- Si BD tiene **7,973 solicitudes** (como mencionó el proyecto)
- Cada estadística requiere leer y procesar TODAS las filas
- 4 estadísticas paralelas = 4 full table scans simultáneos
- Compiten por recursos: CPU, memoria, I/O del disco

---

## 🔧 Recomendaciones (Por Severidad)

### 🚨 CRÍTICO - Implementar Ahora

#### 1. Agregar Índices Faltantes
```sql
-- Índices para estadísticas
CREATE INDEX idx_solicitud_bolsa_activo ON dim_solicitud_bolsa(activo);
CREATE INDEX idx_solicitud_bolsa_estado_gestion ON dim_solicitud_bolsa(estado_gestion_citas_id);
CREATE INDEX idx_solicitud_bolsa_codigo_ipress ON dim_solicitud_bolsa(codigo_ipress);
CREATE INDEX idx_solicitud_bolsa_especialidad ON dim_solicitud_bolsa(especialidad);
CREATE INDEX idx_solicitud_bolsa_tipo_cita ON dim_solicitud_bolsa(tipo_cita);
CREATE INDEX idx_solicitud_bolsa_fecha_solicitud ON dim_solicitud_bolsa(fecha_solicitud);

-- Índice compuesto para las queries de estadísticas
CREATE INDEX idx_solicitud_bolsa_activo_estado ON dim_solicitud_bolsa(activo, estado_gestion_citas_id);
CREATE INDEX idx_solicitud_bolsa_activo_ipress ON dim_solicitud_bolsa(activo, codigo_ipress);

-- Índice para búsqueda en filtros
CREATE INDEX idx_solicitud_bolsa_activo_busqueda
    ON dim_solicitud_bolsa(activo)
    INCLUDE (codigo_ipress, especialidad, tipo_cita);
```

**Impacto:** 40-60% mejora en velocidad de estadísticas

#### 2. Implementar Caching en Backend
```java
// En SolicitudBolsaEstadisticasServiceImpl.java
@Override
@Cacheable("estadisticas-por-estado")
public List<EstadisticasPorEstadoDTO> obtenerEstadisticasPorEstado() {
    log.info("📊 Obteniendo estadísticas por estado...");
    // ... query pesada ...
}

@Override
@Cacheable(value = "kpis", cacheManager = "cacheManager")
public EstadisticasGeneralesDTO obtenerEstadisticasGenerales() {
    // ... query pesada ...
}
```

**Configurar en `application.properties`:**
```properties
spring.cache.type=redis
spring.redis.host=localhost
spring.redis.port=6379
spring.cache.redis.time-to-live=300000  # 5 minutos
```

**Ventajas:**
- Elimina queries repetidas
- Response time: 300ms → 5-10ms (60x más rápido)
- Cache se invalida cada 5 minutos
- Si datos cambian, mostrar versión cached es aceptable

#### 3. Agrupar Estadísticas en 1 Endpoint
Crear `/api/bolsas/estadisticas/consolidadas` que retorna TODO de una sola query:

```javascript
// Frontend: una sola llamada
const stats = await bolsasService.obtenerEstadisticasConsolidadas();
// Retorna: { por_estado, por_ipress, por_tipo_cita, por_tipo_bolsa, kpis }

// En lugar de 4 llamadas paralelas
```

**Cambios Backend:**
```java
@GetMapping("/consolidadas")
@Cacheable("estadisticas-consolidadas")
public ResponseEntity<EstadisticasConsolidadasDTO> obtenerConsolidadas() {
    // Una sola query que retorna TODO
}
```

**Impacto:** 4 queries → 1 query, respuesta en 200-300ms

---

### ⚠️ IMPORTANTE - Implementar en 1-2 Semanas

#### 4. Paginación en Frontend
```javascript
// Solicitudes.jsx
// Cambiar de: cargar TODO + filtrar en cliente
// A: cargar 25 + filtrar en servidor

const cargarSolicitudesConFiltros = async () => {
  const response = await bolsasService.obtenerSolicitudesPaginado(
    page,  // 0
    size,  // 25
    filtros...
  );
  // response.content = 25 registros
  // response.totalElements = 7973
};
```

**Impacto:** Primera carga: 7973 registros → 25 registros = 10x más rápido

#### 5. Debounce en Búsqueda
```javascript
// Frontend - agregar debounce a los cambios de filtro
const [searchTerm, setSearchTerm] = useState('');
const debouncedSearch = useMemo(
  () => debounce((term) => cargarSolicitudesConFiltros(), 500),
  []
);

const handleSearchChange = (term) => {
  setSearchTerm(term);
  debouncedSearch(term); // No buscar en cada tecla, esperar 500ms
};
```

**Impacto:** Reducir requests de 1 por caracter → 1 cada 500ms

---

### 💡 OPCIONAL - Mejoras Futuras

#### 6. Redis para Cache Distribuido
```yaml
# docker-compose.yml
redis:
  image: redis:7-alpine
  ports:
    - "6379:6379"
```

#### 7. Materializar Vistas (Materialized Views)
```sql
-- En PostgreSQL
CREATE MATERIALIZED VIEW mv_estadisticas_por_estado AS
SELECT ... FROM dim_solicitud_bolsa ...

-- Refrescar cada hora
REFRESH MATERIALIZED VIEW CONCURRENTLY mv_estadisticas_por_estado;
```

#### 8. Separar en Microservicios
- Estadísticas → Servicio aparte con BD dedicada
- Solicitudes → Servicio principal
- Comunicación via API o mensaje queue

---

## 🚀 Plan de Acción (Prioridades)

### Fase 1: AHORA (1-2 horas)
- [ ] Crear índices SQL (4 índices críticos)
- [ ] Testear mejora de performance

### Fase 2: Esta Semana
- [ ] Implementar caching con @Cacheable
- [ ] Consolidar estadísticas en 1 endpoint
- [ ] Agregar debounce en búsqueda

### Fase 3: Próximas 2 Semanas
- [ ] Implementar paginación correcta en frontend
- [ ] Redis para cache distribuido
- [ ] Monitoreo con métricas

---

## 📊 Monitoreo

Agregar métricas para ver mejoras:

```java
// En controller
long startTime = System.currentTimeMillis();
List<EstadisticasPorEstadoDTO> datos = estadisticasService.obtenerEstadisticasPorEstado();
long duration = System.currentTimeMillis() - startTime;
log.info("⏱️ /por-estado tardó {}ms", duration);
```

Esperado después de optimizaciones:
```
Antes:  ❌ 300-800ms por query
Después: ✅ 5-20ms (cached) o 50-100ms (fresh)
```

---

## 📝 Checklist de Implementación

### Índices
- [ ] `idx_solicitud_bolsa_activo`
- [ ] `idx_solicitud_bolsa_estado_gestion`
- [ ] `idx_solicitud_bolsa_activo_estado` (compuesto)
- [ ] `idx_solicitud_bolsa_fecha_solicitud`

### Backend
- [ ] Agregar `@Cacheable` a 4 métodos de estadísticas
- [ ] Crear endpoint `/consolidadas`
- [ ] Configurar Redis en `application.properties`
- [ ] Logs con @Slf4j

### Frontend
- [ ] Agregar debounce a filtros
- [ ] Cambiar a paginación server-side
- [ ] Mostrar spinner mientras cargan estadísticas

### Testing
- [ ] Medir tiempos antes/después
- [ ] Testear con BD completa (7973 solicitudes)
- [ ] Verificar que Cache se invalida cada 5 minutos

---

## 💾 Scripts SQL para Ejecutar

```bash
# Ejecutar en PostgreSQL
psql -h 10.0.89.241 -U postgres -d maestro_cenate -f analisis_indices.sql
```

**Contenido de `analisis_indices.sql`:**
```sql
-- Ver índices existentes
\di dim_solicitud_bolsa*

-- Ver tamaño de tabla
SELECT pg_size_pretty(pg_total_relation_size('dim_solicitud_bolsa'));

-- Ver queries lentas (required: pg_stat_statements habilitado)
SELECT query, calls, mean_exec_time
FROM pg_stat_statements
WHERE query LIKE '%dim_solicitud_bolsa%'
ORDER BY mean_exec_time DESC;

-- Crear índices
CREATE INDEX CONCURRENTLY idx_solicitud_bolsa_activo
    ON dim_solicitud_bolsa(activo);
CREATE INDEX CONCURRENTLY idx_solicitud_bolsa_estado_gestion
    ON dim_solicitud_bolsa(estado_gestion_citas_id);
-- ... resto de índices ...

-- Analizar impacto
ANALYZE dim_solicitud_bolsa;
```

---

## 📞 Resumen Ejecutivo

**Problema:** `/bolsas/solicitudes` demora 2-3 segundos en cargar
**Causa:** 11 HTTP requests + 4 full table scans paralelos sin caching
**Solución Inmediata:** Crear índices + caching en backend
**Mejora Esperada:** 2-3 segundos → 300-500ms (5-10x más rápido)
**Esfuerzo:** 4-6 horas de desarrollo + 1 hora testing

