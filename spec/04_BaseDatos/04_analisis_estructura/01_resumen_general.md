# Estructura General de Base de Datos - maestro_cenate

## Información General

| Propiedad | Valor |
|-----------|-------|
| **Nombre de Base de Datos** | maestro_cenate |
| **Motor** | PostgreSQL 14+ |
| **Servidor** | 10.0.89.13:5432 |
| **Propietario** | postgres |
| **Encoding** | UTF8 |
| **Collation** | es_PE.UTF-8 |
| **Timezone** | America/Lima |
| **Tamaño Total** | ~5.4 GB |

---

## Estadísticas Globales

### Objetos de Base de Datos

| Tipo de Objeto | Cantidad | Notas |
|----------------|----------|-------|
| **Tablas** | 135 | Incluye tablas operacionales, maestros y staging |
| **Vistas** | 42 | Vistas para consultas complejas y reportes |
| **Índices** | ~350+ | Indices primarios, únicos y de búsqueda |
| **Secuencias** | ~135 | Una por tabla con PK autoincremental |
| **Foreign Keys** | ~200+ | Relaciones entre entidades |
| **Triggers** | ~15 | Auditoría automática y validaciones |
| **Funciones** | ~25 | Funciones PL/pgSQL para lógica compleja |

### Distribución de Espacio

| Categoría | Espacio | Porcentaje | Tablas |
|-----------|---------|------------|--------|
| **Datos Transaccionales** | 2.8 GB | 52% | asegurados, audit_logs, gestion_paciente |
| **Datos Maestros** | 150 MB | 3% | dim_personal_cnt, dim_ipress, dim_roles |
| **Staging/Temporal** | 880 MB | 16% | ultima_atencion_* (fragmentadas) |
| **Formularios** | 1.5 MB | <1% | form_diag_* |
| **Índices** | 1.2 GB | 22% | Indices de todas las tablas |
| **Otros** | 370 MB | 7% | Logs, tablas vacías, overhead |

---

## Categorización de Tablas

### 1. Autenticación y Seguridad (12 tablas)

Gestión de usuarios, sesiones, tokens y auditoría de accesos.

| Tabla | Filas | Uso | Criticidad |
|-------|-------|-----|------------|
| `dim_usuarios` | 127 | 93,417 accesos | CRÍTICA |
| `account_requests` | 61 | 1,703 accesos | ALTA |
| `active_sessions` | 49 | 78 accesos | ALTA |
| `audit_logs` | 2,873 | 6,088 accesos | CRÍTICA |
| `segu_password_reset_tokens` | 148 | 290 accesos | MEDIA |
| `segu_token_blacklist` | 0 | 12,639 accesos | ALTA |
| `solicitud_contrasena_temporal` | 18 | 66 accesos | MEDIA |
| `recuperacion_cuenta` | 0 | 0 accesos | BAJA |
| `security_alerts` | 0 | 10 accesos | MEDIA |
| `rel_user_roles` | 127 | 103,037 accesos | CRÍTICA |
| `permisos_modulares` | 86 | 20,163 accesos | ALTA |
| `dim_roles` | 1 | 121,983 accesos | CRÍTICA |

**Descripción:** Sistema completo de autenticación JWT, gestión de sesiones, sistema MBAC (Module-Based Access Control), auditoría de accesos y alertas de seguridad.

**Entidades JPA:** Usuario, AccountRequest, ActiveSession, AuditLog, PasswordResetToken, TokenBlacklist, SolicitudContrasena, RecuperacionCuenta, SecurityAlert, Rol, PermisoModular.

---

### 2. Personal y Recursos Humanos (10 tablas)

Gestión de personal médico, administrativo y externo.

| Tabla | Filas | Uso | Criticidad |
|-------|-------|-----|------------|
| `dim_personal_cnt` | 127 | 206,170 accesos | CRÍTICA |
| `dim_personal_prof` | 1 | 18,337 accesos | ALTA |
| `dim_personal_tipo` | 1 | 18,389 accesos | ALTA |
| `dim_personal_firma` | 0 | 40 accesos | MEDIA |
| `dim_personal_oc` | 0 | 40 accesos | BAJA |
| `dim_profesiones` | 0 | 10,717 accesos | ALTA |
| `dim_regimen_laboral` | 0 | 15,106 accesos | ALTA |
| `dim_origen_personal` | 0 | 122 accesos | MEDIA |
| `dim_tipo_personal` | 0 | 10,737 accesos | ALTA |
| `firma_digital_personal` | - | - | MEDIA |

**Descripción:** Maestros de personal médico y administrativo, profesiones, régimen laboral, firmas digitales para documentos.

**Entidades JPA:** PersonalCnt, PersonalProf, DimPersonalTipo, PersonalFirma, PersonalOc, Profesion, RegimenLaboral, DimOrigenPersonal, DimTipoPersonal, FirmaDigitalPersonal.

---

### 3. Instituciones y Geografía (12 tablas)

Datos de IPRESS (hospitales, centros de salud), redes, macroregiones.

| Tabla | Filas | Uso | Criticidad |
|-------|-------|-----|------------|
| `dim_ipress` | 0 | 252,563 accesos | CRÍTICA |
| `dim_red` | 0 | 159,058 accesos | ALTA |
| `dim_macroregion` | 0 | 60,189 accesos | ALTA |
| `dim_area` | 0 | 15,772 accesos | ALTA |
| `dim_area_hosp` | 0 | 395 accesos | MEDIA |
| `dim_nivel_atencion` | 0 | 3 accesos | MEDIA |
| `dim_tipo_ipress` | 0 | 3 accesos | MEDIA |
| `dim_departamento` | 0 | 5 accesos | BAJA |
| `dim_provincia` | 0 | 5 accesos | BAJA |
| `dim_distrito` | 0 | 5 accesos | BAJA |
| `area_hosp_servicio` | 0 | 1 acceso | BAJA |
| `dim_oc` | 0 | 0 accesos | BAJA |

**Descripción:** Catálogo completo de instituciones prestadoras de salud (IPRESS), redes asistenciales, división geográfica (macroregiones, departamentos, provincias, distritos).

**Entidades JPA:** Ipress, Red, Macroregion, Area, AreaHospitalaria, NivelAtencion, TipoIpress, Distrito, Oc.

**Nota:** Las tablas de lookup (maestros) pueden tener 0 filas en `n_live_tup` pero miles de accesos porque los datos se mantienen en caché o son consultados frecuentemente.

---

### 4. Roles, Permisos y MBAC (15 tablas)

Sistema de control de acceso modular (MBAC) y gestión de permisos.

| Tabla | Filas | Uso | Criticidad | Estado |
|-------|-------|-----|------------|--------|
| `dim_roles` | 1 | 121,983 accesos | CRÍTICA | ACTIVA |
| `rel_user_roles` | 127 | 103,037 accesos | CRÍTICA | ACTIVA |
| `permisos_modulares` | 86 | 20,163 accesos | ALTA | ACTIVA |
| `dim_modulos_sistema` | 4 | 1,768 accesos | ALTA | ACTIVA |
| `dim_paginas_modulo` | 5 | 2,261 accesos | ALTA | ACTIVA |
| `dim_paginas` | 0 | 31,126 accesos | ALTA | ACTIVA |
| `dim_permisos` | 0 | 33 accesos | MEDIA | ACTIVA |
| `dim_permisos_modulares` | 1 | 40 accesos | MEDIA | ACTIVA |
| **LEGACY:** | | | | |
| `rel_paginas_permisos` | 0 | 0 accesos | BAJA | LEGACY |
| `rel_rol_pagina_permiso` | 0 | 7 accesos | BAJA | LEGACY |
| `dim_permisos_pagina_rol` | 0 | 7 accesos | BAJA | LEGACY |
| `roles_permisos` | 0 | 2 accesos | BAJA | LEGACY |
| `usuario_roles` | 0 | 20 accesos | BAJA | LEGACY |
| `roles` | 0 | 0 accesos | BAJA | LEGACY |
| `paginas` | 0 | 0 accesos | BAJA | LEGACY |
| `modulos` | 0 | 0 accesos | BAJA | LEGACY |

**Descripción:** Sistema MBAC (Module-Based Access Control) que controla el acceso a módulos, páginas y acciones según roles. Incluye tablas legacy del sistema anterior.

**Entidades JPA:** Rol, Permiso, PermisoModular, ModuloSistema, PaginaModulo, ContextoModulo.

**Recomendación:** Migrar datos de tablas legacy al nuevo sistema y eliminar las obsoletas.

---

### 5. Pacientes y Asegurados (3 tablas)

Gestión de pacientes, asegurados y atenciones.

| Tabla | Filas | Uso | Criticidad |
|-------|-------|-----|------------|
| `asegurados` | 4,656,507 | 1,298,331 accesos | CRÍTICA |
| `gestion_paciente` | 0 | 469,732 accesos | ALTA |
| `solicitud_cita` | 4 | 107 accesos | MEDIA |
| `dim_estado_cita` | 0 | 483 accesos | MEDIA |
| `dim_tipo_documento` | 0 | 4,725,711 accesos | CRÍTICA |

**Descripción:** Registro de asegurados de EsSalud, gestión de pacientes en sistema de telemedicina, solicitudes de citas.

**Entidades JPA:** Asegurado, Paciente, GestionPaciente, SolicitudCita (pendiente), TipoDocumento.

**Nota:** La tabla `asegurados` es la más grande de la base de datos (2.6 GB, 4.6M filas).

---

### 6. Disponibilidad Médica (Módulo v1.13.0) (4 tablas)

Gestión de turnos y disponibilidad de médicos.

| Tabla | Filas | Uso | Criticidad |
|-------|-------|-----|------------|
| `disponibilidad_medica` | 0 | 25 accesos | ALTA |
| `detalle_disponibilidad` | 0 | 16 accesos | ALTA |
| `dashboard_medico_cards` | 1 | 10 accesos | MEDIA |
| `periodo_solicitud_turno` | 1 | 75 accesos | ALTA |
| `solicitud_turno_ipress` | 0 | 113 accesos | ALTA |
| `detalle_solicitud_turno` | 0 | 3 accesos | MEDIA |
| `solicitud_turnos_mensual` | 0 | 5 accesos | MEDIA |
| `solicitud_turnos_detalle` | 0 | 2 accesos | MEDIA |

**Descripción:** Módulo implementado en v1.13.0 para declaración de disponibilidad mensual de médicos por turnos (Mañana, Tarde, Turno Completo) con validación de 150 horas mínimas.

**Entidades JPA:** DisponibilidadMedica, DetalleDisponibilidad, DashboardMedicoCard, PeriodoSolicitudTurno, SolicitudTurnoIpress, DetalleSolicitudTurno, SolicitudTurnosMensual, SolicitudTurnosDetalle.

---

### 7. Servicios y Actividades ESSI (5 tablas)

Catálogo de servicios, actividades y subactividades del sistema ESSI.

| Tabla | Filas | Uso | Criticidad |
|-------|-------|-----|------------|
| `dim_servicio_essi` | 0 | 6,450 accesos | ALTA |
| `dim_actividad_essi` | 0 | 392 accesos | MEDIA |
| `dim_subactividad_essi` | 0 | 61 accesos | MEDIA |
| `actividad_subactividad` | 0 | 0 accesos | BAJA |
| `servicio_actividad` | 0 | 0 accesos | BAJA |

**Descripción:** Maestros de servicios médicos, actividades y subactividades del sistema de información ESSI de EsSalud.

**Entidades JPA:** DimServicioEssi, ActividadEssi, SubactividadEssi.

**Recomendación:** Eliminar tablas `actividad_subactividad` y `servicio_actividad` (vacías sin uso).

---

### 8. Procedimientos Médicos (4 tablas)

Catálogo de procedimientos y tipos.

| Tabla | Filas | Uso | Criticidad |
|-------|-------|-----|------------|
| `dim_proced` | 0 | 0 accesos | MEDIA |
| `dim_procedimiento` | 0 | 0 accesos | BAJA |
| `dim_tipo_procedimiento` | - | - | MEDIA |

**Descripción:** Maestros de procedimientos médicos y tipos de procedimientos.

**Entidades JPA:** Procedimiento, TipoProcedimiento.

**Recomendación:** Consolidar `dim_proced` y `dim_procedimiento` (parecen duplicadas).

---

### 9. Formulario de Diagnóstico Institucional (22 tablas)

Módulo de diagnóstico de instituciones (equipamiento, infraestructura, recursos).

| Categoría | Tablas | Filas | Uso |
|-----------|--------|-------|-----|
| **Formularios** | form_diag_formulario | 9 | 2,659 accesos |
| **Equipamiento** | form_diag_equipamiento | 206 | 725 accesos |
| **Necesidades** | form_diag_necesidad | 307 | 978 accesos |
| **Servicios** | form_diag_servicio | 95 | 424 accesos |
| **Infraestructura** | form_diag_infra_fis, form_diag_infra_tec | 8 cada una | ~285 accesos |
| **Conectividad** | form_diag_conectividad_sist | 8 | 288 accesos |
| **RRHH** | form_diag_recursos_humanos, form_diag_rh_apoyo | 8/0 | 287/4 accesos |
| **Datos Generales** | form_diag_datos_generales | 8 | 281 accesos |
| **Catálogos** | form_diag_cat_* (6 tablas) | 0 | 0-2,340 accesos |

**Descripción:** Sistema de formularios para diagnóstico de capacidades de telemedicina en instituciones (equipamiento, conectividad, infraestructura, RRHH).

**Estado:** ACTIVO (9 formularios registrados, accesos frecuentes)

**Entidades JPA:** Ninguna (módulo sin backend formal).

**Recomendación:** Mantener, es módulo funcional. Considerar crear entidades JPA si se planea expandir funcionalidad.

---

### 10. Módulo Bolsa 107 (5 tablas)

Sistema de gestión de bolsas (aparenta ser legacy).

| Tabla | Filas | Uso | Criticidad |
|-------|-------|-----|------------|
| `bolsa_107_carga` | 1 | 61 accesos | BAJA |
| `bolsa_107_error` | 1 | 21 accesos | BAJA |
| `bolsa_107_hist_estado` | 12 | 2 accesos | BAJA |
| `bolsa_107_item` | 12 | 25 accesos | BAJA |
| `dim_estado_bolsa_107` | 5 | 21 accesos | BAJA |

**Descripción:** Sistema de gestión de "bolsas" (contexto desconocido, posiblemente legacy).

**Estado:** POSIBLE LEGACY (pocos datos, bajo uso)

**Entidades JPA:** Ninguna.

**Recomendación:** Investigar con equipo administrativo. Si está descontinuado, archivar y eliminar.

---

### 11. Módulo Control de Horarios (CTR) (7 tablas)

Sistema de control de horarios (posiblemente legacy).

| Tabla | Filas | Uso | Criticidad |
|-------|-------|-----|------------|
| `ctr_horario` | 0 | 99 accesos | MEDIA |
| `ctr_horario_det` | 0 | 1,954 accesos | MEDIA |
| `ctr_horario_log` | 7 | 25 accesos | BAJA |
| `ctr_periodo` | 0 | 414 accesos | MEDIA |
| `dim_catalogo_horario` | 0 | 10 accesos | BAJA |
| `dim_horario` | 0 | 6,246 accesos | ALTA |
| `rendimiento_horario` | 0 | 13 accesos | BAJA |

**Descripción:** Sistema de control de horarios de personal (posiblemente reemplazado por `disponibilidad_medica`).

**Estado:** POSIBLE LEGACY (alto número de accesos sugiere uso pasado)

**Entidades JPA:** Ninguna.

**Recomendación:** Verificar con coordinadores médicos si fue reemplazado. Si es legacy, archivar.

---

### 12. Tablas Staging y Temporales (10+ tablas)

Tablas para procesos ETL, cargas batch y temporales.

| Tabla | Filas | Tamaño | Estado |
|-------|-------|--------|--------|
| `ultima_atencion_esp_nacional` | 0 | 858 MB | FRAGMENTADA |
| `ultima_atencion_6m_nacional` | 0 | 15 MB | FRAGMENTADA |
| `ultima_atencion_6m_cnt` | 0 | 5.3 MB | FRAGMENTADA |
| `stg_ipress_load` | 0 | 64 KB | VACÍA |
| `bkp_dim_personal_prof_id_esp_202511` | 0 | 8 KB | BACKUP TEMPORAL |

**Descripción:** Tablas staging y temporales, algunas con alta fragmentación pero sin datos.

**Estado:** REQUIERE LIMPIEZA

**Recomendación:**
- ELIMINAR: `bkp_*` (backups temporales obsoletos)
- ELIMINAR: `stg_*` (staging sin uso)
- VACUUM FULL: `ultima_atencion_*` (recuperar 880 MB)

---

### 13. Tablas Misceláneas y Utilitarias (10 tablas)

| Tabla | Filas | Uso | Criticidad |
|-------|-------|-----|------------|
| `frm_transf_img` | 0 | 0 accesos | BAJA |
| `llamadas` | 0 | 0 accesos | BAJA |
| `persona_programa` | 0 | 26 accesos | BAJA |
| `dim_programa` | 0 | 0 accesos | BAJA |
| `dim_grupo` | 0 | 0 accesos | BAJA |
| `dim_seccion` | 0 | 0 accesos | BAJA |
| `dim_subseccion` | 0 | 0 accesos | BAJA |
| `dim_modalidad_atencion` | 0 | 0 accesos | BAJA |
| `dim_tipo_dispositivo` | 0 | 0 accesos | BAJA |
| `dim_firma_digital` | 0 | 0 accesos | MEDIA |

**Descripción:** Tablas de propósito variado, la mayoría sin uso.

**Recomendación:** Investigar propósito. Si no son maestros previstos para futuros módulos, eliminar.

---

## Vistas Principales (42 vistas)

### Vistas de Seguridad y Auditoría
- `vw_auditoria_modular_detallada` - Vista principal de auditoría
- `vw_security_alerts_activas` - Alertas de seguridad activas
- `vw_sesiones_activas` - Sesiones de usuario activas
- `vw_permisos_activos` - Permisos MBAC activos

### Vistas de Personal
- `vw_personal_cnt_detalle` - Personal con detalles completos
- `vw_personal_asistencial_activo` - Personal asistencial activo
- `vw_personal_profesional` - Profesionales de salud
- `dim_personal_interno` - Personal interno CENATE
- `dim_personal_externo` - Personal externo

### Vistas de Disponibilidad
- `vw_disponibilidad_servicio_proximos_dias` - Disponibilidad próxima
- `vw_slots_disponibles_chatbot` - Slots para chatbot
- `vw_fechas_disponibles_chatbot` - Fechas disponibles

### Vistas de Gestión
- `v_gestion_paciente_completo` - Gestión completa de pacientes
- `vw_solicitud_turno_completa` - Solicitudes de turno
- `vw_ch_det_enriquecido` - Control de horarios detallado

---

## Índices Críticos

### Índices por Tipo

| Tipo de Índice | Cantidad | Propósito |
|----------------|----------|-----------|
| **PRIMARY KEY** | ~135 | Identificadores únicos |
| **UNIQUE** | ~45 | Unicidad (username, email, código) |
| **FOREIGN KEY** | ~200 | Relaciones entre tablas |
| **BÚSQUEDA** | ~70 | Optimización de queries frecuentes |

### Índices Más Importantes

```sql
-- Autenticación
CREATE INDEX idx_usuarios_username ON dim_usuarios(username);
CREATE INDEX idx_usuarios_stat ON dim_usuarios(stat_user);

-- Personal
CREATE INDEX idx_personal_cnt_num_doc ON dim_personal_cnt(num_doc_pers);
CREATE INDEX idx_personal_cnt_ipress ON dim_personal_cnt(id_ipress);

-- Auditoría
CREATE INDEX idx_audit_logs_user ON audit_logs(usuario_sesion);
CREATE INDEX idx_audit_logs_action ON audit_logs(accion);
CREATE INDEX idx_audit_logs_timestamp ON audit_logs(timestamp);

-- IPRESS
CREATE INDEX idx_ipress_cod ON dim_ipress(cod_ipress);
CREATE INDEX idx_ipress_red ON dim_ipress(id_red);

-- Permisos MBAC
CREATE INDEX idx_permisos_mod_rol ON permisos_modulares(id_rol);
CREATE INDEX idx_permisos_mod_pagina ON permisos_modulares(id_pagina);
```

---

## Triggers Principales

### Triggers de Auditoría
```sql
-- Auditoría automática en cambios de usuarios
CREATE TRIGGER trg_audit_usuario_changes
AFTER INSERT OR UPDATE OR DELETE ON dim_usuarios
FOR EACH ROW EXECUTE FUNCTION fn_audit_usuario();

-- Auditoría de cambios en permisos
CREATE TRIGGER trg_audit_permisos_changes
AFTER INSERT OR UPDATE OR DELETE ON permisos_modulares
FOR EACH ROW EXECUTE FUNCTION fn_audit_permisos();
```

### Triggers de Validación
```sql
-- Validar horas mínimas en disponibilidad médica
CREATE TRIGGER trg_validate_disponibilidad
BEFORE INSERT OR UPDATE ON disponibilidad_medica
FOR EACH ROW EXECUTE FUNCTION fn_validate_horas_minimas();
```

---

## Funciones PL/pgSQL Principales

### Funciones de Auditoría
```sql
-- Registrar evento de auditoría
CREATE FUNCTION fn_audit_log(
    p_usuario VARCHAR,
    p_accion VARCHAR,
    p_modulo VARCHAR,
    p_detalle TEXT
) RETURNS VOID;

-- Obtener historial de auditoría
CREATE FUNCTION fn_get_audit_history(
    p_usuario VARCHAR,
    p_fecha_inicio DATE,
    p_fecha_fin DATE
) RETURNS TABLE(...);
```

### Funciones de Negocio
```sql
-- Calcular horas por turno según régimen laboral
CREATE FUNCTION fn_calcular_horas_turno(
    p_regimen VARCHAR,
    p_turno VARCHAR
) RETURNS DECIMAL;

-- Obtener disponibilidad de médico
CREATE FUNCTION fn_get_disponibilidad_medico(
    p_id_medico INT,
    p_periodo VARCHAR
) RETURNS TABLE(...);
```

---

## Secuencias

Cada tabla con PK autoincremental tiene su secuencia:

```sql
-- Ejemplos de secuencias principales
dim_usuarios_id_user_seq
account_requests_id_seq
audit_logs_id_seq
dim_personal_cnt_id_personal_cnt_seq
disponibilidad_medica_id_seq
```

**Patrón:** `{nombre_tabla}_{nombre_columna}_seq`

---

## Consideraciones de Performance

### Tablas que Requieren Particionamiento
- `asegurados` (4.6M filas, 2.6 GB) - Considerar particionar por año
- `audit_logs` (crecimiento constante) - Particionar por mes
- `gestion_paciente` (alto uso) - Particionar por fecha de atención

### Tablas que Requieren Índices Adicionales
```sql
-- Consultas frecuentes por rango de fechas
CREATE INDEX idx_audit_logs_timestamp_range
ON audit_logs(timestamp) WHERE timestamp > NOW() - INTERVAL '30 days';

-- Búsquedas de personal por nombres
CREATE INDEX idx_personal_cnt_nombres_gin
ON dim_personal_cnt USING gin(to_tsvector('spanish', nombre_pers || ' ' || apellido_paterno_pers));
```

### Vacuum y Mantenimiento
```sql
-- Configuración recomendada de autovacuum
ALTER TABLE asegurados SET (autovacuum_vacuum_scale_factor = 0.05);
ALTER TABLE audit_logs SET (autovacuum_vacuum_scale_factor = 0.02);

-- Vacuum manual mensual
VACUUM ANALYZE VERBOSE;
```

---

## Seguridad y Privilegios

### Roles de Base de Datos
- `postgres` - Superusuario (propietario)
- `Admin_DBA` - Administrador (propietario de `asegurados`)
- `app_cenate` - Usuario de aplicación (permisos limitados)

### Privilegios Recomendados
```sql
-- Usuario de aplicación
GRANT SELECT, INSERT, UPDATE ON ALL TABLES IN SCHEMA public TO app_cenate;
GRANT SELECT, INSERT, UPDATE, DELETE ON audit_logs TO app_cenate;
REVOKE DELETE ON dim_usuarios FROM app_cenate; -- Solo soft delete

-- Revocar acceso directo a tablas sensibles
REVOKE ALL ON asegurados FROM PUBLIC;
GRANT SELECT ON asegurados TO app_cenate;
```

---

## Backups y Recuperación

### Estrategia de Backup Actual
```bash
# Backup diario completo
pg_dump -h 10.0.89.13 -U postgres -d maestro_cenate \
  -F c -f /backup/maestro_cenate_$(date +%Y%m%d).dump

# Backup de tablas críticas cada 6 horas
pg_dump -h 10.0.89.13 -U postgres -d maestro_cenate \
  -t audit_logs -t dim_usuarios -t account_requests \
  -F c -f /backup/maestro_cenate_critical_$(date +%Y%m%d_%H%M).dump
```

### Restauración
```bash
# Restauración completa
pg_restore -h 10.0.89.13 -U postgres -d maestro_cenate \
  -c -F c /backup/maestro_cenate_20251230.dump

# Restauración de tabla específica
pg_restore -h 10.0.89.13 -U postgres -d maestro_cenate \
  -t audit_logs -F c /backup/maestro_cenate_critical_20251230.dump
```

---

## Monitoreo

### Queries de Monitoreo Recomendadas

```sql
-- Tamaño de base de datos
SELECT pg_size_pretty(pg_database_size('maestro_cenate'));

-- Top 20 tablas más grandes
SELECT
    schemaname || '.' || tablename AS tabla,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamano
FROM pg_tables
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- Tablas con mayor actividad (últimas 24h)
SELECT
    schemaname,
    relname,
    seq_scan + idx_scan AS accesos_totales,
    n_tup_ins AS inserciones,
    n_tup_upd AS actualizaciones,
    n_tup_del AS eliminaciones
FROM pg_stat_user_tables
WHERE (seq_scan + idx_scan) > 0
ORDER BY accesos_totales DESC
LIMIT 20;

-- Queries lentas (requiere pg_stat_statements)
SELECT
    query,
    calls,
    total_time / calls AS tiempo_promedio_ms,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 20;
```

---

## Siguientes Documentos

1. **02_tablas_autenticacion.md** - Detalle de tablas de autenticación
2. **03_tablas_personal.md** - Detalle de tablas de personal
3. **04_tablas_ipress.md** - Detalle de tablas de instituciones
4. **05_tablas_permisos_mbac.md** - Sistema MBAC completo
5. **06_tablas_disponibilidad.md** - Módulo de disponibilidad médica
6. **07_vistas_principales.md** - Documentación de vistas
7. **08_indices_performance.md** - Estrategias de indexación
8. **09_funciones_triggers.md** - Funciones y triggers
9. **10_mantenimiento.md** - Guía de mantenimiento

---

**Generado:** 2025-12-30
**Versión Sistema:** v1.13.0
**Autor:** Análisis automatizado PostgreSQL
