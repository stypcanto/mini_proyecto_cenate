-- V4_4_0__add_id_ipress_atencion.sql
-- 📋 Agregar columna id_ipress_atencion a dim_solicitud_bolsa (v1.15.0 - Excel 12 campos)
-- 2026-02-11
--
-- Descripción:
-- - Nueva columna en Excel v1.15.0 (columna 11: IPRESS - ATENCIÓN)
-- - FK a tabla "ipress"
-- - Obligatorio en nuevas cargas
-- - Paralelo a codigo_ipress (IPRESS ADSCRIPCIÓN)
--
-- Cambios:
-- ✅ ALTER TABLE dim_solicitud_bolsa ADD COLUMN id_ipress_atencion BIGINT
-- ✅ Comentario: Nueva columna Excel v1.15.0

BEGIN;

-- Agregar la columna si no existe
ALTER TABLE dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS id_ipress_atencion BIGINT;

-- Comentario a la columna
COMMENT ON COLUMN dim_solicitud_bolsa.id_ipress_atencion IS 'FK a ipress - IPRESS - ATENCIÓN (Excel v1.15.0, columna 11) - OBLIGATORIO desde v1.15.0';

COMMIT;
