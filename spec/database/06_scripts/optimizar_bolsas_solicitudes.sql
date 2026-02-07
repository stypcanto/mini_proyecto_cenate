-- ============================================================================
-- 🚀 OPTIMIZACIÓN: ÍNDICES PARA /bolsas/solicitudes
-- ============================================================================
-- Fecha: 2026-02-06
-- Versión: 1.0
-- Propósito: Mejorar performance de consultas de estadísticas
-- Impacto Esperado: 2-3 segundos → 300-500ms (5-10x más rápido)
-- ============================================================================

-- ✅ PASO 1: Ver índices existentes (antes)
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename = 'dim_solicitud_bolsa'
ORDER BY indexname;

-- ✅ PASO 2: Ver tamaño de tabla
SELECT
    tablename,
    pg_size_pretty(pg_total_relation_size(schemaname||'.'||tablename)) AS size
FROM pg_tables
WHERE tablename = 'dim_solicitud_bolsa';

-- ============================================================================
-- 🔧 CREAR ÍNDICES CRÍTICOS
-- ============================================================================
-- Estos índices se crean CON CONCURRENTLY para no bloquear la tabla
-- Pueden ejecutarse durante operaciones normales

-- 1️⃣ Índice simple: activo (usado en TODOS los WHERE)
CREATE INDEX CONCURRENTLY IF NOT EXISTS
    idx_solicitud_bolsa_activo
    ON dim_solicitud_bolsa(activo);

-- 2️⃣ Índice simple: estado_gestion_citas_id (usado en JOINs)
CREATE INDEX CONCURRENTLY IF NOT EXISTS
    idx_solicitud_bolsa_estado_gestion
    ON dim_solicitud_bolsa(estado_gestion_citas_id);

-- 3️⃣ Índice simple: codigo_ipress (usado en GROUP BY de estadísticas)
CREATE INDEX CONCURRENTLY IF NOT EXISTS
    idx_solicitud_bolsa_codigo_ipress
    ON dim_solicitud_bolsa(codigo_ipress);

-- 4️⃣ Índice simple: especialidad (usado en GROUP BY de estadísticas)
CREATE INDEX CONCURRENTLY IF NOT EXISTS
    idx_solicitud_bolsa_especialidad
    ON dim_solicitud_bolsa(especialidad);

-- 5️⃣ Índice simple: tipo_cita (usado en GROUP BY de estadísticas)
CREATE INDEX CONCURRENTLY IF NOT EXISTS
    idx_solicitud_bolsa_tipo_cita
    ON dim_solicitud_bolsa(tipo_cita);

-- 6️⃣ Índice simple: fecha_solicitud (usado en filtros de rango temporal)
CREATE INDEX CONCURRENTLY IF NOT EXISTS
    idx_solicitud_bolsa_fecha_solicitud
    ON dim_solicitud_bolsa(fecha_solicitud DESC);

-- ============================================================================
-- 🎯 ÍNDICES COMPUESTOS (Más eficientes para queries específicas)
-- ============================================================================

-- 7️⃣ Índice compuesto: activo + estado (usado en todas las estadísticas)
CREATE INDEX CONCURRENTLY IF NOT EXISTS
    idx_solicitud_bolsa_activo_estado
    ON dim_solicitud_bolsa(activo, estado_gestion_citas_id);

-- 8️⃣ Índice compuesto: activo + ipress (usado en estadísticas IPRESS)
CREATE INDEX CONCURRENTLY IF NOT EXISTS
    idx_solicitud_bolsa_activo_ipress
    ON dim_solicitud_bolsa(activo, codigo_ipress);

-- 9️⃣ Índice compuesto: activo + especialidad (usado en estadísticas especialidad)
CREATE INDEX CONCURRENTLY IF NOT EXISTS
    idx_solicitud_bolsa_activo_especialidad
    ON dim_solicitud_bolsa(activo, especialidad);

-- 🔟 Índice compuesto: activo + tipo_cita (usado en estadísticas tipo cita)
CREATE INDEX CONCURRENTLY IF NOT EXISTS
    idx_solicitud_bolsa_activo_tipo_cita
    ON dim_solicitud_bolsa(activo, tipo_cita);

-- ============================================================================
-- 📊 EJECUTAR VACUUM Y ANALYZE
-- ============================================================================
-- Esto actualiza las estadísticas del planner de PostgreSQL
-- Importante para que use los nuevos índices eficientemente

VACUUM ANALYZE dim_solicitud_bolsa;

-- ============================================================================
-- ✅ VERIFICACIÓN FINAL
-- ============================================================================
-- Ver índices creados (después)
SELECT tablename, indexname, indexdef
FROM pg_indexes
WHERE tablename = 'dim_solicitud_bolsa'
ORDER BY indexname;

-- Ver tamaño de índices creados
SELECT
    indexname,
    pg_size_pretty(pg_relation_size(indexrelname)) AS index_size
FROM pg_indexes
WHERE tablename = 'dim_solicitud_bolsa'
    AND indexname LIKE 'idx_solicitud_bolsa%'
ORDER BY pg_relation_size(indexrelname) DESC;

-- Ver planes de ejecución (ANTES vs DESPUÉS)
-- Para comparar, ejecutar EXPLAIN ANALYZE en una query de estadísticas:
-- EXPLAIN ANALYZE
-- SELECT
--     COALESCE(dgc.desc_estado_cita, 'SIN ESTADO') as estado,
--     COUNT(sb.id_solicitud) as cantidad
-- FROM dim_solicitud_bolsa sb
-- LEFT JOIN dim_estados_gestion_citas dgc ON sb.estado_gestion_citas_id = dgc.id_estado_cita
-- WHERE sb.activo = true
-- GROUP BY dgc.desc_estado_cita, dgc.id_estado_cita
-- ORDER BY cantidad DESC;

-- ============================================================================
-- 📈 MONITOREO (Ejecutar después de 1 hora de uso)
-- ============================================================================

-- Verificar que los índices se están usando
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan as "Veces Usado",
    idx_tup_read as "Tuplas Leídas",
    idx_tup_fetch as "Tuplas Retornadas"
FROM pg_stat_user_indexes
WHERE tablename = 'dim_solicitud_bolsa'
ORDER BY idx_scan DESC;

-- Ver si hay índices no usados (candidatos a eliminar)
SELECT
    schemaname,
    tablename,
    indexname,
    idx_scan
FROM pg_stat_user_indexes
WHERE tablename = 'dim_solicitud_bolsa'
    AND idx_scan = 0
ORDER BY pg_relation_size(indexrelid) DESC;

-- ============================================================================
-- 🧹 LIMPIEZA (Solo si necesitas eliminar índices viejos)
-- ============================================================================
-- NOTA: Descomentar SOLO si sabes que estos índices no se usan

-- DROP INDEX CONCURRENTLY IF EXISTS idx_solicitud_bolsa_viejo_1;
-- DROP INDEX CONCURRENTLY IF EXISTS idx_solicitud_bolsa_viejo_2;

-- ============================================================================
-- ✅ RESULTADO ESPERADO
-- ============================================================================
-- Después de ejecutar este script:
-- 1. La tabla NO será bloqueada (CONCURRENTLY)
-- 2. Las queries de estadísticas serán 5-10x más rápidas
-- 3. El frontend cargará /bolsas/solicitudes en 500-800ms en lugar de 2-3s
-- 4. Los índices ocuparán ~20-30% del tamaño de la tabla

-- ============================================================================
-- 📞 SI ALGO SALE MAL
-- ============================================================================
-- Para revertir los cambios, ejecutar:
-- DROP INDEX CONCURRENTLY idx_solicitud_bolsa_activo;
-- DROP INDEX CONCURRENTLY idx_solicitud_bolsa_estado_gestion;
-- ... etc

