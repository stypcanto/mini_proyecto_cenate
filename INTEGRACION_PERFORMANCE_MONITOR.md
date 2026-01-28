# 🔧 Integración del Performance Monitor Card

**Versión:** v1.37.3
**Fecha:** 2026-01-28
**Status:** ✅ Listo para integrar

---

## 📂 Archivos Creados

```
frontend/src/components/monitoring/
├── PerformanceMonitorCard.jsx    ← Card principal
└── index.js                       ← Exportar componente

GUIA_PERFORMANCE_MONITOR.md        ← Documentación completa
INTEGRACION_PERFORMANCE_MONITOR.md ← Este archivo (quick start)
```

---

## ⚡ Quick Start - 3 Pasos

### 1️⃣ Agregar Import al Dashboard

En `frontend/src/pages/user/UserDashboard.jsx`, agregar al inicio del archivo:

```jsx
import { PerformanceMonitorCard } from "../../components/monitoring";
```

**Línea actual:**
```jsx
import React, { useState, useEffect } from "react";
import {
  UserCircle2,
  IdCard,
  LockKeyhole,
  Bell,
  Settings,
} from "lucide-react";
import { useAuth } from "../../context/AuthContext";
import { useNavigate } from "react-router-dom";
import apiClient from "../../services/apiClient";

// ➕ AGREGAR AQUÍ
import { PerformanceMonitorCard } from "../../components/monitoring";
```

---

### 2️⃣ Agregar el Card en el JSX

Después de la sección de "Bloques principales" (línea 166), agregar:

**Ubicación actual en el archivo (línea ~170):**
```jsx
      {/* ======================================================= */}
      {/* 🧱 Bloques principales */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        {/* Cards existentes */}
      </div>

      {/* ➕ AGREGAR AQUÍ */}
      <div className="mb-10">
        <PerformanceMonitorCard />
      </div>

      {/* ======================================================= */}
      {/* 🔔 Panel de actividades según rol */}
      {/* ======================================================= */}
```

**Código completo a reemplazar:**

```jsx
      {/* ======================================================= */}
      {/* 🧱 Bloques principales */}
      {/* ======================================================= */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-8 mb-10">
        <DashboardCard
          icon={UserCircle2}
          title="Mi Perfil"
          description="Consulta tus datos personales, foto, y roles asignados dentro del sistema."
          color="#0A5BA9"
          onClick={() => navigate(`/user/detail/${userData?.id || user?.idUser || user?.id || ""}`)}
        />

        <DashboardCard
          icon={IdCard}
          title="Mi Información"
          description="Actualiza tus datos institucionales, contactos y área de trabajo."
          color="#16A34A"
          onClick={() => navigate("/user/profile")}
        />

        <DashboardCard
          icon={LockKeyhole}
          title="Seguridad y Contraseña"
          description="Gestiona tu contraseña, sesiones activas y dispositivos confiables."
          color="#7C3AED"
          onClick={() => navigate("/user/security")}
        />
      </div>

      {/* ✨ AGREGAR PERFORMANCE MONITOR */}
      <div className="mb-10">
        <PerformanceMonitorCard />
      </div>

      {/* ======================================================= */}
      {/* 🔔 Panel de actividades según rol */}
      {/* ======================================================= */}
```

---

### 3️⃣ Testear

```bash
# 1. Asegurar backend corriendo
cd backend
./gradlew clean build -x test
./gradlew bootRun --args='--spring.profiles.active=prod'

# 2. Frontend (en otra terminal)
cd frontend
npm start

# 3. Abrir dashboard
# http://localhost:3000/user/dashboard

# 4. Deberías ver el card de Performance Monitor
```

---

## 🎨 Visualización Esperada

```
┌─────────────────────────────────────────────────────────────┐
│  📊 Monitor de Performance                           🔄     │
│  Optimizado para 100 usuarios concurrentes                  │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  📊 Pool de Conexiones DB          |████████░░░░| 85/100   │
│  Status: ADVERTENCIA                                        │
│                                                              │
│  ⚡ Threads Tomcat Activos          |██████░░░░░| 120/200  │
│  Status: OK                                                 │
│                                                              │
│  🖥️ Memoria JVM                     |████████░░░| 2100/3000│
│  Status: OK                                                 │
│                                                              │
│  🔥 CPU Uso                         |████░░░░░░░| 45%      │
│  Status: OK                                                 │
│                                                              │
│  ⏱️ Uptime del Sistema              0d 2h 15m  ✓ ACTIVO    │
│                                                              │
│  🗄️ Estado PostgreSQL               Latencia: 238ms ✓ OK   │
│                                                              │
│  Última actualización: 14:35:22  ●                         │
├─────────────────────────────────────────────────────────────┤
│  ℹ️ Auto-refresh cada 10 segundos | Monitoreo desde 9090   │
└─────────────────────────────────────────────────────────────┘
```

---

## 🐛 Troubleshooting

### Error: "No se pudo conectar con el servicio de monitoreo"

```bash
# Verificar que actuator está escuchando
curl http://localhost:9090/actuator/health

# Debe retornar:
# {"status":"UP","components":{"db":{"status":"UP"}}}
```

### El card no se actualiza

```bash
# Revisar console del navegador (F12)
# Debe haber requests cada 10 segundos a:
# http://localhost:9090/actuator/metrics/*

# Si no hay requests, verificar que backend está corriendo
ps aux | grep java
```

### Valores siempre en 0

```bash
# Verificar que Spring Boot está exponiendo métricas
curl http://localhost:9090/actuator/metrics/db.connection.pool.size

# Debe retornar estructura con "measurements"
```

---

## 📊 Referencia Rápida de Umbrales

| Métrica | Verde | Amarillo | Rojo |
|---------|-------|----------|------|
| **DB Pool** | <70 | 70-90 | >90 |
| **Threads** | <150 | 150-180 | >180 |
| **Memory** | <70% | 70-85% | >85% |
| **CPU** | <60% | 60-80% | >80% |

---

## ✅ Checklist de Integración

```
[ ] Componente PerformanceMonitorCard.jsx creado ✓
[ ] Index.js creado ✓
[ ] Backend con actuator port 9090 ✓
[ ] Import agregado al UserDashboard
[ ] Card JSX agregado al dashboard
[ ] npm start ejecutado
[ ] Dashboard http://localhost:3000/user/dashboard abierto
[ ] Card visible y funcional
[ ] Auto-refresh cada 10 segundos
[ ] Metrics actualizándose correctamente
[ ] Load test con 100 usuarios (ab -n 1000 -c 100)
[ ] Métricas muestran incremento bajo carga
```

---

## 🚀 Próximos Pasos

1. **Integración completada** → Commit y push
2. **Testing en producción** → Verificar con 100 usuarios
3. **Alertas adicionales** → Enviar notificaciones si crítico
4. **Dashboard dedicado** → Crear página admin/monitor
5. **Exportar reportes** → Guardar histórico de métricas

---

## 📞 Soporte Rápido

| Problema | Solución |
|----------|----------|
| Port 9090 no responde | `./gradlew bootRun` con `-Dmanagement.server.port=9090` |
| Valores en 0 | Verificar `management.endpoints.web.exposure` en properties |
| CORS error | Backend necesita permitir origen del frontend en 9090 |
| Card no se ve | Verificar import y JSX en UserDashboard |

---

**¡Listo! El Performance Monitor está listo para integrar.** 🎉
