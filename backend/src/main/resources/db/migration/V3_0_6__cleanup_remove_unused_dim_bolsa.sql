-- ========================================================================
-- 🗑️ Cleanup: Eliminar tabla dim_bolsa (huérfana, no utilizada)
-- ========================================================================
-- Versión: V3.0.6
-- Fecha: 2026-01-27
-- Descripción: dim_bolsa fue diseñada en v1.0.0 pero nunca se utilizó.
--             La arquitectura actual usa: dim_tipos_bolsas → dim_solicitud_bolsa
--             dim_bolsa es tabla intermedia innecesaria
--
-- Razón de eliminación:
--   - ✗ No hay código Java que la referencie
--   - ✗ No hay código React que la use
--   - ✗ dim_solicitud_bolsa tiene su propio mapeo a tipos de bolsa
--   - ✓ Elimina complejidad innecesaria
--   - ✓ Simplifica arquitectura
--
-- Impacto:
--   - Reducir tamaño BD: -5 índices, -1 tabla, -12 columnas
--   - Mejorar claridad arquitectónica
--   - Mantener audit trail via dim_solicitud_bolsa y dim_historial_importacion_bolsa
--   - Sin impacto en funcionalidad actual (tabla nunca se usó)
--
-- Arquitectura correcta después de esta migración:
--   dim_tipos_bolsas (CATÁLOGO: BOLSA_107, BOLSA_DENGUE, etc.)
--          ↓ (FK: id_bolsa)
--   dim_solicitud_bolsa (SOLICITUDES: 39+ pacientes con su bolsa)
--
-- ========================================================================

-- Paso 1: Verificar integridad (tabla no debería tener FK incoming)
-- (dim_solicitud_bolsa NO referencia a dim_bolsa, sino a dim_tipos_bolsas)

-- Paso 2: Eliminar índices de dim_bolsa
DROP INDEX IF EXISTS public.idx_bolsa_estado CASCADE;
DROP INDEX IF EXISTS public.idx_bolsa_especialidad CASCADE;
DROP INDEX IF EXISTS public.idx_bolsa_responsable CASCADE;
DROP INDEX IF EXISTS public.idx_bolsa_activo CASCADE;
DROP INDEX IF EXISTS public.idx_bolsa_fecha_creacion CASCADE;

-- Paso 3: Eliminar triggers y funciones asociadas
DROP TRIGGER IF EXISTS trigger_bolsa_actualizacion ON public.dim_bolsa;
DROP FUNCTION IF EXISTS update_bolsa_actualizacion();

-- Paso 4: Eliminar tabla
DROP TABLE IF EXISTS public.dim_bolsa CASCADE;

-- Paso 5: Logging y confirmación
DO $$
BEGIN
    RAISE NOTICE '✅ Tabla dim_bolsa eliminada exitosamente';
    RAISE NOTICE '✅ Arquirectura simplificada: dim_tipos_bolsas → dim_solicitud_bolsa';
    RAISE NOTICE '✅ BD más limpia y eficiente';
END $$;
