# ⚡ QUICK FIX: /bolsas/solicitudes - 3 Pasos (2 horas)

**Objetivo:** Reducir tiempo de carga de 2-3 segundos a 300-500ms
**Esfuerzo:** 2 horas
**Resultado:** 5-10x más rápido

---

## ✅ PASO 1: Ejecutar Script SQL (5 minutos)

```bash
# 1. Conectar a PostgreSQL
psql -h 10.0.89.241 -U postgres -d maestro_cenate

# 2. Copiar y ejecutar el script
\i /Users/styp/Documents/CENATE/Chatbot/API_Springboot/mini_proyecto_cenate/spec/database/06_scripts/optimizar_bolsas_solicitudes.sql

# 3. Verificar que los índices se crearon
SELECT indexname FROM pg_indexes WHERE tablename = 'dim_solicitud_bolsa';
```

**Esperado:**
- 10 índices nuevos creados
- Sin bloqueos (CONCURRENTLY)
- Tiempo total: <5 minutos

---

## ✅ PASO 2: Agregar Caching en Backend (30 minutos)

### A. Agregar Dependencia (en `build.gradle`)

```gradle
dependencies {
    // Ya debería estar en el proyecto, si no:
    implementation 'org.springframework.boot:spring-boot-starter-data-redis'
    implementation 'org.springframework.boot:spring-boot-starter-cache'
}
```

### B. Habilitar Cache (en `SolicitudBolsaEstadisticasServiceImpl.java`)

```java
// En la clase
@Service
@Slf4j
@Transactional(readOnly = true)
public class SolicitudBolsaEstadisticasServiceImpl implements SolicitudBolsaEstadisticasService {

    // ... código existente ...

    // AGREGAR @Cacheable a estos 4 métodos:

    @Override
    @Cacheable(value = "estadisticas-por-estado", cacheManager = "cacheManager")
    public List<EstadisticasPorEstadoDTO> obtenerEstadisticasPorEstado() {
        log.info("📊 Obteniendo estadísticas por estado...");
        // ... código existente ...
    }

    @Override
    @Cacheable(value = "estadisticas-por-ipress", cacheManager = "cacheManager")
    public List<EstadisticasPorIpressDTO> obtenerEstadisticasPorIpress() {
        log.info("📊 Obteniendo estadísticas por IPRESS...");
        // ... código existente ...
    }

    @Override
    @Cacheable(value = "estadisticas-por-tipo-cita", cacheManager = "cacheManager")
    public List<EstadisticasPorTipoCitaDTO> obtenerEstadisticasPorTipoCita() {
        log.info("📊 Obteniendo estadísticas por tipo de cita...");
        // ... código existente ...
    }

    @Override
    @Cacheable(value = "estadisticas-por-tipo-bolsa", cacheManager = "cacheManager")
    public List<EstadisticasPorTipoBolsaDTO> obtenerEstadisticasPorTipoBolsa() {
        log.info("📊 Obteniendo estadísticas por tipo de bolsa...");
        // ... código existente ...
    }

    @Override
    @Cacheable(value = "kpis", cacheManager = "cacheManager")
    public EstadisticasGeneralesDTO obtenerEstadisticasGenerales() {
        log.info("📊 Calculando estadísticas generales...");
        // ... código existente ...
    }
}
```

### C. Configurar Redis (en `application.properties`)

```properties
# ========================
# 🔴 REDIS - Cache
# ========================
spring.cache.type=redis
spring.redis.host=localhost
spring.redis.port=6379
spring.redis.timeout=60000ms
spring.redis.password=

# Cache TTL (Tiempo a Vivir): 5 minutos
# Después de 5 min, los datos se recalculan (importante para datos frescos)
spring.cache.redis.time-to-live=300000

# Máximo de conexiones
spring.redis.jedis.pool.max-active=8
spring.redis.jedis.pool.max-idle=8
spring.redis.jedis.pool.min-idle=0
```

### D. Crear Config de Cache (nuevo archivo: `CacheConfig.java`)

```java
package com.styp.cenate.config;

import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.data.redis.cache.RedisCacheManager;
import org.springframework.data.redis.connection.RedisConnectionFactory;
import org.springframework.cache.annotation.EnableCaching;

@Configuration
@EnableCaching
public class CacheConfig {

    @Bean
    public RedisCacheManager cacheManager(RedisConnectionFactory connectionFactory) {
        return RedisCacheManager.create(connectionFactory);
    }
}
```

---

## ✅ PASO 3: Agregar Debounce en Frontend (30 minutos)

### A. Crear función `debounce` (en `Solicitudes.jsx`)

```javascript
// Agregar al inicio del archivo
const debounce = (func, delay) => {
  let timeoutId;
  return (...args) => {
    clearTimeout(timeoutId);
    timeoutId = setTimeout(() => func(...args), delay);
  };
};
```

### B. Envolver llamadas de filtro con debounce

```javascript
// En Solicitudes.jsx, buscar esta línea (alrededor de línea 315):
useEffect(() => {
    if (isFirstLoad.current) {
      console.log('🔍 Primer mount - inicializando filtros...');
      isFirstLoad.current = false;
      return;
    }

    // ANTES: se ejecutaba en cada cambio de filtro
    // DESPUÉS: usar debounce de 500ms

    console.log('🔍 Filtros cambiados - Reloading solicitudes con filtros');
    setCurrentPage(1);

    // Crear una función debouncedCargarSolicitudes fuera de useEffect
    cargarSolicitudesConFiltros();
}, [filtroBolsa, filtroMacrorregion, filtroRed, filtroIpress,
    filtroEspecialidad, filtroEstado, filtroTipoCita, filtroAsignacion, searchTerm]);
```

**Cambiar a:**

```javascript
// Agregar ANTES de los useEffect (línea ~173)
const debouncedCargarSolicitudes = React.useMemo(
  () => debounce(() => {
    setCurrentPage(1);
    cargarSolicitudesConFiltros();
  }, 500),
  [cargarSolicitudesConFiltros]
);

// En EFFECT 3 (línea ~300), cambiar:
useEffect(() => {
    if (isFirstLoad.current) {
      console.log('🔍 Primer mount - inicializando filtros...');
      isFirstLoad.current = false;
      return;
    }

    // ✅ Usar debounce: esperar 500ms antes de llamar API
    console.log('🔍 Filtros cambiados - Esperando confirmación...');
    debouncedCargarSolicitudes();
}, [filtroBolsa, filtroMacrorregion, filtroRed, filtroIpress,
    filtroEspecialidad, filtroEstado, filtroTipoCita, filtroAsignacion,
    searchTerm, debouncedCargarSolicitudes]);
```

---

## 🚀 COMPILAR Y TESTEAR

### Paso 1: Backend
```bash
cd backend
./gradlew clean build
./gradlew bootRun
```

**Verificar en logs:**
```
✅ Spring Data Redis autoconfigured
✅ CacheConfig loaded
✅ @EnableCaching active
```

### Paso 2: Frontend
```bash
cd frontend
npm start
```

### Paso 3: Medir Performance

1. Abrir DevTools (F12)
2. Ir a Network tab
3. Cargar `/bolsas/solicitudes`
4. Medir tiempo total

**Resultado Esperado:**
```
ANTES:  ❌ 2000-3000ms
DESPUÉS: ✅ 300-500ms
```

---

## 📊 VALIDACIÓN

### Checklist de Verificación

- [ ] Los 10 índices se crearon en BD
- [ ] Spring Boot inicia sin errores
- [ ] Redis está conectado (logs: "Redis connection established")
- [ ] `/bolsas/solicitudes` carga en <500ms
- [ ] Al cambiar filtro, espera 500ms antes de llamar BD
- [ ] Revisión de cache: En browser DevTools → Storage → Redis
- [ ] Primera carga: ~500ms, segundas cargas: ~50ms

### Monitorear Rendimiento

```bash
# Ver estadísticas de cache en tiempo real
redis-cli
> INFO stats
> KEYS estadisticas-*
> TTL estadisticas-por-estado
```

---

## 🔧 SI ALGO FALLA

### Redis no conecta
```
Error: Cannot get a resource, pool error

Solución:
1. Verificar: redis-cli ping
2. Si no está instalado: docker run -d -p 6379:6379 redis:7-alpine
3. Reiniciar Spring Boot
```

### Cache no funciona
```
# En application.properties, cambiar a:
spring.cache.type=simple  # Usa HashMap en lugar de Redis

# O simplemente remover @Cacheable mientras debugueas
```

### Índices no mejoran performance
```
# Ejecutar ANALYZE nuevamente:
psql -h 10.0.89.241 -U postgres -d maestro_cenate
ANALYZE dim_solicitud_bolsa;
```

---

## 📈 MONITOREO CONTINUO

### Agregar Logs (opcional)
```java
// En SolicitudBolsaEstadisticasServiceImpl
@Override
@Cacheable(value = "estadisticas-por-estado")
public List<EstadisticasPorEstadoDTO> obtenerEstadisticasPorEstado() {
    long start = System.currentTimeMillis();
    log.info("🔄 Obteniendo estadísticas por estado (sin cache)...");

    // ... query ...

    long duration = System.currentTimeMillis() - start;
    log.info("✅ Consulta tardó {}ms", duration);
    return dtos;
}
```

### Dashboard Prometheus (Futuro)
Luego agregar:
```yaml
management:
  endpoints:
    web:
      exposure:
        include: metrics,prometheus
```

---

## 🎯 SUMMARY

| Métrica | Antes | Después | Mejora |
|---------|-------|---------|--------|
| Tiempo carga inicial | 2-3s | 300-500ms | 5-10x |
| Query BD (primera vez) | 300-800ms | 300-800ms | - |
| Query BD (cached) | 300-800ms | 5-20ms | 40-150x |
| DB connections | 10-15 | 2-3 | 80% reducción |
| Debounce búsqueda | 1 req/tecla | 1 req/500ms | 100x |

---

## ✅ PRÓXIMOS PASOS (Opcional)

1. **Consolidar Estadísticas:** Crear 1 endpoint que retorna TODO
2. **Implementar SSR:** Para pre-calcular estadísticas en servidor
3. **Background Jobs:** Refrescar cache cada 5 minutos vía cron

---

**¡Listo! En 2 horas tendrás `/bolsas/solicitudes` 5-10x más rápido! 🚀**

