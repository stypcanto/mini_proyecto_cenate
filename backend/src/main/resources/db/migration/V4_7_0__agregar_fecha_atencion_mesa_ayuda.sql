-- V4_7_0: Agregar campo fecha_atencion para registrar cuándo se resuelve un ticket
ALTER TABLE dim_ticket_mesa_ayuda ADD COLUMN IF NOT EXISTS fecha_atencion TIMESTAMP;

COMMENT ON COLUMN dim_ticket_mesa_ayuda.fecha_atencion IS 'Fecha y hora en que el ticket fue marcado como RESUELTO';

-- Backfill: para tickets ya resueltos, usar fecha_respuesta como fecha_atencion
UPDATE dim_ticket_mesa_ayuda
SET fecha_atencion = COALESCE(fecha_respuesta, fecha_actualizacion)
WHERE estado = 'RESUELTO' AND fecha_atencion IS NULL;
