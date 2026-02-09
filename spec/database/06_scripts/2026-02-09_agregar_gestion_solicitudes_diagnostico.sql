-- ========================================================================
-- 📋 Agregar Página: Gestión de Solicitudes Diagnóstico
-- ========================================================================
-- Script: 2026-02-09_agregar_gestion_solicitudes_diagnostico.sql
-- Propósito: Agregar la nueva página "Gestión de Solicitudes Diagnóstico"
--            al módulo de Administración
-- ========================================================================

-- Verificar que la tabla existe
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1
        FROM information_schema.tables
        WHERE table_name = 'dim_paginas_modulo'
    ) THEN
        RAISE EXCEPTION 'ERROR: Tabla dim_paginas_modulo no existe';
    END IF;
END $$;

-- ========================================================================
-- 1️⃣ Obtener ID del módulo Administración
-- ========================================================================
DO $$
DECLARE
    v_id_modulo_admin INTEGER;
    v_max_orden INTEGER;
BEGIN
    -- Obtener ID del módulo Administración
    SELECT id_modulo INTO v_id_modulo_admin
    FROM dim_modulos_sistema
    WHERE LOWER(nombre_modulo) LIKE '%administraci%'
    LIMIT 1;

    IF v_id_modulo_admin IS NULL THEN
        RAISE EXCEPTION 'ERROR: Módulo "Administración" no encontrado en dim_modulos_sistema';
    END IF;

    -- Obtener el orden máximo actual
    SELECT COALESCE(MAX(orden), 0) INTO v_max_orden
    FROM dim_paginas_modulo
    WHERE id_modulo = v_id_modulo_admin;

    -- ========================================================================
    -- 2️⃣ Insertar la nueva página
    -- ========================================================================
    INSERT INTO dim_paginas_modulo (
        id_modulo,
        nombre_pagina,
        ruta_pagina,
        descripcion,
        icono,
        orden,
        activo,
        created_at,
        updated_at
    ) VALUES (
        v_id_modulo_admin,
        'Gestión de Solicitudes Diagnóstico',
        '/admin/solicitudes-diagnostico',
        'Administra las solicitudes de diagnósticos médicos de pacientes',
        'Stethoscope',
        v_max_orden + 1,
        true,
        NOW(),
        NOW()
    ) ON CONFLICT DO NOTHING;

    -- Log de éxito
    RAISE NOTICE 'INFO: Página "Gestión de Solicitudes Diagnóstico" agregada exitosamente';
    RAISE NOTICE 'INFO: ID Módulo: %, Orden: %', v_id_modulo_admin, (v_max_orden + 1);

EXCEPTION
    WHEN OTHERS THEN
        RAISE NOTICE 'ERROR: %', SQLERRM;
END $$;

-- ========================================================================
-- 3️⃣ Verificar que la página fue insertada
-- ========================================================================
SELECT
    dpm.id_pagina,
    dpm.nombre_pagina,
    dpm.ruta_pagina,
    dpm.descripcion,
    dms.nombre_modulo,
    dpm.icono,
    dpm.orden,
    dpm.activo
FROM dim_paginas_modulo dpm
INNER JOIN dim_modulos_sistema dms ON dpm.id_modulo = dms.id_modulo
WHERE dpm.ruta_pagina = '/admin/solicitudes-diagnostico'
ORDER BY dpm.created_at DESC
LIMIT 1;
