# 📋 Módulo de Requerimiento de Especialidades (v1.58.0)

> **Sistema de Telemedicina CENATE - EsSalud Perú**
> **Fecha de Creación:** 2026-02-08
> **Versión Módulo:** 1.0.0
> **Status:** ✅ Production Ready

---

## 🎯 Descripción General

El **Módulo de Requerimiento de Especialidades** es un sistema completo para gestionar solicitudes de especialidades médicas de las IPRESS (Instituciones Prestadoras de Servicios de Salud) al sistema CENATE.

El módulo permite:
- **Coordinadores:** Crear, enviar, revisar y aprobar solicitudes de especialidades
- **Gestión Territorial:** Visualizar respuestas de solicitudes en modo lectura
- **Administradores:** Gestionar períodos de solicitud y configurar acceso

---

## 🏗️ Arquitectura

### Componentes Principales

```
┌─────────────────────────────────────────────────────────────┐
│                   MÓDULO REQUERIMIENTOS ESPECIALIDADES       │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────────┐  ┌──────────────────┐                 │
│  │  Coordinador     │  │  Gestión         │                 │
│  │  Gestion-        │  │  Territorial     │                 │
│  │  Periodos        │  │  Respuestas      │                 │
│  │                  │  │  Solicitudes     │                 │
│  │ - Crear          │  │                  │                 │
│  │ - Editar         │  │ - Ver detalles   │                 │
│  │ - Enviar         │  │ - Filtrar        │                 │
│  │ - Aprobar        │  │ (Read-only)      │                 │
│  │ - Rechazar       │  │                  │                 │
│  └──────────────────┘  └──────────────────┘                 │
│           │                     │                            │
│           └─────────┬───────────┘                            │
│                     │                                        │
│              ┌──────▼──────────┐                             │
│              │  API REST       │                             │
│              │  /api/          │                             │
│              │  solicitudes-   │                             │
│              │  turno/*        │                             │
│              └──────┬──────────┘                             │
│                     │                                        │
│         ┌───────────┴───────────┐                            │
│         ▼                       ▼                            │
│   ┌──────────────┐      ┌──────────────────┐                │
│   │  Base de     │      │  Servicios       │                │
│   │  Datos       │      │  Backend         │                │
│   │  PostgreSQL  │      │  Spring Boot     │                │
│   └──────────────┘      └──────────────────┘                │
│                                                               │
└─────────────────────────────────────────────────────────────┘
```

---

## 📊 Estructura de Base de Datos

### Tablas Principales

#### 1. `solicitud_turno_ipress`
Almacena las solicitudes principales de especialidades.

```sql
CREATE TABLE solicitud_turno_ipress (
    id_solicitud INT PRIMARY KEY,
    id_periodo INT,              -- FK: periodo_solicitud_turno
    id_pers INT,                 -- FK: dim_personal_cnt
    estado VARCHAR(20),          -- BORRADOR, ENVIADO, INICIADO
    fecha_envio TIMESTAMP,
    created_at TIMESTAMP,
    updated_at TIMESTAMP,
    motivo_rechazo TEXT,
    total_turnos_solicitados INT,
    total_especialidades INT
);
```

**Campos:**
- `id_solicitud`: Identificador único
- `id_periodo`: Período al que pertenece la solicitud
- `id_pers`: Personal/IPRESS que realiza la solicitud
- `estado`: Estado actual (BORRADOR, ENVIADO, INICIADO)
- `fecha_envio`: Cuándo se envió la solicitud
- `total_turnos_solicitados`: Sumatoria de turnos
- `total_especialidades`: Cantidad de especialidades

#### 2. `detalle_solicitud_turno`
Almacena los detalles de especialidades por solicitud.

```sql
CREATE TABLE detalle_solicitud_turno (
    id_detalle INT PRIMARY KEY,
    id_solicitud INT,            -- FK: solicitud_turno_ipress
    nombreEspecialidad VARCHAR,
    codigoServicio VARCHAR,
    turnoManana INT,
    turnoTarde INT,
    teleconsulta INT,
    teleConsultorio INT,
    estado VARCHAR(20),
    observacion TEXT
);
```

**Campos:**
- `id_detalle`: ID único del detalle
- `id_solicitud`: Solicitud padre
- `nombreEspecialidad`: Nombre de la especialidad (Cardiología, etc.)
- `turnoManana`: Turnos solicitados mañana
- `turnoTarde`: Turnos solicitados tarde
- `teleconsulta`: ¿Requiere teleconsulta?
- `teleConsultorio`: ¿Requiere teleconsultorio?
- `estado`: Estado del detalle (PENDIENTE, ASIGNADO, RECHAZADO)
- `observacion`: Notas sobre el detalle

#### 3. `periodo_solicitud_turno`
Almacena los períodos de solicitud.

```sql
CREATE TABLE periodo_solicitud_turno (
    id_periodo INT PRIMARY KEY,
    periodo VARCHAR(6),          -- YYYYMM
    descripcion VARCHAR,         -- "Enero 2026"
    fecha_inicio DATE,
    fecha_fin DATE,
    activo BOOLEAN
);
```

#### 4. `dim_personal_cnt`
Datos de personal de IPRESS (referencia).

```sql
-- Campos relevantes:
id_ipress INT,                   -- IPRESS a la que pertenece
id_red INT,                      -- Red de salud
-- ... otros campos
```

---

## 🔌 API REST Endpoints

### Base URL
```
/api/solicitudes-turno
```

### Endpoints Principales

#### 1. Obtener Todas las Solicitudes
```http
GET /api/solicitudes-turno/consultar
```

**Parámetros:**
```json
{
  "estado": "TODAS",            // TODAS, BORRADOR, ENVIADO, INICIADO
  "idPeriodo": null,            // ID del período
  "macroId": null,              // ID macrorregión
  "redId": null,                // ID de la red
  "ipressId": null,             // ID de la IPRESS
  "busqueda": ""                // Búsqueda libre
}
```

**Respuesta:**
```json
{
  "content": [
    {
      "idSolicitud": 1,
      "estado": "ENVIADO",
      "nombreIpress": "H.II PUCALLPA",
      "idPeriodo": 202606,
      "descripcion": "Junio 2026",
      "fechaEnvio": "2026-02-06T09:41:00Z",
      // ... más campos
    }
  ]
}
```

#### 2. Obtener Solicitud por ID
```http
GET /api/solicitudes-turno/{idSolicitud}
```

**Respuesta:** Solicitud completa con detalles

#### 3. Crear Solicitud
```http
POST /api/solicitudes-turno
```

**Cuerpo:**
```json
{
  "idPeriodo": 202606,
  "detalles": [
    {
      "nombreEspecialidad": "Cardiología",
      "turnoManana": 2,
      "turnoTarde": 1,
      "teleconsulta": true,
      "teleConsultorio": true
    }
  ]
}
```

#### 4. Enviar Solicitud
```http
POST /api/solicitudes-turno/{idSolicitud}/enviar
```

#### 5. Aprobar Solicitud
```http
POST /api/solicitudes-turno/{idSolicitud}/aprobar
```

#### 6. Rechazar Solicitud
```http
POST /api/solicitudes-turno/{idSolicitud}/rechazar
Content-Type: application/json

{
  "motivo": "Excede capacidad disponible"
}
```

---

## 💻 Componentes Frontend

### Estructura de Carpetas
```
frontend/src/pages/roles/
├── coordinador/
│   └── gestion-periodos/
│       ├── GestionPeriodosTurnos.jsx          # Página principal
│       ├── components/
│       │   ├── TabSolicitudes.jsx             # Tabla de solicitudes
│       │   ├── ModalDetalleSolicitud.jsx      # Modal detalle
│       │   ├── ModalAperturarPeriodo.jsx      # Modal crear período
│       │   └── ModalDetalleSolicitud.module.css
│       └── utils/
│           ├── ui.js                          # Utilidades UI
│           └── exportarExcel.js               # Exportación
└── gestionterritorial/
    └── RespuestasSolicitudes.jsx              # Vista read-only
```

### Componentes Principales

#### 1. GestionPeriodosTurnos (Página Principal)
- **Propósito:** Gestión completa de períodos y solicitudes
- **Rol:** Coordinador
- **Funcionalidades:**
  - Crear períodos
  - Listar solicitudes
  - Ver detalles
  - Aprobar/Rechazar
  - Exportar a Excel
  - Filtrar por múltiples criterios

#### 2. TabSolicitudes (Tabla de Solicitudes)
- **Propósito:** Mostrar tabla de solicitudes con filtros
- **Props:**
  - `solicitudes`: Array de solicitudes
  - `filtros`: Estado, período, macrorregión, red, IPRESS
  - `setFiltros`: Actualizar filtros
  - `onVerDetalle`: Callback para ver detalle
  - `readOnly`: Modo lectura (desabilita acciones)
  - `getEstadoBadge`: Función para estilo de estado

#### 3. ModalDetalleSolicitud (Modal de Detalle)
- **Propósito:** Mostrar detalles completos de solicitud
- **Props:**
  - `solicitud`: Datos de la solicitud
  - `readOnly`: Modo lectura (oculta botones de acción)
  - `onAprobar`: Callback de aprobación
  - `onRechazar`: Callback de rechazo

#### 4. RespuestasSolicitudes (Vista Gestión Territorial)
- **Propósito:** Vista read-only para Gestión Territorial
- **Rol:** Personal de Gestión Territorial
- **Funcionalidades:**
  - Ver solicitudes (sin editar)
  - Ver detalles (sin aprobar/rechazar)
  - Filtrar respuestas
  - Acceso MBAC controlado

---

## 🔐 Control de Acceso (MBAC)

### Rutas Registradas
```javascript
'/roles/coordinador/gestion-periodos': {
  component: GestionPeriodosTurnos,
  requiredAction: 'ver',
  requiredRoles: ['COORDINADOR']
}

'/roles/gestionterritorial/respuestas-solicitudes': {
  component: RespuestasSolicitudes,
  requiredAction: 'ver',
  requiredRoles: ['GESTIÓN_TERRITORIAL'] // Controlado por MBAC
}
```

### Base de Datos MBAC
- **Tabla:** `dim_paginas_modulo`
- **Entrada para Coordinador:**
  - `id_pagina: 1`
  - `ruta: /roles/coordinador/gestion-periodos`
  - `nombre: Control de Requerimiento de Especialidades`

- **Entrada para Gestión Territorial:**
  - `id_pagina: 131`
  - `ruta: /roles/gestionterritorial/respuestas-solicitudes`
  - `nombre: Respuestas de los Requerimientos de las IPRESS`

---

## 📈 Flujo de Solicitud

```
┌─────────────────────────────────────────────────────────────┐
│                    CICLO DE VIDA DE SOLICITUD               │
├─────────────────────────────────────────────────────────────┤
│                                                               │
│  ┌──────────────┐                                            │
│  │   BORRADOR   │ ← Coordinador crea solicitud              │
│  └──────┬───────┘                                            │
│         │ Editar detalles                                    │
│         ▼                                                    │
│  ┌──────────────┐                                            │
│  │   ENVIADO    │ ← Coordinador envía solicitud             │
│  └──────┬───────┘                                            │
│         │ Sistema procesa                                    │
│         ▼                                                    │
│  ┌──────────────┐                                            │
│  │  INICIADO    │ ← En revisión por coordinador             │
│  └──────┬───────┘                                            │
│         │                                                    │
│    ┌────┴─────┐                                              │
│    │           │                                             │
│    ▼           ▼                                             │
│ ┌────────┐  ┌──────────┐                                     │
│ │APROBADO│  │ RECHAZADO│ ← Coordinador toma decisión       │
│ └────────┘  └──────────┘                                     │
│    │                                                         │
│    └────────┬─────────────────────────────────────┬──────┐  │
│             │                                      │      │  │
│             ▼                                      ▼      ▼  │
│   Disponible en                          Disponible en    Visible en
│   Gestión Citas                          Respuestas       Gestión
│                                                            Territorial
│                                                              │
└──────────────────────────────────────────────────────────────┘
```

---

## 📊 Filtros Disponibles

### TabSolicitudes (Frontend)
Los filtros se cargan dinámicamente de los datos presentes en la tabla:

1. **Estado**: BORRADOR, ENVIADO, INICIADO (único, oculta completados)
2. **Período**: Extrae períodos únicos de las solicitudes
3. **Macrorregión**: Basado en datos de IPRESS (CASCADE por Estado+Período)
4. **Red**: Basado en datos de IPRESS (CASCADE por Estado+Período+Macrorregión)
5. **IPRESS**: Basado en datos (CASCADE por Estado+Período+Macrorregión+Red)

---

## 🗄️ Scripts de Base de Datos

### Limpieza de Datos de Prueba
Se incluyen scripts para eliminar datos de prueba generados durante desarrollo:

```bash
# Script 1: Eliminar datos de SEDE CENTRAL
2026-02-08_limpiar_datos_prueba_gestion_periodos.sql
- Eliminó: 3 solicitudes, 10 detalles

# Script 2: Eliminar datos de CENTRO NACIONAL DE TELEMEDICINA
2026-02-08_limpiar_datos_prueba_centro_nacional.sql
- Eliminó: 5 solicitudes, 49 detalles

# Estado final: 3 solicitudes reales en el sistema
```

---

## 🎨 Estilos y UI

### Tema de Colores
- **Primario:** #0A5BA9 (Azul corporativo)
- **Secundario:** #2563EB (Azul claro)
- **Éxito:** Emerald (Verde)
- **Advertencia:** Amber (Naranja)
- **Error:** Red (Rojo)

### Estados Badge
- **BORRADOR:** Purple gradient
- **ENVIADO:** Blue gradient (#0A5BA9)
- **INICIADO:** Amber gradient
- **ASIGNADO:** Green gradient
- **RECHAZADO:** Red gradient

### Componentes Personalizados
- **Tooltip:** Para información adicional on-hover
- **Modal profesional:** Con animaciones y efectos
- **Tabla sticky:** Cabecera fija en scroll

---

## 🧪 Testing

### Datos de Prueba (Histórico)
Se utilizaron los siguientes datos para testing:
- **IPRESS:** SEDE CENTRAL, CENTRO NACIONAL DE TELEMEDICINA
- **RED:** AFESSALUD
- **MACRORREGIÓN:** CENTRO
- **PERÍODOS:** Enero - Agosto 2026

**Nota:** Estos datos fueron eliminados antes de producción.

---

## 📝 Changelog (v1.58.0)

### Nuevas Funcionalidades
- ✅ Modal "Ver Detalle" con información completa
- ✅ Vista read-only para Gestión Territorial
- ✅ Filtros dinámicos en cascada
- ✅ Columnas Macrorregión y Red con datos de BD
- ✅ Exportación a Excel mejorada
- ✅ Registro MBAC para nuevas rutas

### Mejoras
- ✅ Botón cerrar (X) con diseño profesional
- ✅ Tooltips informativos
- ✅ Mejora en visual hierarchy
- ✅ Acceso controlado por MBAC

### Fixes
- ✅ Campo ID correcto en obtenerPorId()
- ✅ Deshabilitación de botones en modo read-only
- ✅ Limpieza de datos de prueba

---

## 🔗 Referencias

- **Módulo Principal:** `/roles/coordinador/gestion-periodos`
- **Vista Gestión Territorial:** `/roles/gestionterritorial/respuestas-solicitudes`
- **API Base:** `/api/solicitudes-turno`
- **Servicio Frontend:** `solicitudTurnosService`

---

## 📞 Autor

**Versión:** v1.58.0
**Fecha:** 2026-02-08
**Desarrollado por:** Ing. Styp Canto Rondón
