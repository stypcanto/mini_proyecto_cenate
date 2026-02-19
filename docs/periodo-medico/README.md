# Módulo CTR_PERIODO - Gestión de Períodos de Disponibilidad Médica

> **Versión:** v1.1.0  
> **Fecha:** 2026-02-19  
> **Ubicación Frontend:** `/roles/coordinador/periodo-disponibilidad-medica`

---

## 📋 Descripción

Este módulo gestiona los períodos de captura de disponibilidad médica. Permite a los coordinadores crear, editar, cerrar y eliminar períodos durante los cuales los médicos registran su disponibilidad horaria.

---

## 🔄 Historial de Cambios

| Versión | Fecha | Descripción |
|---------|-------|-------------|
| v1.1.0 | 2026-02-19 | Filtros avanzados (Estado, Área, Propietario), columnas actualizadas, fix fechas |
| v1.0.1 | 2026-02-19 | Fix: Compatibilidad Hibernate 6+ con `@JoinColumns` |
| v1.0.0 | 2026-02-19 | Migración completa de `periodo_medico_disponibilidad` a `ctr_periodo` con PK compuesta |

---

## 🏗️ Arquitectura

### Clave Primaria Compuesta

La tabla `ctr_periodo` usa **clave primaria compuesta**:

```
┌─────────────────────────────────────────┐
│           CTR_PERIODO (PK)              │
├─────────────────────────────────────────┤
│  periodo   VARCHAR(6)   ← "202602"      │
│  id_area   BIGINT       ← FK dim_area   │
├─────────────────────────────────────────┤
│  fecha_inicio           DATE            │
│  fecha_fin              DATE            │
│  estado                 VARCHAR(20)     │
│  id_coordinador         BIGINT (FK)     │
│  id_usuario_ultima_accion BIGINT (FK)   │
│  fecha_creacion         TIMESTAMP       │
│  fecha_actualizacion    TIMESTAMP       │
└─────────────────────────────────────────┘
```

### Estados del Período

| Estado | Descripción |
|--------|-------------|
| `ABIERTO` | Período activo, médicos pueden registrar disponibilidad |
| `EN_VALIDACION` | En proceso de revisión |
| `CERRADO` | Período finalizado, no se permiten cambios |
| `REABIERTO` | Período cerrado que fue reabierto para modificaciones |

---

## 🔍 Filtros Disponibles (v1.1.0)

La interfaz de gestión de períodos incluye los siguientes filtros:

| Filtro | Opciones | Descripción |
|--------|----------|-------------|
| **Estado** | Todos, Abierto, En Validación, Cerrado, Reabierto | Filtra por estado del período |
| **Área** | Todas, SGDT Medicina General (2), SGDT Tele Apoyo (3), SGDT Medicina Especializada (13) | Filtra por área/servicio |
| **Propietario** | Todos, Solo mis períodos | Muestra solo los períodos creados por el usuario actual |
| **Año** | Dinámico | Filtra por año del período |

### Columnas de la Tabla

| Columna | Descripción |
|---------|-------------|
| Periodo | Código del período (YYYYMM) |
| Área | Nombre del área con ID |
| Creado por | Nombre del coordinador que creó el período |
| Fecha Inicio | Fecha de inicio del período |
| Fecha Fin | Fecha de fin del período |
| Fecha Registro | Fecha/hora de creación (`createdAt`) |
| Fecha Actualización | Fecha/hora de última modificación (`updatedAt`) |
| Estado | Badge con el estado actual |
| Acciones | Ver, Editar, Eliminar, Abrir/Cerrar |

---

## 📁 Estructura de Archivos

```
Backend (Spring Boot):
├─ model/
│  ├─ CtrPeriodoId.java          ← Clave compuesta (@Embeddable)
│  └─ CtrPeriodo.java            ← Entidad JPA
├─ repository/
│  └─ CtrPeriodoRepository.java  ← Queries con clave compuesta
├─ dto/
│  ├─ CtrPeriodoRequest.java     ← DTO entrada
│  └─ CtrPeriodoResponse.java    ← DTO salida
├─ mapper/
│  └─ CtrPeriodoMapper.java      ← Entity ↔ DTO
├─ service/
│  ├─ CtrPeriodoService.java     ← Interface
│  └─ CtrPeriodoServiceImpl.java ← Implementación
└─ controller/
   └─ CtrPeriodoController.java  ← REST API

Frontend (React):
├─ services/
│  └─ periodoMedicoDisponibilidadService.js
└─ pages/roles/coordinador/gestion-periodos-disponibilidad/
   └─ GestionPeriodosDisponibilidad.jsx
```

---

## 🔗 API Endpoints

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| GET | `/api/ctr-periodos` | Listar todos los períodos |
| GET | `/api/ctr-periodos/{periodo}/area/{idArea}` | Obtener período por clave compuesta |
| POST | `/api/ctr-periodos` | Crear nuevo período |
| PUT | `/api/ctr-periodos/{periodo}/area/{idArea}` | Actualizar período |
| PATCH | `/api/ctr-periodos/{periodo}/area/{idArea}/estado` | Cambiar estado |
| DELETE | `/api/ctr-periodos/{periodo}/area/{idArea}` | Eliminar período |

---

## 📚 Documentación Relacionada

- [CHANGELOG.md](./CHANGELOG.md) - Historial detallado de cambios
- [MIGRACION.md](./MIGRACION.md) - Guía de migración técnica

