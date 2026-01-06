-- ============================================================================
-- SCRIPT DE CREACIÓN: Tabla dim_proced
-- Sistema: CENATE - Centro Nacional de Telemedicina del Perú
-- Autor: CENATE Development Team
-- Versión: 1.0
-- Fecha: Diciembre 2025
-- ============================================================================

-- Crear tabla dim_proced si no existe
CREATE TABLE IF NOT EXISTS public.dim_proced (
    id_proced SERIAL PRIMARY KEY,
    cod_proced VARCHAR(50) NOT NULL,
    desc_proced TEXT NOT NULL,
    stat_proced VARCHAR(1) NOT NULL DEFAULT 'A' CHECK (stat_proced IN ('A', 'I')),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    
    -- Constraint para código único
    CONSTRAINT uk_dim_proced_cod UNIQUE (cod_proced)
);

-- Crear índices para mejorar el rendimiento
CREATE INDEX IF NOT EXISTS idx_proced_cod_proced ON public.dim_proced(cod_proced);
CREATE INDEX IF NOT EXISTS idx_proced_stat_proced ON public.dim_proced(stat_proced);
CREATE INDEX IF NOT EXISTS idx_proced_desc_proced ON public.dim_proced(desc_proced);

-- Comentarios en la tabla y columnas
COMMENT ON TABLE public.dim_proced IS 'Tabla de procedimientos médicos CPT (Current Procedural Terminology)';
COMMENT ON COLUMN public.dim_proced.id_proced IS 'Identificador único del procedimiento';
COMMENT ON COLUMN public.dim_proced.cod_proced IS 'Código CPT del procedimiento';
COMMENT ON COLUMN public.dim_proced.desc_proced IS 'Descripción del procedimiento médico';
COMMENT ON COLUMN public.dim_proced.stat_proced IS 'Estado del procedimiento: A=Activo, I=Inactivo';
COMMENT ON COLUMN public.dim_proced.created_at IS 'Fecha y hora de creación del registro';
COMMENT ON COLUMN public.dim_proced.updated_at IS 'Fecha y hora de última actualización del registro';

-- Verificar que la tabla se creó correctamente
SELECT 
    'Tabla dim_proced creada exitosamente' AS mensaje,
    COUNT(*) AS total_registros
FROM public.dim_proced;
