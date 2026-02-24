-- ============================================================
-- V6_2_0: Eliminar unique constraint (id_bolsa, paciente_id)
-- en dim_solicitud_bolsa.
--
-- Motivo: El sistema permite múltiples asignaciones del mismo
-- paciente (ej: paciente ya en bolsa enfermería quiere ser
-- importado manualmente con otra especialidad/enfermera).
-- El constraint bloqueaba esta operación con error de duplicado.
-- ============================================================

ALTER TABLE dim_solicitud_bolsa
    DROP CONSTRAINT IF EXISTS solicitud_paciente_unique;
