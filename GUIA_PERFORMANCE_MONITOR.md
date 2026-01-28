# 📊 Guía de Integración - Performance Monitor Card

**Versión:** v1.37.3 (2026-01-28)
**Status:** ✅ Listo para integrar
**Componente:** `PerformanceMonitorCard.jsx`

---

## 🎯 ¿Qué es?

Card especializado que monitorea **en tiempo real** todas las métricas de rendimiento para soportar **100 usuarios concurrentes**.

### 📊 Métricas Monitoreadas

| Métrica | Rango | Indicador | Puerto |
|---------|-------|-----------|--------|
| **Pool DB (Hikari)** | 0-100 conx | Color + % | 9090 |
| **Threads Tomcat** | 0-200 thr | Color + % | 9090 |
| **Memoria JVM** | MB / Total | Barra progreso | 9090 |
| **CPU** | 0-100% | Barra progreso | 9090 |
| **Uptime** | Días/Horas/Min | Texto | 9090 |
| **PostgreSQL Status** | UP/DOWN | ✓/✗ | 9090 |

---

## 🚀 Instalación

### 1️⃣ El componente ya está creado en:
```
frontend/src/components/monitoring/PerformanceMonitorCard.jsx
```

### 2️⃣ Importar en tu página/dashboard

```javascript
import { PerformanceMonitorCard } from '../../components/monitoring';

// O importar directamente
import PerformanceMonitorCard from '../../components/monitoring/PerformanceMonitorCard';
```

### 3️⃣ Usar en tu componente

```jsx
export default function Dashboard() {
  return (
    <div className="space-y-6">
      {/* Tus otros componentes */}

      {/* Card de Performance */}
      <PerformanceMonitorCard />
    </div>
  );
}
```

---

## 📍 Lugares Recomendados para Agregar

### Opción A: Dashboard Admin (RECOMENDADO)
```
frontend/src/pages/user/UserDashboard.jsx
```

**Ejemplo de integración:**
```jsx
import React from 'react';
import { PerformanceMonitorCard } from '../../components/monitoring';

export default function UserDashboard() {
  return (
    <div className="w-full">
      {/* Encabezado existente */}
      <section className="mb-10 mt-4">
        {/* Tu contenido */}
      </section>

      {/* ✨ AGREGAR AQUÍ */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-10">
        <PerformanceMonitorCard />
        {/* Otros cards */}
      </div>

      {/* Resto del dashboard */}
    </div>
  );
}
```

### Opción B: Dashboard de Admin Tabs
```
frontend/src/pages/admin/AdminTabsPage.jsx
```

Agregar una nueva pestaña "Monitor":
```jsx
const tabs = [
  { id: 'monitor', label: 'Monitor', icon: Activity },
  { id: 'usuarios', label: 'Usuarios', icon: Users },
  // ... más tabs
];
```

### Opción C: Panel Dedicado
Crear nueva página:
```
frontend/src/pages/admin/PerformanceMonitor.jsx
```

```jsx
import PerformanceMonitorCard from '../../components/monitoring/PerformanceMonitorCard';

export default function PerformanceMonitor() {
  return (
    <div className="p-6">
      <h1 className="text-2xl font-bold mb-6">Monitor del Sistema</h1>
      <PerformanceMonitorCard />
    </div>
  );
}
```

---

## ⚙️ Configuración Requerida

### 1️⃣ Backend - Actuator Habilitado (✅ Ya configurado)

Verifica en `application.properties`:
```properties
# Puerto 9090 para métricas
management.server.port=9090

# Endpoints disponibles
management.endpoints.web.exposure.include=health,info,mappings,metrics,prometheus
```

### 2️⃣ Asegurar que Spring Boot está corriendo con métricas

```bash
./gradlew bootRun --args='--spring.profiles.active=prod'
```

### 3️⃣ CORS - Permitir acceso a puerto 9090 (IMPORTANTE ⚠️)

Si el frontend está en puerto 3000 y el backend en 8080, agregar a `SecurityConfig.java`:

```java
@Configuration
public class SecurityConfig {
  @Bean
  public SecurityFilterChain filterChain(HttpSecurity http) throws Exception {
    http
      .authorizeHttpRequests(auth -> auth
        // Permitir acceso a actuator metrics sin autenticación
        .requestMatchers("/actuator/**").permitAll()
        .anyRequest().authenticated()
      )
      .cors(cors -> cors.configurationSource(corsConfigurationSource()));

    return http.build();
  }
}
```

---

## 🧪 Testing

### 1️⃣ Verificar que el backend expone métricas

```bash
# Health check
curl http://localhost:9090/actuator/health | jq

# Pool de conexiones
curl http://localhost:9090/actuator/metrics/db.connection.pool.size | jq

# Threads
curl http://localhost:9090/actuator/metrics/process.threads.live | jq
```

### 2️⃣ Simular carga de 100 usuarios

```bash
ab -n 1000 -c 100 http://localhost:8080/api/bolsas/solicitudes

# Verificar que el monitor muestra incremento en:
# - DB Pool: 50-100 conexiones activas
# - Threads: 100-150 threads activos
# - Memory: incremento temporal
# - CPU: 40-60%
```

### 3️⃣ Verificar que el card se refresca

- El card debe actualizar cada 10 segundos
- Punto verde parpadeante indica "En vivo"
- Timestamp al pie muestra hora última actualización

---

## 🎨 Personalización

### Cambiar colores

Editar en `PerformanceMonitorCard.jsx`:

```jsx
// Header gradient
className="bg-gradient-to-r from-blue-600 to-blue-700"

// Cambiar a verde/naranja/rojo
className="bg-gradient-to-r from-green-600 to-green-700"
```

### Cambiar intervalos de auto-refresh

```jsx
// Línea 60: cambiar de 10000ms a lo que necesites
const interval = setInterval(fetchMetrics, 10000); // 10 segundos

// Para 5 segundos
const interval = setInterval(fetchMetrics, 5000);

// Para 30 segundos
const interval = setInterval(fetchMetrics, 30000);
```

### Cambiar umbrales de alerta

```jsx
// En MetricRow, parámetros warning y critical
<MetricRow
  label="Pool de Conexiones DB"
  value={metrics.dbPool}
  max={metrics.dbPoolMax}
  warning={70}    // ← Cambiar aquí
  critical={90}   // ← Cambiar aquí
/>

// Por ejemplo, para alertar más temprano:
warning={50}    // 50% = amarillo
critical={80}   // 80% = rojo
```

---

## 🐛 Troubleshooting

### ❌ "No se pudo conectar con el servicio de monitoreo (puerto 9090)"

**Causa:** Backend no está corriendo o actuator no configurado

**Solución:**
```bash
# 1. Verificar que backend está corriendo
ps aux | grep java | grep 8080

# 2. Verificar que puerto 9090 está listening
lsof -i :9090

# 3. Restart backend
./gradlew bootRun --args='--spring.profiles.active=prod'

# 4. Verificar health
curl http://localhost:9090/actuator/health
```

### ⚠️ Métricas siempre en 0

**Causa:** Actuator no está exposiendo métricas

**Solución:**
```properties
# En application.properties
management.endpoints.web.exposure.include=health,info,mappings,metrics,prometheus

# Reiniciar backend
```

### 🔴 Siempre muestra "CRÍTICO"

**Causa:** Umbrales demasiado bajos

**Solución:**
- Aumentar valores de `warning` y `critical`
- Realizar load test para calibrar valores reales

---

## 📊 Interpretación de Resultados

### Pool de Conexiones (0-100)
- **Verde (0-70):** Normal, capacidad disponible
- **Amarillo (70-90):** Acercándose a límite, considerar aumentar
- **Rojo (90-100):** Crítico, nuevos usuarios rechazados con 401

### Threads Tomcat (0-200)
- **Verde (0-150):** Normal
- **Amarillo (150-180):** Alta concurrencia
- **Rojo (180-200):** Límite casi alcanzado

### Memoria JVM
- **Verde (0-70%):** Normal
- **Amarillo (70-85%):** Considerar aumentar -Xmx
- **Rojo (85-100%):** GC muy frecuente, aplicación puede colgarse

### CPU
- **Verde (0-60%):** Normal
- **Amarillo (60-80%):** Alta carga, verificar queries lentas
- **Rojo (80-100%):** Máxima capacidad, investigar bottlenecks

---

## 📈 Optimizaciones Posteriores

Si los números son bajos después de agregar 100 usuarios:

1. **Aumentar DB Pool:** `maximum-pool-size=150` (en application.properties)
2. **Aumentar Threads:** `server.tomcat.threads.max=300`
3. **Aumentar Memory:** `-Xmx2g -Xms1g` (en JVM args)
4. **Activar Query Cache:** `spring.jpa.properties.hibernate.cache.use_query_cache=true`
5. **Batch Processing:** `spring.jpa.properties.hibernate.jdbc.batch_size=50`

---

## ✅ Checklist de Integración

- [ ] Component copiado a `frontend/src/components/monitoring/`
- [ ] Index.js creado
- [ ] Backend corriendo en puerto 8080 con actuator en 9090
- [ ] CORS configurado en backend para puerto 9090
- [ ] Card agregado a dashboard
- [ ] Auto-refresh funcionando (cada 10s)
- [ ] Load test realizado (100 usuarios)
- [ ] Métricas muestran valores coherentes
- [ ] Alertas (rojo/amarillo) funcionan correctamente

---

## 📞 Soporte

Si hay problemas:

1. Revisar logs del backend: `./gradlew bootRun`
2. Verificar console del navegador (F12)
3. Confirmar que `curl http://localhost:9090/actuator/health` retorna 200 OK
4. Verificar firewall no bloquea puerto 9090

---

**¡Componente listo para usar! 🚀**
