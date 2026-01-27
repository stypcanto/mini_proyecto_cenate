-- V3_0_8: Crear tabla independiente de historial para módulo BOLSAS DE PACIENTES
-- SEPARADO completamente del módulo form107 (bolsa_107_carga)
-- Tabla propia: dim_historial_carga_bolsas

CREATE TABLE public.dim_historial_carga_bolsas (
    id_carga BIGSERIAL PRIMARY KEY,
    nombre_archivo VARCHAR(255) NOT NULL,
    hash_archivo VARCHAR(64) UNIQUE NOT NULL,
    usuario_carga VARCHAR(100),
    estado_carga VARCHAR(20) DEFAULT 'RECIBIDO',
    fecha_reporte DATE NOT NULL DEFAULT CURRENT_DATE,
    total_filas INTEGER DEFAULT 0,
    filas_ok INTEGER DEFAULT 0,
    filas_error INTEGER DEFAULT 0,
    fecha_creacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITH TIME ZONE DEFAULT CURRENT_TIMESTAMP
);

-- Índices para búsquedas rápidas
CREATE INDEX idx_historial_bolsas_fecha ON public.dim_historial_carga_bolsas(fecha_reporte DESC);
CREATE INDEX idx_historial_bolsas_usuario ON public.dim_historial_carga_bolsas(usuario_carga);
CREATE INDEX idx_historial_bolsas_estado ON public.dim_historial_carga_bolsas(estado_carga);

-- Comentario
COMMENT ON TABLE public.dim_historial_carga_bolsas IS 'Historial de cargas Excel del módulo Bolsas de Pacientes (INDEPENDIENTE del módulo 107)';
COMMENT ON COLUMN public.dim_historial_carga_bolsas.id_carga IS 'ID único de la carga';
COMMENT ON COLUMN public.dim_historial_carga_bolsas.estado_carga IS 'RECIBIDO, PROCESADO, ERROR';

-- Verificación
SELECT table_name FROM information_schema.tables 
WHERE table_schema = 'public' AND table_name = 'dim_historial_carga_bolsas';
