-- ========================================================================
-- V2.0.1: Agregar campos CIE-10 y Recomendación del Especialista
-- ------------------------------------------------------------------------
-- CENATE 2026 | Fecha: 2026-01-03
-- Descripción: Mejoras al módulo de Trazabilidad Clínica
-- ========================================================================

-- Agregar campo para código CIE-10 (Clasificación Internacional de Enfermedades)
ALTER TABLE atencion_clinica
ADD COLUMN cie10_codigo VARCHAR(20);

-- Agregar campo para recomendaciones del especialista
ALTER TABLE atencion_clinica
ADD COLUMN recomendacion_especialista TEXT;

-- Comentarios para documentación
COMMENT ON COLUMN atencion_clinica.cie10_codigo IS 'Código CIE-10 del diagnóstico (ej: J00, E11.9)';
COMMENT ON COLUMN atencion_clinica.recomendacion_especialista IS 'Recomendaciones y tratamiento indicado por el especialista';

-- Índice para búsquedas por código CIE-10
CREATE INDEX idx_atencion_clinica_cie10 ON atencion_clinica(cie10_codigo) WHERE cie10_codigo IS NOT NULL;
