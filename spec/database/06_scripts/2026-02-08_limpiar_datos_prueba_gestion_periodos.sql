-- =====================================================================
-- 🧹 SCRIPT: Limpiar Datos de Prueba - Gestión de Períodos
-- =====================================================================
-- Objetivo: Eliminar solicitudes de prueba (SEDE CENTRAL/AFESSALUD)
--          del módulo Gestión de Períodos
--
-- Datos a eliminar:
-- - IPRESS: SEDE CENTRAL (ID: 407)
-- - RED: AFESSALUD
-- - Períodos: 2026-02 a 2026-08
-- - Cantidad: 3 registros
--
-- Fecha: 2026-02-08
-- Versión: v1.58.0
-- Status: ✅ LISTA PARA EJECUTAR
--
-- =====================================================================

-- =====================================================================
-- 1️⃣  PRECONDICIONES
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '⚠️  ADVERTENCIA: Este script eliminará datos de prueba';
    RAISE NOTICE 'IPRESS: SEDE CENTRAL (ID 407)';
    RAISE NOTICE 'Registros a eliminar: 3';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 2️⃣  IDENTIFICAR SOLICITUDES DE PRUEBA
-- =====================================================================

DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM solicitud_turno_ipress sti
    JOIN dim_personal_cnt dpc ON sti.id_pers = dpc.id_pers
    WHERE dpc.id_ipress = 407
    AND sti.estado IN ('ENVIADO', 'INICIADO', 'BORRADOR');

    RAISE NOTICE '📋 Solicitudes identificadas: %', v_count;
END $$;

-- =====================================================================
-- 3️⃣  ELIMINAR DETALLES PRIMERO (Foreign Key Constraint)
-- =====================================================================

DELETE FROM detalle_solicitud_turno
WHERE id_solicitud IN (
    SELECT sti.id_solicitud
    FROM solicitud_turno_ipress sti
    JOIN dim_personal_cnt dpc ON sti.id_pers = dpc.id_pers
    WHERE dpc.id_ipress = 407
    AND sti.estado IN ('ENVIADO', 'INICIADO', 'BORRADOR')
);

DO $$
BEGIN
    RAISE NOTICE '✅ Detalles de solicitudes eliminados';
END $$;

-- =====================================================================
-- 4️⃣  ELIMINAR SOLICITUDES DE PRUEBA
-- =====================================================================

DELETE FROM solicitud_turno_ipress
WHERE id_pers IN (
    SELECT id_pers FROM dim_personal_cnt WHERE id_ipress = 407
)
AND estado IN ('ENVIADO', 'INICIADO', 'BORRADOR');

DO $$
BEGIN
    RAISE NOTICE '✅ Solicitudes de prueba eliminadas';
END $$;

-- =====================================================================
-- 5️⃣  VERIFICACIÓN FINAL
-- =====================================================================

DO $$
DECLARE
    v_remaining INT;
    v_total_solicitudes INT;
BEGIN
    SELECT COUNT(*) INTO v_remaining
    FROM solicitud_turno_ipress sti
    JOIN dim_personal_cnt dpc ON sti.id_pers = dpc.id_pers
    WHERE dpc.id_ipress = 407;

    SELECT COUNT(*) INTO v_total_solicitudes
    FROM solicitud_turno_ipress;

    RAISE NOTICE '';
    RAISE NOTICE '✅ LIMPIEZA COMPLETADA';
    RAISE NOTICE '📊 Solicitudes SEDE CENTRAL restantes: %', v_remaining;
    RAISE NOTICE '📊 Total solicitudes en sistema: %', v_total_solicitudes;
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 📝 NOTAS
-- =====================================================================
--
-- ✅ Qué se eliminó:
--    - 3 solicitudes de prueba (SEDE CENTRAL)
--    - Todos sus detalles asociados
--    - Estados: ENVIADO, INICIADO, BORRADOR
--
-- 🔍 Verificación manual:
--    SELECT * FROM solicitud_turno_ipress
--    WHERE id_pers IN (SELECT id_pers FROM dim_personal_cnt WHERE id_ipress = 407);
--
-- =====================================================================
