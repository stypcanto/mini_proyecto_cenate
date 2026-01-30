-- =====================================================================
-- 📋 SCRIPT: Registrar Módulo 107 dentro de "Bolsas de Pacientes" (v3.0.0)
-- =====================================================================
-- Objetivo: Integrar el Módulo Formulario 107 como parte del módulo
--          principal "Bolsas de Pacientes" (Module ID: 9)
--
-- Cambios:
-- 1. CREAR 5 páginas de navegación para Módulo 107 dentro de Bolsas
-- 2. ELIMINAR módulo independiente "Formulario 107" si existe (Module ID: 8)
-- 3. CONFIGURAR permisos MBAC para nuevas páginas
--
-- Fecha: 2026-01-29
-- Versión: v3.0.0
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
-- 2️⃣  OBTENER ID DEL MÓDULO "BOLSAS DE PACIENTES"
-- =====================================================================

-- Encontrar el ID del módulo Bolsas de Pacientes (normalmente ID = 9)
DO $$
DECLARE
    v_id_bolsas_modulo INT;
BEGIN
    SELECT id_modulo INTO v_id_bolsas_modulo
    FROM dim_modulos_sistema
    WHERE nombre_modulo = 'Bolsas de Pacientes'
    LIMIT 1;

    IF v_id_bolsas_modulo IS NULL THEN
        RAISE EXCEPTION 'ERROR: Módulo "Bolsas de Pacientes" no encontrado en dim_modulos_sistema';
    END IF;

    RAISE NOTICE '✅ Módulo Bolsas de Pacientes encontrado: ID = %', v_id_bolsas_modulo;
END $$;

-- =====================================================================
-- 3️⃣  CREAR PÁGINAS DEL MÓDULO 107 DENTRO DE BOLSAS
-- =====================================================================

-- Obtener el ID_MODULO para usar en INSERTs
WITH modulo_bolsas AS (
    SELECT id_modulo
    FROM dim_modulos_sistema
    WHERE nombre_modulo = 'Bolsas de Pacientes'
    LIMIT 1
)
INSERT INTO dim_paginas_modulo (
    id_modulo,
    url_pagina,
    nombre_pagina,
    descripcion,
    icono,
    orden,
    activo,
    created_at,
    updated_at
)
SELECT
    mb.id_modulo,
    '/bolsas/modulo107/dashboard',
    'Módulo 107 - Dashboard',
    'Panel principal del Formulario 107 - Acceso a todas las funciones',
    'fa-chart-bar',
    1,
    true,
    NOW(),
    NOW()
FROM modulo_bolsas mb
WHERE NOT EXISTS (
    SELECT 1 FROM dim_paginas_modulo
    WHERE url_pagina = '/bolsas/modulo107/dashboard'
)
UNION ALL
SELECT
    mb.id_modulo,
    '/bolsas/modulo107/cargar-excel',
    'Módulo 107 - Cargar Excel',
    'Importar pacientes desde archivo Excel (.xlsx)',
    'fa-file-excel',
    2,
    true,
    NOW(),
    NOW()
FROM modulo_bolsas mb
WHERE NOT EXISTS (
    SELECT 1 FROM dim_paginas_modulo
    WHERE url_pagina = '/bolsas/modulo107/cargar-excel'
)
UNION ALL
SELECT
    mb.id_modulo,
    '/bolsas/modulo107/listado',
    'Módulo 107 - Listado Pacientes',
    'Ver todos los pacientes registrados en el Módulo 107',
    'fa-list',
    3,
    true,
    NOW(),
    NOW()
FROM modulo_bolsas mb
WHERE NOT EXISTS (
    SELECT 1 FROM dim_paginas_modulo
    WHERE url_pagina = '/bolsas/modulo107/listado'
)
UNION ALL
SELECT
    mb.id_modulo,
    '/bolsas/modulo107/buscar',
    'Módulo 107 - Búsqueda Avanzada',
    'Buscar pacientes con filtros: DNI, nombre, IPRESS, estado, fechas',
    'fa-search',
    4,
    true,
    NOW(),
    NOW()
FROM modulo_bolsas mb
WHERE NOT EXISTS (
    SELECT 1 FROM dim_paginas_modulo
    WHERE url_pagina = '/bolsas/modulo107/buscar'
)
UNION ALL
SELECT
    mb.id_modulo,
    '/bolsas/modulo107/estadisticas',
    'Módulo 107 - Estadísticas',
    'Dashboard con KPIs, distribuciones y análisis del Módulo 107',
    'fa-analytics',
    5,
    true,
    NOW(),
    NOW()
FROM modulo_bolsas mb
WHERE NOT EXISTS (
    SELECT 1 FROM dim_paginas_modulo
    WHERE url_pagina = '/bolsas/modulo107/estadisticas'
);

-- =====================================================================
-- 4️⃣  CREAR ACCIONES PARA LAS PÁGINAS DEL MÓDULO 107
-- =====================================================================

-- Insertar acciones estándar: VER, CREAR, EDITAR, ELIMINAR
WITH paginas_modulo_107 AS (
    SELECT id_pagina, url_pagina
    FROM dim_paginas_modulo
    WHERE url_pagina LIKE '/bolsas/modulo107/%'
)
INSERT INTO dim_acciones_por_pagina (
    id_pagina,
    codigo_accion,
    nombre_accion,
    descripcion,
    activo,
    created_at,
    updated_at
)
SELECT
    pm.id_pagina,
    CASE
        WHEN acc.accion = 'ver' THEN 'VER'
        WHEN acc.accion = 'crear' THEN 'CREAR'
        WHEN acc.accion = 'editar' THEN 'EDITAR'
        WHEN acc.accion = 'eliminar' THEN 'ELIMINAR'
        WHEN acc.accion = 'descargar' THEN 'DESCARGAR'
    END,
    CASE
        WHEN acc.accion = 'ver' THEN 'Ver contenido'
        WHEN acc.accion = 'crear' THEN 'Crear nuevo registro'
        WHEN acc.accion = 'editar' THEN 'Editar registro'
        WHEN acc.accion = 'eliminar' THEN 'Eliminar registro'
        WHEN acc.accion = 'descargar' THEN 'Descargar archivo'
    END,
    true,
    NOW(),
    NOW()
FROM paginas_modulo_107 pm
CROSS JOIN LATERAL (
    VALUES ('ver'), ('crear'), ('editar'), ('eliminar'), ('descargar')
) AS acc(accion)
WHERE NOT EXISTS (
    SELECT 1 FROM dim_acciones_por_pagina dapp
    WHERE dapp.id_pagina = pm.id_pagina
    AND dapp.codigo_accion = CASE
        WHEN acc.accion = 'ver' THEN 'VER'
        WHEN acc.accion = 'crear' THEN 'CREAR'
        WHEN acc.accion = 'editar' THEN 'EDITAR'
        WHEN acc.accion = 'eliminar' THEN 'ELIMINAR'
        WHEN acc.accion = 'descargar' THEN 'DESCARGAR'
    END
);

-- =====================================================================
-- 5️⃣  ASIGNAR PERMISOS A ROLES (SUPERADMIN, ADMIN, COORDINADOR)
-- =====================================================================

-- Asignar módulo Bolsas de Pacientes a los roles que tendrán acceso a Módulo 107
WITH modulo_bolsas AS (
    SELECT id_modulo
    FROM dim_modulos_sistema
    WHERE nombre_modulo = 'Bolsas de Pacientes'
    LIMIT 1
),
roles_asignables AS (
    SELECT id_rol, nombre_rol
    FROM dim_roles
    WHERE nombre_rol IN ('SUPERADMIN', 'ADMIN', 'COORDINADOR')
)
INSERT INTO dim_roles_modulos (
    id_rol,
    id_modulo,
    puede_ver,
    puede_crear,
    puede_editar,
    puede_eliminar,
    activo,
    created_at,
    updated_at
)
SELECT
    ra.id_rol,
    mb.id_modulo,
    true,
    CASE WHEN ra.nombre_rol IN ('SUPERADMIN', 'ADMIN') THEN true ELSE true END,
    CASE WHEN ra.nombre_rol IN ('SUPERADMIN', 'ADMIN') THEN true ELSE true END,
    CASE WHEN ra.nombre_rol = 'SUPERADMIN' THEN true ELSE false END,
    true,
    NOW(),
    NOW()
FROM roles_asignables ra
CROSS JOIN modulo_bolsas mb
WHERE NOT EXISTS (
    SELECT 1 FROM dim_roles_modulos drm
    WHERE drm.id_rol = ra.id_rol
    AND drm.id_modulo = mb.id_modulo
);

-- =====================================================================
-- 6️⃣  ELIMINAR MÓDULO INDEPENDIENTE "FORMULARIO 107" (SI EXISTE)
-- =====================================================================

-- Primero, eliminar las páginas del módulo antiguo
DELETE FROM dim_paginas_modulo
WHERE id_modulo IN (
    SELECT id_modulo
    FROM dim_modulos_sistema
    WHERE nombre_modulo = 'Formulario 107'
);

-- Luego, eliminar los registros de roles_módulos
DELETE FROM dim_roles_modulos
WHERE id_modulo IN (
    SELECT id_modulo
    FROM dim_modulos_sistema
    WHERE nombre_modulo = 'Formulario 107'
);

-- Finalmente, marcar como inactivo o eliminar el módulo antiguo
UPDATE dim_modulos_sistema
SET activo = false, updated_at = NOW()
WHERE nombre_modulo = 'Formulario 107';

RAISE NOTICE '✅ Módulo Formulario 107 (antigua versión) marcado como inactivo';

-- =====================================================================
-- 7️⃣  VERIFICACIÓN Y ESTADÍSTICAS
-- =====================================================================

DO $$
DECLARE
    v_total_paginas INT;
    v_total_acciones INT;
BEGIN
    SELECT COUNT(*) INTO v_total_paginas
    FROM dim_paginas_modulo
    WHERE url_pagina LIKE '/bolsas/modulo107/%';

    SELECT COUNT(*) INTO v_total_acciones
    FROM dim_acciones_por_pagina dapp
    INNER JOIN dim_paginas_modulo dpm ON dapp.id_pagina = dpm.id_pagina
    WHERE dpm.url_pagina LIKE '/bolsas/modulo107/%';

    RAISE NOTICE '';
    RAISE NOTICE '✅ INTEGRACIÓN COMPLETADA';
    RAISE NOTICE '📊 Páginas del Módulo 107 creadas: %', v_total_paginas;
    RAISE NOTICE '🔑 Acciones totales asignadas: %', v_total_acciones;
    RAISE NOTICE '';
    RAISE NOTICE '📋 URLs disponibles:';
    RAISE NOTICE '   - /bolsas/modulo107/dashboard';
    RAISE NOTICE '   - /bolsas/modulo107/cargar-excel';
    RAISE NOTICE '   - /bolsas/modulo107/listado';
    RAISE NOTICE '   - /bolsas/modulo107/buscar';
    RAISE NOTICE '   - /bolsas/modulo107/estadisticas';
END $$;

-- Query final de validación
SELECT
    'Módulo 107 - Integración en Bolsas' as "🔍 REPORTE",
    COUNT(*) as "Total Páginas",
    COUNT(CASE WHEN activo = true THEN 1 END) as "Activas",
    COUNT(DISTINCT url_pagina) as "URLs Únicas"
FROM dim_paginas_modulo
WHERE url_pagina LIKE '/bolsas/modulo107/%';

-- =====================================================================
-- 📝 NOTAS IMPORTANTES
-- =====================================================================
--
-- ✅ ESTRUCTURA FINAL:
--    Bolsas de Pacientes (Módulo ID: 9)
--    ├── Módulo 107 - Dashboard
--    ├── Módulo 107 - Cargar Excel
--    ├── Módulo 107 - Listado Pacientes
--    ├── Módulo 107 - Búsqueda Avanzada
--    └── Módulo 107 - Estadísticas
--
-- 🔐 PERMISOS ASIGNADOS:
--    - SUPERADMIN: VER, CREAR, EDITAR, ELIMINAR
--    - ADMIN:      VER, CREAR, EDITAR
--    - COORDINADOR: VER, CREAR, EDITAR
--
-- 🗑️  ELIMINADO:
--    - Módulo "Formulario 107" (versión antigua - ID: 8)
--
-- 📂 PRÓXIMOS PASOS EN FRONTEND:
--    1. Actualizar componentRegistry.js para usar nuevas URLs
--    2. Refactorizar Listado107.jsx con 5 tabs
--    3. Crear componentes ListadoPacientes, BusquedaAvanzada, EstadisticasModulo107
--
-- =====================================================================
