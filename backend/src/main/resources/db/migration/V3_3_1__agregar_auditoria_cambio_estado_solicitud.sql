-- ================================================================
-- V3.3.1: Agregar campos de auditoría para cambios de estado
-- ================================================================
-- Descripción: Agregar registro de fecha y usuario cuando se cambia el estado
-- Tabla: dim_solicitud_bolsa
-- Nuevos campos:
--   - fecha_cambio_estado: Cuándo se cambió el estado
--   - usuario_cambio_estado_id: Quién cambió el estado
-- ================================================================

ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS fecha_cambio_estado TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP;

ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS usuario_cambio_estado_id BIGINT;

-- Agregar comentarios para documentación
COMMENT ON COLUMN public.dim_solicitud_bolsa.fecha_cambio_estado IS 'Fecha y hora cuando se cambió el estado de gestión de citas (para auditoría)';
COMMENT ON COLUMN public.dim_solicitud_bolsa.usuario_cambio_estado_id IS 'ID del usuario que cambió el estado de gestión de citas (FK a dim_usuarios)';

-- Opcional: Crear índice para consultas por fecha de cambio
CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_fecha_cambio_estado
ON public.dim_solicitud_bolsa(fecha_cambio_estado DESC);

-- Opcional: Crear índice para consultas por usuario que cambió estado
CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_usuario_cambio_estado
ON public.dim_solicitud_bolsa(usuario_cambio_estado_id);
