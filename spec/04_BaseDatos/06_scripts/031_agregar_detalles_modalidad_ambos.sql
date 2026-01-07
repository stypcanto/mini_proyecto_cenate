-- ========================================================================
-- SCRIPT 031: Agregar campos de detalles para modalidad AMBOS
-- ========================================================================
-- Fecha: 2026-01-07
-- Descripción: Agrega dos campos para desglosar los detalles de cuándo se
--              usa TELECONSULTA y cuándo TELECONSULTORIO cuando la modalidad es AMBOS
--
-- Tabla: dim_ipress
-- Campos agregados:
--   - detalles_teleconsulta: VARCHAR(1000) - Especificar horarios, especialidades, detalles de teleconsulta
--   - detalles_teleconsultorio: VARCHAR(1000) - Especificar horarios, especialidades, detalles de teleconsultorio
-- ========================================================================

BEGIN TRANSACTION;

-- Agregar columna para detalles de TELECONSULTA
ALTER TABLE dim_ipress
ADD COLUMN detalles_teleconsulta VARCHAR(1000);

ALTER TABLE dim_ipress
ADD COLUMN detalles_teleconsultorio VARCHAR(1000);

-- Agregar comentarios a las columnas
COMMENT ON COLUMN dim_ipress.detalles_teleconsulta IS 'Detalles de horarios, especialidades y uso de la modalidad TELECONSULTA (solo se usa cuando modalidad = AMBOS)';
COMMENT ON COLUMN dim_ipress.detalles_teleconsultorio IS 'Detalles de horarios, especialidades y uso de la modalidad TELECONSULTORIO (solo se usa cuando modalidad = AMBOS)';

COMMIT;

-- ========================================================================
-- VERIFICACIÓN
-- ========================================================================
-- SELECT column_name, data_type, is_nullable, column_default
-- FROM information_schema.columns
-- WHERE table_name = 'dim_ipress'
-- ORDER BY ordinal_position;
