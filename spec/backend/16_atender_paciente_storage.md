# 📦 Atender Paciente - Schema de Almacenamiento v1.47.0+

> **Arquitectura de Datos para el Flujo Médico de Atención de Pacientes**
> **Última Actualización:** 2026-02-06
> **Versión:** v1.0.0

---

## 🎯 Descripción General

Cuando un médico **marca un paciente como "Atendido"** en la interfaz `MisPacientes.jsx`, se disparan hasta **4 operaciones simultáneas** en la base de datos que involucran **múltiples tablas relacionadas**.

Este documento mapea **EXACTAMENTE dónde se guardan los datos** de cada acción médica.

---

## 📊 Tablas Involucradas

```
┌─────────────────────────────────────────────────────────────┐
│                    FLUJO ATENDER PACIENTE                    │
│                                                               │
│  Médico marca: Atendido → Recita/Interconsulta/Crónico       │
│                    ↓                                          │
│  Backend: AtenderPacienteService.java                        │
│                    ↓                                          │
│  4 Operaciones simultáneas en BD                             │
└─────────────────────────────────────────────────────────────┘

    ┌─────────────────────────────────────────────────────┐
    │  1️⃣ OPERACIÓN: Marcar ATENDIDO                      │
    ├─────────────────────────────────────────────────────┤
    │  Tablas: dim_solicitud_bolsa + solicitud_cita       │
    │  Trigger: SincronizacionBolsaService (v1.44.0+)     │
    └─────────────────────────────────────────────────────┘
           ↓                        ↓
    dim_solicitud_bolsa      solicitud_cita
    ├── estado                ├── estado_cita
    ├── fecha_atendido        ├── fecha_atendido
    └── id_solicitud_bolsa    └── id_solicitud_cita


    ┌─────────────────────────────────────────────────────┐
    │  2️⃣ OPERACIÓN: Crear RECITA (opcional)              │
    ├─────────────────────────────────────────────────────┤
    │  Tabla: receta                                      │
    │  Condición: if (tieneRecita == true)                │
    └─────────────────────────────────────────────────────┘
           ↓
    receta
    ├── id_solicitud_cita (FK)
    ├── dni_paciente
    ├── descripcion
    ├── dias_seguimiento
    └── fecha_creacion


    ┌─────────────────────────────────────────────────────┐
    │  3️⃣ OPERACIÓN: Crear INTERCONSULTA (opcional)       │
    ├─────────────────────────────────────────────────────┤
    │  Tabla: interconsulta                               │
    │  Condición: if (tieneInterconsulta == true)         │
    └─────────────────────────────────────────────────────┘
           ↓
    interconsulta
    ├── id_solicitud_cita (FK)
    ├── dni_paciente
    ├── especialidad_referida
    ├── descripcion
    └── fecha_creacion


    ┌─────────────────────────────────────────────────────┐
    │  4️⃣ OPERACIÓN: Registrar CRÓNICO (opcional)         │
    ├─────────────────────────────────────────────────────┤
    │  Tabla: asegurado_enfermedad_cronica                │
    │  Condición: if (esCronico == true)                  │
    └─────────────────────────────────────────────────────┘
           ↓
    asegurado_enfermedad_cronica
    ├── pk_asegurado (DNI)
    ├── tipo_enfermedad
    ├── descripcion_otra
    └── fecha_registro
```

---

## 🔍 Detalle de Cada Tabla

### 1️⃣ **Estado "Atendido"** → `dim_solicitud_bolsa` + `solicitud_cita`

#### Tabla: `dim_solicitud_bolsa` (Actualización)
```sql
UPDATE dim_solicitud_bolsa
SET
  estado = 'ATENDIDO',
  fecha_atendido = CURRENT_TIMESTAMP,
  id_personal = ? -- Médico que atendió
WHERE id_solicitud_bolsa = ?;
```

**Campos Relacionados:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_solicitud_bolsa` | BIGINT | Primary Key (Identificador único) |
| `estado` | VARCHAR | Estado de la solicitud (PENDIENTE, ATENDIDO, etc.) |
| `fecha_atendido` | TIMESTAMP | Fecha/hora en que se marcó ATENDIDO |
| `id_personal` | BIGINT | FK a tabla de personal (médico que atendió) |
| `dni_paciente` | VARCHAR | DNI del paciente |

---

#### Tabla: `solicitud_cita` (Actualización - Sincronización v1.44.0+)
```sql
UPDATE solicitud_cita
SET
  estado_cita = 'ATENDIDA',
  fecha_atendido = CURRENT_TIMESTAMP
WHERE id_solicitud_bolsa = ? AND id_paciente = ?;
```

**Campos Relacionados:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_solicitud_cita` | BIGINT | Primary Key |
| `estado_cita` | VARCHAR | Estado (PENDIENTE, CITADO, ATENDIDA, etc.) |
| `fecha_atendido` | TIMESTAMP | Fecha de atención |
| `id_solicitud_bolsa` | BIGINT | FK a dim_solicitud_bolsa |
| `id_paciente` | BIGINT | FK a gestion_paciente |

**Sincronización Automática:**
- Cuando el médico marca "Atendido" en dim_solicitud_bolsa, el `SincronizacionBolsaService` automáticamente actualiza solicitud_cita
- No requiere intervención manual del usuario
- Implementado en v1.44.0+

---

### 2️⃣ **"Crear Recita"** → `receta`

#### Tabla: `receta` (Insert)
```sql
INSERT INTO receta (
  id_solicitud_cita,
  dni_paciente,
  descripcion,
  dias_seguimiento,
  fecha_creacion,
  estado
)
VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'ACTIVA');
```

**Campos Relacionados:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_receta` | BIGINT | Primary Key (Auto-generated) |
| `id_solicitud_cita` | BIGINT | FK a solicitud_cita (vinculación con cita) |
| `dni_paciente` | VARCHAR | DNI del paciente |
| `descripcion` | TEXT | Descripción/detalles de la recita |
| `dias_seguimiento` | INTEGER | Días de seguimiento (de AtenderPacienteRequest.diasRecita) |
| `fecha_creacion` | TIMESTAMP | Fecha de creación |
| `estado` | VARCHAR | Estado (ACTIVA, COMPLETADA, etc.) |

**Condición de Creación:**
```java
if (request.isTieneRecita()) {
  recetaService.crearRecita(solicitudCita, request.getDiasRecita());
}
```

---

### 3️⃣ **"Crear Interconsulta"** → `interconsulta`

#### Tabla: `interconsulta` (Insert)
```sql
INSERT INTO interconsulta (
  id_solicitud_cita,
  dni_paciente,
  especialidad_referida,
  descripcion,
  fecha_creacion,
  estado
)
VALUES (?, ?, ?, ?, CURRENT_TIMESTAMP, 'PENDIENTE');
```

**Campos Relacionados:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_interconsulta` | BIGINT | Primary Key (Auto-generated) |
| `id_solicitud_cita` | BIGINT | FK a solicitud_cita |
| `dni_paciente` | VARCHAR | DNI del paciente |
| `especialidad_referida` | VARCHAR | Especialidad solicitada (de AtenderPacienteRequest.interconsultaEspecialidad) |
| `descripcion` | TEXT | Detalles de la interconsulta |
| `fecha_creacion` | TIMESTAMP | Fecha de creación |
| `estado` | VARCHAR | Estado (PENDIENTE, ATENDIDA, etc.) |

**Condición de Creación:**
```java
if (request.isTieneInterconsulta()) {
  interconsultaService.crearInterconsulta(
    solicitudCita,
    request.getInterconsultaEspecialidad()
  );
}
```

---

### 4️⃣ **"Registrar Crónico"** → `asegurado_enfermedad_cronica`

#### Tabla: `asegurado_enfermedad_cronica` (Insert)
```sql
INSERT INTO asegurado_enfermedad_cronica (
  pk_asegurado,
  tipo_enfermedad,
  descripcion_otra,
  fecha_registro,
  activo
)
VALUES (?, ?, ?, CURRENT_TIMESTAMP, true)
ON CONFLICT (pk_asegurado, tipo_enfermedad) DO NOTHING;
```

**Estructura Completa:**
```
┌─────────────────────────────────────────┐
│  asegurado_enfermedad_cronica           │
├─────────────────────────────────────────┤
│ id_asegurado_enfermedad  (PK)           │
│ pk_asegurado             (FK→asegurados)│ ← DNI del paciente
│ tipo_enfermedad          (VARCHAR 100)  │ ← "Hipertensión", "Diabetes"
│ descripcion_otra         (VARCHAR 500)  │ ← Detalles adicionales
│ fecha_registro           (TIMESTAMP)    │ ← CURRENT_TIMESTAMP
│ fecha_actualizacion      (TIMESTAMP)    │ ← CURRENT_TIMESTAMP
│ activo                   (BOOLEAN)      │ ← true/false
└─────────────────────────────────────────┘
```

**Campos Relacionados:**
| Campo | Tipo | Descripción |
|-------|------|-------------|
| `id_asegurado_enfermedad` | INT | Primary Key (Auto-generated) |
| `pk_asegurado` | VARCHAR(20) | DNI del paciente (FK a asegurados) |
| `tipo_enfermedad` | VARCHAR(100) | Nombre enfermedad (de AtenderPacienteRequest.enfermedades) |
| `descripcion_otra` | VARCHAR(500) | Descripción adicional |
| `fecha_registro` | TIMESTAMP | Fecha de registro |
| `fecha_actualizacion` | TIMESTAMP | Fecha de última actualización |
| `activo` | BOOLEAN | true=activo, false=inactivo |

**Constraint UNIQUE:**
```sql
UNIQUE CONSTRAINT unique_asegurado_enfermedad
ON (pk_asegurado, tipo_enfermedad)
```
*Previene duplicados: mismo paciente + misma enfermedad*

**Condición de Creación:**
```java
if (request.isEsCronico() && request.getEnfermedades() != null) {
  for (String enfermedad : request.getEnfermedades()) {
    cronicosService.registrarEnfermedad(dni, enfermedad);
  }
}
```

---

## 🔄 Flujo de Datos Completo

### Backend Flow (AtenderPacienteService.java)

```java
public void atenderPaciente(AtenderPacienteRequest request) {

  // 1. Marcar ATENDIDO (OBLIGATORIO)
  SolicitudCita solicitud = solicitudCitaRepository.findById(...);
  solicitud.setEstadoCita("ATENDIDA");
  solicitud.setFechaAtendido(LocalDateTime.now());
  solicitudCitaRepository.save(solicitud);

  // Sincronización automática a dim_solicitud_bolsa (v1.44.0+)
  sincronizacionBolsaService.sincronizarAtendido(solicitud);

  // 2. Crear RECITA (OPCIONAL)
  if (request.isTieneRecita()) {
    recetaService.crearRecita(
      solicitud,
      request.getDiasRecita()
    );
  }

  // 3. Crear INTERCONSULTA (OPCIONAL)
  if (request.isTieneInterconsulta()) {
    interconsultaService.crearInterconsulta(
      solicitud,
      request.getInterconsultaEspecialidad()
    );
  }

  // 4. Registrar CRÓNICO (OPCIONAL)
  if (request.isEsCronico() && request.getEnfermedades() != null) {
    for (String enfermedad : request.getEnfermedades()) {
      cronicosService.registrarEnfermedad(
        solicitud.getDniPaciente(),
        enfermedad
      );
    }
  }
}
```

---

## 📋 Request DTO - `AtenderPacienteRequest`

```java
@Data
public class AtenderPacienteRequest {

  // OBLIGATORIO
  private Long idSolicitudCita;

  // RECITA (Opcional)
  private boolean tieneRecita;
  private Integer diasRecita;           // Ej: 7, 14, 30 días

  // INTERCONSULTA (Opcional)
  private boolean tieneInterconsulta;
  private String interconsultaEspecialidad; // Ej: "Cardiología", "Neurología"

  // CRÓNICO (Opcional)
  private boolean esCronico;
  private List<String> enfermedades;   // Ej: ["Hipertensión", "Diabetes"]
}
```

---

## 🔐 Validación de Datos

### Validaciones Aplicadas (v1.47.0+)

```
┌─────────────────────────────────────────────────────────┐
│  Validaciones en AtenderPacienteValidator.java          │
├─────────────────────────────────────────────────────────┤
│  ✅ Al menos UNA acción debe ser verdadera:             │
│     - tieneRecita OR                                    │
│     - tieneInterconsulta OR                             │
│     - esCronico                                         │
│                                                         │
│  ✅ Si tieneInterconsulta == true:                      │
│     - interconsultaEspecialidad NO puede estar vacío    │
│                                                         │
│  ✅ Si esCronico == true:                               │
│     - enfermedades NO puede estar vacío                 │
│     - Mínimo 1 enfermedad                               │
│                                                         │
│  ✅ idSolicitudCita es OBLIGATORIO                      │
└─────────────────────────────────────────────────────────┘
```

---

## 🗂️ Relaciones entre Tablas

```sql
                       ┌─────────────────────┐
                       │   asegurados        │
                       │  (PK: pk_asegurado) │
                       └──────────┬──────────┘
                                  │ (DNI)
                                  │
                    ┌─────────────┴─────────────┐
                    │                           │
            ┌───────▼──────────┐    ┌──────────▼─────────────┐
            │ dim_solicitud_   │    │ asegurado_enfermedad_  │
            │ bolsa            │    │ cronica                │
            │ (PK: id_...)     │    │ (FK: pk_asegurado)     │
            └───────┬──────────┘    └────────────────────────┘
                    │
            ┌───────▼──────────┐
            │ solicitud_cita   │
            │ (FK: id_...)     │
            └───────┬──────────┘
                    │
        ┌───────────┼───────────┐
        │           │           │
    ┌───▼────┐  ┌──▼──────┐  ┌─▼─────────┐
    │ receta │  │ inter-  │  │ (otros)   │
    │        │  │ consulta│  │           │
    └────────┘  └─────────┘  └───────────┘
```

---

## 📝 Ejemplos de Queries

### Obtener paciente con todos sus registros

```sql
SELECT
  sb.id_solicitud_bolsa,
  sb.dni_paciente,
  sb.estado,
  sb.fecha_atendido,
  r.id_receta,
  r.dias_seguimiento,
  ic.id_interconsulta,
  ic.especialidad_referida,
  aec.tipo_enfermedad
FROM dim_solicitud_bolsa sb
LEFT JOIN receta r ON sb.id_solicitud_bolsa = r.id_solicitud_cita
LEFT JOIN interconsulta ic ON sb.id_solicitud_bolsa = ic.id_solicitud_cita
LEFT JOIN asegurado_enfermedad_cronica aec ON sb.dni_paciente = aec.pk_asegurado
WHERE sb.dni_paciente = '34567803'
ORDER BY sb.fecha_atendido DESC;
```

### Contar acciones por paciente

```sql
SELECT
  sb.dni_paciente,
  COUNT(DISTINCT sb.id_solicitud_bolsa) as total_atenciones,
  COUNT(DISTINCT r.id_receta) as total_recitas,
  COUNT(DISTINCT ic.id_interconsulta) as total_interconsultas,
  COUNT(DISTINCT aec.id_asegurado_enfermedad) as total_cronicas
FROM dim_solicitud_bolsa sb
LEFT JOIN receta r ON sb.id_solicitud_bolsa = r.id_solicitud_cita
LEFT JOIN interconsulta ic ON sb.id_solicitud_bolsa = ic.id_solicitud_cita
LEFT JOIN asegurado_enfermedad_cronica aec ON sb.dni_paciente = aec.pk_asegurado
GROUP BY sb.dni_paciente;
```

---

## 🚀 Integración con Frontend

### MisPacientes.jsx - Estado Visual

```javascript
// Después de marcar "Atendido":
// 1. Card verde aparece: "Atendido - Consulta completada"
// 2. Botones activos: Recita, Interconsulta, Registrar Crónico
// 3. Al hacer click, abre modal correspondiente
// 4. Al confirmar, se insertan datos en BD
// 5. Tabla se actualiza automáticamente (sin reload)
```

---

## 🔗 Referencias Relacionadas

- **Padre:** `spec/backend/15_recita_interconsulta_v1.47.md`
- **Validación:** `backend/src/main/java/com/styp/cenate/validation/AtenderPacienteValidator.java`
- **Servicio:** `backend/src/main/java/com/styp/cenate/service/AtenderPacienteService.java`
- **Controller:** `backend/src/main/java/com/styp/cenate/api/gestionpaciente/GestionPacienteController.java`
- **Frontend:** `frontend/src/pages/roles/medico/pacientes/MisPacientes.jsx`
- **Sincronización:** `spec/backend/14_sincronizacion_atendido/README.md`

---

## 📊 Cambios por Versión

| Versión | Cambio | Tablas Afectadas |
|---------|--------|------------------|
| v1.47.0 | Atender Paciente inicial | dim_solicitud_bolsa, solicitud_cita |
| v1.47.1 | Recita + Interconsulta | receta, interconsulta |
| v1.47.2 | Crónico support | asegurado_enfermedad_cronica |
| v1.48.0+ | Documentation | (todas) |

---

**Documento creado en:** 2026-02-06
**Versión:** v1.0.0
**Estado:** ✅ Completo
**Audience:** Backend Developers, QA, Database Admins
