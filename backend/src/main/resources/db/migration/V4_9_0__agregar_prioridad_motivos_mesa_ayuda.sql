-- ============================================================================
-- V4_9_0: Agregar columna prioridad a dim_motivos_mesadeayuda
-- Permite asignar una prioridad predeterminada a cada motivo de mesa de ayuda
-- Valores: ALTA, MEDIA, BAJA  |  Default: MEDIA
-- Autor: Styp Canto Rondón
-- Fecha: 2026-02-20
-- ============================================================================

ALTER TABLE public.dim_motivos_mesadeayuda
    ADD COLUMN IF NOT EXISTS prioridad VARCHAR(10) NOT NULL DEFAULT 'MEDIA'
        CHECK (prioridad IN ('ALTA', 'MEDIA', 'BAJA'));

-- Asignar prioridades iniciales según la naturaleza de cada motivo
UPDATE public.dim_motivos_mesadeayuda SET prioridad = 'ALTA'  WHERE codigo IN ('PS_CITAR_ADICIONAL', 'PS_CONTACTAR_PACIENTE');
UPDATE public.dim_motivos_mesadeayuda SET prioridad = 'MEDIA' WHERE codigo IN ('PS_ACTUALIZAR_LISTADO', 'PS_CITA_REPROGRAMADA', 'PS_ENVIAR_ACTO_MEDICO');
UPDATE public.dim_motivos_mesadeayuda SET prioridad = 'BAJA'  WHERE codigo IN ('PS_ELIMINAR_EXCEDENTE', 'PS_ENVIO_IMAGENES', 'PS_CITA_ADICIONAL');

-- Índice para consultas por prioridad
CREATE INDEX IF NOT EXISTS idx_motivos_prioridad ON public.dim_motivos_mesadeayuda (prioridad);
