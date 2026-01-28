# 📊 Performance Monitor Card - React Component

**Status:** ✅ Production Ready
**Archivo:** `frontend/src/components/monitoring/PerformanceMonitorCard.jsx`
**Líneas:** 300+
**Dependencias:** React 19, Lucide React Icons, Actuator Metrics

---

## 📦 Instalación

### 1. El componente ya existe en:
```
frontend/src/components/monitoring/PerformanceMonitorCard.jsx
frontend/src/components/monitoring/index.js
```

### 2. Importar en tu página:
```jsx
import { PerformanceMonitorCard } from "../../components/monitoring";
```

### 3. Usar en JSX:
```jsx
<PerformanceMonitorCard />
```

---

## 🎨 Características

### Visual Design
- **Header:** Gradient azul (customizable)
- **Cards:** 6 métricas individuales
- **Icons:** Lucide React icons
- **Responsive:** Mobile, tablet, desktop
- **Animations:** Spin en refresh, pulse en live

### Funcionalidad
- ✅ Auto-refresh cada 10 segundos
- ✅ Fetch desde `/actuator/metrics` (port 9090)
- ✅ Error handling con retry button
- ✅ Loading state mientras carga
- ✅ Timestamp de última actualización
- ✅ Status dot parpadeante (live indicator)

### Indicadores Visuales
- 🟢 **Verde:** Sano (<70% utilización)
- 🟡 **Amarillo:** Advertencia (70-90%)
- 🔴 **Rojo:** Crítico (>90%)
- 📊 **Barra progreso:** Visualización del % uso
- 📈 **Números:** Valor exacto + máximo

---

## 🔧 Endpoints Utilizados

```javascript
// Principales que se consultan:
GET /actuator/metrics/db.connection.pool.size
GET /actuator/metrics/process.threads.live
GET /actuator/metrics/jvm.memory.used
GET /actuator/metrics/jvm.memory.max
GET /actuator/metrics/process.cpu.usage
GET /actuator/metrics/process.uptime
GET /actuator/health  (para DB status)
```

---

## 📊 Las 6 Métricas

### 1. Pool de Conexiones DB (HikariCP)
```
Rango: 0-100 conexiones
Verde: <70 (70 conx)
Amarillo: 70-90 (70-90 conx)
Rojo: >90 (>90 conx)
Indicador: Barra + número exacto
```

### 2. Threads Tomcat Activos
```
Rango: 0-200 threads
Verde: <150 threads
Amarillo: 150-180 threads
Rojo: >180 threads
Indicador: Barra + número exacto
```

### 3. Memoria JVM
```
Rango: MB usado / MB máximo
Verde: <70%
Amarillo: 70-85%
Rojo: >85%
Indicador: Barra + MB/MB
```

### 4. CPU Uso
```
Rango: 0-100%
Verde: <60%
Amarillo: 60-80%
Rojo: >80%
Indicador: Barra + porcentaje
```

### 5. Uptime del Sistema
```
Formato: Xd Xh Xm
Indicador: Siempre "✓ ACTIVO"
Cálculo: segundos → días/horas/minutos
```

### 6. Estado PostgreSQL
```
Status: UP/DOWN
Latencia: desde health check
Indicador: ✓ OK o ✗ ERROR
Color: Verde si UP, Rojo si DOWN
```

---

## 🎯 Umbrales y Customización

### Cambiar umbrales de alerta:

**DB Pool (línea 115):**
```jsx
<MetricRow
  label="Pool de Conexiones DB"
  value={metrics.dbPool}
  max={metrics.dbPoolMax}
  warning={70}      // ← Amarillo al 70%
  critical={90}     // ← Rojo al 90%
/>
```

**Threads (línea 130):**
```jsx
<MetricRow
  label="Threads Tomcat Activos"
  value={metrics.threads}
  max={metrics.threadsMax}
  warning={150}     // ← Amarillo a 150/200
  critical={180}    // ← Rojo a 180/200
/>
```

**Memory (línea 145):**
```jsx
<MetricRow
  label="Memoria JVM"
  value={metrics.memoryUsed}
  max={metrics.memoryMax}
  warning={70}      // ← 70%
  critical={85}     // ← 85%
/>
```

**CPU (línea 160):**
```jsx
<MetricRow
  label="CPU Uso"
  value={parseFloat(metrics.cpu)}
  max={100}
  warning={60}      // ← 60%
  critical={80}     // ← 80%
/>
```

---

## ⚙️ Configuración del Auto-Refresh

**Cambiar frecuencia (línea 60):**
```jsx
// Por defecto: 10 segundos
const interval = setInterval(fetchMetrics, 10000);

// Opciones:
// 5 segundos (más actualizado, más requests)
const interval = setInterval(fetchMetrics, 5000);

// 30 segundos (menos requests, menos actualizado)
const interval = setInterval(fetchMetrics, 30000);

// 1 minuto (mínimo traffic)
const interval = setInterval(fetchMetrics, 60000);
```

---

## 🎨 Customización Visual

### Cambiar colores del header:
```jsx
// Línea 171 - Cambiar gradient
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

### Cambiar tamaño del card:
```jsx
// Línea 142 - Cambiar ancho
className="w-full bg-white rounded-xl"

// Opciones:
// className="w-full" → 100% del contenedor
// className="max-w-4xl" → máximo 4xl
// className="max-w-2xl" → máximo 2xl
```

---

## 🐛 Manejo de Errores

```javascript
if (error) {
  return (
    <div className="bg-red-50 border border-red-200">
      Error: No se pudo conectar con el servicio de monitoreo (puerto 9090)
      <button onClick={fetchMetrics}>Reintentar</button>
    </div>
  );
}
```

### Causas comunes:
1. **Backend no corriendo:** `./gradlew bootRun`
2. **Puerto 9090 no accesible:** Verificar firewall
3. **Actuator no configurado:** Revisar `application.properties`
4. **CORS bloqueado:** Permitir en `SecurityConfig.java`

---

## 📱 Responsiveness

Component se adapta automáticamente a:
- 📱 Mobile (320px+)
- 💻 Tablet (768px+)
- 🖥️ Desktop (1024px+)

```jsx
// Tailwind classes usadas:
grid-cols-1          // Mobile
md:grid-cols-2       // Tablet+
lg:grid-cols-3       // Desktop+
```

---

## 🔌 Integración en Proyectos

### En UserDashboard:
```jsx
import { PerformanceMonitorCard } from "../../components/monitoring";

export default function UserDashboard() {
  return (
    <div>
      {/* Otros contenido */}
      <PerformanceMonitorCard />
    </div>
  );
}
```

### En Admin Dashboard:
```jsx
import PerformanceMonitorCard from "../../components/monitoring/PerformanceMonitorCard";

export default function AdminDashboard() {
  return (
    <div>
      <h1>Admin Panel</h1>
      <PerformanceMonitorCard />
    </div>
  );
}
```

### En Página Dedicada:
```jsx
import { PerformanceMonitorCard } from "../../components/monitoring";

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

## ✅ Checklist de Integración

- [ ] Component importado correctamente
- [ ] JSX insertado en dashboard
- [ ] Backend corriendo en puerto 8080
- [ ] Actuator escuchando en puerto 9090
- [ ] Dashboard abierto en navegador
- [ ] Card visible sin errores
- [ ] Métricas cargando (no en 0)
- [ ] Auto-refresh funciona (cada 10s)
- [ ] Colores cambiar según valores
- [ ] Timestamp actualiza

---

**Versión:** v1.37.3 | Fecha: 2026-01-28 | Status: ✅ Production Ready
