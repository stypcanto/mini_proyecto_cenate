# Módulo CENACRON — Documentación Técnica

> **Estado:** Parcialmente implementado — Inscripción + Baja + Historial operativos
> **Última actualización:** 2026-02-24
> **Versiones que implementan este módulo:** v1.65.x, v1.66.x (en curso)

---

## ¿Qué es CENACRON?

**CENACRON** = Programa Integral de Control de Enfermedades Crónicas (EsSalud/CENATE).

Gestiona el seguimiento continuo de pacientes con enfermedades crónicas no transmisibles (ECNT):
- Hipertensión Arterial (HTA)
- Diabetes Mellitus (DM)
- Enfermedad Pulmonar Obstructiva Crónica (EPOC)
- Asma
- Insuficiencia Cardíaca
- Enfermedad Renal Crónica (ERC)

**Meta:** 4 visitas completas por paciente al año (una cada 3 meses).

---

## Estado de Implementación

| Funcionalidad | Estado | Roles | Ruta |
|---------------|--------|-------|------|
| Inscripción al programa | ✅ Operativo | Gestor de Citas | `/roles/citas/gestion-asegurado` |
| Dar de baja (INACTIVO/COMPLETADO) | ✅ Operativo | Médico, Enfermería, Gestor | `/roles/medico/pacientes`, `/roles/enfermeria/mis-pacientes` |
| Badge CENACRON en bandejas | ✅ Operativo | Todos los roles | Badge `♾ CENACRON` en tablas |
| Historial de bajas (auditoría) | ✅ Operativo | Todos los roles | `/asegurados/bajas-cenacron` |
| Semáforo SLA enfermería | Parcial | Enfermería | Visible en bandeja |
| Ciclos recurrentes (3 meses) | Pendiente | — | — |
| Visita completa multi-actor | Pendiente | — | — |

---

## Modelo de Datos Real (BD)

### Tablas principales

| Tabla | Descripción |
|-------|-------------|
| `dim_estrategia_institucional` | Catálogo de estrategias (CENACRON, TELECAM, etc.) |
| `paciente_estrategia` | Asignaciones de pacientes a estrategias |

### `dim_estrategia_institucional`

```sql
id_estrategia  | bigint       PK
cod_estrategia | varchar(20)  NOT NULL  -- "CENACRON"
desc_estrategia| varchar(100) NOT NULL  -- "PROGRAMA INTEGRAL DE CONTROL..."
sigla          | varchar(20)  NOT NULL  -- "CENACRON" (unique)
estado         | varchar(1)   'A'=activo
```

### `paciente_estrategia`

```sql
id_asignacion              | bigint       PK
pk_asegurado               | varchar(255) FK → asegurados
id_estrategia              | bigint       FK → dim_estrategia_institucional
id_atencion_asignacion     | bigint
id_usuario_asigno          | bigint       FK → dim_usuarios
id_usuario_desvinculo      | bigint       FK → dim_usuarios  -- quién dio la baja
fecha_asignacion           | timestamp    NOT NULL
fecha_desvinculacion       | timestamp
estado                     | varchar(20)  ACTIVO | INACTIVO | COMPLETADO
observacion_desvinculacion | text         -- motivo de baja
created_at / updated_at    | timestamp
```

**Constraint único activo:** `idx_pac_est_activo_unico` — un paciente solo puede tener UN registro ACTIVO por estrategia.

**Estados:**
- `ACTIVO` — paciente actualmente inscrito en el programa
- `INACTIVO` — dado de baja definitivamente (deserción, solicitud del paciente, etc.)
- `COMPLETADO` — egresó por resolución clínica o transferencia

### Vistas disponibles

| Vista | Descripción |
|-------|-------------|
| `vw_paciente_estrategias_activas` | Pacientes activos por estrategia |
| `vw_historial_estrategias_paciente` | Historial completo (todos los estados) |
| `vw_atenciones_por_estrategia` | Estadísticas de atenciones |
| `vw_pacientes_por_estrategia` | Agrupación por estrategia |
| `distribucion_px_enf_cenacron` | Distribución de pacientes CENACRON por enfermería |

---

## Arquitectura Backend

### Base URL
```
/api/paciente-estrategia
```

### Endpoints implementados

| Método | Endpoint | Descripción |
|--------|----------|-------------|
| `POST` | `/` | Inscribir paciente a una estrategia |
| `PUT` | `/baja-cenacron/{pkAsegurado}` | Dar de baja (INACTIVO o COMPLETADO) |
| `PUT` | `/{id}/desasignar` | Desasignar (admin) |
| `GET` | `/{id}` | Obtener asignación por ID |
| `GET` | `/paciente/{pkAsegurado}/activas` | Estrategias activas de un paciente |
| `GET` | `/paciente/{pkAsegurado}/historial` | Historial completo de estrategias |
| `GET` | `/paciente/{pkAsegurado}/verificar/{idEstrategia}` | Verificar si paciente está en estrategia |
| `GET` | `/bajas-cenacron` | Lista paginada de bajas con auditoría |
| `GET` | `/estrategia/{idEstrategia}/contar` | Contar pacientes por estrategia y estado |

### Endpoint clave: GET `/bajas-cenacron`

**Query params:**
```
busqueda    string  — filtra por DNI o nombre del paciente
estado      string  — INACTIVO | COMPLETADO
fechaInicio date    — desde (fecha_desvinculacion)
fechaFin    date    — hasta (fecha_desvinculacion)
page        int     — default 0
size        int     — default 25
```

**Respuesta:**
```json
{
  "success": true,
  "total": 2,
  "totalPaginas": 1,
  "pagina": 0,
  "bajas": [
    {
      "idAsignacion": 2,
      "pkAsegurado": "56789005",
      "nombrePaciente": "Ricardo Manuel Chávez Díaz",
      "estado": "INACTIVO",
      "motivo": "no deseo participar en el programa",
      "fechaAsignacion": "2026-02-24 20:21:45",
      "fechaDesvinculacion": "2026-02-24 20:22:35",
      "usuarioBajaLogin": "44012678",
      "nombreQuienDioBaja": "Quispe Evangelista Maria",
      "diasEnPrograma": 0
    }
  ]
}
```

### Endpoint auxiliar: Evolución Crónica

```
/api/evolucion-cronica
  GET  /paciente/{pkAsegurado}           — historial de evolución clínica
  GET  /verificar-elegibilidad/{pkAsegurado} — verifica elegibilidad al programa
```

### Clases principales

| Clase | Ruta |
|-------|------|
| `PacienteEstrategiaController` | `api/PacienteEstrategiaController.java` |
| `PacienteEstrategiaService` (interfaz) | `service/PacienteEstrategiaService.java` |
| `PacienteEstrategiaServiceImpl` | `service/impl/PacienteEstrategiaServiceImpl.java` |
| `PacienteEstrategiaRepository` | `repository/PacienteEstrategiaRepository.java` |
| `BajaCenacronListDto` | `dto/BajaCenacronListDto.java` |
| `EvolucionCronicaController` | `api/evolucion/EvolucionCronicaController.java` |

---

## Arquitectura Frontend

### Páginas implementadas

| Página | Ruta | Descripción |
|--------|------|-------------|
| `GestionAsegurado.jsx` | `/roles/citas/gestion-asegurado` | Inscripción CENACRON (botón en drawer del paciente) |
| `MisPacientes.jsx` | `/roles/medico/pacientes` | Dar de baja CENACRON desde bandeja médico |
| `MisPacientesEnfermeria.jsx` | `/roles/enfermeria/mis-pacientes` | Badge CENACRON visible |
| `BajasCenacron.jsx` | `/asegurados/bajas-cenacron` | Historial de bajas con auditoría completa |

### Flujo de inscripción (Gestor de Citas)

1. En `GestionAsegurado.jsx` → drawer del paciente
2. Si el paciente **no** tiene badge CENACRON → aparece botón `♾ Registrar en CENACRON`
3. Carga el `idEstrategia` de CENACRON desde `/api/admin/estrategias-institucionales/activas`
4. Confirma modal → `POST /api/paciente-estrategia` con `{ pkAsegurado, idEstrategia }`
5. Badge `♾ CENACRON` aparece en la tabla

### Flujo de baja (Médico / Enfermería)

1. En `MisPacientes.jsx` → columna de acciones del paciente
2. Botón "Dar de baja CENACRON" (solo visible si `paciente.esCenacron === true`)
3. Modal solicita: tipo de baja (`PROGRAMA_COMPLETO` / `ESPECIALIDAD`) + motivo
4. `PUT /api/paciente-estrategia/baja-cenacron/{pkAsegurado}` con body `{ tipo, motivo }`
5. El estado en BD pasa a `INACTIVO` (PROGRAMA_COMPLETO) o `COMPLETADO` (ESPECIALIDAD)
6. Se registra `id_usuario_desvinculo` y `fecha_desvinculacion` automáticamente

### Página Bajas CENACRON (`/asegurados/bajas-cenacron`)

- **KPIs:** Total bajas, INACTIVO (definitivas), COMPLETADO (por especialidad)
- **Filtros:** Búsqueda DNI/nombre, estado, fecha desde/hasta
- **Tabla:** Paciente, DNI, estado (badge), motivo truncado, fecha baja, generado por, días en programa
- **Drawer:** Detalle completo — nombre, DNI, tipo baja, fecha/hora exacta, motivo completo, nombre del usuario que generó la baja + su login
- **Permisos MBAC:** Todos los roles (`id_pagina=156`, `id_modulo=29`)

---

## MBAC — Permisos de Páginas

| Página | id_pagina | id_modulo | Roles con acceso |
|--------|-----------|-----------|-----------------|
| Bajas CENACRON | 156 | 29 (Asegurados) | Todos los roles (solo ver + exportar) |

Los permisos se insertaron directamente en BD (Flyway no activo). Script:
`backend/src/main/resources/db/migration/V5_12_0__pagina_bajas_cenacron.sql`

---

## Migraciones de BD aplicadas

| Script | Descripción |
|--------|-------------|
| `V3.0.0__crear_modulo_paciente_estrategia.sql` | Creación de `paciente_estrategia` |
| `V6_2_0__agregar_usuario_desvinculo_paciente_estrategia.sql` | Columna `id_usuario_desvinculo` |
| `V5_12_0__pagina_bajas_cenacron.sql` | Página + permisos MBAC para Bajas CENACRON |

> **Nota:** Flyway no está activo. Las migraciones se aplican manualmente en BD.

---

## Actores y Flujo Actual

```
GESTOR DE CITAS                MÉDICO                 ENFERMERÍA
────────────────               ──────────────         ──────────────
GestionAsegurado.jsx           MisPacientes.jsx       MisPacientesEnfermeria.jsx

[Inscribe paciente]       →    [Ve badge CENACRON]    [Ve badge CENACRON]
POST /paciente-estrategia      [Da de baja]
estado → ACTIVO                PUT /baja-cenacron/{dni}
                               estado → INACTIVO | COMPLETADO
```

**Auditoría:** Toda baja registra quién la generó (`id_usuario_desvinculo`) y cuándo (`fecha_desvinculacion`). Visible en `/asegurados/bajas-cenacron`.

---

## Pendiente de Implementar

| Funcionalidad | Fase | Prioridad |
|---------------|------|-----------|
| Validación médico (¿pertenece a CENACRON?) | Fase 2 | Media |
| Semáforo SLA completo en enfermería | Fase 3 | Media |
| Registro de atención de enfermería | Fase 3 | Media |
| Bandeja Nutrición / Psicología | Fase 4 | Baja |
| Ciclos recurrentes cada 3 meses | Fase 4 | Baja |
| Tabla `paciente_cenacron_journey` (journey completo) | Fase 4 | Baja |

---

## Archivos relacionados

- `backend/src/main/java/com/styp/cenate/api/PacienteEstrategiaController.java`
- `backend/src/main/java/com/styp/cenate/service/impl/PacienteEstrategiaServiceImpl.java`
- `backend/src/main/java/com/styp/cenate/repository/PacienteEstrategiaRepository.java`
- `backend/src/main/java/com/styp/cenate/dto/BajaCenacronListDto.java`
- `frontend/src/pages/asegurados/BajasCenacron.jsx`
- `frontend/src/pages/roles/citas/GestionAsegurado.jsx`
- `frontend/src/pages/roles/medico/pacientes/MisPacientes.jsx`
- `frontend/src/services/gestionPacientesService.js`

---

*Última actualización: 2026-02-24 | Autor: Styp Canto Rondón / Claude Code*
