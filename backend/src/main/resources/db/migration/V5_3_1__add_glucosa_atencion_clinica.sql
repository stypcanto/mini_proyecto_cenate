-- =====================================================================
-- V5_3_1: Agregar columna glucosa a atencion_clinica
-- Autor  : Styp Canto Rondón / Claude Code
-- Fecha  : 2026-02-20
-- Ticket : v1.77.0 - Mediciones PA y Glucosa en Ficha Enfermería
-- Nota   : presion_arterial ya existía (VARCHAR 20). Se agrega glucosa.
--          Se retiran otraPatologia y tratamiento del flujo enfermería
--          (columnas permanecen para histórico).
-- =====================================================================

ALTER TABLE atencion_clinica
    ADD COLUMN IF NOT EXISTS glucosa DECIMAL(6,1);

COMMENT ON COLUMN atencion_clinica.glucosa          IS 'Glucosa en mg/dL — Ficha Enfermería v1.77.0';
COMMENT ON COLUMN atencion_clinica.presion_arterial IS 'Presión arterial sistólica/diastólica mmHg — ej: 120/80';
