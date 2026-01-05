-- ========================================================================
-- Script: Agregar columnas para asignación de gestor de citas en Bolsa 107
-- Descripción: Agrega campos para asignar gestores de citas a pacientes
-- Fecha: 2026-01-02
-- Autor: Sistema CENATE
-- ========================================================================

-- Agregar columnas para gestor asignado
ALTER TABLE bolsa_107_item
  ADD COLUMN IF NOT EXISTS id_gestor_asignado BIGINT,
  ADD COLUMN IF NOT EXISTS fecha_asignacion_gestor TIMESTAMP WITH TIME ZONE;

-- Agregar foreign key a dim_usuarios (solo si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_bolsa107_gestor'
          AND table_name = 'bolsa_107_item'
    ) THEN
        ALTER TABLE bolsa_107_item
          ADD CONSTRAINT fk_bolsa107_gestor
          FOREIGN KEY (id_gestor_asignado)
          REFERENCES dim_usuarios(id_user) ON DELETE SET NULL;
    END IF;
END
$$;

-- Crear índice para búsquedas por gestor
CREATE INDEX IF NOT EXISTS ix_bolsa107_gestor
  ON bolsa_107_item(id_gestor_asignado)
  WHERE id_gestor_asignado IS NOT NULL;

-- Comentarios en las columnas
COMMENT ON COLUMN bolsa_107_item.id_gestor_asignado IS 'ID del gestor de citas asignado para coordinar la atención del paciente';
COMMENT ON COLUMN bolsa_107_item.fecha_asignacion_gestor IS 'Fecha y hora de asignación del gestor de citas';

-- Verificar columnas creadas
SELECT
    column_name,
    data_type,
    is_nullable,
    column_default
FROM information_schema.columns
WHERE table_name = 'bolsa_107_item'
  AND column_name IN ('id_gestor_asignado', 'fecha_asignacion_gestor')
ORDER BY ordinal_position;

COMMIT;
