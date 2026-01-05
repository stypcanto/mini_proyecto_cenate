-- ========================================================================
-- V2.0.2: Agregar campo Tratamiento
-- ------------------------------------------------------------------------
-- CENATE 2026 | Fecha: 2026-01-03
-- Descripción: Separar recomendaciones de tratamiento para claridad
-- ========================================================================

-- Agregar campo para tratamiento indicado
ALTER TABLE atencion_clinica
ADD COLUMN tratamiento TEXT;

-- Comentario para documentación
COMMENT ON COLUMN atencion_clinica.tratamiento IS 'Tratamiento indicado por el especialista (medicamentos, terapias, etc.)';

-- Índice para búsquedas de texto completo
CREATE INDEX idx_atencion_clinica_tratamiento ON atencion_clinica USING gin(to_tsvector('spanish', tratamiento)) WHERE tratamiento IS NOT NULL;
