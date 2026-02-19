-- =====================================================
-- V4_5_0: Agregar columnas de Personal Asignado a Mesa de Ayuda
-- Fecha: 2026-02-19
-- Versión: v1.65.1
-- Descripción: Permite asignar personal de Mesa de Ayuda a tickets
-- =====================================================

ALTER TABLE dim_ticket_mesa_ayuda
  ADD COLUMN IF NOT EXISTS id_personal_asignado BIGINT,
  ADD COLUMN IF NOT EXISTS nombre_personal_asignado VARCHAR(255),
  ADD COLUMN IF NOT EXISTS fecha_asignacion TIMESTAMP;

CREATE INDEX IF NOT EXISTS idx_ticket_mesa_asignado
  ON dim_ticket_mesa_ayuda(id_personal_asignado);
