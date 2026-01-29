# 📦 Módulo de Bolsas - Índice Maestro v2.5.0

> **Sistema completo de importación, gestión, análisis, estadísticas y control de acceso RBAC**
> **Versión:** v2.5.0 | **Status:** ✅ Production Ready + Gestoras
> **Última actualización:** 2026-01-29
> **Datos en BD:** 329 registros activos
> **✨ NUEVO v2.5.0:** Módulo Mi Bandeja + Permisos Expandidos + Estado "Atendido"

---

## 🎯 Documentación Disponible

### ⭐⭐⭐ ÍNDICE MAESTRO - RECOMENDADO

**[`00_INDICE_MAESTRO_MODULO_BOLSAS.md`](./00_INDICE_MAESTRO_MODULO_BOLSAS.md)** ← **LEE ESTO PRIMERO**

Índice completo unificado del módulo con:
- Vista general de todos los componentes
- Matriz de funcionalidades
- Flujos integrados
- Relaciones entre módulos
- Timeline de desarrollo
- Roadmap futuro
- **✨ v2.1.0 NEW:** Control de Acceso RBAC + Filtros Dinámicos

---

### 🆕 CHANGELOG v2.5.0 - Gestoras (Novedades 2026-01-29)

**[`16_CHANGELOG_v2.5.0_MODULO_GESTORAS.md`](./16_CHANGELOG_v2.5.0_MODULO_GESTORAS.md)** ← **VER CAMBIOS v2.5.0**

Changelog detallado con:
- 🎯 Permisos expandidos para asignar gestoras
- 📬 Nuevo módulo "Mi Bandeja" para gestoras
- ✅ Funcionalidad cambiar estado a "Atendido"
- 👤 Endpoints protegidos por rol GESTOR_DE_CITAS
- 🔒 Control de acceso basado en usuario actual
- 📊 UI dashboard para gestoras
- 🛠️ Implementación técnica completa

---

### 📋 CHANGELOG v2.1.0 - Controles de Acceso

**[`14_CHANGELOG_v2.1.0.md`](./14_CHANGELOG_v2.1.0.md)** ← **VER CAMBIOS v2.1.0**

Changelog detallado con:
- 8 características nuevas
- RBAC (Botón Borrar → SUPERADMIN)
- Filtros dinámicos + contadores
- Teléfono alterno + auto-creación asegurados
- Normalización IPRESS + enriquecimiento cascada
- Matriz de cambios + testing realizado
- Impacto y beneficios

---

### 🚀 GUÍA RÁPIDA - Para nuevos usuarios

**[`01_GUIA_RAPIDA_SETUP.md`](./01_GUIA_RAPIDA_SETUP.md)** ← **COMIENZA AQUÍ (10 min)**

Guía paso a paso para:
- Setup inicial backend + frontend
- Crear primer tipo de bolsa
- Importar primer Excel
- Visualizar estadísticas
- Solucionar problemas comunes

---

## 📚 Documentación por Componente

### 1️⃣ SOLICITUDES - Importación y Gestión (v2.5.0)

**[`12_modulo_solicitudes_bolsa_v1.12.0.md`](./12_modulo_solicitudes_bolsa_v1.12.0.md)**

✨ **Características Base:**
- Auto-detección inteligente de bolsa + servicio
- Soft delete de solicitudes en lote
- Corrección de fechas Excel
- Validación sin headers
- 8 endpoints REST CRUD
- Enriquecimiento automático de datos

✨ **NUEVO v2.5.0 - Gestoras:**
- 👤 Asignación a gestoras de citas (GESTOR_DE_CITAS)
- 📬 Módulo "Mi Bandeja" para que gestoras vean sus solicitudes asignadas
- ✅ Cambio de estado a "Atendido" por parte de gestoras
- 🔒 Permisos expandidos: SUPERADMIN + COORDINADOR_GESTION_DE_CITAS
- 🎯 Filtros y búsqueda en bandeja
- 📊 Estadísticas por estado en tiempo real

✨ **ANTERIOR v2.1.0:**
- 🔒 Control de Acceso RBAC (Botón Borrar → SUPERADMIN)
- 📊 Filtros dinámicos con contadores en tiempo real
- 📱 Teléfono alterno (Excel col 8 → asegurados.tel_celular)
- 👤 Auto-creación de asegurados faltantes
- 🔢 Normalización IPRESS a 3 dígitos (21 → 021)
- 🗺️ Enriquecimiento cascada (IPRESS→RED→MACRORREGIÓN)
- 🎨 UI mejorada con ListHeader.jsx v2.0.0

📊 **Estado:** ✅ v2.5.0 Production Ready + Gestoras

---

### 🆕 MÓDULO MI BANDEJA - Para Gestoras (v2.5.0)

**[`16_CHANGELOG_v2.5.0_MODULO_GESTORAS.md`](./16_CHANGELOG_v2.5.0_MODULO_GESTORAS.md)** ⭐ **NUEVO**

✨ **Características:**
- 📬 Dashboard personal para gestoras de citas
- 🔍 Búsqueda y filtrado de solicitudes asignadas
- ✅ Marcar solicitud como "Atendido"
- 📊 Estadísticas rápidas (Total, Pendientes, Atendidas, Canceladas)
- 🔒 Acceso restringido a rol GESTOR_DE_CITAS
- 👤 Aislamiento por usuario (cada gestora ve solo sus solicitudes)
- 🛠️ Endpoints: GET /mi-bandeja, PATCH /{id}/estado

📊 **Estado:** ✅ v2.5.0 Production Ready (NUEVO)

---

### 2️⃣ ESTADÍSTICAS - Dashboard Analytics (v2.0.0) ⭐ NUEVO

**[`13_estadisticas_dashboard_v2.0.0.md`](./13_estadisticas_dashboard_v2.0.0.md)**

✨ **Características:**
- 8 endpoints REST de estadísticas en tiempo real
- Dashboard con 6 visualizaciones
- Datos 100% reales (329 registros activos)
- Pie charts, barras horizontales, línea temporal
- 3 tipos de cita + 6 tipos de bolsa
- KPIs detallados con indicadores de salud
- Colores y emojis distintivos

📊 **Estado:** ✅ v2.0.0 Production Ready (NUEVO)

---

### 3️⃣ TIPOS DE BOLSA - Catálogo (v1.1.0)

**[`05_modulo_tipos_bolsas_crud.md`](./05_modulo_tipos_bolsas_crud.md)**

✨ **Características:**
- CRUD completo de tipos
- Gestión de 7+ tipos de bolsas
- Búsqueda avanzada
- Paginación y filtros
- Modales profesionales
- Auditoría de cambios

📊 **Estado:** ✅ v1.1.0 Production Ready

---

### 4️⃣ ESTADOS CITAS - Gestión de Estados (v1.33.0)

**[`07_modulo_estados_gestion_citas_crud.md`](./07_modulo_estados_gestion_citas_crud.md)**

✨ **Características:**
- 10 estados predefinidos
- CRUD completo
- Auditoría centralizada
- Reutilizable en otros módulos
- Integración con solicitudes

📊 **Estado:** ✅ v1.33.0 Production Ready

---

## 🌊 Flujo del Sistema Completo v2.0.0

```
┌─────────────────────────────────────────────────────────────────┐
│ 1️⃣ PREPARACIÓN - TIPOS DE BOLSA (v1.1.0)                       │
│   Admin crea tipos: ORDINARIA, EXTRAORDINARIA, ESPECIAL, etc.   │
└─────────────┬───────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 2️⃣ IMPORTACIÓN - SOLICITUDES (v1.12.0)                         │
│   Usuario carga Excel                                           │
│   ├─ Auto-detecta tipo bolsa + servicio                         │
│   ├─ Valida 10 campos Excel                                     │
│   ├─ Enriquece con datos asegurado/IPRESS/RED                  │
│   └─ Guarda 329+ solicitudes en BD                              │
└─────────────┬───────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 3️⃣ GESTIÓN - SOLICITUDES (v1.12.0)                             │
│   ├─ Visualizar listado con filtros                             │
│   ├─ Cambiar estado (10 opciones)                               │
│   ├─ Editar teléfono/correo                                     │
│   └─ Soft delete selectivo o en lote                            │
└─────────────┬───────────────────────────────────────────────────┘
              ↓
┌─────────────────────────────────────────────────────────────────┐
│ 4️⃣ ANÁLISIS - ESTADÍSTICAS (v2.0.0) ⭐ NUEVO                   │
│   Dashboard con 8 endpoints + 6 visualizaciones:                │
│   ├─ Resumen: 5 KPIs principales                               │
│   ├─ Estado: Distribución por PENDIENTE/ATENDIDO/CANCELADO     │
│   ├─ Especialidad: Ranking con tasas                            │
│   ├─ IPRESS: Ranking con carga comparativa                      │
│   ├─ Tipo Cita: Pie chart 3 tipos (VOLUNTARIA/INTERCONSULTA)   │
│   ├─ Tipo Bolsa: Barras horizontales 6 tipos ⭐ NUEVO           │
│   ├─ Temporal: Línea 30 días con tendencias                     │
│   └─ KPIs: Indicadores de salud + alertas                       │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📊 Datos Actuales (2026-01-27)

**Base de datos:** `dim_solicitud_bolsa` - **329 registros activos**

| Métrica | Valor | %  |
|---------|-------|-----|
| **Total Solicitudes** | 329 | 100% |
| Atendidas | 218 | 66.26% |
| Pendientes | 76 | 23.10% |
| Canceladas | 35 | 10.64% |

### Distribución por Tipo de Cita
| Tipo | Total | % | Completación |
|------|-------|---|--------------|
| VOLUNTARIA | 218 | 66.26% | 66.51% |
| RECITA | 76 | 23.10% | 65.79% |
| INTERCONSULTA | 35 | 10.64% | 65.71% |

### Distribución por Estado
| Estado | Total | Emoji |
|--------|-------|-------|
| PENDIENTE | 76 | ⏳ |
| ATENDIDO | 218 | ✅ |
| CANCELADO | 35 | ❌ |

---

## 🏗️ Arquitectura Integrada v2.5.0

```
┌─────────────────────────────────────────────┐
│ FRONTEND (React 19)                         │
├─────────────────────────────────────────────┤
│ ├─ CargarDesdeExcel.jsx (v1.12.0)          │
│ ├─ Solicitudes.jsx (v2.5.0) 👤             │
│ ├─ MiBandeja.jsx (v2.5.0) ⭐ NUEVO         │
│ ├─ TiposBolsas.jsx (v1.1.0)                │
│ ├─ EstadosGestion.jsx (v1.33.0)            │
│ └─ EstadisticasDashboard.jsx (v2.0.0)      │
└──────────────┬──────────────────────────────┘
               │ HTTP REST API
┌──────────────▼──────────────────────────────┐
│ BACKEND (Spring Boot 3.5.6)                │
├─────────────────────────────────────────────┤
│ Controllers:                                │
│ ├─ SolicitudBolsaController (v2.5.0) 👤    │
│ │  ├─ POST /{id}/asignar (expandido)       │
│ │  └─ GET /mi-bandeja (NEW) ⭐             │
│ ├─ TipoBolsaController (v1.3.0)            │
│ ├─ EstadoGestionController (v1.2.0)       │
│ └─ SolicitudBolsaEstadisticasController v2.0.0│
│                                            │
│ Services:                                  │
│ ├─ SolicitudBolsaServiceImpl (v2.5.0) 👤   │
│ │  └─ obtenerSolicitudesAsignadasAGestora()│
│ ├─ ExcelImportService (v1.9.1)            │
│ └─ SolicitudBolsaEstadisticasServiceImpl    │
│                                            │
│ Repositories:                              │
│ ├─ SolicitudBolsaRepository (v1.7.0) ⭐    │
│ │  └─ findByResponsableGestoraIdAndActivo..│
│ └─ UsuarioRepository                       │
└──────────────┬──────────────────────────────┘
               │ SQL
┌──────────────▼──────────────────────────────┐
│ DATABASE (PostgreSQL 14)                    │
├─────────────────────────────────────────────┤
│ Central:                                    │
│ └─ dim_solicitud_bolsa (329 registros)     │
│    ├─ responsable_gestora_id (NEW v2.5.0) │
│    └─ fecha_asignacion (NEW v2.5.0)        │
│                                            │
│ Referencias:                               │
│ ├─ dim_tipos_bolsas                        │
│ ├─ dim_estados_gestion_citas (10 estados) │
│ ├─ dim_usuarios (para gestoras)            │
│ ├─ dim_asegurados (enriquecimiento)       │
│ ├─ dim_ipress + dim_red (geo)             │
│ └─ dim_servicios (especialidades)         │
└─────────────────────────────────────────────┘
```

---

## 📋 Matrix de Funcionalidades v2.5.0

| Funcionalidad | v1.12.0 | v1.33.0 | v1.1.0 | v2.0.0 | v2.5.0 |
|---------------|---------|---------|--------|--------|--------|
| **CRUD Solicitudes** | ✅ | - | - | - | ✅ |
| **Auto-detección Excel** | ✅ | - | - | - | ✅ |
| **Soft Delete lote** | ✅ | - | - | - | ✅ |
| **Asignar a Gestora** | - | - | - | - | ✅ ⭐ |
| **Mi Bandeja Gestora** | - | - | - | - | ✅ ⭐ |
| **Cambiar a Atendido** | - | - | - | - | ✅ ⭐ |
| **Gestión Estados** | - | ✅ | - | - | ✅ |
| **CRUD Tipos Bolsa** | - | - | ✅ | - | ✅ |
| **Dashboard Estadísticas** | - | - | - | ✅ | ✅ |
| **Pie Charts** | - | - | - | ✅ | ✅ |
| **Barras H. Tipo Bolsa** | - | - | - | ✅ | ✅ |
| **Línea Temporal** | - | - | - | ✅ | ✅ |
| **KPIs Detallados** | - | - | - | ✅ | ✅ |

---

## 📁 Estructura de Carpetas v2.5.0

```
spec/backend/09_modules_bolsas/
├── 00_INDICE_MAESTRO_MODULO_BOLSAS.md           ⭐ ÍNDICE (v2.5.0)
├── 01_GUIA_RAPIDA_SETUP.md                      🚀 GUÍA RÁPIDA (v2.0.0)
├── 05_modulo_tipos_bolsas_crud.md               📚 Tipos (v1.1.0)
├── 07_modulo_estados_gestion_citas_crud.md      📚 Estados (v1.33.0)
├── 12_modulo_solicitudes_bolsa_v1.12.0.md       📚 Solicitudes (v2.5.0) + Gestoras
├── 13_estadisticas_dashboard_v2.0.0.md          📊 Estadísticas (v2.0.0)
├── 14_CHANGELOG_v2.1.0.md                       📝 CHANGELOG (v2.1.0)
├── 16_CHANGELOG_v2.5.0_MODULO_GESTORAS.md       📝 CHANGELOG (NEW v2.5.0) ⭐
└── README.md                                     📄 Este archivo (v2.5.0)
```

---

## 🔍 Búsqueda Rápida

| Pregunta | Documento | Sección |
|----------|-----------|---------|
| ¿Cómo hago setup inicial? | 01_GUIA_RAPIDA_SETUP.md | Setup |
| ¿Cómo importo una bolsa? | 12_modulo_solicitudes_bolsa_v1.12.0.md | Ejemplos |
| ¿Cómo creo un tipo? | 05_modulo_tipos_bolsas_crud.md | CRUD |
| ¿Cómo cambio estado? | 07_modulo_estados_gestion_citas_crud.md | Estados |
| ¿Cómo veo estadísticas? | 13_estadisticas_dashboard_v2.0.0.md | Endpoints |
| ¿Cómo funciona todo? | 00_INDICE_MAESTRO_MODULO_BOLSAS.md | Flujo |
| ¿Qué hay de nuevo? | spec/../CAMBIOS_MODULO_BOLSAS_v2.0.0.md | v2.0.0 |

---

## ✅ Estado Módulo v2.5.0

| Componente | Versión | Status | Documentado |
|-----------|---------|--------|-------------|
| Solicitudes | v2.5.0 | ✅ Production + Gestoras | ✅ Completo ⭐ |
| Asignación Gestora | v2.5.0 | ✅ Production | ✅ Completo ⭐ |
| Mi Bandeja | v2.5.0 | ✅ Production | ✅ Completo ⭐ |
| Cambio Estado | v2.5.0 | ✅ Production | ✅ Completo ⭐ |
| Estadísticas | v2.0.0 | ✅ Production | ✅ Completo |
| Tipos Bolsa | v1.1.0 | ✅ Production | ✅ Completo |
| Estados Citas | v1.33.0 | ✅ Production | ✅ Completo |
| Acceso RBAC | v2.5.0 | ✅ Production | ✅ Completo ⭐ |
| Filtros Dinámicos | v2.1.0 | ✅ Production | ✅ Completo |
| **Documentación** | **v2.5.0** | **✅ Actualizada** | **✅ Completa ⭐** |

**Todos los componentes listos para producción. Nuevo módulo Mi Bandeja para gestoras.** 🚀

---

## 📚 Archivos de Referencia Externa

**Resumen CLAUDE.md (proyecto completo):**
→ `CLAUDE.md` (versión v1.37.2)

**Backend README actualizado:**
→ `/spec/backend/README.md`

**Changelog completo v2.1.0:**
→ `14_CHANGELOG_v2.1.0.md` (este directorio)

---

## 📞 Información

**Desarrollador:** Ing. Styp Canto Rondón
**Email:** stypcanto@essalud.gob.pe
**Última actualización:** 2026-01-29
**Versión Sistema:** v2.5.0
**Status:** ✅ Production Ready + Gestoras + Mi Bandeja + Estado Atendido
