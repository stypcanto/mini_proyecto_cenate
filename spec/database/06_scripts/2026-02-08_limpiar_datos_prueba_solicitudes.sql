-- =====================================================================
-- 🧹 SCRIPT: Limpiar Datos de Prueba de Solicitudes
-- =====================================================================
-- Objetivo: Eliminar registros de prueba de la tabla solicitud_turno
--          para evitar confusión con datos reales
--
-- Datos a eliminar:
-- - IPRESS: AFESSALUD
-- - MACRORREGIÓN: CENTRO
-- - Períodos: 2026-02 a 2026-08
--
-- Fecha: 2026-02-08
-- Versión: v1.58.0
-- Status: ⚠️ EJECUCIÓN CON CUIDADO (Destructiva)
--
-- =====================================================================

-- =====================================================================
-- 1️⃣  PRECONDICIONES
-- =====================================================================

DO $$
BEGIN
    RAISE NOTICE '⚠️  ADVERTENCIA: Este script eliminará datos de prueba';
    RAISE NOTICE 'IPRESS: AFESSALUD';
    RAISE NOTICE 'Períodos: Enero 2026 - Agosto 2026';
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 2️⃣  BACKUP: Crear tabla temporal con datos que serán eliminados
-- =====================================================================

CREATE TEMP TABLE solicitudes_backup AS
SELECT *
FROM solicitud_turno
WHERE
    (nombreIpress LIKE '%AFESSALUD%' OR nombreIpress = 'AFESSALUD')
    AND periodo BETWEEN '202601' AND '202608'
    AND estado IN ('ENVIADO', 'INICIADO', 'BORRADOR');

DO $$
DECLARE
    v_count INT;
BEGIN
    SELECT COUNT(*) INTO v_count FROM solicitudes_backup;
    RAISE NOTICE '📋 Registros a eliminar (backup creado): %', v_count;
END $$;

-- =====================================================================
-- 3️⃣  ELIMINAR SOLICITUDES DE PRUEBA
-- =====================================================================

DELETE FROM solicitud_turno
WHERE
    (nombreIpress LIKE '%AFESSALUD%' OR nombreIpress = 'AFESSALUD')
    AND periodo BETWEEN '202601' AND '202608'
    AND estado IN ('ENVIADO', 'INICIADO', 'BORRADOR');

DO $$
BEGIN
    RAISE NOTICE '✅ Solicitudes de prueba eliminadas';
END $$;

-- =====================================================================
-- 4️⃣  VERIFICACIÓN
-- =====================================================================

DO $$
DECLARE
    v_solicitudes_afessalud INT;
    v_solicitudes_totales INT;
BEGIN
    SELECT COUNT(*) INTO v_solicitudes_afessalud
    FROM solicitud_turno
    WHERE nombreIpress = 'AFESSALUD';

    SELECT COUNT(*) INTO v_solicitudes_totales
    FROM solicitud_turno;

    RAISE NOTICE '';
    RAISE NOTICE '✅ LIMPIEZA COMPLETADA';
    RAISE NOTICE '📊 Solicitudes AFESSALUD restantes: %', v_solicitudes_afessalud;
    RAISE NOTICE '📊 Total solicitudes en sistema: %', v_solicitudes_totales;
    RAISE NOTICE '';
END $$;

-- =====================================================================
-- 📝 NOTAS IMPORTANTES
-- =====================================================================
--
-- ✅ Qué se eliminó:
--    - Solicitudes de IPRESS "AFESSALUD"
--    - Estados: ENVIADO, INICIADO, BORRADOR
--    - Períodos: Enero 2026 - Agosto 2026
--
-- 🔍 Cómo verificar:
--    SELECT COUNT(*) FROM solicitud_turno WHERE nombreIpress = 'AFESSALUD';
--    SELECT * FROM solicitud_turno WHERE nombreIpress = 'AFESSALUD';
--
-- 💾 Backup temporal:
--    Los datos eliminados están en solicitudes_backup (tabla temporal)
--    Se elimina automáticamente al cerrar la sesión de la BD
--
-- ⚠️  Si necesitas restaurar:
--    INSERT INTO solicitud_turno SELECT * FROM solicitudes_backup;
--    (Ejecutar antes de cerrar la conexión)
--
-- =====================================================================
