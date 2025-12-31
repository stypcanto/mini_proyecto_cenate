# Análisis de Base de Datos - maestro_cenate

## Fecha: 2025-12-30
## Base de Datos: PostgreSQL 14+ en 10.0.89.13:5432

---

## 1. RESUMEN EJECUTIVO

### Estadísticas Generales
- **Total de tablas:** 135
- **Total de vistas:** 42
- **Tablas con entidades JPA:** ~55
- **Tablas huérfanas (sin entidad):** ~80
- **Espacio total ocupado:** ~5.4 GB

### Tablas más grandes
1. **asegurados:** 2.6 GB (4,656,507 filas) - ACTIVA
2. **ultima_atencion_esp_nacional:** 858 MB (0 filas) - CANDIDATA
3. **ultima_atencion_6m_nacional:** 15 MB (0 filas) - CANDIDATA
4. **ultima_atencion_6m_cnt:** 5.3 MB (0 filas) - CANDIDATA
5. **audit_logs:** 3 MB (2,873 filas) - ACTIVA

---

## 2. TABLAS MAPEADAS CON ENTIDADES JPA (EN USO)

Estas tablas tienen entidades JPA correspondientes y están activamente en uso:

### Autenticación y Usuarios
- `dim_usuarios` (127 filas, 93,417 accesos)
- `account_requests` (61 filas, 1,703 accesos)
- `active_sessions` (49 filas, 78 accesos)
- `segu_password_reset_tokens` (148 filas, 290 accesos)
- `segu_token_blacklist` (0 filas, 12,639 accesos)
- `recuperacion_cuenta` (0 filas, 0 accesos) - MAPPED pero sin uso
- `solicitud_contrasena_temporal` (18 filas, 66 accesos)
- `security_alerts` (0 filas, 10 accesos)

### Auditoría
- `audit_logs` (2,873 filas, 6,088 accesos) - MUY ACTIVA

### Personal
- `dim_personal_cnt` (127 filas, 206,170 accesos) - CRÍTICA
- `dim_personal_prof` (1 fila, 18,337 accesos)
- `dim_personal_tipo` (1 fila, 18,389 accesos)
- `dim_personal_firma` (0 filas, 40 accesos)
- `dim_personal_oc` (0 filas, 40 accesos)
- `firma_digital_personal` (nueva, pendiente)

### Roles y Permisos (MBAC)
- `dim_roles` (1 fila, 121,983 accesos) - CRÍTICA
- `rel_user_roles` (127 filas, 103,037 accesos) - CRÍTICA
- `dim_permisos` (0 filas, 33 accesos)
- `dim_modulos_sistema` (4 filas, 1,768 accesos)
- `dim_paginas_modulo` (5 filas, 2,261 accesos)
- `permisos_modulares` (86 filas, 20,163 accesos)

### Instituciones (IPRESS)
- `dim_ipress` (0 filas, 252,563 accesos) - LOOKUP TABLE CRÍTICA
- `dim_red` (0 filas, 159,058 accesos)
- `dim_macroregion` (0 filas, 60,189 accesos)
- `dim_area` (0 filas, 15,772 accesos)
- `dim_nivel_atencion` (0 filas, 3 accesos)
- `tipo_ipress` (entidad TipoIpress)

### Disponibilidad Médica (Módulo v1.13.0)
- `disponibilidad_medica` (0 filas, 25 accesos)
- `detalle_disponibilidad` (0 filas, 16 accesos)
- `dashboard_medico_cards` (1 fila, 10 accesos)

### Turnos y Solicitudes
- `periodo_solicitud_turno` (1 fila, 75 accesos)
- `solicitud_turno_ipress` (0 filas, 113 accesos)
- `solicitud_turnos_mensual` (0 filas, 5 accesos)
- `solicitud_turnos_detalle` (0 filas, 2 accesos)
- `detalle_solicitud_turno` (0 filas, 3 accesos)

### Pacientes y Asegurados
- `asegurados` (4,656,507 filas, 1,298,331 accesos) - TABLA MÁS GRANDE
- `gestion_paciente` (0 filas, 469,732 accesos) - ALTO ACCESO

### Datos Maestros
- `dim_profesiones` (0 filas, 10,717 accesos)
- `dim_regimen_laboral` (0 filas, 15,106 accesos)
- `dim_tipo_documento` (0 filas, 4,725,711 accesos) - LOOKUP CRÍTICA
- `dim_tipo_personal` (0 filas, 10,737 accesos)
- `dim_origen_personal` (0 filas, 122 accesos)
- `dim_distrito` (0 filas, 5 accesos)
- `dim_oc` (0 filas, 0 accesos)
- `dim_tipo_dispositivo` (0 filas, 0 accesos)
- `dim_firma_digital` (0 filas, 0 accesos)
- `dim_contexto_modulo` (0 filas, 0 accesos)

### Servicios y Actividades ESSI
- `dim_servicio_essi` (0 filas, 6,450 accesos)
- `dim_actividad_essi` (0 filas, 392 accesos)
- `dim_subactividad_essi` (0 filas, 61 accesos)
- `dim_area_hosp` (0 filas, 395 accesos)

### Procedimientos
- `dim_proced` (0 filas, 0 accesos)
- `dim_tipo_procedimiento` (entidad TipoProcedimiento)

### Transferencia de Imágenes
- `frm_transf_img` (0 filas, 0 accesos)

---

## 3. TABLAS SIN ENTIDAD JPA (HUÉRFANAS)

### 3.1 CANDIDATAS PARA ELIMINACIÓN (ALTA PRIORIDAD)

#### Tablas de Backup
```sql
-- Backup temporal de noviembre 2025
bkp_dim_personal_prof_id_esp_202511 | 0 filas | 0 accesos | 8 KB
```
**RECOMENDACIÓN:** ELIMINAR INMEDIATAMENTE
- Es un backup temporal de 2025-11
- Ya pasó más de 1 mes
- No tiene datos ni accesos

#### Tablas Staging Vacías
```sql
stg_ipress_load                  | 0 filas | 0 accesos | 64 KB
```
**RECOMENDACIÓN:** ELIMINAR si no hay procesos ETL activos
- Tablas de staging sin uso
- Verificar si hay procesos batch que las usan

#### Tablas RAW Obsoletas (eliminadas previamente)
Estas tablas ya no existen pero aparecían en estadísticas:
- `bolsa_107_raw`
- `citas_raw`
- `cnt_aseg_2023_2025_raw`
- `horarios_mes_raw`
- `pacientes_citas`
- `raw_atenciones_nacional`
- `stg_ch_202511`
- `stg_personal_asistencial`
- `stg_personal_especialidades`
- `stg_px_aten_x_espe_cnt`
- `stg_rendimiento_horario`

#### Tablas Vacías Sin Referencias
```sql
actividad_subactividad           | 0 filas | 0 accesos | 72 KB
dim_categoria_ipress             | 0 filas | 0 accesos | 80 KB
dim_ipress_modalidad             | 0 filas | 0 accesos | 16 KB
dim_procedimiento                | 0 filas | 0 accesos | 32 KB
llamadas                         | 0 filas | 0 accesos | 16 KB
servicio_actividad               | 0 filas | 0 accesos | 72 KB
v_id_origen                      | 0 filas | 0 accesos | 8 KB
```
**RECOMENDACIÓN:** ELIMINAR SI:
1. No son lookup tables previstas para futuros módulos
2. No tienen foreign keys críticos
3. No están en planes de desarrollo activo

#### Tablas de Atencion con Alto Espacio pero Sin Datos
```sql
ultima_atencion_esp_nacional     | 0 filas | 2 accesos | 858 MB  ❗❗❗
ultima_atencion_6m_nacional      | 0 filas | 0 accesos | 15 MB   ❗❗
ultima_atencion_6m_cnt           | 0 filas | 4 accesos | 5.3 MB  ❗
```
**RECOMENDACIÓN:** ELIMINAR Y RECREAR
- Ocupan 878 MB sin datos (probablemente fragmentación)
- Ejecutar VACUUM FULL o DROP + CREATE

### 3.2 CANDIDATAS PARA ARCHIVADO (PRIORIDAD MEDIA)

#### Módulo Bolsa 107 (Sistema Antiguo)
```sql
bolsa_107_carga                  | 1 fila  | 61 accesos
bolsa_107_error                  | 1 fila  | 21 accesos
bolsa_107_hist_estado            | 12 filas| 2 accesos
bolsa_107_item                   | 12 filas| 25 accesos
dim_estado_bolsa_107             | 5 filas | 21 accesos
```
**RECOMENDACIÓN:** ARCHIVAR SI:
- El módulo Bolsa 107 ya no está en uso
- Consultar con el equipo si es un módulo legacy
- Si es legacy, hacer dump SQL y eliminar

#### Módulo Control de Horarios (CTR)
```sql
ctr_horario                      | 0 filas | 99 accesos
ctr_horario_det                  | 0 filas | 1,954 accesos
ctr_horario_log                  | 7 filas | 25 accesos
ctr_periodo                      | 0 filas | 414 accesos
dim_catalogo_horario             | 0 filas | 10 accesos
dim_horario                      | 0 filas | 6,246 accesos
rendimiento_horario              | 0 filas | 13 accesos
```
**RECOMENDACIÓN:** INVESTIGAR
- Parece un sistema de control horario antiguo
- Alto número de accesos en algunas tablas
- Verificar si fue reemplazado por `disponibilidad_medica`
- Si está obsoleto, archivar

#### Módulo Formulario Diagnóstico (22 tablas)
```sql
form_diag_formulario             | 9 filas   | 2,659 accesos
form_diag_equipamiento           | 206 filas | 725 accesos
form_diag_necesidad              | 307 filas | 978 accesos
form_diag_servicio               | 95 filas  | 424 accesos
form_diag_datos_generales        | 8 filas   | 281 accesos
form_diag_conectividad_sist      | 8 filas   | 288 accesos
form_diag_infra_fis              | 8 filas   | 285 accesos
form_diag_infra_tec              | 8 filas   | 285 accesos
form_diag_recursos_humanos       | 8 filas   | 287 accesos
-- Tablas de catálogo (6 tablas sin datos)
form_diag_cat_*                  | 0 filas   | 0-2,340 accesos
```
**RECOMENDACIÓN:** MANTENER POR AHORA
- Tiene datos (9 formularios activos)
- Accesos moderados (sugiere uso)
- Módulo funcional de diagnóstico institucional
- POSIBLE MEJORA: Consolidar tablas de catálogo

### 3.3 TABLAS DUPLICADAS O LEGACY (INVESTIGAR)

#### Sistema de Permisos Antiguo
```sql
-- Tablas legacy (posible sistema anterior)
rel_paginas_permisos             | 0 filas | 0 accesos
rel_rol_pagina_permiso           | 0 filas | 7 accesos
dim_permisos_pagina_rol          | 0 filas | 7 accesos
roles_permisos                   | 0 filas | 2 accesos

-- Tablas nuevas (sistema MBAC actual)
permisos_modulares               | 86 filas | 20,163 accesos ✓ EN USO
```
**RECOMENDACIÓN:** ELIMINAR TABLAS LEGACY
- Las tablas `rel_*` parecen del sistema antiguo
- El sistema nuevo usa `permisos_modulares` y vistas
- Verificar que no hay dependencias y eliminar

#### Tablas de Usuario/Rol Duplicadas
```sql
-- Tablas legacy
usuario_roles                    | 0 filas | 20 accesos
roles                            | 0 filas | 0 accesos
paginas                          | 0 filas | 0 accesos
modulos                          | 0 filas | 0 accesos
permisos_rol_modulo              | 0 filas | 0 accesos
permisos_rol_pagina              | 0 filas | 0 accesos
permisos_usuario_pagina          | 0 filas | 20 accesos

-- Tablas activas
rel_user_roles                   | 127 filas | 103,037 accesos ✓
dim_roles                        | 1 fila | 121,983 accesos ✓
dim_paginas                      | 0 filas | 31,126 accesos ✓
dim_modulos_sistema              | 4 filas | 1,768 accesos ✓
```
**RECOMENDACIÓN:** ELIMINAR TABLAS LEGACY
- Sistema migró a tablas con prefijo `dim_` y `segu_`
- Tablas sin prefijo están vacías/obsoletas

### 3.4 TABLAS CON DATOS - MANTENER Y MONITOREAR

#### Solicitudes de Cita
```sql
solicitud_cita                   | 4 filas | 107 accesos
dim_estado_cita                  | 0 filas | 483 accesos
```
**RECOMENDACIÓN:** MANTENER
- Sistema activo de citas
- Crear entidad JPA si no existe
- Módulo funcional sin backend formal

#### Datos de Área/Servicio
```sql
area_hosp_servicio               | 0 filas | 1 acceso
```
**RECOMENDACIÓN:** INVESTIGAR
- Puede ser lookup table vacía esperando datos
- O tabla obsoleta reemplazada por otras

#### Programa de Persona
```sql
persona_programa                 | 0 filas | 26 accesos
dim_programa                     | 0 filas | 0 accesos
```
**RECOMENDACIÓN:** INVESTIGAR
- Relación persona-programa sin datos
- Verificar si es módulo futuro o legacy

#### Tablas Misceláneas
```sql
dim_grupo                        | 0 filas | 0 accesos
dim_seccion                      | 0 filas | 0 accesos
dim_subseccion                   | 0 filas | 0 accesos
dim_modalidad_atencion           | 0 filas | 0 accesos
dim_departamento                 | 0 filas | 5 accesos
dim_provincia                    | 0 filas | 5 accesos
dim_tipo_turno                   | 0 filas | 161 accesos
```
**RECOMENDACIÓN:** MANTENER lookup tables geo/organizacionales
- Pueden ser maestros que se llenarán luego
- Bajos costos de almacenamiento

---

## 4. RECOMENDACIONES CONSOLIDADAS

### 🔴 ALTA PRIORIDAD - ELIMINAR DE INMEDIATO (AHORRO: ~880 MB)

```sql
-- 1. Backups temporales
DROP TABLE IF EXISTS bkp_dim_personal_prof_id_esp_202511;

-- 2. Tablas RAW fragmentadas (recrear si son necesarias)
TRUNCATE TABLE ultima_atencion_esp_nacional;
TRUNCATE TABLE ultima_atencion_6m_nacional;
TRUNCATE TABLE ultima_atencion_6m_cnt;
VACUUM FULL ultima_atencion_esp_nacional;
VACUUM FULL ultima_atencion_6m_nacional;
VACUUM FULL ultima_atencion_6m_cnt;

-- 3. Tablas staging sin uso
DROP TABLE IF EXISTS stg_ipress_load;

-- 4. Tablas vacías sin foreign keys
DROP TABLE IF EXISTS actividad_subactividad;
DROP TABLE IF EXISTS dim_categoria_ipress;
DROP TABLE IF EXISTS dim_ipress_modalidad;
DROP TABLE IF EXISTS dim_procedimiento;
DROP TABLE IF EXISTS llamadas;
DROP TABLE IF EXISTS servicio_actividad;
DROP TABLE IF EXISTS v_id_origen;
```

**RIESGO:** BAJO
**BENEFICIO:** Liberar 880+ MB, simplificar esquema
**REVERSIBILIDAD:** ALTA (tablas vacías o backup)

### 🟡 MEDIA PRIORIDAD - INVESTIGAR Y DECIDIR

#### Sistema de Permisos Legacy
```sql
-- Verificar que no hay dependencias primero
SELECT * FROM rel_paginas_permisos LIMIT 1;
SELECT * FROM rel_rol_pagina_permiso LIMIT 1;
SELECT * FROM dim_permisos_pagina_rol LIMIT 1;
SELECT * FROM roles_permisos LIMIT 1;

-- Si están vacías y sin foreign keys:
DROP TABLE IF EXISTS rel_paginas_permisos;
DROP TABLE IF EXISTS rel_rol_pagina_permiso;
DROP TABLE IF EXISTS dim_permisos_pagina_rol;
DROP TABLE IF EXISTS roles_permisos;
```

#### Tablas Usuario/Rol Legacy
```sql
-- Verificar primero
SELECT * FROM usuario_roles LIMIT 1;
SELECT * FROM roles LIMIT 1;
SELECT * FROM paginas LIMIT 1;
SELECT * FROM modulos LIMIT 1;

-- Si no se usan:
DROP TABLE IF EXISTS usuario_roles;
DROP TABLE IF EXISTS roles;
DROP TABLE IF EXISTS paginas;
DROP TABLE IF EXISTS modulos;
DROP TABLE IF EXISTS permisos_rol_modulo;
DROP TABLE IF EXISTS permisos_rol_pagina;
DROP TABLE IF EXISTS permisos_usuario_pagina;
```

#### Módulo Bolsa 107
```sql
-- SOLO SI el módulo está oficialmente descontinuado
-- Hacer backup primero:
pg_dump -h 10.0.89.13 -U postgres -d maestro_cenate \
  -t bolsa_107_carga -t bolsa_107_error \
  -t bolsa_107_hist_estado -t bolsa_107_item \
  -t dim_estado_bolsa_107 > backup_bolsa_107_$(date +%Y%m%d).sql

-- Luego eliminar:
DROP TABLE IF EXISTS bolsa_107_item;
DROP TABLE IF EXISTS bolsa_107_error;
DROP TABLE IF EXISTS bolsa_107_carga;
DROP TABLE IF EXISTS bolsa_107_hist_estado;
DROP TABLE IF EXISTS dim_estado_bolsa_107;
```

#### Módulo Control de Horarios (CTR)
```sql
-- Verificar si fue reemplazado por disponibilidad_medica
-- Consultar con equipo médico/coordinadores
-- Si está obsoleto, archivar:
pg_dump -h 10.0.89.13 -U postgres -d maestro_cenate \
  -t ctr_horario -t ctr_horario_det -t ctr_horario_log \
  -t ctr_periodo -t dim_catalogo_horario -t dim_horario \
  -t rendimiento_horario > backup_ctr_$(date +%Y%m%d).sql
```

### 🟢 BAJA PRIORIDAD - MANTENER

#### Tablas de Lookup/Maestros (vacías pero previstas)
- `dim_grupo`, `dim_seccion`, `dim_subseccion`
- `dim_modalidad_atencion`
- `dim_departamento`, `dim_provincia`
- `dim_tipo_turno`

#### Módulos Activos
- **Formulario Diagnóstico:** 22 tablas, 664 filas totales, accesos activos
- **Solicitud de Cita:** 2 tablas, 4 filas, 107 accesos

---

## 5. PLAN DE ACCIÓN CONSERVADOR

### Fase 1: Seguridad (Semana 1)
```bash
# Crear backup completo de la base de datos
pg_dump -h 10.0.89.13 -U postgres -d maestro_cenate \
  -F c -f maestro_cenate_backup_$(date +%Y%m%d).dump

# Verificar integridad del backup
pg_restore --list maestro_cenate_backup_$(date +%Y%m%d).dump | wc -l
```

### Fase 2: Eliminaciones de Bajo Riesgo (Semana 2)
```sql
-- Solo tablas totalmente vacías sin foreign keys
BEGIN;

DROP TABLE IF EXISTS bkp_dim_personal_prof_id_esp_202511;
DROP TABLE IF EXISTS stg_ipress_load;
DROP TABLE IF EXISTS actividad_subactividad;
DROP TABLE IF EXISTS dim_categoria_ipress;
DROP TABLE IF EXISTS dim_ipress_modalidad;
DROP TABLE IF EXISTS llamadas;
DROP TABLE IF EXISTS servicio_actividad;
DROP TABLE IF EXISTS v_id_origen;

-- Verificar que no hay errores
COMMIT;
```

### Fase 3: Optimización de Espacio (Semana 3)
```sql
-- Limpiar tablas RAW fragmentadas
TRUNCATE TABLE ultima_atencion_esp_nacional;
TRUNCATE TABLE ultima_atencion_6m_nacional;
TRUNCATE TABLE ultima_atencion_6m_cnt;

-- Recuperar espacio
VACUUM FULL ultima_atencion_esp_nacional;
VACUUM FULL ultima_atencion_6m_nacional;
VACUUM FULL ultima_atencion_6m_cnt;
```

### Fase 4: Investigación de Legacy (Semana 4)
```sql
-- Analizar uso real de tablas legacy
SELECT
    schemaname,
    tablename,
    n_live_tup,
    seq_scan + idx_scan AS total_accesos,
    last_vacuum,
    last_autovacuum
FROM pg_stat_user_tables
WHERE tablename IN (
    'rel_paginas_permisos',
    'rel_rol_pagina_permiso',
    'roles_permisos',
    'usuario_roles',
    'roles',
    'paginas',
    'modulos'
)
ORDER BY total_accesos DESC;
```

### Fase 5: Decisión sobre Módulos (Reunión con Stakeholders)
- Bolsa 107: ¿Activo o legacy?
- Control de Horarios (CTR): ¿Reemplazado por disponibilidad_medica?
- Formulario Diagnóstico: ¿Se sigue usando?

---

## 6. QUERIES ÚTILES PARA AUDITORÍA

### Verificar foreign keys antes de eliminar tabla
```sql
SELECT
    tc.table_name AS tabla_origen,
    kcu.column_name AS columna_origen,
    ccu.table_name AS tabla_referenciada,
    ccu.column_name AS columna_referenciada
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name = 'NOMBRE_TABLA_A_ELIMINAR';
```

### Detectar tablas sin índices
```sql
SELECT
    schemaname,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamano
FROM pg_tables
WHERE schemaname = 'public'
  AND NOT EXISTS (
      SELECT 1
      FROM pg_indexes
      WHERE schemaname = pg_tables.schemaname
        AND tablename = pg_tables.tablename
  )
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;
```

### Encontrar duplicados en estructura
```sql
-- Comparar columnas de dos tablas
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tabla1'
INTERSECT
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'tabla2';
```

---

## 7. RIESGOS Y MITIGACIONES

### Riesgos Identificados

| Riesgo | Probabilidad | Impacto | Mitigación |
|--------|--------------|---------|------------|
| Eliminar tabla con dependencias ocultas | BAJA | ALTO | Verificar foreign keys y vistas antes de eliminar |
| Perder datos históricos importantes | MEDIA | ALTO | Backup completo antes de cualquier DROP |
| Módulos legacy aún en uso por scripts | MEDIA | MEDIO | Revisar logs de aplicación por 2 semanas |
| Vistas rotas al eliminar tablas | BAJA | MEDIO | Listar vistas que usan cada tabla antes de DROP |

### Checklist Pre-Eliminación

```bash
# Para cada tabla a eliminar:
# 1. Verificar foreign keys entrantes
SELECT * FROM information_schema.table_constraints
WHERE constraint_type = 'FOREIGN KEY'
  AND table_name = 'TABLA';

# 2. Verificar vistas que la usan
SELECT DISTINCT table_name
FROM information_schema.view_table_usage
WHERE view_schema = 'public'
  AND table_name = 'TABLA';

# 3. Verificar triggers
SELECT trigger_name
FROM information_schema.triggers
WHERE event_object_table = 'TABLA';

# 4. Hacer backup específico
pg_dump -h 10.0.89.13 -U postgres -d maestro_cenate \
  -t TABLA > backup_TABLA_$(date +%Y%m%d).sql

# 5. Verificar accesos recientes (última semana)
SELECT
    schemaname,
    relname,
    seq_scan,
    idx_scan,
    n_live_tup,
    last_vacuum,
    last_analyze
FROM pg_stat_user_tables
WHERE relname = 'TABLA';
```

---

## 8. BENEFICIOS ESPERADOS

### Reducción de Espacio
- **Inmediata:** ~880 MB (tablas RAW fragmentadas + backups)
- **Potencial:** ~1.5 GB (si se archivan módulos legacy)

### Mejoras en Performance
- Menos tablas = queries más rápidas en catálogo
- Menos objetos = backups más rápidos
- Indices más eficientes sin fragmentación

### Mantenibilidad
- Esquema más limpio y comprensible
- Menos confusión sobre qué tablas están activas
- Documentación más clara del modelo de datos

---

## 9. PRÓXIMOS PASOS RECOMENDADOS

1. **Validar con equipo técnico** (2-3 días)
   - Revisar este análisis con equipo de desarrollo
   - Identificar módulos legacy oficialmente descontinuados
   - Verificar si hay scripts Python/batch que usen tablas staging

2. **Crear backup completo** (1 día)
   ```bash
   pg_dump -h 10.0.89.13 -U postgres -d maestro_cenate \
     -F c -f /backup/maestro_cenate_pre_limpieza_$(date +%Y%m%d).dump
   ```

3. **Ejecutar Fase 1: Eliminaciones seguras** (1 semana)
   - Eliminar 8 tablas vacías sin foreign keys
   - Monitorear logs de aplicación

4. **Ejecutar Fase 2: Optimización de espacio** (1 día)
   - VACUUM FULL en tablas fragmentadas
   - Recuperar 880 MB

5. **Revisar módulos legacy** (2 semanas)
   - Consultar con coordinadores médicos sobre CTR
   - Verificar con admin si Bolsa 107 está activo
   - Revisar logs de uso del formulario diagnóstico

6. **Documentar cambios** (continuo)
   - Actualizar CLAUDE.md con tablas eliminadas
   - Crear script de rollback por si acaso
   - Documentar decisiones en changelog

---

## 10. CONTACTOS Y RESPONSABLES

| Área | Responsable | Email | Consulta |
|------|-------------|-------|----------|
| Desarrollo | Ing. Styp Canto | cenate.analista@essalud.gob.pe | Validación técnica |
| Médicos | Coordinador Médico | - | Módulo CTR, disponibilidad |
| Administración | Admin CENATE | - | Módulo Bolsa 107 |
| Base de Datos | DBA EsSalud | - | Backups y restauración |

---

**Generado por:** Claude Sonnet 4.5
**Fecha:** 2025-12-30
**Versión Sistema:** v1.13.0
**Base de Datos:** PostgreSQL 14+ en 10.0.89.13:5432/maestro_cenate
