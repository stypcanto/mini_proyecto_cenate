-- ============================================================================
-- V3_1_3: Eliminar vinculación entre dim_solicitud_bolsa y formulario 107
-- ============================================================================
-- PROPÓSITO: Desacoplar completamente el módulo Formulario 107 del módulo
--            Solicitudes de Bolsa. Cada uno trabaja de forma independiente.
--
-- CAMBIOS:
-- 1. Eliminar Foreign Key fk_solicitud_carga_bolsas
-- 2. Eliminar índice idx_solicitud_id_carga
-- 3. Eliminar columna id_carga de dim_solicitud_bolsa
--
-- JUSTIFICACIÓN:
-- - Formulario 107 → Almacena en staging.bolsa_107_raw + bolsa_107_carga
-- - Solicitudes Bolsa → Almacena en dim_solicitud_bolsa
-- - NO deben mezclarse datos ni crear dependencias cruzadas
--
-- VERSIÓN: v1.0.0 (2026-01-28)
-- ============================================================================

-- ============================================================================
-- PASO 1: Eliminar Foreign Key
-- ============================================================================
ALTER TABLE public.dim_solicitud_bolsa
DROP CONSTRAINT IF EXISTS fk_solicitud_carga_bolsas CASCADE;

-- ============================================================================
-- PASO 2: Eliminar Índice
-- ============================================================================
DROP INDEX IF EXISTS public.idx_solicitud_id_carga;

-- ============================================================================
-- PASO 3: Eliminar Columna id_carga
-- ============================================================================
ALTER TABLE public.dim_solicitud_bolsa
DROP COLUMN IF EXISTS id_carga CASCADE;

-- ============================================================================
-- PASO 4: Verificación
-- ============================================================================
-- Confirmar que la columna fue eliminada
SELECT column_name, data_type
FROM information_schema.columns
WHERE table_name = 'dim_solicitud_bolsa'
AND table_schema = 'public'
AND column_name = 'id_carga';
-- Expected: 0 filas (no existe)

-- Confirmar que la FK fue eliminada
SELECT constraint_name
FROM information_schema.table_constraints
WHERE table_name = 'dim_solicitud_bolsa'
AND constraint_type = 'FOREIGN KEY'
AND table_schema = 'public'
ORDER BY constraint_name;
-- Expected: Sin fk_solicitud_carga_bolsas

-- ============================================================================
-- COMENTARIO FINAL
-- ============================================================================
-- ✅ dim_solicitud_bolsa está ahora COMPLETAMENTE DESACOPLADA
-- ✅ Formulario 107 usa SOLO sus propias tablas (bolsa_107_carga + staging.bolsa_107_raw)
-- ✅ No hay cruce de datos entre módulos
-- ============================================================================
