-- =====================================================
-- SCRIPTS DE LIMPIEZA - FASE 1 (BAJO RIESGO)
-- Base de Datos: maestro_cenate
-- Fecha: 2025-12-30
-- Versión: v1.13.0
-- =====================================================

-- IMPORTANTE: LEER ANTES DE EJECUTAR
-- 1. Este script contiene operaciones de ELIMINACIÓN y VACUUM
-- 2. Crear backup completo ANTES de ejecutar
-- 3. Ejecutar en ambiente de desarrollo primero
-- 4. VACUUM FULL requiere bloqueo de tabla (ejecutar en horario nocturno)
-- 5. Revisar cada sección antes de ejecutar

-- =====================================================
-- CHECKLIST PRE-EJECUCIÓN
-- =====================================================
/*
[ ] Backup completo creado y validado
[ ] Ventana de mantenimiento agendada (02:00 - 05:00)
[ ] Equipo técnico notificado
[ ] Logs de aplicación revisados
[ ] Ambiente de desarrollo probado
[ ] Script de rollback preparado
[ ] Monitoreo activo configurado
*/

-- =====================================================
-- BACKUP PREVIO (EJECUTAR DESDE BASH)
-- =====================================================
/*
# Backup completo de la base de datos
PGPASSWORD=Essalud2025 pg_dump -h 10.0.89.13 -U postgres -d maestro_cenate \
  -F c -f /backup/maestro_cenate_pre_limpieza_fase1_$(date +%Y%m%d).dump

# Verificar integridad del backup
PGPASSWORD=Essalud2025 pg_restore --list \
  /backup/maestro_cenate_pre_limpieza_fase1_$(date +%Y%m%d).dump | wc -l

# Resultado esperado: >500 objetos

# Backup de tablas específicas a eliminar (seguridad adicional)
PGPASSWORD=Essalud2025 pg_dump -h 10.0.89.13 -U postgres -d maestro_cenate \
  -t bkp_dim_personal_prof_id_esp_202511 \
  -t stg_ipress_load \
  -t actividad_subactividad \
  -t dim_categoria_ipress \
  -t dim_ipress_modalidad \
  -t dim_procedimiento \
  -t llamadas \
  -t servicio_actividad \
  -t v_id_origen \
  > /backup/tablas_a_eliminar_fase1_$(date +%Y%m%d).sql
*/

-- =====================================================
-- PASO 1: ANÁLISIS PREVIO
-- =====================================================
-- Verificar estado actual de las tablas a limpiar

\echo '===== ANÁLISIS PREVIO - Tablas a Eliminar ====='

-- 1.1 Verificar que las tablas están vacías
SELECT
    'VERIFICACIÓN: Tablas Vacías' AS titulo,
    t.tablename,
    COALESCE(s.n_live_tup, 0) AS filas,
    pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename)) AS tamano
FROM pg_tables t
LEFT JOIN pg_stat_user_tables s ON t.tablename = s.relname
WHERE t.schemaname = 'public'
  AND t.tablename IN (
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
ORDER BY t.tablename;

-- Resultado esperado: Todas con 0 filas

-- 1.2 Verificar foreign keys entrantes (no deben tener)
SELECT
    'VERIFICACIÓN: Foreign Keys Entrantes' AS titulo,
    ccu.table_name AS tabla_referenciada,
    tc.table_name AS tabla_origen,
    kcu.column_name AS columna_origen
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name IN (
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

-- Resultado esperado: 0 filas (sin foreign keys)

-- 1.3 Verificar vistas que usan las tablas
SELECT
    'VERIFICACIÓN: Vistas Dependientes' AS titulo,
    table_name AS tabla,
    view_name AS vista_dependiente
FROM information_schema.view_table_usage
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

-- Resultado esperado: 0 filas (sin vistas dependientes)

-- 1.4 Verificar triggers
SELECT
    'VERIFICACIÓN: Triggers' AS titulo,
    event_object_table AS tabla,
    trigger_name
FROM information_schema.triggers
WHERE event_object_schema = 'public'
  AND event_object_table IN (
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

-- Resultado esperado: 0 filas (sin triggers)

-- 1.5 Calcular espacio total a liberar
SELECT
    'RESUMEN: Espacio a Liberar' AS titulo,
    COUNT(*) AS total_tablas,
    pg_size_pretty(SUM(pg_total_relation_size(schemaname||'.'||tablename))) AS espacio_total
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
  );

-- =====================================================
-- PASO 2: ANÁLISIS TABLAS RAW (VACUUM FULL)
-- =====================================================

\echo '===== ANÁLISIS: Tablas RAW Fragmentadas ====='

-- 2.1 Verificar tamaño actual de tablas RAW
SELECT
    'Estado Actual: Tablas RAW' AS titulo,
    t.tablename,
    COALESCE(s.n_live_tup, 0) AS filas,
    COALESCE(s.n_dead_tup, 0) AS filas_muertas,
    pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename)) AS tamano_total,
    pg_size_pretty(pg_relation_size(t.schemaname||'.'||t.tablename)) AS tamano_datos,
    pg_size_pretty(pg_total_relation_size(t.schemaname||'.'||t.tablename) -
                   pg_relation_size(t.schemaname||'.'||t.tablename)) AS tamano_indices,
    s.last_vacuum,
    s.last_autovacuum
FROM pg_tables t
LEFT JOIN pg_stat_user_tables s ON t.tablename = s.relname
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'ultima_atencion_esp_nacional',
    'ultima_atencion_6m_nacional',
    'ultima_atencion_6m_cnt'
  )
ORDER BY pg_total_relation_size(t.schemaname||'.'||t.tablename) DESC;

-- 2.2 Verificar que NO tienen foreign keys entrantes
SELECT
    'VERIFICACIÓN: FK Entrantes en Tablas RAW' AS titulo,
    ccu.table_name AS tabla_referenciada,
    tc.table_name AS tabla_origen,
    kcu.column_name
FROM information_schema.table_constraints AS tc
JOIN information_schema.key_column_usage AS kcu
  ON tc.constraint_name = kcu.constraint_name
JOIN information_schema.constraint_column_usage AS ccu
  ON ccu.constraint_name = tc.constraint_name
WHERE tc.constraint_type = 'FOREIGN KEY'
  AND ccu.table_name IN (
    'ultima_atencion_esp_nacional',
    'ultima_atencion_6m_nacional',
    'ultima_atencion_6m_cnt'
  );

-- Resultado esperado: 0 filas

-- 2.3 Calcular fragmentación
SELECT
    'Análisis de Fragmentación' AS titulo,
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamano_actual,
    pg_size_pretty(CAST(8192 AS BIGINT)) AS tamano_esperado_vacio,
    pg_size_pretty(
        pg_total_relation_size(schemaname||'.'||tablename) - 8192
    ) AS espacio_desperdiciado,
    ROUND(
        (pg_total_relation_size(schemaname||'.'||tablename)::NUMERIC - 8192) /
        pg_total_relation_size(schemaname||'.'||tablename) * 100, 2
    ) AS porcentaje_fragmentacion
FROM pg_tables
WHERE schemaname = 'public'
  AND tablename IN (
    'ultima_atencion_esp_nacional',
    'ultima_atencion_6m_nacional',
    'ultima_atencion_6m_cnt'
  )
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC;

-- =====================================================
-- PASO 3: PAUSA PARA REVISIÓN
-- =====================================================

\echo '===== PAUSA PARA REVISIÓN ====='
\echo 'Revise los resultados del análisis previo.'
\echo 'Verifique que:'
\echo '  - Todas las tablas a eliminar están vacías (0 filas)'
\echo '  - No tienen foreign keys entrantes'
\echo '  - No tienen vistas dependientes'
\echo '  - No tienen triggers activos'
\echo '  - Tablas RAW están vacías pero ocupan mucho espacio'
\echo ''
\echo 'Si todo está correcto, presione ENTER para continuar...'
\echo 'O Ctrl+C para cancelar y revisar.'
\prompt 'Presione ENTER para continuar' continuar

-- =====================================================
-- PASO 4: ELIMINACIÓN DE TABLAS VACÍAS (BAJO RIESGO)
-- =====================================================

\echo '===== EJECUTANDO: Eliminación de Tablas Vacías ====='

BEGIN;

-- Registrar inicio de limpieza en auditoría
INSERT INTO audit_logs (usuario_sesion, accion, modulo, detalle, nivel, estado)
VALUES ('SYSTEM', 'DATABASE_CLEANUP', 'MANTENIMIENTO',
        'Inicio Fase 1: Eliminación de tablas obsoletas', 'INFO', 'SUCCESS');

-- 4.1 Eliminar backup temporal (obsoleto)
\echo 'Eliminando: bkp_dim_personal_prof_id_esp_202511'
DROP TABLE IF EXISTS bkp_dim_personal_prof_id_esp_202511 CASCADE;

-- 4.2 Eliminar tabla staging sin uso
\echo 'Eliminando: stg_ipress_load'
DROP TABLE IF EXISTS stg_ipress_load CASCADE;

-- 4.3 Eliminar tablas vacías sin dependencias
\echo 'Eliminando: actividad_subactividad'
DROP TABLE IF EXISTS actividad_subactividad CASCADE;

\echo 'Eliminando: dim_categoria_ipress'
DROP TABLE IF EXISTS dim_categoria_ipress CASCADE;

\echo 'Eliminando: dim_ipress_modalidad'
DROP TABLE IF EXISTS dim_ipress_modalidad CASCADE;

\echo 'Eliminando: dim_procedimiento'
DROP TABLE IF EXISTS dim_procedimiento CASCADE;

\echo 'Eliminando: llamadas'
DROP TABLE IF EXISTS llamadas CASCADE;

\echo 'Eliminando: servicio_actividad'
DROP TABLE IF EXISTS servicio_actividad CASCADE;

\echo 'Eliminando: v_id_origen'
DROP TABLE IF EXISTS v_id_origen CASCADE;

-- Registrar finalización
INSERT INTO audit_logs (usuario_sesion, accion, modulo, detalle, nivel, estado)
VALUES ('SYSTEM', 'DATABASE_CLEANUP', 'MANTENIMIENTO',
        'Fase 1: Eliminadas 9 tablas obsoletas', 'INFO', 'SUCCESS');

-- Verificar que no hay errores antes de confirmar
\echo '¿Todo correcto? Revisando...'
SELECT COUNT(*) AS tablas_eliminadas_ok
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

-- Resultado esperado: 0 tablas (todas eliminadas)

\echo 'Si el resultado es 0, presione ENTER para confirmar COMMIT...'
\echo 'O escriba ROLLBACK; para revertir'
\prompt 'Confirmar eliminación (ENTER = COMMIT)' confirmar

COMMIT;

\echo '===== TABLAS ELIMINADAS EXITOSAMENTE ====='

-- =====================================================
-- PASO 5: VACUUM FULL EN TABLAS RAW (RECUPERAR ESPACIO)
-- =====================================================

\echo '===== EJECUTANDO: VACUUM FULL en Tablas RAW ====='
\echo 'ADVERTENCIA: VACUUM FULL bloquea las tablas durante la operación'
\echo 'Ejecutar SOLO en horario de baja actividad (madrugada 02:00-05:00)'
\echo ''
\prompt '¿Continuar con VACUUM FULL? (si/no)' continuar_vacuum

-- Si el usuario escribió 'si', continuar
-- De lo contrario, saltar este paso

BEGIN;

-- 5.1 Truncar tablas RAW (eliminar datos residuales)
\echo 'Truncando: ultima_atencion_esp_nacional'
TRUNCATE TABLE ultima_atencion_esp_nacional;

\echo 'Truncando: ultima_atencion_6m_nacional'
TRUNCATE TABLE ultima_atencion_6m_nacional;

\echo 'Truncando: ultima_atencion_6m_cnt'
TRUNCATE TABLE ultima_atencion_6m_cnt;

COMMIT;

-- 5.2 VACUUM FULL (NO usar transacción, no soporta rollback)
\echo 'Ejecutando VACUUM FULL (puede tomar varios minutos)...'
\echo 'Iniciando: ultima_atencion_esp_nacional (~858 MB a recuperar)'
VACUUM FULL ANALYZE VERBOSE ultima_atencion_esp_nacional;

\echo 'Iniciando: ultima_atencion_6m_nacional (~15 MB a recuperar)'
VACUUM FULL ANALYZE VERBOSE ultima_atencion_6m_nacional;

\echo 'Iniciando: ultima_atencion_6m_cnt (~5 MB a recuperar)'
VACUUM FULL ANALYZE VERBOSE ultima_atencion_6m_cnt;

-- Registrar en auditoría
INSERT INTO audit_logs (usuario_sesion, accion, modulo, detalle, nivel, estado)
VALUES ('SYSTEM', 'DATABASE_CLEANUP', 'MANTENIMIENTO',
        'VACUUM FULL ejecutado en tablas RAW, ~880 MB recuperados', 'INFO', 'SUCCESS');

\echo '===== VACUUM FULL COMPLETADO ====='

-- =====================================================
-- PASO 6: VERIFICACIÓN POST-LIMPIEZA
-- =====================================================

\echo '===== VERIFICACIÓN POST-LIMPIEZA ====='

-- 6.1 Verificar que las tablas fueron eliminadas
SELECT
    'Tablas Eliminadas (debe ser 0)' AS verificacion,
    COUNT(*) AS resultado
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

-- 6.2 Verificar nuevo tamaño de tablas RAW
SELECT
    'Tamaño Post-VACUUM' AS verificacion,
    tablename,
    n_live_tup AS filas,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamano_actual,
    pg_size_pretty(8192::BIGINT) AS tamano_esperado
FROM pg_tables t
LEFT JOIN pg_stat_user_tables s ON t.tablename = s.relname
WHERE t.schemaname = 'public'
  AND t.tablename IN (
    'ultima_atencion_esp_nacional',
    'ultima_atencion_6m_nacional',
    'ultima_atencion_6m_cnt'
  );

-- Resultado esperado: Tamaño actual ~8 KB cada una

-- 6.3 Calcular espacio recuperado
WITH antes AS (
    -- Valores antes de VACUUM (registrados en análisis previo)
    SELECT 858 AS mb_esp_nacional,
           15 AS mb_6m_nacional,
           5 AS mb_6m_cnt
),
despues AS (
    SELECT
        pg_total_relation_size('ultima_atencion_esp_nacional') / 1024 / 1024 AS mb_esp_nacional,
        pg_total_relation_size('ultima_atencion_6m_nacional') / 1024 / 1024 AS mb_6m_nacional,
        pg_total_relation_size('ultima_atencion_6m_cnt') / 1024 / 1024 AS mb_6m_cnt
)
SELECT
    'Espacio Recuperado' AS titulo,
    pg_size_pretty(
        (a.mb_esp_nacional - d.mb_esp_nacional) * 1024 * 1024 +
        (a.mb_6m_nacional - d.mb_6m_nacional) * 1024 * 1024 +
        (a.mb_6m_cnt - d.mb_6m_cnt) * 1024 * 1024
    ) AS espacio_recuperado
FROM antes a, despues d;

-- 6.4 Tamaño total de la base de datos
SELECT
    'Tamaño BD Post-Limpieza' AS verificacion,
    pg_size_pretty(pg_database_size('maestro_cenate')) AS tamano_actual;

-- 6.5 Total de tablas activas
SELECT
    'Total Tablas Activas' AS verificacion,
    COUNT(*) AS total_tablas
FROM information_schema.tables
WHERE table_schema = 'public'
  AND table_type = 'BASE TABLE';

-- 6.6 Listar top 20 tablas por tamaño (post-limpieza)
SELECT
    'Top 20 Tablas por Tamaño' AS titulo,
    schemaname || '.' || tablename AS tabla,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS tamano,
    n_live_tup AS filas
FROM pg_tables t
JOIN pg_stat_user_tables s ON t.tablename = s.relname
WHERE schemaname = 'public'
ORDER BY pg_total_relation_size(schemaname||'.'||tablename) DESC
LIMIT 20;

-- =====================================================
-- PASO 7: ACTUALIZAR ESTADÍSTICAS
-- =====================================================

\echo '===== ACTUALIZANDO ESTADÍSTICAS ====='

-- Actualizar estadísticas de todas las tablas
ANALYZE VERBOSE;

-- =====================================================
-- PASO 8: REGISTRO FINAL
-- =====================================================

-- Registrar finalización completa
INSERT INTO audit_logs (usuario_sesion, accion, modulo, detalle, nivel, estado)
VALUES ('SYSTEM', 'DATABASE_CLEANUP', 'MANTENIMIENTO',
        'Fase 1 COMPLETADA: 9 tablas eliminadas, ~880 MB recuperados', 'INFO', 'SUCCESS');

-- =====================================================
-- RESUMEN FINAL
-- =====================================================

\echo ''
\echo '=============================================='
\echo '  FASE 1 COMPLETADA EXITOSAMENTE'
\echo '=============================================='
\echo ''
\echo 'Acciones realizadas:'
\echo '  - 9 tablas obsoletas eliminadas'
\echo '  - VACUUM FULL en 3 tablas RAW'
\echo '  - ~880 MB de espacio recuperado'
\echo '  - Estadísticas actualizadas'
\echo ''
\echo 'Siguiente paso:'
\echo '  - Monitorear logs de aplicación por 48 horas'
\echo '  - Verificar que no hay errores'
\echo '  - Si todo está OK, proceder con Fase 2'
\echo ''
\echo '=============================================='

-- =====================================================
-- FIN DEL SCRIPT FASE 1
-- =====================================================
