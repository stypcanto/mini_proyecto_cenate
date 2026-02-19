-- =============================================
-- 053: Agregar columna telefono_paciente a dim_ticket_mesa_ayuda
-- Fecha: 2026-02-19
-- Descripción: Agrega campo para almacenar el teléfono del paciente
--              denormalizado en el ticket (mismo patrón que ipress, nombrePaciente, etc.)
-- =============================================

ALTER TABLE dim_ticket_mesa_ayuda
ADD COLUMN IF NOT EXISTS telefono_paciente VARCHAR(50);

COMMENT ON COLUMN dim_ticket_mesa_ayuda.telefono_paciente IS 'Teléfono del paciente (denormalizado de dim_solicitud_bolsa)';
