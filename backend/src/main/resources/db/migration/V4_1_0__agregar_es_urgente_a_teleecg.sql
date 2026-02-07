-- ============================================================================
-- v1.60.2: Agregar columna es_urgente a tabla tele_ecg_imagenes
-- ============================================================================
-- La entidad TeleECGImagen espera esta columna pero no existía en la BD
-- Esto causaba errores SQL 400 al intentar cargar imágenes

ALTER TABLE public.tele_ecg_imagenes
ADD COLUMN IF NOT EXISTS es_urgente BOOLEAN NOT NULL DEFAULT false;

-- Crear índice para búsquedas rápidas de imágenes urgentes
CREATE INDEX IF NOT EXISTS idx_tele_ecg_urgente ON public.tele_ecg_imagenes(es_urgente)
WHERE stat_imagen = 'A';

-- Log
SELECT 'v1.60.2: ✅ Columna es_urgente agregada a tele_ecg_imagenes' AS migration_status;
