# 📊 Módulo Pendientes Mensuales (v1.68.0)

> **Sistema de Telemedicina CENATE - EsSalud Perú**
> **Fecha de Creación:** 2026-02-25
> **Versión Módulo:** 1.0.0
> **Status:** ✅ Backend Production Ready

---

## 🎯 Descripción General

El **Módulo de Pendientes Mensuales** expone endpoints REST para consultar los pacientes pendientes de atención agrupados por médico, para un período mensual determinado.

Los datos provienen de dos tablas precomputadas en la BD:
- `consolidado_pendientes_mensual` — resumen por profesional (1 fila por médico)
- `detalle_pendientes_mensual` — listado nominal de pacientes (1 fila por paciente)

---

## 🏗️ Arquitectura

```
┌─────────────────────────────────────────────────────────────────┐
│              MÓDULO PENDIENTES MENSUALES                        │
├─────────────────────────────────────────────────────────────────┤
│                                                                  │
│  GET /api/pendientes-mensuales/kpis                              │
│  GET /api/pendientes-mensuales/consolidado   ← paginado + filtros│
│  GET /api/pendientes-mensuales/detalle       ← paginado + búsqueda│
│  GET /api/pendientes-mensuales/detalle/{dniMedico}               │
│                                                                  │
│  ┌──────────────────────────────────────────────────────────┐   │
│  │  PendientesMensualesController                           │   │
│  │  └── PendientesService / PendientesServiceImpl           │   │
│  │       ├── ConsolidadoPendientesMensualRepository         │   │
│  │       │    └── consolidado_pendientes_mensual (106 filas) │   │
│  │       └── DetallePendientesMensualRepository              │   │
│  │            └── detalle_pendientes_mensual (5,277 filas)  │   │
│  └──────────────────────────────────────────────────────────┘   │
└─────────────────────────────────────────────────────────────────┘
```

---

## 📂 Estructura de Archivos

```
backend/src/main/java/com/styp/cenate/
├── model/
│   ├── ConsolidadoPendientesMensual.java
│   └── DetallePendientesMensual.java
├── dto/pendientes/
│   ├── ConsolidadoPendientesDTO.java
│   ├── DetallePendientesDTO.java
│   └── PendientesResumenDTO.java         ← KPIs + inner classes
├── repository/pendientes/
│   ├── ConsolidadoPendientesMensualRepository.java
│   └── DetallePendientesMensualRepository.java
├── service/pendientes/
│   ├── PendientesService.java            ← interfaz
│   └── PendientesServiceImpl.java        ← implementación
└── api/pendientes/
    └── PendientesMensualesController.java
```

---

## 🗄️ Tablas de Base de Datos

### `consolidado_pendientes_mensual`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_cons_pend` | bigint PK | Identificador único |
| `dni_medico` | text | DNI del profesional |
| `profesional` | text | Nombre del médico |
| `fecha_cita` | date | Fecha de la cita pendiente |
| `subactividad` | text | TELECONSULTA, TELEMONITOREO, etc. |
| `servicio` | text | Especialidad / servicio |
| `abandono` | integer | Cantidad de abandonos |

**Volumen:** ~106 filas (1 por médico)

---

### `detalle_pendientes_mensual`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_det_pend` | bigint PK | Identificador único |
| `dni_medico` | text | DNI del profesional |
| `profesional` | text | Nombre del médico |
| `fecha_cita` | date | Fecha de la cita pendiente |
| `subactividad` | text | Tipo de subactividad |
| `servicio` | text | Especialidad / servicio |
| `doc_paciente` | text | DNI del paciente |
| `paciente` | text | Nombre del paciente |
| `abandono` | text | Texto de estado de abandono |

**Volumen:** ~5,277 filas (1 por paciente pendiente)

---

## 🔌 Endpoints REST

**Base URL:** `/api/pendientes-mensuales`

### 1. KPIs Globales

```
GET /api/pendientes-mensuales/kpis
```

**Respuesta:**
```json
{
  "status": 200,
  "message": "KPIs obtenidos exitosamente",
  "data": {
    "totalMedicos": 106,
    "totalPacientes": 4980,
    "totalAbandonos": 1230,
    "porSubactividad": [
      { "subactividad": "TELECONSULTA", "medicos": 80, "abandonos": 900 },
      { "subactividad": "TELEMONITOREO", "medicos": 26, "abandonos": 330 }
    ],
    "topServiciosPorAbandonos": [
      { "servicio": "MEDICINA GENERAL", "medicos": 30, "abandonos": 400 },
      ...
    ]
  }
}
```

---

### 2. Consolidado por Médico (paginado)

```
GET /api/pendientes-mensuales/consolidado
```

**Query params (todos opcionales):**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `servicio` | String | Filtrar por especialidad (ILIKE) |
| `subactividad` | String | TELECONSULTA, TELEMONITOREO, etc. |
| `fechaDesde` | LocalDate (ISO) | Desde fecha_cita |
| `fechaHasta` | LocalDate (ISO) | Hasta fecha_cita |
| `page` | int | Número de página (default: 0) |
| `size` | int | Tamaño de página (default: 20) |

**Ejemplo:**
```
GET /api/pendientes-mensuales/consolidado?servicio=CARDIOLOGIA&page=0&size=20
```

---

### 3. Detalle Nominal (paginado)

```
GET /api/pendientes-mensuales/detalle
```

**Query params (todos opcionales):**

| Parámetro | Tipo | Descripción |
|-----------|------|-------------|
| `servicio` | String | Filtrar por especialidad (ILIKE) |
| `subactividad` | String | TELECONSULTA, TELEMONITOREO, etc. |
| `busqueda` | String | DNI paciente o nombre (ILIKE en ambos) |
| `fechaDesde` | LocalDate (ISO) | Desde fecha_cita |
| `fechaHasta` | LocalDate (ISO) | Hasta fecha_cita |
| `page` | int | Número de página (default: 0) |
| `size` | int | Tamaño de página (default: 20) |

**Ejemplo:**
```
GET /api/pendientes-mensuales/detalle?busqueda=12345678&page=0&size=20
```

---

### 4. Detalle por Médico Específico

```
GET /api/pendientes-mensuales/detalle/{dniMedico}
```

Devuelve **todos** los pacientes pendientes de un médico (sin paginar).

**Ejemplo:**
```
GET /api/pendientes-mensuales/detalle/40123456
```

---

## 🔐 Control de Acceso (MBAC)

```java
@PreAuthorize("hasAnyRole(
    'SUPERADMIN',
    'ADMIN',
    'COORDINADOR',
    'COORD. GESTION CITAS',
    'GESTOR_TERRITORIAL_TI',
    'GESTIONTERRITORIAL'
)")
```

Todos los endpoints del módulo usan la misma expresión de autorización.

---

## 📦 DTOs

### `ConsolidadoPendientesDTO`
```java
Long idConsPend, String dniMedico, String profesional,
LocalDate fechaCita, String subactividad, String servicio, Integer abandono
```

### `DetallePendientesDTO`
```java
Long idDetPend, String dniMedico, String profesional,
LocalDate fechaCita, String subactividad, String servicio,
String docPaciente, String paciente, String abandono
```

### `PendientesResumenDTO`
```java
Long totalMedicos, Long totalPacientes, Long totalAbandonos,
List<SubactividadResumenDTO> porSubactividad,     // {subactividad, medicos, abandonos}
List<ServicioResumenDTO> topServiciosPorAbandonos // {servicio, medicos, abandonos} top 10
```

---

## ✅ Verificación Build

```bash
./gradlew clean build -x test
# BUILD SUCCESSFUL in 13s
```

---

## 🔮 Próximos Pasos (Frontend)

- [ ] Página `/roles/coordinador/pendientes-mensuales` con tabla + KPIs
- [ ] Filtros: servicio, subactividad, rango de fechas, búsqueda
- [ ] Modal de detalle al hacer click en un médico (usa `/detalle/{dniMedico}`)
- [ ] Exportar a Excel
- [ ] Acceso desde sidebar para roles permitidos
