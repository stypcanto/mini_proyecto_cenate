-- ============================================================================
-- Script: 023_agregar_campos_programacion_bolsa107.sql
-- Descripción: Agregar columnas para programación en ESSI
-- Autor: Claude Code
-- Fecha: 2026-01-03
-- Versión: 1.0
-- ============================================================================

-- Agregar columnas de programación
ALTER TABLE bolsa_107_item
  ADD COLUMN IF NOT EXISTS fecha_programacion DATE,
  ADD COLUMN IF NOT EXISTS turno VARCHAR(20),
  ADD COLUMN IF NOT EXISTS profesional VARCHAR(200),
  ADD COLUMN IF NOT EXISTS dni_profesional VARCHAR(20),
  ADD COLUMN IF NOT EXISTS especialidad VARCHAR(100);

-- Comentarios descriptivos
COMMENT ON COLUMN bolsa_107_item.fecha_programacion IS 'Fecha de programación en ESSI';
COMMENT ON COLUMN bolsa_107_item.turno IS 'Turno de la programación (M, T, MT)';
COMMENT ON COLUMN bolsa_107_item.profesional IS 'Nombre completo del profesional';
COMMENT ON COLUMN bolsa_107_item.dni_profesional IS 'DNI del profesional';
COMMENT ON COLUMN bolsa_107_item.especialidad IS 'Especialidad médica';

-- Crear índices para búsquedas
CREATE INDEX IF NOT EXISTS ix_bolsa107_fecha_programacion
  ON bolsa_107_item(fecha_programacion)
  WHERE fecha_programacion IS NOT NULL;

CREATE INDEX IF NOT EXISTS ix_bolsa107_dni_profesional
  ON bolsa_107_item(dni_profesional)
  WHERE dni_profesional IS NOT NULL;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Columnas de programación agregadas correctamente a bolsa_107_item';
END $$;
