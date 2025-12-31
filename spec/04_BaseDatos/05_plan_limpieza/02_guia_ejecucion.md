# Guía de Ejecución Paso a Paso - Limpieza Fase 1

## Información General

| Propiedad | Valor |
|-----------|-------|
| **Fase** | 1 - Bajo Riesgo |
| **Duración Estimada** | 3-4 horas |
| **Ventana de Mantenimiento** | 02:00 - 06:00 (Madrugada) |
| **Riesgo** | BAJO |
| **Reversible** | SÍ (backup completo) |
| **Requiere Downtime** | SÍ (solo durante VACUUM FULL) |

---

## Pre-requisitos

### Verificaciones Técnicas

- [ ] PostgreSQL 14+ instalado y accesible
- [ ] Usuario con privilegios de DBA (postgres)
- [ ] Espacio en disco para backups (mínimo 8 GB)
- [ ] Conexión estable a servidor BD (10.0.89.13:5432)
- [ ] Herramientas instaladas: psql, pg_dump, pg_restore

### Verificaciones Operacionales

- [ ] Equipo técnico notificado
- [ ] Usuarios finales notificados (ventana de mantenimiento)
- [ ] Monitoreo activo configurado
- [ ] Script de rollback preparado
- [ ] Ambiente de desarrollo probado
- [ ] Aprobación de jefe de proyecto

---

## Paso 1: Preparación (30 minutos)

### 1.1 Crear Backup Completo

```bash
# Conectar al servidor (si es remoto)
ssh usuario@10.0.89.13

# Crear directorio de backups
mkdir -p /backup/maestro_cenate/fase1
cd /backup/maestro_cenate/fase1

# Backup completo (tarda ~30-45 minutos)
PGPASSWORD=Essalud2025 pg_dump \
  -h 10.0.89.13 \
  -U postgres \
  -d maestro_cenate \
  -F c \
  -f maestro_cenate_pre_limpieza_fase1_$(date +%Y%m%d_%H%M).dump \
  --verbose

# Verificar tamaño del backup
ls -lh maestro_cenate_pre_limpieza_fase1_*.dump
# Esperado: ~4-5 GB

# Verificar integridad del backup
PGPASSWORD=Essalud2025 pg_restore \
  --list maestro_cenate_pre_limpieza_fase1_*.dump | wc -l
# Esperado: >500 objetos
```

**Tiempo Estimado:** 30-45 minutos

**Checklist:**
- [ ] Backup creado exitosamente
- [ ] Tamaño del backup es razonable (~4-5 GB)
- [ ] Integridad verificada (>500 objetos listados)
- [ ] Archivo backup accesible y con permisos correctos

---

### 1.2 Backup de Tablas Específicas (Seguridad Adicional)

```bash
# Backup solo de las tablas a eliminar
PGPASSWORD=Essalud2025 pg_dump \
  -h 10.0.89.13 \
  -U postgres \
  -d maestro_cenate \
  -t bkp_dim_personal_prof_id_esp_202511 \
  -t stg_ipress_load \
  -t actividad_subactividad \
  -t dim_categoria_ipress \
  -t dim_ipress_modalidad \
  -t dim_procedimiento \
  -t llamadas \
  -t servicio_actividad \
  -t v_id_origen \
  --verbose \
  > tablas_a_eliminar_fase1_$(date +%Y%m%d).sql

# Verificar contenido
head -50 tablas_a_eliminar_fase1_*.sql
```

**Tiempo Estimado:** 2-3 minutos

**Checklist:**
- [ ] Backup de tablas específicas creado
- [ ] Archivo SQL legible y con estructura correcta

---

### 1.3 Preparar Entorno de Ejecución

```bash
# Copiar script de limpieza al servidor
scp 02_scripts_limpieza_fase1.sql usuario@10.0.89.13:/tmp/

# O descargarlo si está en repositorio
# curl -o /tmp/limpieza_fase1.sql https://ruta/al/script.sql

# Conectarse al servidor
ssh usuario@10.0.89.13

# Verificar que el script está disponible
ls -lh /tmp/02_scripts_limpieza_fase1.sql
```

**Checklist:**
- [ ] Script SQL disponible en servidor
- [ ] Permisos de lectura correctos

---

## Paso 2: Análisis Previo (15 minutos)

### 2.1 Conectar a la Base de Datos

```bash
PGPASSWORD=Essalud2025 psql \
  -h 10.0.89.13 \
  -U postgres \
  -d maestro_cenate
```

**Salida esperada:**
```
psql (14.x)
SSL connection (protocol: TLSv1.3, cipher: TLS_AES_256_GCM_SHA384, bits: 256)
Type "help" for help.

maestro_cenate=#
```

---

### 2.2 Verificar Estado Actual

```sql
-- Ver tamaño actual de la BD
SELECT pg_size_pretty(pg_database_size('maestro_cenate'));
```

**Resultado esperado:** ~5.4 GB

```sql
-- Contar tablas actuales
SELECT COUNT(*) AS total_tablas
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
```

**Resultado esperado:** ~135 tablas

```sql
-- Verificar que las tablas a eliminar existen
SELECT tablename
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'bkp_dim_personal_prof_id_esp_202511',
    'stg_ipress_load',
    'actividad_subactividad',
    'dim_categoria_ipress',
    'dim_ipress_modalidad',
    'dim_procedimiento',
    'llamadas',
    'servicio_actividad',
    'v_id_origen'
  )
ORDER BY tablename;
```

**Resultado esperado:** 9 tablas listadas

---

### 2.3 Ejecutar Análisis Previo del Script

```sql
-- Ejecutar solo la sección de ANÁLISIS PREVIO del script
\i /tmp/02_scripts_limpieza_fase1.sql
```

**Revisar resultados:**

1. **Tablas vacías:** Todas deben tener 0 filas
2. **Foreign keys entrantes:** 0 (sin dependencias)
3. **Vistas dependientes:** 0 (sin vistas que las usen)
4. **Triggers:** 0 (sin triggers activos)
5. **Espacio a liberar:** ~350-400 KB (tablas vacías)

**Checklist:**
- [ ] Todas las tablas tienen 0 filas
- [ ] No hay foreign keys entrantes
- [ ] No hay vistas dependientes
- [ ] No hay triggers
- [ ] Espacio calculado es razonable

---

### 2.4 Análisis de Tablas RAW (Fragmentación)

```sql
-- Verificar tamaño de tablas RAW
SELECT
    tablename,
    n_live_tup AS filas,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamano
FROM pg_tables t
LEFT JOIN pg_stat_user_tables s ON t.tablename = s.relname
WHERE schemaname = 'public'
  AND tablename IN (
    'ultima_atencion_esp_nacional',
    'ultima_atencion_6m_nacional',
    'ultima_atencion_6m_cnt'
  );
```

**Resultado esperado:**
```
         tablename                | filas |  tamano
----------------------------------+-------+----------
 ultima_atencion_esp_nacional     |     0 | 858 MB   ❗❗❗
 ultima_atencion_6m_nacional      |     0 | 15 MB    ❗
 ultima_atencion_6m_cnt           |     0 | 5.3 MB   ❗
```

**Checklist:**
- [ ] Las 3 tablas tienen 0 filas
- [ ] Ocupan espacio significativo (fragmentadas)
- [ ] Total a recuperar: ~880 MB

---

## Paso 3: Eliminación de Tablas Vacías (30 minutos)

### 3.1 Iniciar Transacción

```sql
BEGIN;
```

---

### 3.2 Registrar Inicio en Auditoría

```sql
INSERT INTO audit_logs (usuario_sesion, accion, modulo, detalle, nivel, estado)
VALUES ('SYSTEM', 'DATABASE_CLEANUP', 'MANTENIMIENTO',
        'Inicio Fase 1: Eliminación de tablas obsoletas', 'INFO', 'SUCCESS');
```

**Salida esperada:**
```
INSERT 0 1
```

---

### 3.3 Eliminar Tablas Una por Una

```sql
-- 1. Backup temporal (obsoleto)
DROP TABLE IF EXISTS bkp_dim_personal_prof_id_esp_202511 CASCADE;
-- DROP TABLE

-- 2. Staging sin uso
DROP TABLE IF EXISTS stg_ipress_load CASCADE;
-- DROP TABLE

-- 3. Tablas vacías sin dependencias
DROP TABLE IF EXISTS actividad_subactividad CASCADE;
-- DROP TABLE

DROP TABLE IF EXISTS dim_categoria_ipress CASCADE;
-- DROP TABLE

DROP TABLE IF EXISTS dim_ipress_modalidad CASCADE;
-- DROP TABLE

DROP TABLE IF EXISTS dim_procedimiento CASCADE;
-- DROP TABLE

DROP TABLE IF EXISTS llamadas CASCADE;
-- DROP TABLE

DROP TABLE IF EXISTS servicio_actividad CASCADE;
-- DROP TABLE

DROP TABLE IF EXISTS v_id_origen CASCADE;
-- DROP TABLE
```

**Cada comando debe retornar:** `DROP TABLE`

---

### 3.4 Verificar Eliminación

```sql
-- Verificar que las tablas ya no existen (debe retornar 0)
SELECT COUNT(*) AS tablas_restantes
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_name IN (
    'bkp_dim_personal_prof_id_esp_202511',
    'stg_ipress_load',
    'actividad_subactividad',
    'dim_categoria_ipress',
    'dim_ipress_modalidad',
    'dim_procedimiento',
    'llamadas',
    'servicio_actividad',
    'v_id_origen'
  );
```

**Resultado esperado:** 0

**Si el resultado es 0, CONTINUAR. Si no, ROLLBACK y revisar.**

---

### 3.5 Registrar Finalización

```sql
INSERT INTO audit_logs (usuario_sesion, accion, modulo, detalle, nivel, estado)
VALUES ('SYSTEM', 'DATABASE_CLEANUP', 'MANTENIMIENTO',
        'Fase 1: Eliminadas 9 tablas obsoletas', 'INFO', 'SUCCESS');
```

---

### 3.6 Confirmar Transacción

```sql
COMMIT;
```

**Salida esperada:**
```
COMMIT
```

**Checklist:**
- [ ] Transacción confirmada (COMMIT exitoso)
- [ ] 9 tablas eliminadas
- [ ] Registros de auditoría creados
- [ ] Verificación retornó 0 tablas restantes

---

## Paso 4: VACUUM FULL (2-3 horas)

**ADVERTENCIA:** Este paso BLOQUEA las tablas durante la operación.
Ejecutar SOLO en horario de baja actividad (02:00 - 05:00).

### 4.1 Notificar al Equipo

```
MENSAJE INTERNO:
"Se iniciará VACUUM FULL en 3 tablas RAW.
Duración estimada: 2-3 horas.
Sistema en modo mantenimiento.
Evitar acceso a BD durante este periodo."
```

---

### 4.2 Truncar Tablas RAW (Eliminar Datos Residuales)

```sql
BEGIN;

TRUNCATE TABLE ultima_atencion_esp_nacional;
-- TRUNCATE TABLE

TRUNCATE TABLE ultima_atencion_6m_nacional;
-- TRUNCATE TABLE

TRUNCATE TABLE ultima_atencion_6m_cnt;
-- TRUNCATE TABLE

COMMIT;
```

---

### 4.3 Ejecutar VACUUM FULL

**IMPORTANTE:** VACUUM FULL NO soporta transacciones (no se puede hacer ROLLBACK).

```sql
-- Tabla 1: ~858 MB a recuperar (tarda ~45-60 minutos)
VACUUM FULL ANALYZE VERBOSE ultima_atencion_esp_nacional;
```

**Salida esperada:**
```
INFO:  vacuuming "public.ultima_atencion_esp_nacional"
INFO:  "ultima_atencion_esp_nacional": found 0 removable, 0 nonremovable row versions
INFO:  "ultima_atencion_esp_nacional": truncated 0 to 0 pages
INFO:  analyzing "public.ultima_atencion_esp_nacional"
VACUUM
```

---

```sql
-- Tabla 2: ~15 MB a recuperar (tarda ~5-10 minutos)
VACUUM FULL ANALYZE VERBOSE ultima_atencion_6m_nacional;
```

---

```sql
-- Tabla 3: ~5 MB a recuperar (tarda ~2-5 minutos)
VACUUM FULL ANALYZE VERBOSE ultima_atencion_6m_cnt;
```

---

### 4.4 Registrar en Auditoría

```sql
INSERT INTO audit_logs (usuario_sesion, accion, modulo, detalle, nivel, estado)
VALUES ('SYSTEM', 'DATABASE_CLEANUP', 'MANTENIMIENTO',
        'VACUUM FULL ejecutado en tablas RAW, ~880 MB recuperados', 'INFO', 'SUCCESS');
```

---

### 4.5 Monitorear Progreso

**En otra terminal (mientras VACUUM corre):**

```sql
-- Ver procesos activos
SELECT
    pid,
    usename,
    query,
    state,
    NOW() - query_start AS duration
FROM pg_stat_activity
WHERE query LIKE '%VACUUM%'
  AND state != 'idle';
```

**Checklist durante VACUUM:**
- [ ] Proceso VACUUM visible en pg_stat_activity
- [ ] No hay errores en logs de PostgreSQL
- [ ] Espacio en disco no se agota
- [ ] Tiempo de ejecución dentro de lo esperado

---

## Paso 5: Verificación Post-Limpieza (15 minutos)

### 5.1 Verificar Tamaño de Tablas RAW

```sql
SELECT
    tablename,
    n_live_tup AS filas,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamano_actual
FROM pg_tables t
LEFT JOIN pg_stat_user_tables s ON t.tablename = s.relname
WHERE schemaname = 'public'
  AND tablename IN (
    'ultima_atencion_esp_nacional',
    'ultima_atencion_6m_nacional',
    'ultima_atencion_6m_cnt'
  );
```

**Resultado esperado:**
```
         tablename                | filas | tamano_actual
----------------------------------+-------+---------------
 ultima_atencion_esp_nacional     |     0 | 8192 bytes ✓
 ultima_atencion_6m_nacional      |     0 | 8192 bytes ✓
 ultima_atencion_6m_cnt           |     0 | 8192 bytes ✓
```

**Checklist:**
- [ ] Las 3 tablas ahora ocupan ~8 KB cada una
- [ ] Espacio recuperado: ~880 MB

---

### 5.2 Verificar Tamaño Total de BD

```sql
SELECT pg_size_pretty(pg_database_size('maestro_cenate')) AS tamano_bd;
```

**Resultado esperado:**
```
 tamano_bd
-----------
 4.5 GB    (antes: 5.4 GB)
```

**Espacio recuperado total:** ~900 MB

---

### 5.3 Contar Tablas Activas

```sql
SELECT COUNT(*) AS total_tablas
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';
```

**Resultado esperado:** ~126 tablas (antes: 135)

---

### 5.4 Top 20 Tablas por Tamaño

```sql
SELECT
    schemaname || '.' || tablename AS tabla,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamano,
    n_live_tup AS filas
FROM pg_tables t
JOIN pg_stat_user_tables s ON t.tablename = s.relname
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;
```

**Verificar que las tablas RAW ya no aparecen en el top 20.**

---

### 5.5 Actualizar Estadísticas

```sql
ANALYZE VERBOSE;
```

**Tiempo estimado:** 5-10 minutos

---

## Paso 6: Pruebas de Funcionalidad (30 minutos)

### 6.1 Verificar Aplicación Web

1. **Login de Usuario**
   - Acceder a http://localhost:3000 (desarrollo) o http://10.0.89.239 (producción)
   - Iniciar sesión con usuario de prueba
   - Verificar que el login funciona correctamente

2. **Dashboard Médico**
   - Navegar al dashboard de médico
   - Verificar que las cards se cargan
   - Verificar disponibilidad médica

3. **Dashboard Administrativo**
   - Navegar al panel de admin
   - Verificar listado de usuarios
   - Verificar módulo de auditoría
   - Verificar permisos MBAC

**Checklist:**
- [ ] Login funciona correctamente
- [ ] Dashboard médico carga sin errores
- [ ] Dashboard admin carga sin errores
- [ ] No hay errores en consola del navegador

---

### 6.2 Verificar Logs de Aplicación

```bash
# Ver logs del backend (últimos 100)
tail -100 /ruta/logs/backend.log

# O si está en Docker
docker logs cenate-backend --tail=100

# Buscar errores
grep -i "error" /ruta/logs/backend.log | tail -20
grep -i "exception" /ruta/logs/backend.log | tail -20
```

**Checklist:**
- [ ] No hay errores relacionados con tablas eliminadas
- [ ] No hay errores de SQL
- [ ] No hay excepciones inesperadas

---

### 6.3 Verificar Logs de PostgreSQL

```bash
# Ver logs de PostgreSQL (ubicación varía según instalación)
tail -100 /var/log/postgresql/postgresql-14-main.log

# Buscar errores
grep "ERROR" /var/log/postgresql/postgresql-14-main.log | tail -20
```

**Checklist:**
- [ ] No hay errores de "relation does not exist"
- [ ] No hay errores de foreign keys rotos
- [ ] No hay errores de vistas rotas

---

## Paso 7: Registro Final y Documentación (15 minutos)

### 7.1 Crear Registro en Changelog

Editar `spec/002_changelog.md`:

```markdown
## v1.14.0 - Limpieza de Base de Datos Fase 1 (2025-12-30)

### Optimización de Base de Datos

#### Eliminado
- Tablas backup temporales obsoletas (1):
  - `bkp_dim_personal_prof_id_esp_202511`
- Tablas staging sin uso (1):
  - `stg_ipress_load`
- Tablas vacías sin dependencias (7):
  - `actividad_subactividad`
  - `dim_categoria_ipress`
  - `dim_ipress_modalidad`
  - `dim_procedimiento`
  - `llamadas`
  - `servicio_actividad`
  - `v_id_origen`

#### Optimizado
- VACUUM FULL ejecutado en tablas RAW fragmentadas (3):
  - `ultima_atencion_esp_nacional` (~858 MB recuperados)
  - `ultima_atencion_6m_nacional` (~15 MB recuperados)
  - `ultima_atencion_6m_cnt` (~5 MB recuperados)

#### Resultados
- **Espacio recuperado:** ~880 MB (16% del total de BD)
- **Tablas eliminadas:** 9
- **Tamaño BD:** 5.4 GB → 4.5 GB
- **Total tablas:** 135 → 126
- **Tiempo de backup:** Reducción estimada de 15%

#### Backups Creados
- Backup completo: `maestro_cenate_pre_limpieza_fase1_20251230.dump` (4.8 GB)
- Backup tablas eliminadas: `tablas_a_eliminar_fase1_20251230.sql` (12 KB)

#### Notas Técnicas
- Ejecutado en ventana de mantenimiento: 02:00 - 05:30
- Sin incidentes reportados
- Monitoreo activo durante 48 horas post-ejecución
- Rollback disponible si es necesario
```

---

### 7.2 Actualizar Documentación CLAUDE.md

Editar `/Users/styp/Documents/CENATE/Chatbot/API_Springboot/mini_proyecto_cenate/CLAUDE.md`:

Actualizar sección de base de datos:

```markdown
### Estadísticas Generales (Actualizado 2025-12-30)
- **Total de tablas:** 126 (reducido de 135)
- **Tamaño total BD:** 4.5 GB (reducido de 5.4 GB)
- **Espacio recuperado:** 880 MB (optimización Fase 1)
```

---

### 7.3 Enviar Reporte a Stakeholders

```
ASUNTO: [COMPLETADO] Limpieza de Base de Datos - Fase 1

Estimados,

Se ha completado exitosamente la Fase 1 de limpieza de base de datos
del sistema CENATE.

RESULTADOS:
- Espacio recuperado: 880 MB (16% del total)
- Tablas eliminadas: 9 (obsoletas/vacías)
- Tamaño BD: 5.4 GB → 4.5 GB
- Tiempo total: 4 horas

IMPACTO EN USUARIOS:
- NINGUNO - Todas las operaciones fueron transparentes
- Sin downtime para usuarios finales
- Sistema funciona normalmente

VERIFICACIONES POST-EJECUCIÓN:
✓ Login y autenticación funcionan correctamente
✓ Dashboard médico operativo
✓ Dashboard administrativo operativo
✓ Módulo de auditoría funcional
✓ Sin errores en logs de aplicación
✓ Sin errores en logs de base de datos

PRÓXIMOS PASOS:
- Monitoreo activo por 48 horas
- Si todo está OK, proceder con Fase 2 (validación de tablas legacy)

BACKUP:
- Backup completo disponible para rollback si es necesario
- Ubicación: /backup/maestro_cenate/fase1/

Adjunto documentación técnica detallada.

Saludos,
Ing. Styp Canto Rondon
DBA - Proyecto CENATE
```

---

## Paso 8: Monitoreo Post-Ejecución (48 horas)

### 8.1 Checklist de Monitoreo (Día 1)

**Cada 4 horas durante las primeras 24 horas:**

- [ ] Verificar logs de aplicación
- [ ] Verificar logs de PostgreSQL
- [ ] Revisar uso de disco (debe haber +880 MB libre)
- [ ] Verificar performance de queries
- [ ] Confirmar que no hay errores de usuarios

### 8.2 Checklist de Monitoreo (Día 2)

**Cada 8 horas durante las siguientes 24 horas:**

- [ ] Verificar logs de aplicación
- [ ] Verificar logs de PostgreSQL
- [ ] Confirmar estabilidad del sistema
- [ ] Revisar feedback de usuarios

### 8.3 Queries de Monitoreo

```sql
-- Verificar espacio en disco
SELECT pg_size_pretty(pg_database_size('maestro_cenate'));

-- Verificar actividad reciente
SELECT COUNT(*) AS registros_auditoria_hoy
FROM audit_logs
WHERE timestamp::DATE = CURRENT_DATE;

-- Verificar sesiones activas
SELECT COUNT(*) AS sesiones_activas
FROM active_sessions
WHERE logout_time IS NULL;

-- Verificar queries lentas (si pg_stat_statements está activo)
SELECT
    query,
    calls,
    mean_time,
    max_time
FROM pg_stat_statements
WHERE mean_time > 100
ORDER BY mean_time DESC
LIMIT 10;
```

---

## Checklist Final de Fase 1

- [ ] Backup completo creado y verificado
- [ ] 9 tablas eliminadas exitosamente
- [ ] VACUUM FULL ejecutado en 3 tablas RAW
- [ ] 880 MB de espacio recuperado
- [ ] Tamaño BD reducido de 5.4 GB a 4.5 GB
- [ ] Estadísticas de BD actualizadas
- [ ] Aplicación web funcionando correctamente
- [ ] Sin errores en logs de aplicación
- [ ] Sin errores en logs de PostgreSQL
- [ ] Documentación actualizada (CHANGELOG, CLAUDE.md)
- [ ] Stakeholders notificados
- [ ] Monitoreo activo configurado
- [ ] Rollback disponible si es necesario

---

## Procedimiento de Rollback (Si es Necesario)

### Cuándo Hacer Rollback

- Errores críticos en aplicación después de limpieza
- Errores de foreign keys o vistas rotas
- Pérdida de funcionalidad no detectada previamente
- Solicitud de stakeholders

### Cómo Hacer Rollback

```bash
# Restaurar backup completo
PGPASSWORD=Essalud2025 pg_restore \
  -h 10.0.89.13 \
  -U postgres \
  -d maestro_cenate \
  -c -F c \
  /backup/maestro_cenate/fase1/maestro_cenate_pre_limpieza_fase1_*.dump \
  --verbose

# O restaurar tablas específicas
PGPASSWORD=Essalud2025 psql \
  -h 10.0.89.13 \
  -U postgres \
  -d maestro_cenate \
  < /backup/maestro_cenate/fase1/tablas_a_eliminar_fase1_*.sql
```

---

## Contactos de Soporte

| Rol | Nombre | Email | Teléfono |
|-----|--------|-------|----------|
| **DBA Principal** | Ing. Styp Canto | cenate.analista@essalud.gob.pe | - |
| **Jefe de Proyecto** | - | - | - |
| **Soporte 24/7** | - | - | - |

---

**Generado:** 2025-12-30
**Versión:** v1.14.0
**Autor:** Ing. Styp Canto Rondon
**Última Actualización:** 2025-12-30
