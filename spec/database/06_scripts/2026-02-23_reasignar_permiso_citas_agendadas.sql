-- ========================================================================
-- 🔐 Registrar página /citas/citas-agendadas en MBAC
--    y asignar permiso "editar" a los roles:
--      - COORDINADOR_GESTION_CITAS
--      - USUARIO_GESTION_CITAS  (o el nombre exacto en dim_roles)
-- Script: 2026-02-23_reasignar_permiso_citas_agendadas.sql
-- ========================================================================

DO $$
DECLARE
    v_id_modulo    INTEGER;
    v_id_pagina    INTEGER;
    v_orden        INTEGER;
    v_id_rol_coord INTEGER;
    v_id_rol_user  INTEGER;
BEGIN

    -- ── 1. Obtener módulo "Citas" ────────────────────────────
    SELECT id_modulo INTO v_id_modulo
    FROM dim_modulos_sistema
    WHERE LOWER(nombre_modulo) LIKE '%cita%'
    LIMIT 1;

    IF v_id_modulo IS NULL THEN
        RAISE EXCEPTION 'ERROR: Módulo "Citas" no encontrado en dim_modulos_sistema';
    END IF;
    RAISE NOTICE 'INFO: Módulo Citas id=%', v_id_modulo;

    -- ── 2. Registrar página si no existe ────────────────────
    SELECT id_pagina INTO v_id_pagina
    FROM dim_paginas_modulo
    WHERE ruta_pagina = '/citas/citas-agendadas'
    LIMIT 1;

    IF v_id_pagina IS NULL THEN
        SELECT COALESCE(MAX(orden), 0) INTO v_orden
        FROM dim_paginas_modulo
        WHERE id_modulo = v_id_modulo;

        INSERT INTO dim_paginas_modulo (
            id_modulo, nombre_pagina, ruta_pagina,
            descripcion, icono, orden, activo, created_at, updated_at
        ) VALUES (
            v_id_modulo,
            'Citas Agendadas',
            '/citas/citas-agendadas',
            'Producción de citas gestionadas – reasignación de profesional',
            'CalendarCheck',
            v_orden + 1,
            true, NOW(), NOW()
        ) RETURNING id_pagina INTO v_id_pagina;

        RAISE NOTICE 'INFO: Página /citas/citas-agendadas insertada con id=%', v_id_pagina;
    ELSE
        RAISE NOTICE 'INFO: Página /citas/citas-agendadas ya existe con id=%', v_id_pagina;
    END IF;

    -- ── 3. Obtener roles ─────────────────────────────────────
    -- Ajusta los nombres si difieren en tu dim_roles
    SELECT id_rol INTO v_id_rol_coord
    FROM dim_roles
    WHERE LOWER(desc_rol) LIKE '%coordinador%gestion%cita%'
       OR LOWER(desc_rol) LIKE '%coord%cita%'
    LIMIT 1;

    SELECT id_rol INTO v_id_rol_user
    FROM dim_roles
    WHERE LOWER(desc_rol) LIKE '%usuario%gestion%cita%'
       OR LOWER(desc_rol) LIKE '%user%cita%'
    LIMIT 1;

    RAISE NOTICE 'INFO: Rol coordinador id=%, Rol usuario id=%', v_id_rol_coord, v_id_rol_user;

    -- ── 4. Insertar permisos para COORDINADOR_GESTION_CITAS ─
    IF v_id_rol_coord IS NOT NULL THEN
        INSERT INTO segu_permisos_rol_pagina (
            id_rol, id_pagina,
            puede_ver, puede_crear, puede_editar, puede_eliminar,
            activo, created_at, updated_at, autorizado_por
        ) VALUES (
            v_id_rol_coord, v_id_pagina,
            true, false, true, false,
            true, NOW(), NOW(), 'SCRIPT-2026-02-23'
        ) ON CONFLICT (id_rol, id_pagina) DO UPDATE
            SET puede_editar = true,
                puede_ver    = true,
                activo       = true,
                updated_at   = NOW(),
                autorizado_por = 'SCRIPT-2026-02-23';
        RAISE NOTICE 'INFO: Permiso asignado al rol coordinador (id=%)', v_id_rol_coord;
    ELSE
        RAISE WARNING 'WARN: Rol COORDINADOR_GESTION_CITAS no encontrado';
    END IF;

    -- ── 5. Insertar permisos para USUARIO_GESTION_CITAS ─────
    IF v_id_rol_user IS NOT NULL THEN
        INSERT INTO segu_permisos_rol_pagina (
            id_rol, id_pagina,
            puede_ver, puede_crear, puede_editar, puede_eliminar,
            activo, created_at, updated_at, autorizado_por
        ) VALUES (
            v_id_rol_user, v_id_pagina,
            true, false, true, false,
            true, NOW(), NOW(), 'SCRIPT-2026-02-23'
        ) ON CONFLICT (id_rol, id_pagina) DO UPDATE
            SET puede_editar = true,
                puede_ver    = true,
                activo       = true,
                updated_at   = NOW(),
                autorizado_por = 'SCRIPT-2026-02-23';
        RAISE NOTICE 'INFO: Permiso asignado al rol usuario (id=%)', v_id_rol_user;
    ELSE
        RAISE WARNING 'WARN: Rol USUARIO_GESTION_CITAS no encontrado';
    END IF;

END $$;

-- ── Verificación ─────────────────────────────────────────────
SELECT
    r.desc_rol,
    p.ruta_pagina,
    prp.puede_ver,
    prp.puede_editar,
    prp.activo
FROM segu_permisos_rol_pagina prp
JOIN dim_roles           r  ON prp.id_rol    = r.id_rol
JOIN dim_paginas_modulo  p  ON prp.id_pagina = p.id_pagina
WHERE p.ruta_pagina = '/citas/citas-agendadas'
ORDER BY r.desc_rol;
