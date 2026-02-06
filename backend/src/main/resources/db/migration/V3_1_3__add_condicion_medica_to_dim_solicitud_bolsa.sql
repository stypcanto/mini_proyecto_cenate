-- ============================================================================
-- V3.1.3: Agregar columna de condición médica a dim_solicitud_bolsa
-- ============================================================================
-- Permite registrar el estado de la consulta desde la perspectiva médica:
-- - Atendido: Médico completó la consulta
-- - Pendiente: Aún no atendido
-- - Deserción: Paciente no se presentó (con razón)
-- ============================================================================

-- Agregar columna condicion_medica (por defecto NULL para registros existentes)
ALTER TABLE dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS condicion_medica VARCHAR(50);

-- Agregar columna para observaciones médicas
ALTER TABLE dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS observaciones_medicas TEXT;

-- Crear índice para búsquedas rápidas por condición médica
CREATE INDEX IF NOT EXISTS idx_dim_solicitud_bolsa_condicion_medica
ON dim_solicitud_bolsa(condicion_medica);

-- Loguear la migración
COMMENT ON COLUMN dim_solicitud_bolsa.condicion_medica IS
'Estado de la consulta desde perspectiva médica: Atendido | Pendiente | Deserción (v1.46.0)';

COMMENT ON COLUMN dim_solicitud_bolsa.observaciones_medicas IS
'Notas médicas y razones de deserción (v1.46.0)';
