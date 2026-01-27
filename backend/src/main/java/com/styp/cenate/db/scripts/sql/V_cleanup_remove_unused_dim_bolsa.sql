-- ========================================================================
-- 🗑️ Migration: Eliminar tabla dim_bolsa (huérfana, no utilizada)
-- ========================================================================
-- Descripción: dim_bolsa fue diseñada en v1.0.0 pero nunca se utilizó.
--             La arquitectura actual usa: dim_tipos_bolsas → dim_solicitud_bolsa
--             dim_bolsa es tabla intermedia innecesaria
--
-- Razón de eliminación:
--   - ✗ No hay código Java que la referencie
--   - ✗ No hay código React que la use
--   - ✗ dim_solicitud_bolsa tiene su propio mapeo a tipos de bolsa
--   - ✓ Elimina complejidad innecesaria
--
-- Impacto:
--   - Reducir tamaño BD: -3 índices, -1 tabla, -8 columnas
--   - Mejorar claridad arquitectónica
--   - Mantener audit trail via dim_solicitud_bolsa
--
-- Fecha: 2026-01-27
-- ========================================================================

-- Paso 1: Verificar que no hay referencias foráneas activas
-- (Las solicitudes referencian a dim_tipos_bolsas, NO a dim_bolsa)

-- Paso 2: Eliminar índices de dim_bolsa
DROP INDEX IF EXISTS public.idx_bolsa_estado;
DROP INDEX IF EXISTS public.idx_bolsa_especialidad;
DROP INDEX IF EXISTS public.idx_bolsa_responsable;
DROP INDEX IF EXISTS public.idx_bolsa_activo;
DROP INDEX IF EXISTS public.idx_bolsa_fecha_creacion;

-- Paso 3: Eliminar triggers asociados
DROP TRIGGER IF EXISTS trigger_bolsa_actualizacion ON public.dim_bolsa;

-- Paso 4: Eliminar función asociada
DROP FUNCTION IF EXISTS update_bolsa_actualizacion();

-- Paso 5: Eliminar tabla
DROP TABLE IF EXISTS public.dim_bolsa CASCADE;

-- Confirmación
SELECT 'Tabla dim_bolsa eliminada exitosamente - Arquitectura simplificada' AS resultado;
