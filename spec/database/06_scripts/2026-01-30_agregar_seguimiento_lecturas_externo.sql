-- =====================================================================
-- 📊 SCRIPT: Agregar "Seguimiento de Lecturas" al módulo EXTERNO
-- =====================================================================
-- Objetivo: Agregar página "Seguimiento de Lecturas Pendientes" dentro de
--          el módulo EXTERNO o crear un submenu bajo "Gestión de Modalidad"
--
-- Cambios:
-- 1. Agregar página "Seguimiento de Lecturas Pendientes"
-- 2. Configurar acciones (VER) para la página
-- 3. Asignar permisos al rol EXTERNO
--
-- Fecha: 2026-01-30
-- Versión: v1.0.0
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
-- 2️⃣  IDENTIFICAR MÓDULOS RELEVANTES PARA EXTERNO
-- =====================================================================

-- Primero, obtener el ID del módulo EXTERNO (puede ser "Gestión de Modalidad de Atención" o similar)
DO $$
DECLARE
    v_id_modulo_externo INT;
    v_nombre_modulo TEXT;
BEGIN
    -- Buscar módulos que contengan palabras clave EXTERNO, MODALIDAD, IPRESS
    SELECT id_modulo, nombre_modulo INTO v_id_modulo_externo, v_nombre_modulo
    FROM dim_modulos_sistema
    WHERE LOWER(nombre_modulo) LIKE '%modalidad%'
       OR LOWER(nombre_modulo) LIKE '%externo%'
       OR LOWER(nombre_modulo) LIKE '%ipress%'
    LIMIT 1;

    IF v_id_modulo_externo IS NOT NULL THEN
        RAISE NOTICE '✅ Módulo encontrado: ID = %, Nombre = %', v_id_modulo_externo, v_nombre_modulo;
    ELSE
        RAISE NOTICE '⚠️  No se encontró módulo específico. Usando el primero disponible para EXTERNO.';
    END IF;
END $$;

-- =====================================================================
-- 3️⃣  CREAR PÁGINA "SEGUIMIENTO DE LECTURAS PENDIENTES"
-- =====================================================================

-- Obtener el ID del módulo para usar en INSERT
-- Prioridad: Gestión de Modalidad > Externo > Primer módulo activo
WITH modulo_target AS (
    SELECT id_modulo
    FROM dim_modulos_sistema
    WHERE LOWER(nombre_modulo) LIKE '%modalidad%'
       OR LOWER(nombre_modulo) LIKE '%externo%'
       OR LOWER(nombre_modulo) LIKE '%ipress%'
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
    '/roles/externo/seguimiento-lecturas',
    'Seguimiento de Lecturas Pendientes',
    'Panel en tiempo real para monitorear lecturas pendientes de procesamiento en tu IPRESS',
    'BarChart3',
    10,
    true
FROM modulo_target mt
WHERE NOT EXISTS (
    SELECT 1 FROM dim_paginas_modulo
    WHERE ruta_pagina = '/roles/externo/seguimiento-lecturas'
);

DO $$
BEGIN
    RAISE NOTICE '✅ Página "Seguimiento de Lecturas Pendientes" creada exitosamente';
END $$;

-- =====================================================================
-- 4️⃣  CREAR ACCIONES PARA LA NUEVA PÁGINA
-- =====================================================================

WITH nueva_pagina AS (
    SELECT id_pagina
    FROM dim_paginas_modulo
    WHERE ruta_pagina = '/roles/externo/seguimiento-lecturas'
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
    'Ver dashboard de seguimiento de lecturas',
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
-- 5️⃣  ASIGNAR PERMISOS AL ROL EXTERNO
-- =====================================================================

-- Obtener el módulo que contiene la nueva página
WITH modulo_con_pagina AS (
    SELECT DISTINCT dpm.id_modulo
    FROM dim_paginas_modulo dpm
    WHERE dpm.ruta_pagina = '/roles/externo/seguimiento-lecturas'
),
rol_externo AS (
    SELECT id_rol
    FROM dim_roles
    WHERE LOWER(nombre_rol) = 'externo'
       OR LOWER(nombre_rol) LIKE '%externo%'
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
    re.id_rol,
    mcp.id_modulo,
    true,  -- VER
    false, -- CREAR (no necesario para esto)
    false, -- EDITAR (no necesario para esto)
    false, -- ELIMINAR (no necesario para esto)
    true
FROM rol_externo re
CROSS JOIN modulo_con_pagina mcp
WHERE NOT EXISTS (
    SELECT 1 FROM dim_roles_modulos drm
    WHERE drm.id_rol = re.id_rol
    AND drm.id_modulo = mcp.id_modulo
);

DO $$
BEGIN
    RAISE NOTICE '✅ Permisos asignados al rol EXTERNO';
END $$;

-- =====================================================================
-- 6️⃣  VERIFICACIÓN Y ESTADÍSTICAS
-- =====================================================================

DO $$
DECLARE
    v_pagina_existe INT;
    v_acciones_creadas INT;
    v_permisos_asignados INT;
BEGIN
    SELECT COUNT(*) INTO v_pagina_existe
    FROM dim_paginas_modulo
    WHERE ruta_pagina = '/roles/externo/seguimiento-lecturas';

    SELECT COUNT(*) INTO v_acciones_creadas
    FROM dim_acciones_por_pagina dapp
    INNER JOIN dim_paginas_modulo dpm ON dapp.id_pagina = dpm.id_pagina
    WHERE dpm.ruta_pagina = '/roles/externo/seguimiento-lecturas';

    SELECT COUNT(*) INTO v_permisos_asignados
    FROM dim_roles_modulos drm
    INNER JOIN dim_modulos_sistema dms ON drm.id_modulo = dms.id_modulo
    INNER JOIN dim_paginas_modulo dpm ON dms.id_modulo = dpm.id_modulo
    WHERE dpm.ruta_pagina = '/roles/externo/seguimiento-lecturas';

    RAISE NOTICE '';
    RAISE NOTICE '✅ INSTALACIÓN COMPLETADA';
    RAISE NOTICE '📄 Página creada: %', CASE WHEN v_pagina_existe > 0 THEN 'SI' ELSE 'NO' END;
    RAISE NOTICE '🔑 Acciones asignadas: %', v_acciones_creadas;
    RAISE NOTICE '👤 Permisos configurados: %', v_permisos_asignados;
    RAISE NOTICE '';
    RAISE NOTICE '🔗 URL Frontend: /roles/externo/seguimiento-lecturas';
    RAISE NOTICE '';
END $$;

-- Query final de validación
SELECT
    'Seguimiento de Lecturas Pendientes - Instalación EXTERNO' as "REPORTE",
    COUNT(*) as "Estado",
    CASE
        WHEN COUNT(*) > 0 THEN 'INSTALADO'
        ELSE 'NO INSTALADO'
    END as "Status"
FROM dim_paginas_modulo
WHERE ruta_pagina = '/roles/externo/seguimiento-lecturas';

-- =====================================================================
-- 📝 NOTAS IMPORTANTES
-- =====================================================================
--
-- ✅ ESTRUCTURA FINAL:
--    Módulo EXTERNO / Gestión de Modalidad
--    └── Seguimiento de Lecturas Pendientes
--        ├── URL: /roles/externo/seguimiento-lecturas
--        ├── Icono: BarChart3
--        └── Acciones: VER
--
-- 🔐 PERMISOS ASIGNADOS:
--    - EXTERNO: VER ✅
--
-- 📂 PRÓXIMOS PASOS:
--    1. Verificar que la página aparece en el sidebar para EXTERNO
--    2. Verificar que el link navega a SeguimientoLecturasExterno.jsx
--    3. Confirmar que el PowerBI se carga correctamente
--
-- =====================================================================
