-- ============================================================================
-- SCRIPT DE CREACIÓN: Tabla dim_especialidad
-- Sistema: CENATE - Centro Nacional de Telemedicina del Perú
-- Autor: CENATE Development Team
-- Versión: 1.0
-- Fecha: Diciembre 2025
-- ============================================================================

-- Crear tabla dim_especialidad si no existe
CREATE TABLE IF NOT EXISTS public.dim_especialidad (
    id_esp SERIAL PRIMARY KEY,
    desc_esp VARCHAR(150) NOT NULL,
    stat_esp VARCHAR(1) NOT NULL DEFAULT 'A' CHECK (stat_esp IN ('A', 'I')),
    id_prof INTEGER NOT NULL,
    id_pers INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Foreign keys
    CONSTRAINT fk_especialidad_profesion 
        FOREIGN KEY (id_prof) 
        REFERENCES public.dim_profesiones(id_prof) 
        ON DELETE RESTRICT,
    
    CONSTRAINT fk_especialidad_personal 
        FOREIGN KEY (id_pers) 
        REFERENCES public.dim_personal_cnt(id_pers) 
        ON DELETE SET NULL
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_especialidad_id_prof ON public.dim_especialidad(id_prof);
CREATE INDEX IF NOT EXISTS idx_especialidad_id_pers ON public.dim_especialidad(id_pers);
CREATE INDEX IF NOT EXISTS idx_especialidad_stat_esp ON public.dim_especialidad(stat_esp);

-- Comentarios en la tabla y columnas
COMMENT ON TABLE public.dim_especialidad IS 'Tabla de especialidades médicas o profesionales';
COMMENT ON COLUMN public.dim_especialidad.id_esp IS 'Identificador único de la especialidad';
COMMENT ON COLUMN public.dim_especialidad.desc_esp IS 'Descripción de la especialidad';
COMMENT ON COLUMN public.dim_especialidad.stat_esp IS 'Estado de la especialidad: A=Activo, I=Inactivo';
COMMENT ON COLUMN public.dim_especialidad.id_prof IS 'ID de la profesión asociada (referencia a dim_profesiones)';
COMMENT ON COLUMN public.dim_especialidad.id_pers IS 'ID del personal asociado (referencia a dim_personal_cnt)';
COMMENT ON COLUMN public.dim_especialidad.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN public.dim_especialidad.updated_at IS 'Fecha y hora de última actualización del registro';

