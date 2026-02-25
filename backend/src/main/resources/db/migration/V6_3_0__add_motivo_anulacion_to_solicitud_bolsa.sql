-- V6_3_0: Agregar columna motivo_anulacion a dim_solicitud_bolsa
-- Registra el motivo cuando una cita es anulada (estado RECHAZADO) por el gestor
-- v1.69.0 - 2026-02-25

ALTER TABLE dim_solicitud_bolsa
    ADD COLUMN IF NOT EXISTS motivo_anulacion TEXT;

COMMENT ON COLUMN dim_solicitud_bolsa.motivo_anulacion
    IS 'Motivo de anulación de la cita, registrado por el gestor al cambiar estado a RECHAZADO';
