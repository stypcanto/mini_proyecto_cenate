-- ============================================================================
-- 📋 Migración: dim_horario_estado + FK en ctr_horario
-- Fecha: 2026-03-02
-- Versión: v1.80.0
-- Descripción: Crea tabla de estados de horario y relación con ctr_horario
-- ============================================================================

-- 1. Crear tabla de estados de horario
CREATE TABLE IF NOT EXISTS public.dim_horario_estado (
    id_estado SMALLINT PRIMARY KEY,
    nombre_estado VARCHAR(30) NOT NULL,
    descripcion TEXT,
    activo BOOLEAN DEFAULT TRUE
);

-- 2. Insertar estados base
INSERT INTO public.dim_horario_estado (id_estado, nombre_estado, descripcion, activo)
VALUES
    (1, 'INICIADO', 'Horario creado', TRUE),
    (2, 'EN PROCESO', 'Horario en ejecución', TRUE),
    (3, 'ANULADO', 'Horario cancelado', TRUE),
    (4, 'TERMINADO', 'Horario finalizado', TRUE)
ON CONFLICT (id_estado) DO NOTHING;

-- 3. Agregar columna id_estado a ctr_horario (con default = 1 = INICIADO)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.columns 
        WHERE table_schema = 'public' 
          AND table_name = 'ctr_horario' 
          AND column_name = 'id_estado'
    ) THEN
        ALTER TABLE public.ctr_horario
        ADD COLUMN id_estado SMALLINT NOT NULL DEFAULT 1;
    END IF;
END $$;

-- 4. Crear FK constraint
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints 
        WHERE constraint_name = 'fk_ctr_horario_estado'
          AND table_name = 'ctr_horario'
    ) THEN
        ALTER TABLE public.ctr_horario
        ADD CONSTRAINT fk_ctr_horario_estado
        FOREIGN KEY (id_estado)
        REFERENCES public.dim_horario_estado(id_estado);
    END IF;
END $$;

-- 5. Verificación
SELECT 'dim_horario_estado' AS tabla, COUNT(*) AS registros FROM public.dim_horario_estado
UNION ALL
SELECT 'ctr_horario con id_estado', COUNT(*) FROM public.ctr_horario WHERE id_estado IS NOT NULL;
