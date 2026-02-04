# 📊 Métricas Disponibles v1.37.3

**Status:** ✅ En Vivo
**Port:** 9090 (Actuator)
**Auto-refresh:** Cada 10 segundos
**Total Métricas:** 6 principales + 10+ adicionales

---

## 🎯 Las 6 Métricas Principales

### 1️⃣ DB Connection Pool Size
```
Endpoint: GET /actuator/metrics/db.connection.pool.size
Rango: 0-100 conexiones
Unidad: conexiones activas
Verde: <70 (70 conx)
Amarillo: 70-90 (70-90 conx)
Rojo: >90 (>90 conx)

Respuesta JSON:
{
  "name": "db.connection.pool.size",
  "description": "Current number of active connections",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 45.0
    }
  ]
}

Interpretación:
- 45 conexiones = 45% del pool utilizado = VERDE
- 75 conexiones = 75% del pool utilizado = AMARILLO
- 95 conexiones = 95% del pool utilizado = ROJO ⚠️
```

### 2️⃣ Process Threads Live
```
Endpoint: GET /actuator/metrics/process.threads.live
Rango: 0-200 threads
Unidad: threads activos
Verde: <150 threads
Amarillo: 150-180 threads
Rojo: >180 threads

Respuesta JSON:
{
  "name": "process.threads.live",
  "description": "Current number of live threads",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 120.0
    }
  ]
}

Interpretación:
- 120 threads = 60% de 200 = VERDE
- 165 threads = 82.5% de 200 = AMARILLO
- 195 threads = 97.5% de 200 = ROJO ⚠️
```

### 3️⃣ JVM Memory Used
```
Endpoint: GET /actuator/metrics/jvm.memory.used
Rango: MB / Total MB
Unidad: bytes (convertir a MB)
Verde: <70% utilización
Amarillo: 70-85% utilización
Rojo: >85% utilización

Respuesta JSON:
{
  "name": "jvm.memory.used",
  "description": "The amount of used memory",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 2199023255552.0  // bytes
    }
  ]
}

Cálculo:
- 2199023255552 bytes ÷ (1024 * 1024) = ~2097 MB = ~2.1 GB
- Si max = 3000 MB: 2100/3000 = 70% = AMARILLO ⚠️

Interpretación:
- <70% = VERDE (memoria disponible)
- 70-85% = AMARILLO (acercándose a límite)
- >85% = ROJO (crítico, GC frecuente)
```

### 4️⃣ JVM Memory Max
```
Endpoint: GET /actuator/metrics/jvm.memory.max
Rango: Bytes totales
Unidad: bytes
Descripción: Memoria máxima asignada a JVM

Respuesta JSON:
{
  "name": "jvm.memory.max",
  "description": "The maximum amount of memory available",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 3221225472.0  // 3GB
    }
  ]
}

Cálculo:
- 3221225472 bytes ÷ (1024 * 1024) = 3072 MB = 3 GB
```

### 5️⃣ Process CPU Usage
```
Endpoint: GET /actuator/metrics/process.cpu.usage
Rango: 0.0 a 1.0 (0-100%)
Unidad: proporción decimal
Verde: <0.60 (60%)
Amarillo: 0.60-0.80 (60-80%)
Rojo: >0.80 (>80%)

Respuesta JSON:
{
  "name": "process.cpu.usage",
  "description": "The current CPU usage",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 0.45  // 45%
    }
  ]
}

Interpretación:
- 0.45 = 45% CPU = VERDE
- 0.72 = 72% CPU = AMARILLO ⚠️
- 0.88 = 88% CPU = ROJO ⚠️⚠️
```

### 6️⃣ Process Uptime
```
Endpoint: GET /actuator/metrics/process.uptime
Rango: Segundos desde inicio
Unidad: segundos
Descripción: Cuánto tiempo lleva el sistema corriendo

Respuesta JSON:
{
  "name": "process.uptime",
  "description": "System uptime",
  "measurements": [
    {
      "statistic": "VALUE",
      "value": 7920.0  // segundos
    }
  ]
}

Cálculo:
- 7920 segundos = 132 minutos = 2 horas 12 minutos
- Format: 0d 2h 12m

Interpretación:
- <1 hora: Sistema recién reiniciado
- 1-24 horas: Normal
- >24 horas: Buena estabilidad
- >7 días: Excelente uptime
```

---

## 📈 Métricas Adicionales (Disponibles)

### Health Check
```
Endpoint: GET /actuator/health
Descripción: Estado general del sistema

Respuesta:
{
  "status": "UP",
  "components": {
    "db": {
      "status": "UP",
      "details": {...}
    },
    "livenessState": {
      "status": "UP"
    },
    "readinessState": {
      "status": "UP"
    }
  }
}

Estados:
- UP: Sistema operativo ✓
- DOWN: Sistema no disponible ✗
- OUT_OF_SERVICE: Mantenimiento
- UNKNOWN: Estado desconocido
```

### Threads Peak
```
Endpoint: GET /actuator/metrics/process.threads.peak
Descripción: Máximo de threads alcanzado
Rango: 0-200+
```

### Memory Committed
```
Endpoint: GET /actuator/metrics/jvm.memory.committed
Descripción: Memoria comprometida a JVM
Rango: Bytes
```

### Garbage Collection
```
Endpoint: GET /actuator/metrics/jvm.gc.memory.allocated
Descripción: Bytes asignados a GC
Indicador de: Frecuencia de recolección de basura
```

### HTTP Requests
```
Endpoint: GET /actuator/metrics/http.server.requests
Descripción: Requests HTTP procesados
Indicador de: Tráfico
```

---

## 🔍 Cómo Consultar Métricas

### Opción 1: Desde Navegador
```
http://localhost:9090/actuator/metrics/db.connection.pool.size
```

### Opción 2: Con curl
```bash
# Ver métrica específica
curl http://localhost:9090/actuator/metrics/db.connection.pool.size | jq

# Ver todas las métricas disponibles
curl http://localhost:9090/actuator/metrics | jq '.names'

# Ver health
curl http://localhost:9090/actuator/health | jq
```

### Opción 3: Con watch (tiempo real)
```bash
# Actualizar cada 2 segundos
watch -n 2 'curl -s http://localhost:9090/actuator/metrics/db.connection.pool.size | jq .measurements[0].value'
```

### Opción 4: Con PerformanceMonitorCard (RECOMENDADO)
```
Frontend: http://localhost:3000/user/dashboard
Auto-actualiza cada 10 segundos
Visualización interactiva
```

---

## 📊 Tabla Resumen de Umbral es

| Métrica | Verde | Amarillo | Rojo | Crítico |
|---------|-------|----------|------|---------|
| **DB Pool** | <70% | 70-90% | >90% | >95% (saturado) |
| **Threads** | <150 | 150-180 | >180 | >195 (agotados) |
| **Memory** | <70% | 70-85% | >85% | >95% (crash inminent) |
| **CPU** | <60% | 60-80% | >80% | >90% (máxima carga) |
| **Uptime** | - | >1h | - | <5m (inestable) |
| **DB Status** | UP | - | DOWN | N/A (no acceso) |

---

## 🚨 Alertas y Acciones

### DB Pool > 90%
```
⚠️ AMARILLO: Acercándose al límite
→ Acción: Monitorear conexiones lentas
→ Revisar: Queries de larga duración

🔴 ROJO: Agotado/saturado
→ Acción: INMEDIATA - Aumentar pool size
→ Comando:
  spring.datasource.hikari.maximum-pool-size=200
  (de 100 actual)
→ Reiniciar backend
```

### Threads > 180
```
⚠️ AMARILLO: Casi al límite
→ Acción: Monitorear si sigue creciendo

🔴 ROJO: Agotados/saturados
→ Acción: INMEDIATA - Aumentar threads
→ Comando:
  server.tomcat.threads.max=400
  (de 200 actual)
→ Reiniciar backend
```

### Memory > 85%
```
⚠️ AMARILLO: GC frecuente
→ Acción: Monitorear si sigue creciendo
→ Revisar: Memory leaks

🔴 ROJO: Crítico - Near OutOfMemory
→ Acción: INMEDIATA - Reiniciar backend
→ Alternativa: Aumentar -Xmx
  java -Xmx4g -jar cenate.jar
```

### CPU > 80%
```
⚠️ AMARILLO: Alta carga
→ Acción: Revisar queries lentas
→ Comando: Enable query logging

🔴 ROJO: Máxima capacidad
→ Acción: Load balancing
→ Revisar: Bottlenecks (BD, CPU, IO)
```

### DB Status = DOWN
```
🔴 ROJO: Base de datos no accesible
→ Acción: INMEDIATA
→ Verificar:
  1. PostgreSQL está corriendo
  2. Conexión a 10.0.89.241:5432
  3. Credenciales correctas
  4. Network/Firewall
→ Comando:
  psql -h 10.0.89.241 -U postgres -d maestro_cenate
```

---

## 📝 Logging de Métricas

Para capturar métricas en logs:

```properties
# Activar logging de métricas
logging.level.com.zaxxer.hikari=DEBUG
logging.level.org.springframework.boot.actuate=DEBUG

# En logs aparecerán:
# [HikariPool-1] Connection is not available
# [HikariPool-1] Fill pool skipped
# [metrics] db.connection.pool.size=95
```

---

## 🔄 Refresh Rates Recomendados

| Caso | Frecuencia | Razón |
|------|-----------|--------|
| **Desarrollo** | 5s | Debug rápido |
| **Producción** | 10s | Balance info/traffic |
| **Monitoreo remoto** | 30s | Menos bandwidth |
| **Alertas** | 60s | Solo cambios signif. |
| **Histórico** | 5m | Tendencias |

---

**Versión:** v1.37.3 | Fecha: 2026-01-28 | Status: ✅ Production Ready

[Anterior: Configuration](02_configuracion_backend.md) | [Siguiente: Deployment](05_guia_deployment.md)
