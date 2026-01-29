-- ============================================================================
-- Migration: Add Dengue Fields to dim_solicitud_bolsa
-- Version: V2026_01_29_000001
-- Date: 2026-01-29
-- Author: Styp Canto Rondón
-- ============================================================================
--
-- DESCRIPCIÓN:
-- Agrega 4 columnas nuevas a dim_solicitud_bolsa para soportar
-- la integración del módulo Dengue sin crear tabla separada.
--
-- CAMBIOS:
-- 1. cenasicod (INTEGER) - Código CAS Adscripción
-- 2. dx_main (VARCHAR 10) - Diagnóstico CIE-10
-- 3. fecha_sintomas (DATE) - Fecha de síntomas
-- 4. semana_epidem (VARCHAR 20) - Semana epidemiológica
--
-- ÍNDICES:
-- 1. Único para deduplicación: (paciente_dni, fecha_atencion) when dx_main IS NOT NULL
-- 2. Búsqueda: (dx_main, cenasicod)
--
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1️⃣ AGREGAR COLUMNAS NUEVAS
-- ============================================================================

ALTER TABLE public.dim_solicitud_bolsa
ADD COLUMN IF NOT EXISTS cenasicod INTEGER,
ADD COLUMN IF NOT EXISTS dx_main VARCHAR(10),
ADD COLUMN IF NOT EXISTS fecha_sintomas DATE,
ADD COLUMN IF NOT EXISTS semana_epidem VARCHAR(20);

-- ============================================================================
-- 2️⃣ COMENTARIOS EN LAS COLUMNAS (Documentación)
-- ============================================================================

COMMENT ON COLUMN public.dim_solicitud_bolsa.cenasicod
  IS 'Código CAS Adscripción - Vinculación con dim_ipress para cargar IPRESS + Red automáticamente';

COMMENT ON COLUMN public.dim_solicitud_bolsa.dx_main
  IS 'Diagnóstico CIE-10 (A97.0=Sin alarma, A97.1=Con alarma, A97.2=Grave) - Validado contra dim_cie10';

COMMENT ON COLUMN public.dim_solicitud_bolsa.fecha_sintomas
  IS 'Fecha de inicio de síntomas (fec_st del Excel) - Para clasificación epidemiológica';

COMMENT ON COLUMN public.dim_solicitud_bolsa.semana_epidem
  IS 'Semana epidemiológica (ej: 2025SE25) - Para reportes y análisis';

-- ============================================================================
-- 3️⃣ ÍNDICE DE DEDUPLICACIÓN
-- ============================================================================
-- Evita duplicados: mismo paciente + misma fecha de atención = 1 sola vez
-- Solo aplica para registros dengue (dx_main IS NOT NULL)
-- ============================================================================

CREATE UNIQUE INDEX IF NOT EXISTS idx_dengue_dedup
ON public.dim_solicitud_bolsa (paciente_dni, fecha_atencion)
WHERE dx_main IS NOT NULL AND activo = true;

-- ============================================================================
-- 4️⃣ ÍNDICE DE BÚSQUEDA
-- ============================================================================
-- Optimiza búsquedas por diagnóstico + CAS
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_dengue_search
ON public.dim_solicitud_bolsa (dx_main, cenasicod)
WHERE activo = true;

-- ============================================================================
-- 5️⃣ ÍNDICE ADICIONAL: CAS Adscripción
-- ============================================================================
-- Para búsquedas rápidas por código de centro asistencial
-- ============================================================================

CREATE INDEX IF NOT EXISTS idx_dengue_cenasicod
ON public.dim_solicitud_bolsa (cenasicod)
WHERE dx_main IS NOT NULL AND activo = true;

-- ============================================================================
-- 6️⃣ VERIFICACIÓN POST-MIGRACIÓN
-- ============================================================================

-- Verificar que las columnas se crearon correctamente
SELECT
  column_name,
  data_type,
  is_nullable
FROM information_schema.columns
WHERE table_name = 'dim_solicitud_bolsa'
  AND column_name IN ('cenasicod', 'dx_main', 'fecha_sintomas', 'semana_epidem')
ORDER BY ordinal_position;

-- Verificar que los índices se crearon
SELECT
  indexname,
  indexdef
FROM pg_indexes
WHERE tablename = 'dim_solicitud_bolsa'
  AND indexname LIKE 'idx_dengue%'
ORDER BY indexname;

-- ============================================================================
-- ✅ FIN DE MIGRACIÓN
-- ============================================================================
--
-- Estadísticas post-migración:
-- - Columnas agregadas: 4
-- - Índices creados: 3
-- - Registros existentes: Sin cambios (nuevas columnas = NULL)
--
-- ROLLBACK:
-- Si necesita revertir, use:
-- DROP INDEX IF EXISTS idx_dengue_dedup;
-- DROP INDEX IF EXISTS idx_dengue_search;
-- DROP INDEX IF EXISTS idx_dengue_cenasicod;
-- ALTER TABLE dim_solicitud_bolsa DROP COLUMN IF EXISTS cenasicod;
-- ALTER TABLE dim_solicitud_bolsa DROP COLUMN IF EXISTS dx_main;
-- ALTER TABLE dim_solicitud_bolsa DROP COLUMN IF EXISTS fecha_sintomas;
-- ALTER TABLE dim_solicitud_bolsa DROP COLUMN IF EXISTS semana_epidem;
--
-- ============================================================================

COMMIT;
