-- =============================================================================
-- Migration: v1.42.0 - Crear índice para optimizar filtro de especialidades
-- =============================================================================
-- Versión: 1.0
-- Fecha: 2026-02-01
-- Propósito: Mejorar performance de query DISTINCT en especialidades
-- Impacto esperado: 10ms → 1ms (10x más rápido)
-- =============================================================================

-- Índice compuesto: (activo, especialidad)
-- Optimiza WHERE y ORDER BY en query de especialidades
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitud_activo_especialidad
ON dim_solicitud_bolsa (activo, especialidad)
WHERE activo = true
  AND especialidad IS NOT NULL
  AND especialidad != '';

-- Analizar tabla para actualizar estadísticas del planner
ANALYZE dim_solicitud_bolsa;

-- =============================================================================
-- Validación: Verificar que el índice se creó correctamente
-- =============================================================================
-- Ejecutar después de la migración:
--
-- SELECT * FROM pg_indexes
-- WHERE tablename = 'dim_solicitud_bolsa'
-- AND indexname = 'idx_solicitud_activo_especialidad';
--
-- Resultado esperado:
-- tablename          | indexname                               | indexdef
-- dim_solicitud_bolsa| idx_solicitud_activo_especialidad       | CREATE INDEX ...
--
-- =============================================================================

-- Benchmarking (ANTES de crear índice - ejecutar primero):
-- EXPLAIN ANALYZE
-- SELECT DISTINCT sb.especialidad
-- FROM dim_solicitud_bolsa sb
-- WHERE sb.activo = true
--   AND sb.especialidad IS NOT NULL
--   AND sb.especialidad != ''
-- ORDER BY sb.especialidad ASC;
--
-- Resultado esperado ANTES:
-- Execution Time: ~10.000 ms (Full Table Scan)
--
-- Resultado esperado DESPUÉS:
-- Execution Time: ~1.000 ms (Index Only Scan)
--
-- =============================================================================
