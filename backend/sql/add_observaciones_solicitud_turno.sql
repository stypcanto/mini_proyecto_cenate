-- =====================================================
-- Agregar campo observaciones a solicitud_turno_ipress
-- =====================================================
-- Fecha: 2026-02-09
-- Descripción: Agrega el campo observaciones a la tabla 
-- solicitud_turno_ipress para almacenar comentarios 
-- generales del usuario al enviar la solicitud.
-- =====================================================

-- Agregar columna observaciones
ALTER TABLE solicitud_turno_ipress 
ADD COLUMN IF NOT EXISTS observaciones TEXT;

-- Comentario descriptivo para la nueva columna
COMMENT ON COLUMN solicitud_turno_ipress.observaciones 
IS 'Observaciones generales del usuario sobre la solicitud de turnos';

-- Verificar que la columna fue agregada correctamente
SELECT column_name, data_type, is_nullable, column_default
FROM information_schema.columns 
WHERE table_name = 'solicitud_turno_ipress' 
AND column_name = 'observaciones';