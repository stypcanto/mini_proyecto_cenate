-- ============================================================================
-- Script: V3_4_0__agregar_estado_pendiente_cita.sql
-- Descripción: Insertar estado PENDIENTE_CITA faltante en tabla de estados
-- Fecha: 2026-02-05
-- Versión: v1.0
-- ============================================================================

-- Insertar estado PENDIENTE_CITA si no existe
INSERT INTO public.dim_estados_gestion_citas (cod_estado_cita, desc_estado_cita, stat_estado_cita)
VALUES (
    'PENDIENTE_CITA',
    'Pendiente Citar - Paciente nuevo que ingresó a la bolsa',
    'A'
)
ON CONFLICT (cod_estado_cita) DO NOTHING;

-- Verificar que se insertó correctamente
SELECT 'PENDIENTE_CITA insertado o ya existía' as resultado
WHERE EXISTS (
    SELECT 1 FROM public.dim_estados_gestion_citas
    WHERE cod_estado_cita = 'PENDIENTE_CITA'
);

COMMENT ON COLUMN public.dim_estados_gestion_citas.cod_estado_cita
    IS 'Código único del estado (ej: PENDIENTE_CITA, CITADO, NO_CONTESTA, etc.)';
