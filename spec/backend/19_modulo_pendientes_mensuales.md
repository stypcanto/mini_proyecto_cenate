# 📊 Módulo Estadísticas de Programación — Pendientes Mensuales (v1.68.x)

> **Sistema de Telemedicina CENATE - EsSalud Perú**
> **Fecha de Creación:** 2026-02-25
> **Última Actualización:** 2026-02-25
> **Versión:** 1.68.x
> **Status:** ✅ Production Ready (Backend + Frontend)

---

## 🎯 Descripción General

El **Módulo de Estadísticas de Programación** visualiza los pacientes pendientes de atención agrupados por médico para el mes en curso. Los datos provienen de dos tablas precomputadas en BD:

- `consolidado_pendientes_mensual` — resumen por profesional (1 fila por médico/fecha/servicio)
- `detalle_pendientes_mensual` — listado nominal de pacientes (1 fila por paciente)

**Datos reales (Feb 2026):**
- `consolidado_pendientes_mensual`: 106 médicos con pendientes
- `detalle_pendientes_mensual`: 5,277 pacientes pendientes

---

## 🗺️ Ruta Frontend

```
/estadisticas/programacion
```

**Página:** `frontend/src/pages/estadisticas/EstadisticasProgramacion.jsx`

---

## 🏗️ Arquitectura Completa

```
┌────────────────────────────────────────────────────────────────────┐
│              MÓDULO PENDIENTES MENSUALES                           │
├────────────────────────────────────────────────────────────────────┤
│                                                                    │
│  GET /api/pendientes-mensuales/kpis       ← KPIs globales          │
│  GET /api/pendientes-mensuales/consolidado ← árbol RESUMEN         │
│  GET /api/pendientes-mensuales/detalle    ← tabla NOMINAL          │
│  GET /api/pendientes-mensuales/detalle/{dniMedico} ← drawer        │
│  GET /api/pendientes-mensuales/calendar   ← conteos por fecha      │
│                                                                    │
│  ┌─────────────────────────────────────────────────────────────┐   │
│  │  PendientesMensualesController                              │   │
│  │  └── PendientesService / PendientesServiceImpl              │   │
│  │       ├── ConsolidadoPendientesMensualRepository            │   │
│  │       │    └── consolidado_pendientes_mensual (106 filas)   │   │
│  │       └── DetallePendientesMensualRepository                │   │
│  │            └── detalle_pendientes_mensual (5,277 filas)     │   │
│  └─────────────────────────────────────────────────────────────┘   │
└────────────────────────────────────────────────────────────────────┘
```

---

## 📂 Estructura de Archivos Backend

```
backend/src/main/java/com/styp/cenate/
├── model/
│   ├── ConsolidadoPendientesMensual.java
│   └── DetallePendientesMensual.java
├── dto/pendientes/
│   ├── ConsolidadoPendientesDTO.java
│   ├── DetallePendientesDTO.java
│   └── PendientesResumenDTO.java          ← KPIs + inner classes
├── repository/pendientes/
│   ├── ConsolidadoPendientesMensualRepository.java
│   └── DetallePendientesMensualRepository.java
├── service/pendientes/
│   ├── PendientesService.java             ← interfaz
│   └── PendientesServiceImpl.java         ← implementación
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
| `profesional` | text | Nombre completo del médico |
| `fecha_cita` | date | Fecha de la cita pendiente |
| `subactividad` | text | TELECONSULTA, TELEMONITOREO, etc. |
| `servicio` | text | Especialidad / servicio |
| `abandono` | integer | Cantidad de abandonos |
| `turno` | text | **'MAÑANA'** (futuro: 'TARDE') |

**Volumen:** 106 filas
**Distribución de fechas (Feb 2026):** 2026-02-25 (47), 2026-02-26 (24), 2026-02-27 (17), 2026-02-28 (3), más anteriores.

---

### `detalle_pendientes_mensual`

| Columna | Tipo | Descripción |
|---------|------|-------------|
| `id_det_pend` | bigint PK | Identificador único |
| `dni_medico` | text | DNI del profesional |
| `profesional` | text | Nombre completo del médico |
| `fecha_cita` | date | Fecha de la cita pendiente |
| `subactividad` | text | Tipo de subactividad |
| `servicio` | text | Especialidad / servicio |
| `doc_paciente` | text | DNI del paciente |
| `paciente` | text | Nombre completo del paciente |
| `abandono` | text | Texto de estado de abandono |
| `hora_cita` | time | Hora de la cita (nullable, 719 de 5277 tienen hora) |
| `turno` | text | **'MAÑANA'** (futuro: 'TARDE') |

**Volumen:** 5,277 filas
**Distribución de fechas (Feb 2026):** 2026-02-25 (2008), 2026-02-26 (1275), 2026-02-27 (1166), 2026-02-28 (720), más anteriores.

**Nota `hora_cita`:** Se pobló desde `dim_solicitud_bolsa` mediante JOIN por `doc_paciente + fecha_cita`. Solo 719 de 5277 registros tienen hora porque el resto son "pendientes de citar" que aún no tienen entrada en `dim_solicitud_bolsa`.

**Nota `turno`:** Columna agregada posteriormente. El valor 'MAÑANA' es `7 bytes UTF-8` (Ñ = U+00D1).

---

## 🔌 Endpoints REST

**Base URL:** `/api/pendientes-mensuales`

### 1. KPIs Globales

```
GET /api/pendientes-mensuales/kpis?turno=MAÑANA
```

**Respuesta:**
```json
{
  "status": 200,
  "message": "KPIs obtenidos exitosamente",
  "data": {
    "totalMedicos": 106,
    "totalPacientes": 5182,
    "totalAbandonos": 5277,
    "porSubactividad": [
      { "subactividad": "TELECONSULTA", "medicos": 80, "abandonos": 900 },
      { "subactividad": "TELEMONITOREO", "medicos": 26, "abandonos": 330 }
    ],
    "topServiciosPorAbandonos": [
      { "servicio": "NEUROLOGIA", "medicos": 5, "abandonos": 400 }
    ]
  }
}
```

---

### 2. Consolidado por Médico (paginado)

```
GET /api/pendientes-mensuales/consolidado?turno=MAÑANA&page=0&size=200
```

**Query params:**

| Parámetro | Tipo | Default | Descripción |
|-----------|------|---------|-------------|
| `turno` | String | MAÑANA | Turno a consultar |
| `servicio` | String | null | Filtrar por especialidad (ILIKE) |
| `subactividad` | String | null | TELECONSULTA, TELEMONITOREO, etc. |
| `fechaDesde` | date ISO | null | Desde fecha_cita |
| `fechaHasta` | date ISO | null | Hasta fecha_cita |
| `page` | int | 0 | Número de página |
| `size` | int | 20 | Tamaño de página |

---

### 3. Detalle Nominal (paginado)

```
GET /api/pendientes-mensuales/detalle?turno=MAÑANA&page=0&size=20
```

**Query params:** igual que consolidado + `busqueda` (DNI o nombre paciente, ILIKE en ambos campos).

---

### 4. Detalle por Médico Específico

```
GET /api/pendientes-mensuales/detalle/{dniMedico}?turno=MAÑANA
```

Devuelve **todos** los pacientes pendientes de un médico (sin paginar). Usado por el **Drawer** del frontend.

---

### 5. Calendario — Conteos por Fecha *(nuevo)*

```
GET /api/pendientes-mensuales/calendar?turno=MAÑANA
```

**Respuesta:**
```json
{
  "status": 200,
  "data": [
    { "fecha": "2026-02-25", "count": 2008 },
    { "fecha": "2026-02-26", "count": 1275 },
    { "fecha": "2026-02-27", "count": 1166 },
    { "fecha": "2026-02-28", "count": 720 }
  ]
}
```

Usado por el componente `CalendarFilter` del frontend para pintar días con pacientes.

---

## 🔐 Control de Acceso (MBAC)

```java
@PreAuthorize("hasAnyRole(
    'SUPERADMIN','ADMIN','COORDINADOR',
    'COORD. GESTION CITAS','GESTOR_TERRITORIAL_TI','GESTIONTERRITORIAL'
)")
```

Todos los endpoints usan la misma expresión de autorización.

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
String docPaciente, String paciente, String abandono,
LocalTime horaCita   // nullable
```

### `PendientesResumenDTO`
```java
Long totalMedicos, Long totalPacientes, Long totalAbandonos,
List<SubactividadResumenDTO> porSubactividad,      // {subactividad, medicos, abandonos}
List<ServicioResumenDTO> topServiciosPorAbandonos  // top 10 por abandonos
```

---

## ⚠️ Patrón Crítico: Filtros de Fecha en Queries Nativas

**Problema:** Hibernate 6 con `LocalDate` en queries nativas — el chequeo `:param IS NULL` falla por ambigüedad de tipo.

**Solución aplicada (ambos repositorios):**

```sql
-- ❌ FALLA con LocalDate nulo en Hibernate 6:
AND (:fechaDesde IS NULL OR c.fecha_cita >= CAST(:fechaDesde AS date))

-- ✅ FUNCIONA — doble cast texto→date:
AND (CAST(:fechaDesde AS text) IS NULL OR c.fecha_cita >= CAST(CAST(:fechaDesde AS text) AS date))
```

Este patrón convierte primero el parámetro a `text` (lo cual funciona con valores nulos y no nulos), verifica el IS NULL sobre texto, y luego convierte a `date` para la comparación.

---

## 🖥️ Frontend — Página EstadisticasProgramacion.jsx

### Ruta y Registro

```
/estadisticas/programacion
frontend/src/pages/estadisticas/EstadisticasProgramacion.jsx
```

Registrada en `componentRegistry.js` con el nombre `EstadisticasProgramacion`.

### Componentes Internos

```
EstadisticasProgramacion (componente principal)
├── FilterSelect          — select estilizado reutilizable
├── CalendarFilter        — calendario con badges de conteo
├── MedicoNode            — nodo del árbol (lazy load de subactividades)
│   ├── SubactividadNode  — nodo de subactividad (expande servicios)
│   │   └── ServicioRow   — fila de servicio (abre drawer)
│   └── DrawerListaPacientes — panel derecho con lista de pacientes
└── (tabla NOMINAL)       — tabla paginada de pacientes
```

---

### KPI Cards

| KPI | Fuente | Color |
|-----|--------|-------|
| Médicos con Pendientes | `totalMedicos` (consolidado) | Azul |
| Pacientes Pendientes | `totalPacientes` (detalle) | Azul |
| Total Abandonos | `totalAbandonos` (consolidado) | Rojo |
| Subactividades | `porSubactividad.length` | Púrpura |

---

### Toggle de Turno

```
☀ Mañana [106]    🌆 Tarde
```

- **Mañana:** carga datos normalmente
- **Tarde:** estado vacío inmediato (tablas de tarde aún no existen)
- El badge del botón Mañana muestra el total de médicos cargados

**Implementación:** `if (turno === "TARDE") { setConsolidado([]); return; }` en todos los fetch.

---

### Tab RESUMEN — Vista Árbol

**Jerarquía:** `Médico → Subactividad → Servicio`

- **Médico:** avatar con iniciales coloreado, DNI. Badge cyan con total de pacientes (aparece tras lazy load)
- **Subactividad:** ícono de pulso (`Activity`), texto
- **Servicio:** ícono de documento (`FileText`), clic abre **Drawer**

**Lazy loading:** Al expandir un médico se llama `GET /detalle/{dniMedico}` una sola vez, los datos se cachean en el estado del nodo `MedicoNode`.

---

### Drawer de Pacientes (ServicioRow → DrawerListaPacientes)

Al hacer clic en un **Servicio**, se abre un panel deslizante por la derecha con:

**Header:**
- Nombre del servicio (grande)
- Subactividad y nombre del médico
- Badges: total pacientes (azul) + total abandonos (rojo)

**Buscador en tiempo real:**
- Filtra por nombre o DNI del paciente
- Input con ícono de lupa

**Tabla de pacientes:**

| Columna | Campo |
|---------|-------|
| Paciente / DNI | `paciente` + `docPaciente` |
| Fecha | `fechaCita` (dd/MM/yyyy) |
| Hora | `horaCita` (HH:mm, "—" si null) |
| Estado | badge `abandono` (rojo) |

**Cierre:** botón X en esquina superior derecha o clic en overlay.

---

### Tab NOMINAL — Tabla Paginada

Listado nominal de pacientes con:

- **Filtros:** Subactividad, Profesional (debounced), Servicio, Búsqueda (DNI/nombre), Fecha
- **Columnas:** DNI Médico, Profesional, Fecha, Subactividad, Servicio, DNI Paciente, Paciente, Abandono
- **Paginación:** tamaño 20, navegación anterior/siguiente con total de páginas
- **Búsqueda:** Enter o botón "Buscar" para confirmar

---

### Componente CalendarFilter

Calendario desplegable tipo datepicker con badges de conteo por día.

**Comportamiento:**
- Datos cargados en el padre (`useEffect([turno]) → obtenerCalendario(turno)`) y pasados como prop `conteos`
- Días CON pacientes: fondo azul oscuro (`#1e3a8a`) + badge debajo (número o "9+" si > 9)
- Días SIN pacientes: texto gris, no clickeables
- Clic en día: filtra árbol/tabla por esa fecha y cierra el calendario
- X en el botón: limpia la selección (es `<span>`, no `<button>`, para evitar anidamiento HTML inválido)
- "Limpiar selección" en footer del dropdown
- Navegación por mes: `<` `>` con nombre del mes en español
- Al cargar conteos: navega automáticamente al mes con más datos

**Props:**

| Prop | Tipo | Descripción |
|------|------|-------------|
| `conteos` | `{[fecha: string]: number}` | Mapa fecha→cantidad de pacientes |
| `fechaSel` | `string \| null` | Fecha seleccionada (`"YYYY-MM-DD"`) |
| `onSelect` | `(fecha: string \| null) => void` | Callback al seleccionar/limpiar |

**Visible en:** RESUMEN y NOMINAL (mismo estado `fechaFiltro` compartido).

---

### Filtros Barra Superior

```
[Subactividad ▼] [Profesional 🔍___________] [Servicio ▼] [📅 Fecha de Cita ▼] [🔄] [✖]
                                              [🔍 Buscar Paciente] (solo NOMINAL) [Buscar]
```

| Filtro | Tab | Comportamiento |
|--------|-----|----------------|
| Subactividad | Ambos | Select con opciones dinámicas desde KPIs |
| Profesional | Ambos | Input con debounce 400ms |
| Servicio | Ambos | Select con opciones dinámicas desde KPIs |
| Fecha de Cita | Ambos | CalendarFilter dropdown |
| Buscar Paciente | Solo NOMINAL | Búsqueda por DNI o nombre (Enter/botón) |
| Actualizar | Ambos | Recarga datos con filtros actuales |
| Limpiar | Ambos | Resetea todos los filtros + fechaFiltro |

---

### Exportar CSV

Botón en header de la página. Exporta los datos del tab activo:

- **RESUMEN:** `DNI Médico, Profesional, Fecha, Subactividad, Servicio, Abandonos`
- **NOMINAL:** `DNI Médico, Profesional, Fecha, Subactividad, Servicio, DNI Paciente, Paciente, Abandono`
- Formato: CSV con BOM UTF-8 (`\uFEFF`) para compatibilidad Excel

---

## 🐛 Bugs Corregidos

### 1. Turno Tarde mostraba datos de Mañana

**Causa:** Race condition en React — estado stale + backend devolvía datos (turno no filtraba correctamente).

**Fix:** Guards de early return en todos los fetch functions:
```js
if (turno === "TARDE") { setConsolidado([]); return; }
```

### 2. CalendarFilter no pintaba días (conteos vacío)

**Causa:** El `CalendarFilter` hacía su propio fetch interno, pero fallaba silenciosamente por contexto de autenticación diferente al padre.

**Fix:** Mover el fetch a `useEffect([turno])` en el componente padre y pasar `conteos` como prop.

### 3. Error 500 al filtrar consolidado por fecha

**Causa:** Hibernate 6 no maneja correctamente el binding de `LocalDate` nullable en queries nativas con `:param IS NULL`.

**Fix:** Patrón doble cast en SQL:
```sql
AND (CAST(:fechaDesde AS text) IS NULL OR c.fecha_cita >= CAST(CAST(:fechaDesde AS text) AS date))
```

### 4. HTML inválido: `<button>` dentro de `<button>`

**Causa:** El botón X para limpiar la fecha estaba dentro del botón trigger del CalendarFilter.

**Fix:** Cambiar el X a `<span onClick={...} className="cursor-pointer">`.

---

## 🗂️ Servicio Frontend

**Archivo:** `frontend/src/services/pendientesMensualesService.js`

```js
obtenerKpis(turno)                          // GET /kpis
obtenerConsolidado(params)                  // GET /consolidado (paginado + filtros)
obtenerDetalle(params)                      // GET /detalle (paginado + filtros)
obtenerDetallePorMedico(dniMedico, turno)   // GET /detalle/{dniMedico}
obtenerCalendario(turno)                    // GET /calendar
```

---

## 🚀 Próximos Pasos

- [ ] **Turno Tarde** — Crear tablas `consolidado_pendientes_tarde` y `detalle_pendientes_tarde`, replicar lógica
- [ ] **Exportar Excel** — Reemplazar CSV por XLSX con formato CENATE
- [ ] **Filtro por Médico específico** — Link desde KPI "106 médicos" para ver solo ese médico
- [ ] **Histórico** — Soporte para meses anteriores (actualmente solo el mes en curso)
- [ ] **Gráfico barras** — Distribución de pacientes por subactividad / servicio
