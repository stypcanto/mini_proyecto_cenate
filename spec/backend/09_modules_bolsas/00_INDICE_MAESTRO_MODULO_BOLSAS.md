# 📚 ÍNDICE MAESTRO - Módulo de Bolsas v2.0.0

> **Documentación unificada del módulo completo de Bolsas de Pacientes**
> **Fecha:** 2026-01-27
> **Versión:** v2.0.0
> **Status:** ✅ Production Ready

---

## 📖 Tabla de Contenidos

1. [Vista General](#vista-general)
2. [Estructura del Módulo](#estructura-del-módulo)
3. [Componentes Principales](#componentes-principales)
4. [Flujo Integrado](#flujo-integrado)
5. [Matrix de Funcionalidades](#matrix-de-funcionalidades)
6. [Timeline de Desarrollo](#timeline-de-desarrollo)
7. [Documentación Completa](#documentación-completa)
8. [Preguntas Frecuentes](#preguntas-frecuentes)
9. [Roadmap Futuro](#roadmap-futuro)

---

## Vista General

El **Módulo de Bolsas** es un sistema integral para la gestión de solicitudes de atención de pacientes en CENATE. Comprende 4 componentes principales que trabajan en conjunto:

```
┌─────────────────────────────────────────────────────────────┐
│  MÓDULO DE BOLSAS v2.0.0                                   │
│  (Sistema integral de importación, gestión y análisis)      │
├─────────────────────────────────────────────────────────────┤
│                                                              │
│  ✅ v1.12.0 - Solicitudes (Importación + Gestión)          │
│  ├─ Excel inteligente con auto-detección                   │
│  ├─ 329+ solicitudes activas                               │
│  ├─ Soft delete con auditoría                              │
│  └─ 8 endpoints REST CRUD                                  │
│                                                              │
│  ✅ v1.1.0 - Tipos de Bolsa (Catálogo)                     │
│  ├─ 7+ tipos predefinidos                                  │
│  ├─ CRUD completo                                          │
│  ├─ Búsqueda avanzada                                      │
│  └─ Integración con solicitudes                            │
│                                                              │
│  ✅ v1.33.0 - Estados Citas (Gestión Estados)              │
│  ├─ 10 estados disponibles                                 │
│  ├─ Tracking centralizado                                  │
│  ├─ Auditoría automática                                   │
│  └─ Reutilizable en otros módulos                          │
│                                                              │
│  ✅ v2.0.0 - Estadísticas Dashboard (Análisis) ⭐ NUEVO   │
│  ├─ 8 endpoints de estadísticas                            │
│  ├─ 6 visualizaciones diferentes                           │
│  ├─ Datos 100% reales (329 registros)                      │
│  └─ KPIs con indicadores de salud                          │
│                                                              │
└─────────────────────────────────────────────────────────────┘
```

---

## Estructura del Módulo

### Nivel 1: Base de Datos

```
dim_solicitud_bolsa (329 registros activos)
├─ Identificación: id_solicitud, numero_solicitud
├─ Paciente: DNI, nombre, teléfono, correo
├─ Datos Excel: Fecha preferida, tipo documento, sexo, fecha nacimiento
├─ Localización: Código IPRESS, descripción, RED
├─ Clínico: Especialidad, tipo cita
├─ Estado: estado_gestion_citas_id (10 opciones)
├─ Bolsa: id_bolsa (referencia a dim_tipos_bolsas)
└─ Auditoría: fecha_solicitud, fecha_actualizacion, activo (soft delete)
```

**Tablas de Referencia:**
- `dim_tipos_bolsas` - Catálogo de tipos
- `dim_estados_gestion_citas` - 10 estados
- `dim_asegurados` - Enriquecimiento
- `dim_ipress` - Instituciones
- `dim_red` - Redes asistenciales

### Nivel 2: Servicios REST

**8 Endpoints principales:**

| Endpoint | Versión | Función |
|----------|---------|---------|
| `/api/bolsas/solicitudes` | v1.8.0 | CRUD solicitudes |
| `/api/bolsas/tipos-bolsas` | v1.3.0 | CRUD tipos bolsa |
| `/api/admin/estados-gestion-citas` | v1.2.0 | CRUD estados |
| `/api/bolsas/estadisticas/**` | v2.0.0 | 8 endpoints estadísticas ⭐ |

### Nivel 3: Frontend React

**4 Páginas principales:**
- `CargarDesdeExcel.jsx` - Importación inteligente
- `Solicitudes.jsx` - Listado y gestión
- `TiposBolsas.jsx` - Administración de tipos
- `EstadisticasDashboard.jsx` - Dashboard analítico ⭐

---

## Componentes Principales

### 1️⃣ SOLICITUDES DE BOLSA (v1.12.0)

**Propósito:** Importación, validación y gestión de solicitudes de atención

**Características clave:**
- ✅ Auto-detección de tipo bolsa + servicio por nombre archivo
- ✅ Validación de 10 campos Excel
- ✅ Enriquecimiento automático desde tablas auxiliares
- ✅ Soft delete con auditoría
- ✅ Mensajes de error amigables

**Archivos:**
- Backend: `SolicitudBolsaController`, `ExcelImportService`, `SolicitudBolsaServiceImpl`
- Frontend: `CargarDesdeExcel.jsx`, `Solicitudes.jsx`
- Base datos: `dim_solicitud_bolsa`, `dim_historial_importacion_bolsa`

**Endpoints:**
```
POST   /api/bolsas/solicitudes/importar
GET    /api/bolsas/solicitudes
GET    /api/bolsas/solicitudes/{id}
PUT    /api/bolsas/solicitudes/{id}
POST   /api/bolsas/solicitudes/borrar (soft delete lote)
PATCH  /api/bolsas/solicitudes/{id}/estado
```

---

### 2️⃣ TIPOS DE BOLSA (v1.1.0)

**Propósito:** Administración del catálogo de tipos de bolsa

**Características clave:**
- ✅ CRUD completo de tipos
- ✅ Búsqueda case-insensitive
- ✅ Paginación y filtros
- ✅ Validación de duplicados
- ✅ Auditoría de cambios

**Archivos:**
- Backend: `TipoBolsaController`, `TipoBolsaServiceImpl`, `TipoBolsaRepository`
- Frontend: `TiposBolsas.jsx`
- Base datos: `dim_tipos_bolsas`

**Tipos predefinidos:**
- ORDINARIA - Bolsas regulares
- EXTRAORDINARIA - Bolsas especiales
- ESPECIAL - Bolsas de especialidades
- URGENTE - Bolsas de urgencia
- EMERGENCIA - Bolsas de emergencia
- RESERVA - Bolsas de reserva
- (+ tipos personalizados)

---

### 3️⃣ ESTADOS CITAS (v1.33.0)

**Propósito:** Gestión centralizada de estados de seguimiento

**Características clave:**
- ✅ 10 estados predefinidos
- ✅ CRUD completo
- ✅ Estados por defecto configurables
- ✅ Reutilizable en otros módulos
- ✅ Auditoría automática

**Estados disponibles:**
1. PENDIENTE_CITA - Aguardando asignación
2. CITADO - Cita asignada
3. NO_CONTESTA - Paciente no contactable
4. ATENDIDO - Atención completada
5. CANCELADO - Cita cancelada
6. DERIVADO - Derivado a otra institución
7. OBSERVADO - En observación
8. RECHAZADO - Solicitud rechazada
9. APLAZADO - Aplazado a otra fecha
10. COMPLETADO - Proceso completado

**Archivos:**
- Backend: `EstadoGestionController`, `EstadoGestionServiceImpl`
- Base datos: `dim_estados_gestion_citas`

---

### 4️⃣ ESTADÍSTICAS DASHBOARD (v2.0.0) ⭐

**Propósito:** Análisis e inteligencia empresarial del módulo

**Características clave:**
- ✅ 8 endpoints REST de estadísticas
- ✅ 6 visualizaciones diferentes
- ✅ Datos 100% reales (329 registros)
- ✅ Colores y emojis distintivos
- ✅ KPIs con indicadores de salud

**Endpoints:**
```
GET /api/bolsas/estadisticas/resumen              - Resumen 5 KPIs
GET /api/bolsas/estadisticas/del-dia              - Últimas 24h
GET /api/bolsas/estadisticas/por-estado           - Distribución estados
GET /api/bolsas/estadisticas/por-especialidad     - Ranking especialidades
GET /api/bolsas/estadisticas/por-ipress           - Ranking IPRESS
GET /api/bolsas/estadisticas/por-tipo-cita        - 3 tipos cita (pie)
GET /api/bolsas/estadisticas/por-tipo-bolsa       - 6 tipos bolsa (barras) ⭐
GET /api/bolsas/estadisticas/evolucion-temporal   - Últimos 30 días
GET /api/bolsas/estadisticas/kpis                 - Indicadores detallados
GET /api/bolsas/estadisticas/dashboard-completo   - Todos los datos (1 llamada)
```

**Visualizaciones:**
- Pie chart: Tipo de cita (3 segmentos)
- Barras horizontales: Tipo de bolsa (6 barras) ⭐
- Línea temporal: Evolución 30 días
- Tablas: Especialidad e IPRESS
- Cards: KPIs ejecutivos

**Archivos:**
- Backend: `SolicitudBolsaEstadisticasController`, `SolicitudBolsaEstadisticasServiceImpl`
- Frontend: `EstadisticasDashboard.jsx` (7 componentes)
- Base datos: Queries nativas SQL en `SolicitudBolsaRepository`

---

## Flujo Integrado

### Caso de Uso Completo: Del Excel al Dashboard

```
┌─────────────────────────────────────────────────────────────┐
│ PASO 1: SETUP INICIAL                                       │
│                                                              │
│ Admin accede a: Admin > Tipos de Bolsa                      │
│ ├─ Crea 6+ tipos de bolsa                                   │
│ └─ Sistema listo para importar                              │
└──────────────┬──────────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────────┐
│ PASO 2: IMPORTACIÓN INTELIGENTE                              │
│                                                              │
│ Coordinador accede a: Bolsas > Cargar desde Excel           │
│ ├─ Selecciona archivo: "BOLSA_OTORRINO_2601.xlsx"           │
│ ├─ Sistema auto-detecta:                                    │
│ │  ├─ Bolsa: Otorrinolaringología                           │
│ │  └─ Servicio: Consulta Externa                            │
│ ├─ Valida 10 campos Excel                                   │
│ ├─ Enriquece con datos:                                     │
│ │  ├─ Asegurado: Nombre, sexo, fecha nac, correo           │
│ │  ├─ IPRESS: Descripción, RED                              │
│ │  └─ Servicios: Especialidad                               │
│ └─ Importa 50 solicitudes nuevas (total: 329)               │
└──────────────┬──────────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────────┐
│ PASO 3: GESTIÓN DE SOLICITUDES                               │
│                                                              │
│ Gestor accede a: Bolsas > Solicitudes                       │
│ ├─ Visualiza listado de 329 solicitudes                     │
│ ├─ Puede filtrar por:                                       │
│ │  ├─ Especialidad                                          │
│ │  ├─ Estado (10 opciones)                                  │
│ │  ├─ Bolsa                                                 │
│ │  └─ Fecha                                                 │
│ ├─ Realiza acciones:                                        │
│ │  ├─ Cambiar estado (PENDIENTE → ATENDIDO)                │
│ │  ├─ Editar teléfono/correo                               │
│ │  ├─ Eliminar seleccionadas                                │
│ │  └─ Eliminar todas                                        │
│ └─ Soft delete con auditoría automática                     │
└──────────────┬──────────────────────────────────────────────┘
               ↓
┌──────────────────────────────────────────────────────────────┐
│ PASO 4: ANÁLISIS Y ESTADÍSTICAS ⭐ NUEVO v2.0.0              │
│                                                              │
│ Director/Analista accede a: Bolsas > Dashboard Estadísticas │
│ ├─ Ve 5 KPIs principales:                                   │
│ │  ├─ Total: 329 solicitudes                                │
│ │  ├─ Atendidas: 218 (66.26%)                               │
│ │  ├─ Pendientes: 76 (23.10%)                               │
│ │  ├─ Canceladas: 35 (10.64%)                               │
│ │  └─ Derivadas: 0 (0%)                                     │
│ ├─ Analiza 6 visualizaciones:                               │
│ │  ├─ Estado (distribución)                                 │
│ │  ├─ Especialidad (ranking)                                │
│ │  ├─ IPRESS (ranking)                                      │
│ │  ├─ Tipo Cita (pie 3 tipos)                               │
│ │  ├─ Tipo Bolsa (barras 6 tipos) ⭐                        │
│ │  └─ Temporal (30 días)                                    │
│ └─ Genera reportes y toma decisiones                        │
└──────────────────────────────────────────────────────────────┘
```

---

## Matrix de Funcionalidades

| Funcionalidad | v1.12.0 | v1.1.0 | v1.33.0 | v2.0.0 | Status |
|---|---|---|---|---|---|
| **CRUD Solicitudes** | ✅ | - | - | - | ✅ Activo |
| **Auto-detección Excel** | ✅ | - | - | - | ✅ Activo |
| **Soft Delete lote** | ✅ | - | - | - | ✅ Activo |
| **CRUD Tipos Bolsa** | - | ✅ | - | - | ✅ Activo |
| **Búsqueda avanzada** | - | ✅ | - | - | ✅ Activo |
| **CRUD Estados** | - | - | ✅ | - | ✅ Activo |
| **10 Estados predefinidos** | - | - | ✅ | - | ✅ Activo |
| **Dashboard Analytics** | - | - | - | ✅ | ✅ NUEVO |
| **8 Endpoints stats** | - | - | - | ✅ | ✅ NUEVO |
| **6 Visualizaciones** | - | - | - | ✅ | ✅ NUEVO |
| **KPIs Detallados** | - | - | - | ✅ | ✅ NUEVO |
| **Pie Charts** | - | - | - | ✅ | ✅ NUEVO |
| **Barras H. Tipo Bolsa** | - | - | - | ✅ | ✅ NUEVO |

---

## Timeline de Desarrollo

```
2024-09 - 2025-06: v1.0.0 - v1.9.0
  ├─ v1.0.0: Estructura inicial
  ├─ v1.1.0: Tipos de bolsa CRUD
  ├─ v1.2.0: Estados citas CRUD
  ├─ v1.4.0: Auto-normalización Excel
  ├─ v1.6.0: Solicitudes importación
  ├─ v1.8.0: Soft delete lote
  └─ v1.9.0: Correcciones Excel

2025-07 - 2026-01: v1.10.0 - v2.0.0
  ├─ v1.10.0: Búsqueda avanzada
  ├─ v1.11.0: Historial importaciones
  ├─ v1.12.0: Auto-detección + Soft delete
  ├─ v1.33.0: Estados gestión (migración)
  ├─ v1.37.0: Tipos bolsa v1.1.0 reorganizado
  └─ v2.0.0: ESTADÍSTICAS DASHBOARD ✨ (2026-01-27)

2026-02 - Futuro: v2.1.0+
  ├─ v2.1.0: Reportes PDF
  ├─ v2.2.0: Exportación Excel
  ├─ v2.3.0: Predicción con IA
  └─ v2.4.0: Mobile app
```

---

## Documentación Completa

### 📄 Por Componente

| Documento | Versión | Líneas | Tema |
|-----------|---------|--------|------|
| [`01_GUIA_RAPIDA_SETUP.md`](./01_GUIA_RAPIDA_SETUP.md) | v2.0.0 | 200 | Setup rápido ⭐ |
| [`05_modulo_tipos_bolsas_crud.md`](./05_modulo_tipos_bolsas_crud.md) | v1.1.0 | 450 | Tipos bolsa |
| [`07_modulo_estados_gestion_citas_crud.md`](./07_modulo_estados_gestion_citas_crud.md) | v1.33.0 | 500 | Estados citas |
| [`12_modulo_solicitudes_bolsa_v1.12.0.md`](./12_modulo_solicitudes_bolsa_v1.12.0.md) | v1.12.0 | 800 | Solicitudes |
| [`13_estadisticas_dashboard_v2.0.0.md`](./13_estadisticas_dashboard_v2.0.0.md) | v2.0.0 | 900 | Estadísticas ⭐ |
| [`00_INDICE_MAESTRO_MODULO_BOLSAS.md`](./00_INDICE_MAESTRO_MODULO_BOLSAS.md) | v2.0.0 | 500 | Índice maestro |
| [`README.md`](./README.md) | v2.0.0 | 350 | Vista general |

---

## Preguntas Frecuentes

**P: ¿Cuáles son los pasos mínimos para empezar?**
R: 1. Lee `01_GUIA_RAPIDA_SETUP.md` (10 min) 2. Setup backend + frontend 3. Crea un tipo bolsa 4. Importa un Excel 5. Visualiza estadísticas ✅

**P: ¿Cómo auto-detecta la bolsa el sistema?**
R: Extrae palabras del nombre archivo (ej: "BOLSA_OTORRINO_2601.xlsx" → busca "OTORRINO" en dim_tipos_bolsas)

**P: ¿Qué hacer si tengo errores al importar Excel?**
R: Consulta `12_modulo_solicitudes_bolsa_v1.12.0.md` → "Errores y Manejo" con lista de problemas comunes

**P: ¿Cuántas solicitudes puedo importar?**
R: Unlimited. Sistema actual tiene 329 activas. Recomendación: 1000+ por archivo es seguro.

**P: ¿Puedo ver estadísticas en tiempo real?**
R: Sí. Dashboard (`EstadisticasDashboard.jsx`) consulta 8 endpoints en paralelo con Promise.all()

**P: ¿Se guardan las importaciones antiguas?**
R: Sí. Tabla `dim_historial_importacion_bolsa` guarda historial completo

**P: ¿Cómo borro solicitudes?**
R: Soft delete (no destruye datos) en `Solicitudes.jsx` → "Eliminar seleccionadas" o "Eliminar todas"

**P: ¿Qué hay de nuevo en v2.0.0?**
R: Dashboard completo con 8 endpoints, 6 visualizaciones, y nuevo gráfico tipo bolsa ⭐

---

## Roadmap Futuro

### v2.1.0 (Q2 2026) - Reportes

- ✅ Reportes PDF generados
- ✅ Reportes Excel descargables
- ✅ Gráficos en reportes
- ✅ Programación de reportes automáticos

### v2.2.0 (Q3 2026) - Alertas Inteligentes

- ✅ Alertas por solicitudes vencidas
- ✅ Notificaciones por email
- ✅ Umbrales personalizables
- ✅ Dashboard de alertas

### v2.3.0 (Q4 2026) - IA/Predicción

- ✅ Predicción de completación
- ✅ Clustering de solicitudes
- ✅ Recomendaciones de acción
- ✅ Análisis de patrones

### v2.4.0 (2027) - Mobile

- ✅ App móvil React Native
- ✅ Sincronización offline
- ✅ Push notifications
- ✅ Consulta solicitudes

---

## Referencias Rápidas

**Números clave (2026-01-27):**
- 329 solicitudes activas
- 218 atendidas (66.26%)
- 76 pendientes (23.10%)
- 35 canceladas (10.64%)
- 8 endpoints estadísticas
- 6 visualizaciones
- 4 componentes

**URLs importantes:**
- Dashboard: `http://localhost:3000/bolsas/estadisticas`
- API Base: `http://localhost:8080/api/bolsas`
- DB: PostgreSQL 14

**Commits clave v2.0.0:**
```
28ef1f2 - docs: Resumen completo cambios Módulo Bolsas v2.0.0
e536561 - docs(bolsas-estadisticas): Documentación v2.0.0
1816237 - refactor(bolsas-estadisticas): Mejorar colores
a453e90 - refactor(bolsas-estadisticas): Cambiar a barras
62dc337 - feat(bolsas-estadisticas): Agregar tipo bolsa
```

---

**Última actualización:** 2026-01-27
**Desarrollador:** Ing. Styp Canto Rondón
**Email:** stypcanto@essalud.gob.pe
