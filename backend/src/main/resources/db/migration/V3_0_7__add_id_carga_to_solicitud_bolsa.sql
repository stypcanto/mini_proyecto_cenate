-- V3_0_7: Agregar vínculo entre dim_solicitud_bolsa y bolsa_107_carga
-- Esto permite que el historial de cargas esté directamente vinculado con las solicitudes

-- 1. Agregar columna id_carga a dim_solicitud_bolsa
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN id_carga BIGINT;

-- 2. Crear índice para búsquedas rápidas
CREATE INDEX idx_solicitud_id_carga ON public.dim_solicitud_bolsa(id_carga);

-- 3. Crear Foreign Key a bolsa_107_carga
ALTER TABLE public.dim_solicitud_bolsa
ADD CONSTRAINT fk_solicitud_carga
FOREIGN KEY (id_carga) 
REFERENCES public.bolsa_107_carga(id_carga) 
ON DELETE CASCADE 
ON UPDATE CASCADE;

-- 4. Comentario descriptivo
COMMENT ON COLUMN public.dim_solicitud_bolsa.id_carga IS 'ID de la carga Excel de origen (referencia a bolsa_107_carga)';

-- 5. Verificar que la columna se agregó
SELECT column_name, data_type 
FROM information_schema.columns 
WHERE table_name = 'dim_solicitud_bolsa' AND column_name = 'id_carga'
ORDER BY ordinal_position;
