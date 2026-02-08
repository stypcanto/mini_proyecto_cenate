-- =====================================================================
-- 📋 SCRIPT: Agregar "Respuestas de Requerimientos" a GESTIÓN TERRITORIAL
-- =====================================================================
-- Objetivo: Agregar página "Respuestas de los Requerimientos de las IPRESS"
--          al módulo GESTIÓN TERRITORIAL para usuarios con rol coordinador
--
-- Cambios:
-- 1. Agregar página "Respuestas de los Requerimientos de las IPRESS"
-- 2. Configurar acción (VER) para la página
-- 3. Asignar permisos a roles apropiados
--
-- Fecha: 2026-02-08
-- Versión: v1.58.0
-- Status: ✅ EJECUCIÓN RECOMENDADA
--
-- Tablas afectadas:
-- - dim_modulos_sistema (módulos)
-- - dim_paginas_modulo (páginas)
-- - dim_acciones_por_pagina (acciones)
-- - dim_roles_modulos (asignación de roles)
--
-- =====================================================================

-- =====================================================================
-- 1️⃣  PRECONDICIONES
-- =====================================================================

DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'dim_modulos_sistema'
    ) THEN
        RAISE EXCEPTION 'ERROR: Tabla dim_modulos_sistema no existe';
    END IF;

    IF NOT EXISTS (
        SELECT 1 FROM information_schema.tables
        WHERE table_name = 'dim_paginas_modulo'
    ) THEN
        RAISE EXCEPTION 'ERROR: Tabla dim_paginas_modulo no existe';
    END IF;

    RAISE NOTICE '✅ Validaciones de precondición completadas';
END $$;

-- =====================================================================
-- 2️⃣  CREAR PÁGINA "RESPUESTAS DE REQUERIMIENTOS DE IPRESS"
-- =====================================================================

-- Obtener el ID del módulo GESTIÓN TERRITORIAL
WITH modulo_target AS (
    SELECT id_modulo
    FROM dim_modulos_sistema
    WHERE LOWER(nombre_modulo) LIKE '%gestión territorial%'
       OR LOWER(nombre_modulo) LIKE '%territorial%'
    LIMIT 1
)
INSERT INTO dim_paginas_modulo (
    id_modulo,
    ruta_pagina,
    nombre_pagina,
    descripcion,
    icono,
    orden,
    activo
)
SELECT
    mt.id_modulo,
    '/roles/gestionterritorial/respuestas-solicitudes',
    'Respuestas de los Requerimientos de las IPRESS',
    'Consulte el estado de las respuestas enviadas por las IPRESS a los requerimientos de especialidades',
    'CheckCircle2',
    3,
    true
FROM modulo_target mt
WHERE NOT EXISTS (
    SELECT 1 FROM dim_paginas_modulo
    WHERE ruta_pagina = '/roles/gestionterritorial/respuestas-solicitudes'
);

DO $$
BEGIN
    RAISE NOTICE '✅ Página "Respuestas de los Requerimientos de las IPRESS" creada exitosamente';
END $$;

-- =====================================================================
-- 3️⃣  CREAR ACCIONES PARA LA NUEVA PÁGINA
-- =====================================================================

WITH nueva_pagina AS (
    SELECT id_pagina
    FROM dim_paginas_modulo
    WHERE ruta_pagina = '/roles/gestionterritorial/respuestas-solicitudes'
    LIMIT 1
)
INSERT INTO dim_acciones_por_pagina (
    id_pagina,
    codigo_accion,
    nombre_accion,
    descripcion,
    activo
)
SELECT
    np.id_pagina,
    'VER',
    'Ver contenido',
    'Visualizar respuestas de requerimientos de IPRESS en modo lectura',
    true
FROM nueva_pagina np
WHERE NOT EXISTS (
    SELECT 1 FROM dim_acciones_por_pagina
    WHERE id_pagina = np.id_pagina
    AND codigo_accion = 'VER'
);

DO $$
BEGIN
    RAISE NOTICE '✅ Acciones para página creadas';
END $$;

-- =====================================================================
-- 4️⃣  ASIGNAR PERMISOS AL ROL COORDINADOR
-- =====================================================================

-- Obtener el módulo que contiene la nueva página
WITH modulo_con_pagina AS (
    SELECT DISTINCT dpm.id_modulo
    FROM dim_paginas_modulo dpm
    WHERE dpm.ruta_pagina = '/roles/gestionterritorial/respuestas-solicitudes'
),
rol_coordinador AS (
    SELECT id_rol
    FROM dim_roles
    WHERE LOWER(nombre_rol) = 'coordinador'
       OR LOWER(nombre_rol) LIKE '%coordinador%'
    LIMIT 1
)
INSERT INTO dim_roles_modulos (
    id_rol,
    id_modulo,
    puede_ver,
    puede_crear,
    puede_editar,
    puede_eliminar,
    activo
)
SELECT
    rc.id_rol,
    mcp.id_modulo,
    true,  -- VER (lectura de respuestas)
    false, -- CREAR (no necesario)
    false, -- EDITAR (modo read-only)
    false, -- ELIMINAR (no necesario)
    true
FROM rol_coordinador rc
CROSS JOIN modulo_con_pagina mcp
WHERE NOT EXISTS (
    SELECT 1 FROM dim_roles_modulos drm
    WHERE drm.id_rol = rc.id_rol
    AND drm.id_modulo = mcp.id_modulo
);

DO $$
BEGIN
    RAISE NOTICE '✅ Permisos asignados al rol COORDINADOR';
END $$;

-- =====================================================================
-- 5️⃣  VERIFICACIÓN Y ESTADÍSTICAS
-- =====================================================================

DO $$
DECLARE
    v_pagina_existe INT;
    v_acciones_creadas INT;
    v_permisos_asignados INT;
BEGIN
    SELECT COUNT(*) INTO v_pagina_existe
    FROM dim_paginas_modulo
    WHERE ruta_pagina = '/roles/gestionterritorial/respuestas-solicitudes';

    SELECT COUNT(*) INTO v_acciones_creadas
    FROM dim_acciones_por_pagina dapp
    INNER JOIN dim_paginas_modulo dpm ON dapp.id_pagina = dpm.id_pagina
    WHERE dpm.ruta_pagina = '/roles/gestionterritorial/respuestas-solicitudes';

    SELECT COUNT(*) INTO v_permisos_asignados
    FROM dim_roles_modulos drm
    INNER JOIN dim_modulos_sistema dms ON drm.id_modulo = dms.id_modulo
    INNER JOIN dim_paginas_modulo dpm ON dms.id_modulo = dpm.id_modulo
    WHERE dpm.ruta_pagina = '/roles/gestionterritorial/respuestas-solicitudes';

    RAISE NOTICE '';
    RAISE NOTICE '✅ INSTALACIÓN COMPLETADA';
    RAISE NOTICE '📄 Página creada: %', CASE WHEN v_pagina_existe > 0 THEN 'SI' ELSE 'NO' END;
    RAISE NOTICE '🔑 Acciones asignadas: %', v_acciones_creadas;
    RAISE NOTICE '👤 Permisos configurados: %', v_permisos_asignados;
    RAISE NOTICE '';
    RAISE NOTICE '🔗 URL Frontend: /roles/gestionterritorial/respuestas-solicitudes';
    RAISE NOTICE '';
END $$;

-- Query final de validación
SELECT
    'Respuestas de los Requerimientos de las IPRESS - Instalación GESTIÓN TERRITORIAL' as "REPORTE",
    COUNT(*) as "Estado",
    CASE
        WHEN COUNT(*) > 0 THEN 'INSTALADO'
        ELSE 'NO INSTALADO'
    END as "Status"
FROM dim_paginas_modulo
WHERE ruta_pagina = '/roles/gestionterritorial/respuestas-solicitudes';

-- =====================================================================
-- 📝 NOTAS IMPORTANTES
-- =====================================================================
--
-- ✅ ESTRUCTURA FINAL:
--    Módulo GESTIÓN TERRITORIAL
--    └── Respuestas de los Requerimientos de las IPRESS
--        ├── URL: /roles/gestionterritorial/respuestas-solicitudes
--        ├── Icono: CheckCircle2
--        └── Acciones: VER (lectura)
--
-- 🔐 PERMISOS ASIGNADOS:
--    - COORDINADOR: VER ✅
--    - COORDINADOR_GESTION_CITAS: (heredado del módulo)
--
-- 📂 PRÓXIMOS PASOS:
--    1. Ejecutar este script en la base de datos CENATE
--    2. Verificar que la página aparece en el sidebar de Gestión Territorial
--    3. Verificar que el link navega a RespuestasSolicitudes.jsx
--    4. Confirmar el modo read-only funciona correctamente
--
-- =====================================================================
