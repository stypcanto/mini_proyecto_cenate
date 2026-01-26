-- ============================================================================
-- 🧹 SCRIPT: Limpiar Formularios Duplicados (EN_PROCESO + ENVIADO/FIRMADO)
-- ============================================================================
--
-- Fecha:       2026-01-26
-- Versión:     v1.37.0
-- Propósito:   Eliminar EN_PROCESO cuando existe ENVIADO/FIRMADO más reciente
-- Base Datos:  maestro_cenate
-- Tabla:       form_diag_formulario
--
-- Problema: Usuario crea EN_PROCESO, sin completarlo crea OTRO, luego lo envía
--           Resultado: 2 registros para la misma IPRESS+año
--           - id=125: EN_PROCESO (14:36:43) - VIEJO
--           - id=126: ENVIADO    (14:59:40) - RECIENTE
--
-- Solución: Eliminar EN_PROCESO más antiguos cuando existe ENVIADO+ más reciente
-- ============================================================================

-- 📊 PASO 1: Identificar duplicados con estados mixtos
-- ===============================================

SELECT
    f1.id_ipress,
    f1.anio,
    COUNT(*) as total_registros,
    STRING_AGG(DISTINCT f1.estado, ', ') as estados,
    STRING_AGG(f1.id_formulario::text, ', ' ORDER BY f1.fecha_creacion) as ids_por_antigüedad
FROM form_diag_formulario f1
WHERE f1.estado IN ('EN_PROCESO', 'ENVIADO', 'FIRMADO', 'APROBADO')
GROUP BY f1.id_ipress, f1.anio
HAVING COUNT(*) > 1
AND EXISTS (
    SELECT 1 FROM form_diag_formulario f2
    WHERE f2.id_ipress = f1.id_ipress
    AND f2.anio = f1.anio
    AND f2.estado IN ('ENVIADO', 'FIRMADO', 'APROBADO')
)
ORDER BY f1.id_ipress, f1.anio;

-- 🧹 PASO 2: Eliminar formularios EN_PROCESO cuando existe estado más avanzado
-- ============================================================================

DELETE FROM form_diag_formulario
WHERE id_formulario IN (
    SELECT f1.id_formulario
    FROM form_diag_formulario f1
    WHERE f1.estado = 'EN_PROCESO'
    AND EXISTS (
        -- Si existe otro registro para la misma IPRESS+año
        -- en estado ENVIADO/FIRMADO/APROBADO más reciente
        SELECT 1 FROM form_diag_formulario f2
        WHERE f2.id_ipress = f1.id_ipress
        AND f2.anio = f1.anio
        AND f2.estado IN ('ENVIADO', 'FIRMADO', 'APROBADO')
        AND f2.fecha_creacion > f1.fecha_creacion
    )
);

-- 📈 PASO 3: Verificar que no quedan duplicados de este tipo
-- ===========================================================

SELECT
    f1.id_ipress,
    f1.anio,
    COUNT(*) as total_registros,
    STRING_AGG(DISTINCT f1.estado, ', ') as estados
FROM form_diag_formulario f1
WHERE f1.estado IN ('EN_PROCESO', 'ENVIADO', 'FIRMADO', 'APROBADO')
GROUP BY f1.id_ipress, f1.anio
HAVING COUNT(*) > 1
AND EXISTS (
    SELECT 1 FROM form_diag_formulario f2
    WHERE f2.id_ipress = f1.id_ipress
    AND f2.anio = f1.anio
    AND COUNT(DISTINCT f2.estado) > 1
);

-- Resultado esperado: (0 filas - sin duplicados)

-- ============================================================================
-- ✅ ROLLBACK (si es necesario deshacer)
-- ============================================================================
--
-- Este script es solo DELETE sin INSERT, así que NO hay rollback directo
-- Para recuperar datos, necesitarías: RESTORE FROM BACKUP
--
-- ============================================================================
