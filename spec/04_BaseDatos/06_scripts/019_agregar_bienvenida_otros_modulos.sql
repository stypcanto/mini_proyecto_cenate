-- ========================================================================
-- 👋 Script: Agregar Bienvenida a Otros Módulos Principales
-- ------------------------------------------------------------------------
-- Agrega la página "Bienvenida" a:
-- - Administración (id 27)
-- - Panel Médico (id 22)
-- - Gestión de Coordinador Médico (id 19)
-- - Coordinador de Gestión de Citas (id 41)
--
-- Versión: v1.15.18
-- Fecha: 2026-01-03
-- ========================================================================

BEGIN;

-- ========================================================================
-- 0. VERIFICAR Y CORREGIR SECUENCIA
-- ========================================================================
SELECT setval('dim_paginas_modulo_id_pagina_seq',
    COALESCE((SELECT MAX(id_pagina) FROM dim_paginas_modulo), 1) + 1,
    false);

-- ========================================================================
-- 1. ACTUALIZAR ORDEN DE PÁGINAS EXISTENTES
-- ------------------------------------------------------------------------
-- Incrementar orden de páginas existentes para hacer espacio
-- ========================================================================

-- Administración (id 27)
UPDATE dim_paginas_modulo
SET orden = COALESCE(orden, 0) + 1
WHERE id_modulo = 27;

-- Panel Médico (id 22)
UPDATE dim_paginas_modulo
SET orden = COALESCE(orden, 0) + 1
WHERE id_modulo = 22;

-- Gestión de Coordinador Médico (id 19)
UPDATE dim_paginas_modulo
SET orden = COALESCE(orden, 0) + 1
WHERE id_modulo = 19;

-- Coordinador de Gestión de Citas (id 41)
UPDATE dim_paginas_modulo
SET orden = COALESCE(orden, 0) + 1
WHERE id_modulo = 41;

-- ========================================================================
-- 2. INSERTAR PÁGINAS DE BIENVENIDA
-- ========================================================================

-- Bienvenida para Administración (id_modulo = 27)
INSERT INTO dim_paginas_modulo (
    id_modulo, nombre_pagina, ruta_pagina, descripcion, activo, orden
) VALUES (
    27,
    'Bienvenida',
    '/admin/bienvenida',
    'Pantalla de bienvenida con información de la cuenta, roles y funciones del usuario',
    true,
    1
) ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- Bienvenida para Panel Médico (id_modulo = 22)
INSERT INTO dim_paginas_modulo (
    id_modulo, nombre_pagina, ruta_pagina, descripcion, activo, orden
) VALUES (
    22,
    'Bienvenida',
    '/roles/medico/bienvenida',
    'Pantalla de bienvenida con información de la cuenta, roles y funciones del usuario',
    true,
    1
) ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- Bienvenida para Coordinador Médico (id_modulo = 19)
INSERT INTO dim_paginas_modulo (
    id_modulo, nombre_pagina, ruta_pagina, descripcion, activo, orden
) VALUES (
    19,
    'Bienvenida',
    '/roles/coordinador/bienvenida',
    'Pantalla de bienvenida con información de la cuenta, roles y funciones del usuario',
    true,
    1
) ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- Bienvenida para Coordinador de Citas (id_modulo = 41)
INSERT INTO dim_paginas_modulo (
    id_modulo, nombre_pagina, ruta_pagina, descripcion, activo, orden
) VALUES (
    41,
    'Bienvenida',
    '/roles/coordcitas/bienvenida',
    'Pantalla de bienvenida con información de la cuenta, roles y funciones del usuario',
    true,
    1
) ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- ========================================================================
-- 3. ASIGNAR PERMISOS A ROLES
-- ------------------------------------------------------------------------
-- Roles conocidos:
-- - SUPERADMIN (id 1) y ADMIN (id 2) → Admin
-- - MEDICO (id 3) → Panel Médico
-- - COORDINADOR (id 4) → Coordinador Médico
-- - COORD_GESTION_CITAS (buscar) → Coordinador de Citas
-- ========================================================================

DO $$
DECLARE
    v_pagina_admin INTEGER;
    v_pagina_medico INTEGER;
    v_pagina_coord INTEGER;
    v_pagina_coordcitas INTEGER;
    v_rol_coord_citas INTEGER;
BEGIN
    -- Obtener IDs de páginas recién creadas
    SELECT id_pagina INTO v_pagina_admin
    FROM dim_paginas_modulo
    WHERE id_modulo = 27 AND ruta_pagina = '/admin/bienvenida';

    SELECT id_pagina INTO v_pagina_medico
    FROM dim_paginas_modulo
    WHERE id_modulo = 22 AND ruta_pagina = '/roles/medico/bienvenida';

    SELECT id_pagina INTO v_pagina_coord
    FROM dim_paginas_modulo
    WHERE id_modulo = 19 AND ruta_pagina = '/roles/coordinador/bienvenida';

    SELECT id_pagina INTO v_pagina_coordcitas
    FROM dim_paginas_modulo
    WHERE id_modulo = 41 AND ruta_pagina = '/roles/coordcitas/bienvenida';

    -- Buscar rol de coordinador de citas (puede variar)
    SELECT id_rol INTO v_rol_coord_citas
    FROM dim_roles
    WHERE desc_rol ILIKE '%COORD%CITA%'
       OR desc_rol ILIKE '%GESTION%CITA%'
    LIMIT 1;

    -- ====================================================================
    -- PERMISOS PARA ADMINISTRACIÓN
    -- ====================================================================

    -- SUPERADMIN (id_rol = 1)
    IF v_pagina_admin IS NOT NULL THEN
        INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, activo)
        VALUES (1, v_pagina_admin, true, true)
        ON CONFLICT (id_rol, id_pagina) DO UPDATE
        SET puede_ver = true, activo = true;

        RAISE NOTICE '✓ Permiso: SUPERADMIN -> Bienvenida Admin';
    END IF;

    -- ADMIN (id_rol = 2)
    IF v_pagina_admin IS NOT NULL THEN
        INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, activo)
        VALUES (2, v_pagina_admin, true, true)
        ON CONFLICT (id_rol, id_pagina) DO UPDATE
        SET puede_ver = true, activo = true;

        RAISE NOTICE '✓ Permiso: ADMIN -> Bienvenida Admin';
    END IF;

    -- ====================================================================
    -- PERMISOS PARA PANEL MÉDICO
    -- ====================================================================

    -- MEDICO (id_rol = 3)
    IF v_pagina_medico IS NOT NULL THEN
        INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, activo)
        VALUES (3, v_pagina_medico, true, true)
        ON CONFLICT (id_rol, id_pagina) DO UPDATE
        SET puede_ver = true, activo = true;

        RAISE NOTICE '✓ Permiso: MEDICO -> Bienvenida Médico';
    END IF;

    -- ====================================================================
    -- PERMISOS PARA COORDINADOR MÉDICO
    -- ====================================================================

    -- COORDINADOR (id_rol = 4)
    IF v_pagina_coord IS NOT NULL THEN
        INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, activo)
        VALUES (4, v_pagina_coord, true, true)
        ON CONFLICT (id_rol, id_pagina) DO UPDATE
        SET puede_ver = true, activo = true;

        RAISE NOTICE '✓ Permiso: COORDINADOR -> Bienvenida Coordinador';
    END IF;

    -- ====================================================================
    -- PERMISOS PARA COORDINADOR DE CITAS
    -- ====================================================================

    IF v_pagina_coordcitas IS NOT NULL AND v_rol_coord_citas IS NOT NULL THEN
        INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, activo)
        VALUES (v_rol_coord_citas, v_pagina_coordcitas, true, true)
        ON CONFLICT (id_rol, id_pagina) DO UPDATE
        SET puede_ver = true, activo = true;

        RAISE NOTICE '✓ Permiso: COORD_CITAS (id:%) -> Bienvenida CoordCitas', v_rol_coord_citas;
    END IF;
END $$;

-- ========================================================================
-- 4. VERIFICACIÓN FINAL
-- ========================================================================

SELECT
    '🎯 RESUMEN DE CAMBIOS' as titulo,
    '' as detalle
UNION ALL
SELECT
    '📄 Páginas Bienvenida creadas:',
    COUNT(*)::text
FROM dim_paginas_modulo
WHERE nombre_pagina = 'Bienvenida'
  AND id_modulo IN (19, 22, 27, 41)
UNION ALL
SELECT
    '👥 Permisos asignados:',
    COUNT(*)::text
FROM dim_permisos_pagina_rol pr
JOIN dim_paginas_modulo pp ON pr.id_pagina = pp.id_pagina
WHERE pp.nombre_pagina = 'Bienvenida'
  AND pp.id_modulo IN (19, 22, 27, 41);

-- Mostrar páginas creadas
SELECT
    '📋 NUEVAS PÁGINAS' as info,
    ms.id_modulo,
    ms.nombre_modulo,
    pp.nombre_pagina,
    pp.ruta_pagina,
    pp.orden
FROM dim_paginas_modulo pp
JOIN dim_modulos_sistema ms ON pp.id_modulo = ms.id_modulo
WHERE pp.nombre_pagina = 'Bienvenida'
  AND pp.id_modulo IN (19, 22, 27, 41)
ORDER BY pp.id_modulo;

-- Mostrar permisos asignados
SELECT
    '🔐 PERMISOS ASIGNADOS' as info,
    r.desc_rol as rol,
    pp.ruta_pagina as pagina,
    pr.puede_ver,
    pr.activo
FROM dim_permisos_pagina_rol pr
JOIN dim_paginas_modulo pp ON pr.id_pagina = pp.id_pagina
JOIN dim_roles r ON pr.id_rol = r.id_rol
WHERE pp.nombre_pagina = 'Bienvenida'
  AND pp.id_modulo IN (19, 22, 27, 41)
ORDER BY r.desc_rol;

COMMIT;

-- ========================================================================
-- ✅ SCRIPT COMPLETADO
-- ========================================================================
-- Páginas de Bienvenida agregadas a 4 módulos adicionales.
-- Total de módulos con Bienvenida: 6
-- ========================================================================
