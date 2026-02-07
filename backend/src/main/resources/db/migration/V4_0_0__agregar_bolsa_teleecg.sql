-- =============================================================================
-- v4.0.0 - Agregar tipo de bolsa TELEECG para integración CENATE
-- =============================================================================
-- Propósito: Permitir que ECGs cargados por IPRESS aparezcan en sistema CENATE
-- Autor: Claude Haiku 4.5 x2
-- Fecha: 2026-02-06

-- 1️⃣ Verificar si ya existe el tipo de bolsa
DO $$
BEGIN
    -- Insertar BOLSA_TELEECG si no existe
    INSERT INTO public.dim_tipos_bolsas (cod_tipo_bolsa, desc_tipo_bolsa, stat_tipo_bolsa)
    SELECT 'BOLSA_TELEECG', 'Bolsa TeleECG - Electrocardiogramas remotos', 'A'
    WHERE NOT EXISTS (
        SELECT 1 FROM public.dim_tipos_bolsas
        WHERE cod_tipo_bolsa = 'BOLSA_TELEECG'
    );

    RAISE NOTICE '✅ Tipo de bolsa TELEECG verificado/creado';
END $$;

-- 2️⃣ Crear índices para optimizar búsquedas de TeleECG en dim_solicitud_bolsa
CREATE INDEX IF NOT EXISTS idx_solicitud_bolsa_teleecg
ON public.dim_solicitud_bolsa(id_bolsa, estado)
WHERE id_bolsa = (SELECT id_tipo_bolsa FROM public.dim_tipos_bolsas WHERE cod_tipo_bolsa = 'BOLSA_TELEECG');

-- 3️⃣ Agregar columna de referencia a imagen TeleECG (para auditoría)
ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS id_teleecg_imagen BIGINT DEFAULT NULL;

-- 4️⃣ Agregar comentario
COMMENT ON COLUMN public.dim_solicitud_bolsa.id_teleecg_imagen IS 'Referencia a imagen TeleECG (tele_ecg_imagenes.id_imagen) - v4.0.0';

-- ✅ Finalizado
COMMIT;
