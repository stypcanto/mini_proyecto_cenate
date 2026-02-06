-- ============================================================================
-- V3.1.3: Agregar columna fecha_atencion_medica a dim_solicitud_bolsa
-- ============================================================================
-- Propósito: Guardar la fecha/hora exacta cuando el médico marca un paciente
--            como "Atendido" o "Deserción"
--
-- Tabla: dim_solicitud_bolsa
-- Versión: v1.47.0
-- Fecha: 2026-02-06
-- ============================================================================

-- Agregar columna fecha_atencion_medica
ALTER TABLE dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS fecha_atencion_medica TIMESTAMP WITH TIME ZONE;

-- Crear índice para búsquedas rápidas por fecha de atención
CREATE INDEX IF NOT EXISTS idx_dim_solicitud_bolsa_fecha_atencion_medica
ON dim_solicitud_bolsa(fecha_atencion_medica DESC);

-- Comentario documentado
COMMENT ON COLUMN dim_solicitud_bolsa.fecha_atencion_medica IS 'Fecha y hora cuando el médico marca la consulta como "Atendido" o "Deserción" (v1.47.0)';
