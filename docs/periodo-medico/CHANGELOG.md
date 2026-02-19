# CHANGELOG - Módulo CTR_PERIODO

> Historial de versiones y cambios del módulo de gestión de períodos de disponibilidad médica.

---

## [v1.1.0] - 2026-02-19

### ✨ Nuevas Características

#### Frontend - Filtros Avanzados

1. **Filtro de Estado Actualizado**
   - Opciones: Todos, Abierto, En Validación, Cerrado, Reabierto
   - Valores correctos según tabla `ctr_periodo`

2. **Filtro de Área** (Nuevo)
   - Opciones dinámicas por ID de área:
     - `2` - SGDT - SERVICIO DE MEDICINA GENERAL - TELEURGENCIAS Y TELETRIAJE
     - `3` - SGDT - SERVICIO DE TELE APOYO AL DIAGNÓSTICO
     - `13` - SGDT - SERVICIO DE MEDICINA ESPECIALIZADA
   - Filtrado en frontend (no impacta BD)

3. **Filtro de Propietario** (Nuevo)
   - Opciones: Todos, Solo mis períodos
   - Compara `idCoordinador` con `user.id` del contexto de autenticación
   - Permite ver solo los períodos creados por el usuario actual

4. **Filtro de Año** (Existente)
   - Mantiene funcionalidad previa

#### Frontend - Tabla de Períodos

5. **Columnas Actualizadas**
   - Periodo, Área (con ID), Creado por, Fecha Inicio, Fecha Fin
   - Fecha Registro (`createdAt`), Fecha Actualización (`updatedAt`)
   - Estado, Acciones

6. **Columnas Eliminadas**
   - Total Disponibilidades, Enviadas, Revisadas (KPIs de disponibilidades)

7. **Formato de Fechas Corregido**
   - Fix de zona horaria para fechas `YYYY-MM-DD`
   - `fmtDate()` ahora parsea strings ISO sin conversión UTC

### 🐛 Fixes

8. **Campos `createdAt`/`updatedAt` no visibles**
   - **Problema:** El mapeo en `GestionPeriodosDisponibilidad.jsx` no incluía estos campos
   - **Solución:** Agregar `createdAt: p.createdAt, updatedAt: p.updatedAt` al mapeo

9. **Nombre Coordinador mostraba DNI**
   - **Problema:** Mapper usaba `getNameUser()` (DNI) en lugar del nombre completo
   - **Solución:** Usar `getNombreCompleto()` que obtiene nombre desde `PersonalCnt`

10. **Fechas mostrando día anterior**
    - **Problema:** `new Date("2026-07-01")` interpreta como UTC y resta 5h (zona Perú)
    - **Solución:** Parsear directamente el string sin conversión de zona horaria

#### Backend

11. **JOIN FETCH para relaciones**
    - Nuevo método `findAllWithRelations()` en `CtrPeriodoRepository`
    - Carga eagerly: `area`, `coordinador`, `coordinador.personalCnt`
    - Evita `LazyInitializationException` al acceder a `getNombreCompleto()`

---

### 📦 Archivos Modificados

| Archivo | Cambios |
|---------|---------|
| `TabPeriodos.jsx` | Nuevas columnas, filtros Estado/Área/Propietario actualizados |
| `GestionPeriodosDisponibilidad.jsx` | Mapeo de `createdAt`/`updatedAt`, filtro propietario, `useAuth()` |
| `utils/ui.js` | Fix `fmtDate()` para fechas ISO sin conversión TZ |
| `CtrPeriodoRepository.java` | Nuevo `findAllWithRelations()` con JOIN FETCH |
| `CtrPeriodoServiceImpl.java` | Usa `findAllWithRelations()` para listar |

---

## [v1.0.1] - 2026-02-19

### 🐛 Fixes

**Error:** `Referenced column 'periodo' mapped by target property 'id' occurs out of order in the list of '@JoinColumn's`

#### 1. Fix en CtrPeriodo.java
- **Problema:** `@MapsId("idArea")` causa conflictos con Hibernate 6+ en claves compuestas embebidas
- **Solución:** Cambiar a `@JoinColumn(insertable = false, updatable = false)`

```java
// Antes (error)
@MapsId("idArea")
@JoinColumn(name = "id_area", nullable = false)
private Area area;

// Después (correcto)
@JoinColumn(name = "id_area", insertable = false, updatable = false)
private Area area;
```

#### 2. Fix en CtrHorario.java
- **Problema:** Relación con `CtrPeriodo` usaba solo `periodo` cuando la PK es compuesta `(periodo, id_area)`
- **Solución:** Usar `@JoinColumns` con ambas columnas

```java
// Antes (error)
@JoinColumn(name = "periodo", referencedColumnName = "periodo", insertable = false, updatable = false)
private CtrPeriodo periodoObj;

// Después (correcto)
@JoinColumns({
    @JoinColumn(name = "periodo", referencedColumnName = "periodo", insertable = false, updatable = false),
    @JoinColumn(name = "id_area", referencedColumnName = "id_area", insertable = false, updatable = false)
})
private CtrPeriodo periodoObj;
```

---

## [v1.0.0] - 2026-02-19

### 🚀 Migración Completa: `periodo_medico_disponibilidad` → `ctr_periodo`

**Tipo de cambio:** Breaking Change - Reestructuración completa

---

### ✨ Nuevas Características

#### Backend

1. **Clave Primaria Compuesta** (v1.0.0)
   - Archivo: `CtrPeriodoId.java`
   - Campos: `periodo` (VARCHAR 6) + `idArea` (BIGINT)
   - Anotación: `@Embeddable`

2. **Nueva Entidad JPA** (v1.0.0)
   - Archivo: `CtrPeriodo.java`
   - Usa: `@EmbeddedId` con `CtrPeriodoId`
   - Relaciones: `dim_area`, `dim_usuarios` (coordinador, última acción)

3. **Repository con Queries Compuestas** (v1.0.0)
   - Archivo: `CtrPeriodoRepository.java`
   - Métodos: `findByAreaOrderByPeriodoDesc()`, `existsByPeriodoAndArea()`, `findVigentes()`

4. **DTOs Optimizados** (v1.0.0)
   - `CtrPeriodoRequest.java`: periodo, idArea, fechaInicio, fechaFin, estado
   - `CtrPeriodoResponse.java`: incluye nombreArea, nombreCoordinador, anio, mes

5. **Mapper Entity ↔ DTO** (v1.0.0)
   - Archivo: `CtrPeriodoMapper.java`
   - Métodos: `toResponse()`, `toEntity()`, `updateEntity()`

6. **Service Layer** (v1.0.0)
   - Interface: `CtrPeriodoService.java`
   - Implementación: `CtrPeriodoServiceImpl.java`
   - Lógica: transiciones de estado, validación de fechas

7. **REST Controller** (v1.0.0)
   - Archivo: `CtrPeriodoController.java`
   - Base URL: `/api/ctr-periodos`
   - Pattern: `/{periodo}/area/{idArea}` para operaciones con clave compuesta

#### Frontend

8. **Service Actualizado** (v1.0.0)
   - Archivo: `periodoMedicoDisponibilidadService.js`
   - Cambio URL: `/periodos-medicos-disponibilidad` → `/ctr-periodos`
   - Todos los métodos usan clave compuesta `(periodo, idArea)`
   - Añadido `auth=true` en todas las llamadas (fix 404)

9. **Componente React Actualizado** (v1.0.0)
   - Archivo: `GestionPeriodosDisponibilidad.jsx`
   - Handlers actualizados para clave compuesta
   - Estados cambiados: ACTIVO/BORRADOR → ABIERTO/EN_VALIDACION/CERRADO/REABIERTO

---

### 🔄 Cambios de Estados

| Anterior | Nuevo | Descripción |
|----------|-------|-------------|
| `BORRADOR` | `ABIERTO` | Período activo para captura |
| `ACTIVO` | `ABIERTO` | Consolidado en un solo estado |
| `CERRADO` | `CERRADO` | Sin cambios |
| `ANULADO` | `REABIERTO` | Período reabierto para modificaciones |
| - | `EN_VALIDACION` | Nuevo estado intermedio |

---

### 📦 Archivos Creados

| Archivo | Ruta | Descripción |
|---------|------|-------------|
| `CtrPeriodoId.java` | `backend/src/main/java/com/styp/cenate/model/` | Clave compuesta embebida |
| `CtrPeriodo.java` | `backend/src/main/java/com/styp/cenate/model/` | Entidad JPA (modificado) |
| `CtrPeriodoRepository.java` | `backend/src/main/java/com/styp/cenate/repository/` | Repository JPA |
| `CtrPeriodoRequest.java` | `backend/src/main/java/com/styp/cenate/dto/` | DTO de entrada |
| `CtrPeriodoResponse.java` | `backend/src/main/java/com/styp/cenate/dto/` | DTO de salida |
| `CtrPeriodoMapper.java` | `backend/src/main/java/com/styp/cenate/mapper/` | Mapper Entity↔DTO |
| `CtrPeriodoService.java` | `backend/src/main/java/com/styp/cenate/service/` | Interface de servicio |
| `CtrPeriodoServiceImpl.java` | `backend/src/main/java/com/styp/cenate/service/impl/` | Implementación |
| `CtrPeriodoController.java` | `backend/src/main/java/com/styp/cenate/controller/` | REST Controller |

---

### 📦 Archivos Modificados

| Archivo | Ruta | Cambios |
|---------|------|---------|
| `periodoMedicoDisponibilidadService.js` | `frontend/src/services/` | URL base, métodos con clave compuesta, auth=true |
| `GestionPeriodosDisponibilidad.jsx` | `frontend/src/pages/.../` | Handlers, estados, KPIs |

---

### ⚠️ Breaking Changes

1. **API Endpoints cambiaron**:
   - Antes: `/api/periodos-medicos-disponibilidad/{id}`
   - Ahora: `/api/ctr-periodos/{periodo}/area/{idArea}`

2. **Request Body cambió**:
   - Antes: `{ anio, periodo, descripcion, ... }`
   - Ahora: `{ periodo, idArea, fechaInicio, fechaFin, estado }`

3. **Response Structure cambió**:
   - Nuevos campos: `idArea`, `nombreArea`, `nombreCoordinador`, `anio`, `mes`
   - Eliminados: `idPeriodoRegDisp`, `descripcion`

---

### 🔧 Configuración Requerida

La tabla `ctr_periodo` debe existir en la base de datos con la siguiente estructura:

```sql
CREATE TABLE ctr_periodo (
    periodo VARCHAR(6) NOT NULL,
    id_area BIGINT NOT NULL,
    fecha_inicio DATE,
    fecha_fin DATE,
    estado VARCHAR(20) DEFAULT 'ABIERTO',
    id_coordinador BIGINT,
    id_usuario_ultima_accion BIGINT,
    fecha_creacion TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP,
    PRIMARY KEY (periodo, id_area),
    FOREIGN KEY (id_area) REFERENCES dim_area(id_area),
    FOREIGN KEY (id_coordinador) REFERENCES dim_usuarios(id_usuario),
    FOREIGN KEY (id_usuario_ultima_accion) REFERENCES dim_usuarios(id_usuario)
);
```

---

## Versiones Futuras

### [v1.2.0] - Planificado
- [ ] Filtro de Área dinámico desde BD (en lugar de hardcodeado)
- [ ] Filtros a nivel de BD para mejor rendimiento
- [ ] Integración con notificaciones
- [ ] Dashboard de estadísticas por área
- [ ] Exportación a Excel

### [v1.3.0] - Planificado
- [ ] Historial de cambios de estado
- [ ] Auditoría de acciones
- [ ] Permisos granulares por área

