# Análisis de Tablas - Endpoints Solicitud Turno IPRESS

## 📋 Resumen

Este documento identifica todas las tablas de la base de datos que son utilizadas por los endpoints del controlador `SolicitudTurnoIpressController` (Base URL: `/api/solicitudes-turno`).

## 🔗 Endpoints Analizados

1. `GET /api/solicitudes-turno/{id}` - Obtener solicitud por ID
2. `PUT /api/solicitudes-turno/{id}` - Actualizar solicitud
3. `DELETE /api/solicitudes-turno/{id}` - Eliminar solicitud
4. `PUT /api/solicitudes-turno/{id}/revisar` - Marcar como revisada
5. `PUT /api/solicitudes-turno/{id}/enviar` - Enviar solicitud
6. `POST /api/solicitudes-turno` - Crear nueva solicitud
7. `POST /api/solicitudes-turno/borrador` - Guardar como borrador
8. `GET /api/solicitudes-turno/periodo/{idPeriodo}` - Listar por periodo
9. `GET /api/solicitudes-turno/periodo/{idPeriodo}/red/{idRed}` - Listar por periodo y red
10. `GET /api/solicitudes-turno/periodo/{idPeriodo}/existe` - Verificar si existe
11. `GET /api/solicitudes-turno/mis-solicitudes` - Listar mis solicitudes
12. `GET /api/solicitudes-turno/mi-solicitud/periodo/{idPeriodo}` - Obtener mi solicitud

## 🗄️ Tablas de la Base de Datos

### 1. Tabla Principal: `solicitud_turno_ipress`

**Schema:** `public`  
**Descripción:** Tabla principal que almacena las solicitudes de turnos enviadas por usuarios IPRESS.

**Estructura:**
- `id_solicitud` (BIGINT, PK, AUTO_INCREMENT) - Identificador único
- `id_periodo` (BIGINT, FK → `periodo_solicitud_turno.id_periodo`) - Periodo de solicitud
- `id_pers` (BIGINT, FK → `dim_personal_cnt.id_pers`) - Personal que creó la solicitud
- `estado` (VARCHAR(20)) - Estado: BORRADOR, ENVIADO, REVISADO
- `fecha_envio` (TIMESTAMP WITH TIME ZONE) - Fecha de envío
- `created_at` (TIMESTAMP WITH TIME ZONE) - Fecha de creación
- `updated_at` (TIMESTAMP WITH TIME ZONE) - Fecha de actualización

**Unique Constraint:** `(id_periodo, id_pers)` - Un usuario solo puede tener una solicitud por periodo

**Entidad Java:** `com.styp.cenate.model.SolicitudTurnoIpress`

---

### 2. Tabla de Detalles: `detalle_solicitud_turno`

**Schema:** `public`  
**Descripción:** Almacena los detalles de turnos solicitados por especialidad para cada solicitud.

**Estructura:**
- `id_detalle` (BIGINT, PK, AUTO_INCREMENT) - Identificador único
- `id_solicitud` (BIGINT, FK → `solicitud_turno_ipress.id_solicitud`) - Solicitud padre
- `id_servicio` (BIGINT, FK → `dim_servicio_essi.id_servicio`) - Especialidad/servicio
- `turnos_solicitados` (INTEGER) - Cantidad de turnos solicitados
- `turno_preferente` (VARCHAR(100)) - Turno preferente (Mañana, Tarde, Noche)
- `dia_preferente` (VARCHAR(200)) - Días preferentes (Lunes, Miércoles, Viernes)
- `observacion` (TEXT) - Observaciones adicionales
- `created_at` (TIMESTAMP WITH TIME ZONE) - Fecha de creación

**Entidad Java:** `com.styp.cenate.model.DetalleSolicitudTurno`

---

### 3. Tabla de Periodos: `periodo_solicitud_turno`

**Schema:** `public`  
**Descripción:** Define los periodos (mensuales) en los que se pueden solicitar turnos.

**Estructura:**
- `id_periodo` (BIGINT, PK, AUTO_INCREMENT) - Identificador único
- `periodo` (VARCHAR(6)) - Periodo en formato YYYYMM (ej: "202601")
- `descripcion` (VARCHAR(100)) - Descripción (ej: "Enero 2026")
- `fecha_inicio` (TIMESTAMP) - Fecha de inicio del periodo
- `fecha_fin` (TIMESTAMP) - Fecha de fin del periodo
- `estado` (VARCHAR(20)) - Estado: BORRADOR, ACTIVO, CERRADO
- `instrucciones` (TEXT) - Instrucciones para el periodo
- `created_by` (VARCHAR(50)) - Usuario que creó el periodo
- `created_at` (TIMESTAMP WITH TIME ZONE) - Fecha de creación
- `updated_at` (TIMESTAMP WITH TIME ZONE) - Fecha de actualización

**Entidad Java:** `com.styp.cenate.model.PeriodoSolicitudTurno`

---

### 4. Tabla de Personal: `dim_personal_cnt`

**Schema:** `public`  
**Descripción:** Información del personal del CENATE que crea las solicitudes.

**Campos utilizados por los endpoints:**
- `id_pers` (BIGINT, PK) - Identificador único del personal
- `num_doc_pers` (VARCHAR(20), UNIQUE) - DNI del personal
- `nom_pers` (VARCHAR(100)) - Nombre
- `ape_pater_pers` (VARCHAR(100)) - Apellido paterno
- `ape_mater_pers` (VARCHAR(100)) - Apellido materno
- `email_pers` (VARCHAR(150)) - Email personal
- `email_corp_pers` (VARCHAR(150)) - Email corporativo
- `movil_pers` (VARCHAR(15)) - Teléfono móvil
- `id_ipress` (BIGINT, FK → `dim_ipress.id_ipress`) - IPRESS del personal
- `id_usuario` (BIGINT, FK → `dim_usuarios.id_user`) - Usuario asociado

**Entidad Java:** `com.styp.cenate.model.PersonalCnt`

---

### 5. Tabla de IPRESS: `dim_ipress`

**Schema:** `public`  
**Descripción:** Información de las Instituciones Prestadoras de Servicios de Salud.

**Campos utilizados por los endpoints:**
- `id_ipress` (BIGINT, PK) - Identificador único
- `cod_ipress` (VARCHAR) - Código RENIPRESS
- `desc_ipress` (VARCHAR) - Nombre/descripción de la IPRESS
- `id_red` (BIGINT, FK → `dim_red.id_red`) - Red a la que pertenece

**Entidad Java:** `com.styp.cenate.model.Ipress`

---

### 6. Tabla de Redes: `dim_red`

**Schema:** `public`  
**Descripción:** Redes Asistenciales de salud.

**Campos utilizados por los endpoints:**
- `id_red` (BIGINT, PK) - Identificador único
- `cod_red` (VARCHAR) - Código de la red
- `desc_red` (VARCHAR) - Nombre/descripción de la red

**Entidad Java:** `com.styp.cenate.model.Red`

---

### 7. Tabla de Servicios/Especialidades: `dim_servicio_essi`

**Schema:** `public`  
**Descripción:** Catálogo de servicios/especialidades ESSI.

**Campos utilizados por los endpoints:**
- `id_servicio` (BIGINT, PK) - Identificador único
- `cod_servicio` (VARCHAR(10)) - Código del servicio
- `desc_servicio` (TEXT) - Nombre/descripción de la especialidad
- `estado` (CHAR(1)) - Estado: A=Activo, I=Inactivo
- `es_cenate` (BOOLEAN) - Indica si es servicio CENATE

**Entidad Java:** `com.styp.cenate.model.DimServicioEssi`

---

### 8. Tabla de Usuarios: `dim_usuarios`

**Schema:** `public`  
**Descripción:** Usuarios del sistema (para autenticación).

**Campos utilizados por los endpoints:**
- `id_user` (BIGINT, PK) - Identificador único
- `name_user` (VARCHAR) - Nombre de usuario (usado para login)

**Entidad Java:** `com.styp.cenate.model.Usuario`

---

## 🔄 Relaciones entre Tablas

```
dim_usuarios (1) ──< (1) dim_personal_cnt (N) ──< (1) dim_ipress (1) ──< (1) dim_red
                                                              │
                                                              │
                                                              │
                                              (N) <─── (1) solicitud_turno_ipress
                                                              │
                                                              │
                                                              │ (1)
                                                              │
                                                              │
                                            (N) <─── (1) detalle_solicitud_turno (N) ──> (1) dim_servicio_essi
                                                              │
                                                              │
                                                              │
                                            (N) <─── (1) periodo_solicitud_turno
```

## 📊 Consultas por Endpoint

### GET `/api/solicitudes-turno/{id}`
**Tablas utilizadas:**
- `solicitud_turno_ipress` (principal)
- `detalle_solicitud_turno` (LEFT JOIN)
- `dim_servicio_essi` (LEFT JOIN via detalle)
- `periodo_solicitud_turno` (JOIN)
- `dim_personal_cnt` (JOIN)
- `dim_ipress` (JOIN via personal)
- `dim_red` (JOIN via ipress)

### GET `/api/solicitudes-turno/periodo/{idPeriodo}`
**Tablas utilizadas:**
- `solicitud_turno_ipress` (principal)
- `dim_personal_cnt` (LEFT JOIN)
- `dim_ipress` (LEFT JOIN via personal)
- `dim_red` (LEFT JOIN via ipress)
- `periodo_solicitud_turno` (JOIN)

### POST `/api/solicitudes-turno`
**Tablas utilizadas:**
- `solicitud_turno_ipress` (INSERT)
- `detalle_solicitud_turno` (INSERT múltiple)
- `periodo_solicitud_turno` (SELECT para validación)
- `dim_servicio_essi` (SELECT para validación)

### PUT `/api/solicitudes-turno/{id}`
**Tablas utilizadas:**
- `solicitud_turno_ipress` (UPDATE)
- `detalle_solicitud_turno` (DELETE y INSERT)

## 🔐 Credenciales de Base de Datos

Según `application.properties`:
- **Host:** 10.0.89.13
- **Puerto:** 5432
- **Base de datos:** maestro_cenate
- **Usuario:** postgres (o valor de variable de entorno `DB_USERNAME`)
- **Contraseña:** Essalud2025 (o valor de variable de entorno `DB_PASSWORD`)

## 📝 Notas Importantes

1. **Restricción única:** Un usuario (`id_pers`) solo puede tener una solicitud por periodo (`id_periodo`).

2. **Estados de solicitud:**
   - `BORRADOR`: Solicitud en edición
   - `ENVIADO`: Solicitud enviada y pendiente de revisión
   - `REVISADO`: Solicitud revisada por coordinador

3. **Cascada:** Al eliminar una solicitud, se eliminan automáticamente sus detalles (orphan removal).

4. **Auditoría:** Los endpoints pueden registrar operaciones en tablas de auditoría (no incluidas en este análisis).

5. **Validaciones:**
   - Solo se pueden editar solicitudes en estado `BORRADOR` o `ENVIADO` (no `REVISADO`)
   - Solo se pueden eliminar solicitudes en estado `BORRADOR`
   - Solo se pueden enviar solicitudes que tengan al menos un detalle con turnos solicitados

---

**Fecha de análisis:** 2026-01-08  
**Versión del código analizado:** SolicitudTurnoIpressController y SolicitudTurnoIpressServiceImpl
