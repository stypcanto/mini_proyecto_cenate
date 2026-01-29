-- ============================================================================
-- ROLLBACK SCRIPT: Remove Dengue Fields from dim_solicitud_bolsa
-- Version: V2026_01_29_000002 (for emergency use only)
-- Date: 2026-01-29
-- ============================================================================
--
-- ⚠️  ADVERTENCIA: Este script SOLO debe ejecutarse en caso de emergencia
-- para revertir la migración V2026_01_29_000001
--
-- ACCIÓN: Elimina las 4 columnas nuevas e índices relacionados
-- ============================================================================

BEGIN;

-- ============================================================================
-- 1️⃣ ELIMINAR ÍNDICES
-- ============================================================================

DROP INDEX IF EXISTS public.idx_dengue_dedup;
DROP INDEX IF EXISTS public.idx_dengue_search;
DROP INDEX IF EXISTS public.idx_dengue_cenasicod;

-- ============================================================================
-- 2️⃣ ELIMINAR COLUMNAS
-- ============================================================================

ALTER TABLE public.dim_solicitud_bolsa
DROP COLUMN IF EXISTS cenasicod;

ALTER TABLE public.dim_solicitud_bolsa
DROP COLUMN IF EXISTS dx_main;

ALTER TABLE public.dim_solicitud_bolsa
DROP COLUMN IF EXISTS fecha_sintomas;

ALTER TABLE public.dim_solicitud_bolsa
DROP COLUMN IF EXISTS semana_epidem;

-- ============================================================================
-- ✅ ROLLBACK COMPLETADO
-- ============================================================================
--
-- Estado después del rollback:
-- - Columnas eliminadas: 4
-- - Índices eliminados: 3
-- - Datos en registros existentes: Sin cambios (rollback limpio)
-- - Tabla dim_solicitud_bolsa: Volvió a estado anterior
--
-- ============================================================================

COMMIT;
