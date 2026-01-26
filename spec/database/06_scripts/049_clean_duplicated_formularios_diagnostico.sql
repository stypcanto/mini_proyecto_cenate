-- ============================================================================
-- 🧹 SCRIPT: Limpiar Formularios Duplicados EN_PROCESO
-- ============================================================================
--
-- Fecha:       2026-01-26
-- Versión:     v1.36.0
-- Propósito:   Eliminar registros duplicados antes de agregar UNIQUE index
-- Base Datos:  maestro_cenate
-- Tabla:       form_diag_formulario
--
-- ============================================================================

-- 📊 PASO 1: Identificar duplicados
-- ===================================
--
-- Ejecutar esta query PRIMERO para ver los duplicados:
--
-- SELECT id_ipress, anio, COUNT(*) as cantidad, STRING_AGG(id_formulario::text, ', ') as ids
-- FROM form_diag_formulario
-- WHERE estado = 'EN_PROCESO'
-- GROUP BY id_ipress, anio
-- HAVING COUNT(*) > 1
-- ORDER BY cantidad DESC;

-- 🧹 PASO 2: Eliminar registros duplicados
-- ==========================================
--
-- Estrategia: Mantener el registro MÁS RECIENTE (fecha_creacion más nueva)
--             Eliminar los anteriores
--
-- Para cada grupo (id_ipress, anio) con múltiples EN_PROCESO:
--   - Identificar el más reciente
--   - Eliminar los anteriores

DELETE FROM form_diag_formulario
WHERE id_formulario IN (
    -- Seleccionar IDs de registros a eliminar (todos EXCEPTO el más reciente)
    SELECT id_formulario
    FROM (
        SELECT
            id_formulario,
            id_ipress,
            anio,
            fecha_creacion,
            ROW_NUMBER() OVER (
                PARTITION BY id_ipress, anio
                ORDER BY fecha_creacion DESC
            ) as rn
        FROM form_diag_formulario
        WHERE estado = 'EN_PROCESO'
    ) ranked
    WHERE rn > 1  -- Todos excepto el primero (más reciente)
);

-- 📝 RESULTADO
-- ============
-- Se eliminan los registros duplicados EN_PROCESO
-- Se mantiene el más reciente para cada (id_ipress, anio)
--
-- Por ejemplo, si HI ANDAHUAYLAS (068, 2026) tiene 5 registros EN_PROCESO:
--   ✅ Se mantiene: 1 (el más reciente por fecha_creacion)
--   ❌ Se eliminan: 4 (los anteriores)
--
-- Los formularios en otros estados (ENVIADO, APROBADO, etc.) NO se afectan

-- 🔄 Verificación
-- ===============
-- Después de ejecutar, verificar que se limpió correctamente:
--
-- SELECT id_ipress, anio, COUNT(*) as cantidad
-- FROM form_diag_formulario
-- WHERE estado = 'EN_PROCESO'
-- GROUP BY id_ipress, anio
-- HAVING COUNT(*) > 1;
--
-- Resultado esperado: (vacío - sin duplicados)

-- ============================================================================
