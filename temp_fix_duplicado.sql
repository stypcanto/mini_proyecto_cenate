-- ============================================================================
-- SCRIPT: Eliminar carga duplicada de Excel (Bolsa 107)
-- ============================================================================
-- Propósito: Permite recargar el mismo archivo Excel en el mismo día
--            durante testing/desarrollo
-- Fecha: 2026-01-02
-- ============================================================================

-- 1) Ver todas las cargas de HOY
SELECT
    id_carga,
    nombre_archivo,
    LEFT(hash_archivo, 16) || '...' as hash_corto,
    fecha_reporte,
    usuario_carga,
    fecha_carga,
    total_filas,
    estado_carga
FROM public.bolsa_107_carga
WHERE fecha_reporte = CURRENT_DATE
ORDER BY fecha_carga DESC;

-- 2) OPCIÓN A: Eliminar la ÚLTIMA carga de hoy (más reciente)
-- Descomenta para ejecutar:
/*
DELETE FROM public.bolsa_107_carga
WHERE id_carga = (
    SELECT MAX(id_carga)
    FROM public.bolsa_107_carga
    WHERE fecha_reporte = CURRENT_DATE
);
*/

-- 3) OPCIÓN B: Eliminar TODAS las cargas de hoy
-- ⚠️ CUIDADO: Esto elimina TODAS las cargas del día actual
-- Descomenta para ejecutar:
/*
DELETE FROM public.bolsa_107_carga
WHERE fecha_reporte = CURRENT_DATE;
*/

-- 4) OPCIÓN C: Eliminar una carga específica por ID
-- Descomenta y reemplaza 123 con el ID real:
/*
DELETE FROM public.bolsa_107_carga
WHERE id_carga = 123;
*/

-- 5) Verificar que se eliminó
SELECT COUNT(*) as cargas_hoy
FROM public.bolsa_107_carga
WHERE fecha_reporte = CURRENT_DATE;
