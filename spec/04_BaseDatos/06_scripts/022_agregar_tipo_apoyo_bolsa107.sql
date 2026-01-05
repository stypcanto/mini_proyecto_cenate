-- ============================================================================
-- Script: 022_agregar_tipo_apoyo_bolsa107.sql
-- Descripción: Agregar columna tipo_apoyo a la tabla bolsa_107_item
-- Autor: Claude Code
-- Fecha: 2026-01-03
-- Versión: 1.0
-- ============================================================================

-- Agregar columna tipo_apoyo
ALTER TABLE bolsa_107_item
  ADD COLUMN IF NOT EXISTS tipo_apoyo VARCHAR(100) DEFAULT 'OTROS';

-- Comentario descriptivo
COMMENT ON COLUMN bolsa_107_item.tipo_apoyo IS 'Tipo de apoyo que requiere el paciente (HABILITAR BOLSA, PROGRAMAR EN ESSI, etc.)';

-- Crear índice para búsquedas
CREATE INDEX IF NOT EXISTS ix_bolsa107_tipo_apoyo
  ON bolsa_107_item(tipo_apoyo)
  WHERE tipo_apoyo IS NOT NULL;

-- Mensaje de confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Columna tipo_apoyo agregada correctamente a bolsa_107_item';
END $$;
