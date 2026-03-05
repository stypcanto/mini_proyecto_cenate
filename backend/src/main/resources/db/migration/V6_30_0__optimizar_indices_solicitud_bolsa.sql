-- ============================================================================
-- V6_30_0: Optimización de índices para dim_solicitud_bolsa
-- ============================================================================
-- Problema: La página de bolsas tarda en cargar debido a queries lentos
-- Solución: Agregar índices compuestos para acelerar JOINs y filtros comunes
-- Fecha: 2026-03-05
-- ============================================================================

-- 1️⃣ Índice para JOIN con dim_tipos_bolsas (usado en estadísticas por tipo)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitud_bolsa_id_bolsa_activo 
ON dim_solicitud_bolsa(id_bolsa, activo) 
WHERE activo = true;

-- 2️⃣ Índice para filtro estado_gestion_citas_id (JOIN con dim_estados_gestion_citas)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitud_bolsa_estado_activo 
ON dim_solicitud_bolsa(estado_gestion_citas_id, activo) 
WHERE activo = true;

-- 3️⃣ Índice parcial para conteo rápido de activos
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitud_bolsa_activo_partial 
ON dim_solicitud_bolsa(id_solicitud) 
WHERE activo = true;

-- 4️⃣ Índice compuesto para estadísticas por IPRESS
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitud_bolsa_ipress_estado_activo 
ON dim_solicitud_bolsa(id_ipress, estado_gestion_citas_id) 
WHERE activo = true;

-- 5️⃣ Índice compuesto para estadísticas por IPRESS Atención
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitud_bolsa_ipress_atencion_activo 
ON dim_solicitud_bolsa(id_ipress_atencion, estado_gestion_citas_id) 
WHERE activo = true;

-- 6️⃣ Índice para búsqueda por DNI (muy frecuente)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitud_bolsa_dni_activo 
ON dim_solicitud_bolsa(paciente_dni) 
WHERE activo = true;

-- 7️⃣ Índice para ordenamiento por fecha (paginación)
CREATE INDEX CONCURRENTLY IF NOT EXISTS idx_solicitud_bolsa_fecha_desc_activo 
ON dim_solicitud_bolsa(fecha_solicitud DESC) 
WHERE activo = true;

-- Comentarios para documentación
COMMENT ON INDEX idx_solicitud_bolsa_id_bolsa_activo IS 'Optimiza JOIN con dim_tipos_bolsas en estadísticas por tipo de bolsa';
COMMENT ON INDEX idx_solicitud_bolsa_estado_activo IS 'Optimiza JOIN con dim_estados_gestion_citas en estadísticas por estado';
COMMENT ON INDEX idx_solicitud_bolsa_activo_partial IS 'Optimiza COUNT(*) WHERE activo = true';
COMMENT ON INDEX idx_solicitud_bolsa_ipress_estado_activo IS 'Optimiza estadísticas por IPRESS adscripción';
COMMENT ON INDEX idx_solicitud_bolsa_ipress_atencion_activo IS 'Optimiza estadísticas por IPRESS atención';
COMMENT ON INDEX idx_solicitud_bolsa_dni_activo IS 'Optimiza búsqueda por DNI de paciente';
COMMENT ON INDEX idx_solicitud_bolsa_fecha_desc_activo IS 'Optimiza paginación ordenada por fecha DESC';

-- ============================================================================
-- VACUUM ANALYZE para actualizar estadísticas del planificador
-- ============================================================================
ANALYZE dim_solicitud_bolsa;
