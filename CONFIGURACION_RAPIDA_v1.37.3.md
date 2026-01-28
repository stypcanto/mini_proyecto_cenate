# ⚡ Configuración Rápida - Referencia v1.37.3

**Quick reference para cambios futuros o ajustes**

---

## 🔧 Ajustar para Más Usuarios

### Si necesitas soportar 200 usuarios:

**Archivo:** `backend/src/main/resources/application.properties`

```properties
# Buscar y reemplazar:

# Línea ~39
spring.datasource.hikari.maximum-pool-size=200  # (de 100)

# Línea ~40
spring.datasource.hikari.minimum-idle=20  # (de 10)

# Línea ~10 (AGREGAR)
server.tomcat.threads.max=400  # (de 200)

# Línea ~9
server.tomcat.threads.min-spare=40  # (de 20)
```

**Resultado:** Sistema soporta 200 usuarios concurrentes

---

## 🔧 Ajustar para Menos Usuarios (desarrollo)

Si quieres reducir consumo de recursos en dev:

```properties
# Pool DB (reducir)
spring.datasource.hikari.maximum-pool-size=30  # (de 100)
spring.datasource.hikari.minimum-idle=5       # (de 10)

# Tomcat (reducir)
server.tomcat.threads.max=50   # (de 200)
server.tomcat.threads.min-spare=10  # (de 20)

# JWT (reducir para testing)
jwt.expiration=3600000  # 1 hora en lugar de 12h

# Logging (para debug)
logging.level.root=INFO  # (en lugar de WARN)
logging.level.org.hibernate.SQL=DEBUG
spring.jpa.show-sql=true
```

---

## 📊 Umbrales de Alerta (PerformanceMonitorCard)

Editar en `frontend/src/components/monitoring/PerformanceMonitorCard.jsx`

### Cambiar cuándo se pone amarillo/rojo

**Línea ~115 (DB Pool):**
```jsx
<MetricRow
  label="Pool de Conexiones DB"
  value={metrics.dbPool}
  max={metrics.dbPoolMax}
  warning={70}    // ← Cambiar aquí (% para amarillo)
  critical={90}   // ← Cambiar aquí (% para rojo)
/>

// Para alertar más temprano:
warning={50}    // Amarillo al 50%
critical={75}   // Rojo al 75%
```

**Línea ~130 (Threads):**
```jsx
<MetricRow
  label="Threads Tomcat Activos"
  value={metrics.threads}
  max={metrics.threadsMax}
  warning={150}   // Amarillo al 150/200
  critical={180}  // Rojo al 180/200
/>

// Para ser más tolerante:
warning={160}
critical={190}
```

**Línea ~145 (Memory):**
```jsx
<MetricRow
  label="Memoria JVM"
  value={metrics.memoryUsed}
  max={metrics.memoryMax}
  warning={70}    // Amarillo al 70%
  critical={85}   // Rojo al 85%
/>
```

**Línea ~160 (CPU):**
```jsx
<MetricRow
  label="CPU Uso"
  value={parseFloat(metrics.cpu)}
  max={100}
  warning={60}    // Amarillo al 60%
  critical={80}   // Rojo al 80%
/>
```

---

## 🔄 Cambiar Frecuencia de Auto-Refresh

**Archivo:** `frontend/src/components/monitoring/PerformanceMonitorCard.jsx`

**Línea ~60:**
```jsx
// Por defecto: 10 segundos
const interval = setInterval(fetchMetrics, 10000);

// Para 5 segundos (más actualizaciones)
const interval = setInterval(fetchMetrics, 5000);

// Para 30 segundos (menos requests)
const interval = setInterval(fetchMetrics, 30000);

// Para 1 minuto (mínimo traffic)
const interval = setInterval(fetchMetrics, 60000);
```

---

## 🎨 Cambiar Colores del Card

**Archivo:** `frontend/src/components/monitoring/PerformanceMonitorCard.jsx`

**Header gradient (línea ~171):**
```jsx
// Azul (actual)
className="bg-gradient-to-r from-blue-600 to-blue-700"

// Verde
className="bg-gradient-to-r from-green-600 to-green-700"

// Rojo
className="bg-gradient-to-r from-red-600 to-red-700"

// Púrpura
className="bg-gradient-to-r from-purple-600 to-purple-700"

// Naranja
className="bg-gradient-to-r from-orange-600 to-orange-700"
```

---

## 💾 Aumentar Memory JVM

**En el comando de inicio del backend:**

```bash
# Actual (default)
./gradlew bootRun

# Con más memoria
java -Xmx2g -Xms1g -jar cenate.jar

# Parámetro Xmx = máximo
# Parámetro Xms = inicial
# Ejemplos:
#   -Xmx1g -Xms512m   → 1GB máximo (desarrollo)
#   -Xmx4g -Xms2g     → 4GB máximo (producción pesada)
#   -Xmx8g -Xms4g     → 8GB máximo (muy pesado)
```

---

## 🔐 Cambiar JWT Expiration

**Archivo:** `backend/src/main/resources/application.properties`

**Línea ~81:**
```properties
# Actual: 12 horas
jwt.expiration=43200000

# Para diferentes tiempos:
jwt.expiration=3600000      # 1 hora
jwt.expiration=7200000      # 2 horas (original)
jwt.expiration=14400000     # 4 horas
jwt.expiration=86400000     # 1 día
jwt.expiration=604800000    # 1 semana

# Cálculo: (horas * 60 * 60 * 1000)
# Ejemplo: 3 horas = (3 * 60 * 60 * 1000) = 10800000
```

---

## 📊 Cambiar Thresholds de Query Batch

**Archivo:** `backend/src/main/resources/application.properties`

**Línea ~63:**
```properties
# Actual: 20 (insertar 20 registros de una vez)
spring.jpa.properties.hibernate.jdbc.batch_size=20

# Para más inserciones por batch (más rápido, más memory):
spring.jpa.properties.hibernate.jdbc.batch_size=50

# Para menos (menos memory, más lento):
spring.jpa.properties.hibernate.jdbc.batch_size=10
```

---

## 🔌 Cambiar Puerto Actuator

**Archivo:** `backend/src/main/resources/application.properties`

**Línea ~101:**
```properties
# Actual (9090)
management.server.port=9090

# Cambiar a otro puerto:
management.server.port=8888
management.server.port=9999

# ⚠️ También actualizar en PerformanceMonitorCard.jsx:
const poolResponse = await fetch('http://localhost:9999/actuator/metrics/db.connection.pool.size');
```

---

## 🗜️ Cambiar Compression Settings

**Archivo:** `backend/src/main/resources/application.properties`

**Líneas ~126-128:**
```properties
# Mínimo tamaño para comprimir (aumentar = menos compression)
server.compression.min-response-size=1024

# Tipos MIME a comprimir (agregar/quitar según necesites)
server.compression.mime-types=text/html,text/xml,text/plain,text/css,application/javascript,application/json

# Deshabilitar completamente si necesitas (no recomendado)
server.compression.enabled=false
```

---

## 📝 Cambiar Logging Levels

**Archivo:** `backend/src/main/resources/application.properties`

**Líneas ~64-72:**

```properties
# Actual (producción, mínimo logging)
logging.level.root=WARN
logging.level.org.hibernate.SQL=WARN
spring.jpa.show-sql=false

# Para más debug (desarrollo)
logging.level.root=INFO
logging.level.org.springframework=DEBUG
logging.level.org.hibernate.SQL=DEBUG
logging.level.org.hibernate.type.descriptor.sql.BasicBinder=TRACE
spring.jpa.show-sql=true

# Para silent (máximo rendimiento, pero poco info)
logging.level.root=ERROR
spring.jpa.show-sql=false
```

---

## 🔍 Monitorear con Curl

### Ver el pool en tiempo real
```bash
watch -n 2 'curl -s http://localhost:9090/actuator/metrics/db.connection.pool.size | jq .measurements[0].value'
```

### Ver todos los metrics disponibles
```bash
curl http://localhost:9090/actuator/metrics | jq '.names | .[]' | head -20
```

### Ver valor específico
```bash
curl http://localhost:9090/actuator/metrics/process.threads.live | jq
curl http://localhost:9090/actuator/metrics/jvm.memory.used | jq
curl http://localhost:9090/actuator/metrics/process.cpu.usage | jq
```

---

## 📋 Checklist para Cambios Futuros

Si necesitas hacer cambios a las configuraciones:

- [ ] Identificar qué métrica cambiar (Pool, Threads, Memory, Logging, etc)
- [ ] Leer la sección correspondiente arriba
- [ ] Hacer el cambio en el archivo correcto
- [ ] Recompilar backend: `./gradlew clean build`
- [ ] Reiniciar: `./gradlew bootRun --args='--spring.profiles.active=prod'`
- [ ] Verificar con curl o dashboard que el cambio tomó efecto
- [ ] Hacer load test: `ab -n 1000 -c 100 http://localhost:8080/api/bolsas/solicitudes`
- [ ] Verificar métricas en PerformanceMonitorCard

---

## 🆘 Troubleshooting Rápido

| Síntoma | Causa | Solución |
|---------|-------|----------|
| Errores 401 | Pool DB agotado | Aumentar `maximum-pool-size` |
| Alto CPU | Logging DEBUG | Cambiar a `logging.level.root=WARN` |
| Memory crecer | Sin caching | Activar `use_second_level_cache=true` |
| Respuestas lentas | Queries sin cache | Activar `use_query_cache=true` |
| Dashboard no actualiza | Puerto equivocado | Verificar `management.server.port` |
| Timeout en queries | Pool muy pequeño | Aumentar `maximum-pool-size` |

---

## 📱 Frontend Performance Monitor

### Para editar comportamiento del card:

**Archivo:** `frontend/src/components/monitoring/PerformanceMonitorCard.jsx`

```jsx
// Línea 12: Cambiar colores del header
className="bg-gradient-to-r from-blue-600 to-blue-700"

// Línea 60: Cambiar refresh rate
const interval = setInterval(fetchMetrics, 10000);

// Línea 115-186: Cambiar umbrales de alerta
<MetricRow ... warning={70} critical={90} />

// Línea 250: Cambiar URL del port 9090
fetch('http://localhost:9090/actuator/metrics/...')

// Línea 283: Cambiar tamaño del card
className="w-full bg-white rounded-xl"
```

---

**¡Referencia rápida completa!** ⚡

Última actualización: 2026-01-28 | v1.37.3
