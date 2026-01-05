-- ========================================================================
-- Script: 024_crear_tabla_tipo_profesional.sql
-- Descripción: Crea la tabla dim_tipo_profesional para clasificar tipos
--              de profesionales en el sistema CENATE
-- Autor: Styp Canto Rondón
-- Fecha: 2026-01-03
-- Versión: 1.15.3
-- ========================================================================

-- Crear tabla dim_tipo_profesional
CREATE TABLE IF NOT EXISTS public.dim_tipo_profesional (
    id_tipo_prof SERIAL PRIMARY KEY,
    desc_tipo_prof VARCHAR(100) NOT NULL UNIQUE,
    stat_tipo_prof VARCHAR(1) NOT NULL DEFAULT 'A' CHECK (stat_tipo_prof IN ('A', 'I')),
    activo BOOLEAN NOT NULL DEFAULT true,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Comentarios en la tabla
COMMENT ON TABLE public.dim_tipo_profesional IS 'Tabla de tipos de profesionales del sistema CENATE';
COMMENT ON COLUMN public.dim_tipo_profesional.id_tipo_prof IS 'ID único del tipo profesional';
COMMENT ON COLUMN public.dim_tipo_profesional.desc_tipo_prof IS 'Descripción del tipo profesional (ej: ADMINISTRATIVO, ASISTENCIAL)';
COMMENT ON COLUMN public.dim_tipo_profesional.stat_tipo_prof IS 'Estado: A=Activo, I=Inactivo';
COMMENT ON COLUMN public.dim_tipo_profesional.activo IS 'Indica si el tipo profesional está activo';
COMMENT ON COLUMN public.dim_tipo_profesional.created_at IS 'Fecha de creación del registro';
COMMENT ON COLUMN public.dim_tipo_profesional.updated_at IS 'Fecha de última actualización';

-- Índices para mejorar performance
CREATE INDEX IF NOT EXISTS idx_tipo_profesional_estado
    ON public.dim_tipo_profesional(stat_tipo_prof)
    WHERE stat_tipo_prof = 'A';

CREATE INDEX IF NOT EXISTS idx_tipo_profesional_activo
    ON public.dim_tipo_profesional(activo)
    WHERE activo = true;

-- Insertar datos iniciales
INSERT INTO public.dim_tipo_profesional (desc_tipo_prof, stat_tipo_prof, activo) VALUES
    ('ADMINISTRATIVO', 'A', true),
    ('ASISTENCIAL', 'A', true),
    ('TÉCNICO', 'A', true),
    ('APOYO', 'A', true)
ON CONFLICT (desc_tipo_prof) DO NOTHING;

-- Verificar datos insertados
SELECT * FROM public.dim_tipo_profesional ORDER BY desc_tipo_prof;

-- ========================================================================
-- Fin del script
-- ========================================================================
