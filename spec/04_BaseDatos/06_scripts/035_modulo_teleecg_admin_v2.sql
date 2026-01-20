-- ============================================================
-- Script: Modulo TeleECG para Panel Administrativo (V2 - CORREGIDO)
-- Fecha: 2026-01-19
-- Descripcion: Crea modulo TeleECG con pagina "TeleECG Recibidas"
--   - Permite a administradores ver TODAS las ECGs recibidas
--   - Submodulo: TeleECG Recibidas (tabla consolidada de todas IPRESS)
--   - Acceso: SUPERADMIN, ADMIN, COORDINADOR_RED, ENFERMERIA
-- ============================================================

-- Nota: El módulo ya fue creado en la ejecución anterior

-- ============================================================
-- 1. CREAR PAGINA "TeleECG Recibidas" (submodulo principal)
-- ============================================================
-- Buscar primero si la página ya existe, si no, crearla
DO $$
DECLARE
    v_modulo_id INTEGER;
    v_pagina_id INTEGER;
BEGIN
    -- Obtener ID del módulo TeleECG
    SELECT id_modulo INTO v_modulo_id
    FROM dim_modulos_sistema
    WHERE nombre_modulo = 'TeleECG';

    IF v_modulo_id IS NOT NULL THEN
        -- Verificar si la página ya existe
        SELECT id_pagina INTO v_pagina_id
        FROM dim_paginas_modulo
        WHERE ruta_pagina = '/teleecg/recibidas';

        -- Si no existe, crearla
        IF v_pagina_id IS NULL THEN
            INSERT INTO dim_paginas_modulo (
                id_modulo,
                nombre_pagina,
                ruta_pagina,
                descripcion,
                orden,
                activo,
                created_at,
                updated_at
            ) VALUES (
                v_modulo_id,
                'TeleECG Recibidas',
                '/teleecg/recibidas',
                'Vista consolidada de todos los electrocardiogramas recibidos de las IPRESS',
                1,
                true,
                NOW(),
                NOW()
            );
            RAISE NOTICE 'Página "TeleECG Recibidas" creada exitosamente';
        ELSE
            RAISE NOTICE 'Página "TeleECG Recibidas" ya existe (ID: %)', v_pagina_id;
            -- Actualizar si está inactiva
            UPDATE dim_paginas_modulo
            SET activo = true, updated_at = NOW()
            WHERE id_pagina = v_pagina_id;
        END IF;
    ELSE
        RAISE EXCEPTION 'Módulo TeleECG no encontrado';
    END IF;
END $$;

-- ============================================================
-- 2. CREAR PAGINA "Estadísticas TeleECG" (opcional)
-- ============================================================
DO $$
DECLARE
    v_modulo_id INTEGER;
    v_pagina_id INTEGER;
BEGIN
    SELECT id_modulo INTO v_modulo_id
    FROM dim_modulos_sistema
    WHERE nombre_modulo = 'TeleECG';

    IF v_modulo_id IS NOT NULL THEN
        SELECT id_pagina INTO v_pagina_id
        FROM dim_paginas_modulo
        WHERE ruta_pagina = '/teleecg/estadisticas';

        IF v_pagina_id IS NULL THEN
            INSERT INTO dim_paginas_modulo (
                id_modulo,
                nombre_pagina,
                ruta_pagina,
                descripcion,
                orden,
                activo,
                created_at,
                updated_at
            ) VALUES (
                v_modulo_id,
                'Estadísticas',
                '/teleecg/estadisticas',
                'Estadísticas y reportes de ECGs por IPRESS',
                2,
                true,
                NOW(),
                NOW()
            );
            RAISE NOTICE 'Página "Estadísticas" creada exitosamente';
        END IF;
    END IF;
END $$;

-- ============================================================
-- 3. ASIGNAR PERMISOS A ROLES (SUPERADMIN Y ADMIN)
-- ============================================================
DO $$
DECLARE
    v_admin_id INTEGER;
    v_superadmin_id INTEGER;
    v_pagina_id INTEGER;
BEGIN
    -- Obtener IDs de roles
    SELECT id_rol INTO v_superadmin_id FROM dim_roles WHERE desc_rol = 'SUPERADMIN' LIMIT 1;
    SELECT id_rol INTO v_admin_id FROM dim_roles WHERE desc_rol = 'ADMIN' LIMIT 1;

    -- Obtener ID de página
    SELECT id_pagina INTO v_pagina_id
    FROM dim_paginas_modulo
    WHERE ruta_pagina = '/teleecg/recibidas'
    LIMIT 1;

    IF v_superadmin_id IS NOT NULL AND v_pagina_id IS NOT NULL THEN
        INSERT INTO segu_permisos_rol_pagina (
            id_rol, id_pagina,
            puede_ver, puede_crear, puede_editar, puede_eliminar,
            puede_exportar, puede_importar, puede_aprobar,
            activo, created_at, updated_at
        ) VALUES (
            v_superadmin_id, v_pagina_id,
            true, true, true, true, true, true, true,
            true, NOW(), NOW()
        )
        ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
            puede_ver = true, puede_crear = true, puede_editar = true,
            puede_eliminar = true, puede_exportar = true, puede_importar = true,
            puede_aprobar = true, activo = true, updated_at = NOW();
        RAISE NOTICE 'Permisos asignados a SUPERADMIN para /teleecg/recibidas';
    END IF;

    IF v_admin_id IS NOT NULL AND v_pagina_id IS NOT NULL THEN
        INSERT INTO segu_permisos_rol_pagina (
            id_rol, id_pagina,
            puede_ver, puede_crear, puede_editar, puede_eliminar,
            puede_exportar, puede_importar, puede_aprobar,
            activo, created_at, updated_at
        ) VALUES (
            v_admin_id, v_pagina_id,
            true, true, true, true, true, true, true,
            true, NOW(), NOW()
        )
        ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
            puede_ver = true, puede_crear = true, puede_editar = true,
            puede_eliminar = true, puede_exportar = true, puede_importar = true,
            puede_aprobar = true, activo = true, updated_at = NOW();
        RAISE NOTICE 'Permisos asignados a ADMIN para /teleecg/recibidas';
    END IF;
END $$;

-- ============================================================
-- 4. ASIGNAR PERMISOS A COORDINADOR_RED
-- ============================================================
DO $$
DECLARE
    v_coord_red_id INTEGER;
    v_pagina_id INTEGER;
BEGIN
    SELECT id_rol INTO v_coord_red_id FROM dim_roles WHERE desc_rol = 'COORDINADOR_RED' LIMIT 1;
    SELECT id_pagina INTO v_pagina_id
    FROM dim_paginas_modulo
    WHERE ruta_pagina = '/teleecg/recibidas'
    LIMIT 1;

    IF v_coord_red_id IS NOT NULL AND v_pagina_id IS NOT NULL THEN
        INSERT INTO segu_permisos_rol_pagina (
            id_rol, id_pagina,
            puede_ver, puede_crear, puede_editar, puede_eliminar,
            puede_exportar, puede_importar, puede_aprobar,
            activo, created_at, updated_at
        ) VALUES (
            v_coord_red_id, v_pagina_id,
            true, false, false, false, true, false, false,
            true, NOW(), NOW()
        )
        ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
            puede_ver = true, puede_exportar = true,
            activo = true, updated_at = NOW();
        RAISE NOTICE 'Permisos asignados a COORDINADOR_RED para /teleecg/recibidas';
    END IF;
END $$;

-- ============================================================
-- 5. ASIGNAR PERMISOS A ENFERMERIA
-- ============================================================
DO $$
DECLARE
    v_enfermeria_id INTEGER;
    v_pagina_id INTEGER;
BEGIN
    SELECT id_rol INTO v_enfermeria_id FROM dim_roles WHERE desc_rol = 'ENFERMERIA' LIMIT 1;
    SELECT id_pagina INTO v_pagina_id
    FROM dim_paginas_modulo
    WHERE ruta_pagina = '/teleecg/recibidas'
    LIMIT 1;

    IF v_enfermeria_id IS NOT NULL AND v_pagina_id IS NOT NULL THEN
        INSERT INTO segu_permisos_rol_pagina (
            id_rol, id_pagina,
            puede_ver, puede_crear, puede_editar, puede_eliminar,
            puede_exportar, puede_importar, puede_aprobar,
            activo, created_at, updated_at
        ) VALUES (
            v_enfermeria_id, v_pagina_id,
            true, false, false, false, false, false, false,
            true, NOW(), NOW()
        )
        ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
            puede_ver = true, activo = true, updated_at = NOW();
        RAISE NOTICE 'Permisos asignados a ENFERMERIA para /teleecg/recibidas';
    END IF;
END $$;

-- ============================================================
-- 6. PERMISOS PARA PÁGINA DE ESTADÍSTICAS
-- ============================================================
DO $$
DECLARE
    v_admin_id INTEGER;
    v_superadmin_id INTEGER;
    v_pagina_id INTEGER;
BEGIN
    SELECT id_rol INTO v_superadmin_id FROM dim_roles WHERE desc_rol = 'SUPERADMIN' LIMIT 1;
    SELECT id_rol INTO v_admin_id FROM dim_roles WHERE desc_rol = 'ADMIN' LIMIT 1;
    SELECT id_pagina INTO v_pagina_id
    FROM dim_paginas_modulo
    WHERE ruta_pagina = '/teleecg/estadisticas'
    LIMIT 1;

    IF v_superadmin_id IS NOT NULL AND v_pagina_id IS NOT NULL THEN
        INSERT INTO segu_permisos_rol_pagina (
            id_rol, id_pagina,
            puede_ver, puede_crear, puede_editar, puede_eliminar,
            puede_exportar, puede_importar, puede_aprobar,
            activo, created_at, updated_at
        ) VALUES (
            v_superadmin_id, v_pagina_id,
            true, true, true, true, true, true, true,
            true, NOW(), NOW()
        )
        ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
            puede_ver = true, puede_crear = true, puede_editar = true,
            puede_eliminar = true, puede_exportar = true, puede_importar = true,
            puede_aprobar = true, activo = true, updated_at = NOW();
    END IF;

    IF v_admin_id IS NOT NULL AND v_pagina_id IS NOT NULL THEN
        INSERT INTO segu_permisos_rol_pagina (
            id_rol, id_pagina,
            puede_ver, puede_crear, puede_editar, puede_eliminar,
            puede_exportar, puede_importar, puede_aprobar,
            activo, created_at, updated_at
        ) VALUES (
            v_admin_id, v_pagina_id,
            true, true, true, true, true, true, true,
            true, NOW(), NOW()
        )
        ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
            puede_ver = true, puede_crear = true, puede_editar = true,
            puede_eliminar = true, puede_exportar = true, puede_importar = true,
            puede_aprobar = true, activo = true, updated_at = NOW();
    END IF;
END $$;

-- ============================================================
-- 7. VERIFICACION FINAL
-- ============================================================

-- Verificar módulo creado
SELECT 'MÓDULO CREADO' as "VERIFICACIÓN",
    id_modulo,
    nombre_modulo,
    descripcion,
    icono,
    orden,
    activo
FROM dim_modulos_sistema
WHERE nombre_modulo = 'TeleECG';

-- Verificar páginas creadas
SELECT 'PÁGINAS CREADAS' as "VERIFICACIÓN",
    p.id_pagina,
    m.nombre_modulo,
    p.nombre_pagina,
    p.ruta_pagina,
    p.orden,
    p.activo
FROM dim_paginas_modulo p
JOIN dim_modulos_sistema m ON p.id_modulo = m.id_modulo
WHERE m.nombre_modulo = 'TeleECG'
ORDER BY p.orden;

-- Verificar permisos asignados
SELECT 'PERMISOS ASIGNADOS' as "VERIFICACIÓN",
    r.desc_rol,
    p.nombre_pagina,
    p.ruta_pagina,
    prp.puede_ver,
    prp.puede_crear,
    prp.puede_editar,
    prp.puede_eliminar,
    prp.puede_exportar,
    prp.activo
FROM segu_permisos_rol_pagina prp
JOIN dim_roles r ON prp.id_rol = r.id_rol
JOIN dim_paginas_modulo p ON prp.id_pagina = p.id_pagina
JOIN dim_modulos_sistema m ON p.id_modulo = m.id_modulo
WHERE m.nombre_modulo = 'TeleECG'
ORDER BY p.ruta_pagina, r.desc_rol;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
