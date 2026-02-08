-- =====================================================================
-- 🧹 SCRIPT: Limpiar Datos de Prueba - Centro Nacional de Telemedicina
-- =====================================================================
-- Objetivo: Eliminar solicitudes de prueba (CENTRO NACIONAL DE TELEMEDICINA)
--          del módulo Gestión de Períodos
--
-- Datos a eliminar:
-- - IPRESS: CENTRO NACIONAL DE TELEMEDICINA (ID: 2)
-- - RED: AFESSALUD
-- - Períodos: 2026-01 a 2026-06
-- - Cantidad: 5 registros
--
-- Fecha: 2026-02-08
-- Versión: v1.58.0
-- Status: ✅ LISTA PARA EJECUTAR
--
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '⚠️  ADVERTENCIA: Este script eliminará datos de prueba';
    RAISE NOTICE 'IPRESS: CENTRO NACIONAL DE TELEMEDICINA (ID 2)';
    RAISE NOTICE 'Registros a eliminar: 5';
    RAISE NOTICE '';
END $$;

-- Contar registros antes
DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count
    FROM solicitud_turno_ipress sti
    JOIN dim_personal_cnt dpc ON sti.id_pers = dpc.id_pers
    WHERE dpc.id_ipress = 2
    AND sti.estado IN ('ENVIADO', 'INICIADO', 'BORRADOR');

    RAISE NOTICE '📋 Solicitudes identificadas: %', v_count;
END $$;

-- Eliminar detalles primero
DELETE FROM detalle_solicitud_turno
WHERE id_solicitud IN (
    SELECT sti.id_solicitud
    FROM solicitud_turno_ipress sti
    JOIN dim_personal_cnt dpc ON sti.id_pers = dpc.id_pers
    WHERE dpc.id_ipress = 2
    AND sti.estado IN ('ENVIADO', 'INICIADO', 'BORRADOR')
);

DO $$
BEGIN
    RAISE NOTICE '✅ Detalles de solicitudes eliminados';
END $$;

-- Eliminar solicitudes
DELETE FROM solicitud_turno_ipress
WHERE id_pers IN (
    SELECT id_pers FROM dim_personal_cnt WHERE id_ipress = 2
)
AND estado IN ('ENVIADO', 'INICIADO', 'BORRADOR');

DO $$
BEGIN
    RAISE NOTICE '✅ Solicitudes de prueba eliminadas';
END $$;

-- Verificación
DO $$
DECLARE
    v_remaining INT;
    v_total_solicitudes INT;
BEGIN
    SELECT COUNT(*) INTO v_remaining
    FROM solicitud_turno_ipress sti
    JOIN dim_personal_cnt dpc ON sti.id_pers = dpc.id_pers
    WHERE dpc.id_ipress = 2;

    SELECT COUNT(*) INTO v_total_solicitudes
    FROM solicitud_turno_ipress;

    RAISE NOTICE '';
    RAISE NOTICE '✅ LIMPIEZA COMPLETADA';
    RAISE NOTICE '📊 Solicitudes CENTRO NACIONAL restantes: %', v_remaining;
    RAISE NOTICE '📊 Total solicitudes en sistema: %', v_total_solicitudes;
    RAISE NOTICE '';
END $$;
