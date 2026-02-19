-- =====================================================
-- V4_6_0: Migrar estados de Mesa de Ayuda
-- Fecha: 2026-02-19
-- Versión: v1.65.2
-- Descripción:
--   - Renombrar ABIERTO → NUEVO
--   - Fusionar CERRADO → RESUELTO
--   - Estados finales: NUEVO, EN_PROCESO, RESUELTO
-- =====================================================

-- 1. Migrar datos existentes
UPDATE dim_ticket_mesa_ayuda SET estado = 'NUEVO' WHERE estado = 'ABIERTO';
UPDATE dim_ticket_mesa_ayuda SET estado = 'RESUELTO' WHERE estado = 'CERRADO';

-- 2. Eliminar el CHECK constraint antiguo
ALTER TABLE dim_ticket_mesa_ayuda DROP CONSTRAINT IF EXISTS dim_ticket_mesa_ayuda_estado_check;

-- 3. Cambiar el DEFAULT
ALTER TABLE dim_ticket_mesa_ayuda ALTER COLUMN estado SET DEFAULT 'NUEVO';

-- 4. Crear nuevo CHECK constraint con 3 estados
ALTER TABLE dim_ticket_mesa_ayuda ADD CONSTRAINT dim_ticket_mesa_ayuda_estado_check
    CHECK (estado IN ('NUEVO', 'EN_PROCESO', 'RESUELTO'));

-- 5. Actualizar comentario
COMMENT ON COLUMN dim_ticket_mesa_ayuda.estado IS 'Estado del ticket: NUEVO, EN_PROCESO, RESUELTO';
