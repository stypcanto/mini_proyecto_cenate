-- ============================================================================
-- V6_2_0: Agregar columna id_usuario_desvinculo a tabla paciente_estrategia
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-02-24
-- Descripción: Permite auditar qué usuario del sistema solicitó la baja
--              (retiro) de un paciente de una estrategia institucional.
--              Usado principalmente para la baja CENACRON desde el módulo
--              de atención clínica.
-- ============================================================================

-- 1. Agregar columna (NULL para no romper registros históricos sin auditor)
ALTER TABLE paciente_estrategia
    ADD COLUMN IF NOT EXISTS id_usuario_desvinculo BIGINT NULL
        REFERENCES dim_usuarios(id_user);

-- 2. Índice para acelerar consultas de auditoría (¿quién dio de baja?)
CREATE INDEX IF NOT EXISTS idx_pe_usuario_desvinculo
    ON paciente_estrategia(id_usuario_desvinculo)
    WHERE id_usuario_desvinculo IS NOT NULL;

-- 3. Comentario de columna para documentación del esquema
COMMENT ON COLUMN paciente_estrategia.id_usuario_desvinculo
    IS 'FK al usuario que solicitó la baja/retiro del paciente de la estrategia. NULL en registros históricos anteriores a v6.2.0.';

-- Verificación
SELECT
    column_name,
    data_type,
    is_nullable
FROM information_schema.columns
WHERE table_name = 'paciente_estrategia'
  AND column_name = 'id_usuario_desvinculo';
