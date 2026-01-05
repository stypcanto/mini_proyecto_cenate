-- ========================================================================
-- 👋 Script: Agregar Páginas de Bienvenida a Módulos
-- ------------------------------------------------------------------------
-- Agrega la página "Bienvenida" como primera subopción en los módulos
-- de Gestión de Citas y Gestión de Personal Externo
--
-- Versión: v1.15.18
-- Fecha: 2026-01-03
-- ========================================================================

BEGIN;

-- ========================================================================
-- 0. VERIFICAR Y CORREGIR SECUENCIA (si está desincronizada)
-- ========================================================================
SELECT setval('dim_paginas_modulo_id_pagina_seq',
    COALESCE((SELECT MAX(id_pagina) FROM dim_paginas_modulo), 1) + 1,
    false);

-- ========================================================================
-- 1. ACTUALIZAR ORDEN DE PÁGINAS EXISTENTES
-- ------------------------------------------------------------------------
-- Incrementar orden de páginas existentes para hacer espacio
-- ========================================================================

-- Módulo 18: Gestión de Citas (incrementar orden)
UPDATE dim_paginas_modulo
SET orden = COALESCE(orden, 0) + 1
WHERE id_modulo = 18;

-- Módulo 20: Gestión de Personal Externo (incrementar orden)
UPDATE dim_paginas_modulo
SET orden = COALESCE(orden, 0) + 1
WHERE id_modulo = 20;

DO $$ BEGIN
    RAISE NOTICE '✓ Orden de páginas existentes actualizado';
END $$;

-- ========================================================================
-- 2. INSERTAR PÁGINAS DE BIENVENIDA
-- ========================================================================

-- Bienvenida para Gestión de Citas (id_modulo = 18)
INSERT INTO dim_paginas_modulo (
    id_modulo,
    nombre_pagina,
    ruta_pagina,
    descripcion,
    activo,
    orden
) VALUES (
    18,
    'Bienvenida',
    '/citas/bienvenida',
    'Pantalla de bienvenida con información de la cuenta, roles y funciones del usuario',
    true,
    1
) ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- Bienvenida para Gestión de Personal Externo (id_modulo = 20)
INSERT INTO dim_paginas_modulo (
    id_modulo,
    nombre_pagina,
    ruta_pagina,
    descripcion,
    activo,
    orden
) VALUES (
    20,
    'Bienvenida',
    '/roles/externo/bienvenida',
    'Pantalla de bienvenida con información de la cuenta, roles y funciones del usuario',
    true,
    1
) ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

DO $$ BEGIN
    RAISE NOTICE '✓ Páginas de Bienvenida creadas';
END $$;

-- ========================================================================
-- 3. ASIGNAR PERMISOS MODULARES (RBAC)
-- ------------------------------------------------------------------------
-- Dar permisos de "ver" a las páginas de Bienvenida
-- ========================================================================

-- Obtener IDs de las páginas recién creadas
DO $$
DECLARE
    v_pagina_citas INTEGER;
    v_pagina_externo INTEGER;
    v_accion_ver INTEGER;
BEGIN
    -- Obtener ID de acción "ver"
    SELECT id_accion INTO v_accion_ver
    FROM dim_acciones_mbac
    WHERE nombre_accion = 'ver'
    LIMIT 1;

    -- Obtener ID de página Bienvenida Citas
    SELECT id_pagina INTO v_pagina_citas
    FROM dim_paginas_modulo
    WHERE id_modulo = 18 AND ruta_pagina = '/citas/bienvenida';

    -- Obtener ID de página Bienvenida Externo
    SELECT id_pagina INTO v_pagina_externo
    FROM dim_paginas_modulo
    WHERE id_modulo = 20 AND ruta_pagina = '/roles/externo/bienvenida';

    -- Insertar permiso modular para Bienvenida Citas
    IF v_pagina_citas IS NOT NULL AND v_accion_ver IS NOT NULL THEN
        INSERT INTO dim_permisos_modulares (id_pagina, id_accion)
        VALUES (v_pagina_citas, v_accion_ver)
        ON CONFLICT (id_pagina, id_accion) DO NOTHING;

        RAISE NOTICE '✓ Permiso "ver" asignado a Bienvenida Citas (id_pagina: %)', v_pagina_citas;
    END IF;

    -- Insertar permiso modular para Bienvenida Externo
    IF v_pagina_externo IS NOT NULL AND v_accion_ver IS NOT NULL THEN
        INSERT INTO dim_permisos_modulares (id_pagina, id_accion)
        VALUES (v_pagina_externo, v_accion_ver)
        ON CONFLICT (id_pagina, id_accion) DO NOTHING;

        RAISE NOTICE '✓ Permiso "ver" asignado a Bienvenida Externo (id_pagina: %)', v_pagina_externo;
    END IF;
END $$;

-- ========================================================================
-- 4. ASIGNAR PERMISOS A ROLES ESPECÍFICOS
-- ------------------------------------------------------------------------
-- Dar acceso a los roles correspondientes
-- ========================================================================

DO $$
DECLARE
    v_pagina_citas INTEGER;
    v_pagina_externo INTEGER;
    v_rol_gestor_citas INTEGER;
    v_rol_externo INTEGER;
    v_rol_institucion_ex INTEGER;
BEGIN
    -- Obtener IDs de páginas
    SELECT id_pagina INTO v_pagina_citas
    FROM dim_paginas_modulo
    WHERE id_modulo = 18 AND ruta_pagina = '/citas/bienvenida';

    SELECT id_pagina INTO v_pagina_externo
    FROM dim_paginas_modulo
    WHERE id_modulo = 20 AND ruta_pagina = '/roles/externo/bienvenida';

    -- Obtener IDs de roles
    SELECT id_rol INTO v_rol_gestor_citas
    FROM dim_rol
    WHERE desc_rol = 'GESTOR DE CITAS'
    LIMIT 1;

    SELECT id_rol INTO v_rol_externo
    FROM dim_rol
    WHERE desc_rol = 'EXTERNO'
    LIMIT 1;

    SELECT id_rol INTO v_rol_institucion_ex
    FROM dim_rol
    WHERE desc_rol = 'INSTITUCION_EX'
    LIMIT 1;

    -- Asignar Bienvenida Citas a GESTOR DE CITAS
    IF v_pagina_citas IS NOT NULL AND v_rol_gestor_citas IS NOT NULL THEN
        INSERT INTO dim_permisos_pagina_rol (id_pagina, id_rol)
        VALUES (v_pagina_citas, v_rol_gestor_citas)
        ON CONFLICT (id_pagina, id_rol) DO NOTHING;

        RAISE NOTICE '✓ Bienvenida Citas asignada a rol GESTOR DE CITAS';
    END IF;

    -- Asignar Bienvenida Externo a EXTERNO
    IF v_pagina_externo IS NOT NULL AND v_rol_externo IS NOT NULL THEN
        INSERT INTO dim_permisos_pagina_rol (id_pagina, id_rol)
        VALUES (v_pagina_externo, v_rol_externo)
        ON CONFLICT (id_pagina, id_rol) DO NOTHING;

        RAISE NOTICE '✓ Bienvenida Externo asignada a rol EXTERNO';
    END IF;

    -- Asignar Bienvenida Externo a INSTITUCION_EX
    IF v_pagina_externo IS NOT NULL AND v_rol_institucion_ex IS NOT NULL THEN
        INSERT INTO dim_permisos_pagina_rol (id_pagina, id_rol)
        VALUES (v_pagina_externo, v_rol_institucion_ex)
        ON CONFLICT (id_pagina, id_rol) DO NOTHING;

        RAISE NOTICE '✓ Bienvenida Externo asignada a rol INSTITUCION_EX';
    END IF;
END $$;

-- ========================================================================
-- 5. VERIFICACIÓN FINAL
-- ========================================================================

SELECT
    '🎯 RESUMEN DE CAMBIOS' as titulo,
    '' as detalle
UNION ALL
SELECT
    '📄 Páginas de Bienvenida:',
    COUNT(*)::text
FROM dim_paginas_modulo
WHERE nombre_pagina = 'Bienvenida'
  AND id_modulo IN (18, 20)
UNION ALL
SELECT
    '🔐 Permisos Modulares:',
    COUNT(*)::text
FROM dim_permisos_modulares pm
JOIN dim_paginas_modulo pp ON pm.id_pagina = pp.id_pagina
WHERE pp.nombre_pagina = 'Bienvenida'
  AND pp.id_modulo IN (18, 20)
UNION ALL
SELECT
    '👥 Permisos por Rol:',
    COUNT(*)::text
FROM dim_permisos_pagina_rol pr
JOIN dim_paginas_modulo pp ON pr.id_pagina = pp.id_pagina
WHERE pp.nombre_pagina = 'Bienvenida'
  AND pp.id_modulo IN (18, 20);

-- Mostrar páginas creadas
SELECT
    '📋 PÁGINAS CREADAS' as info,
    '' as id_modulo,
    '' as nombre_modulo,
    '' as nombre_pagina,
    '' as ruta_pagina,
    '' as orden
UNION ALL
SELECT
    '' as info,
    ms.id_modulo::text,
    ms.nombre_modulo,
    pp.nombre_pagina,
    pp.ruta_pagina,
    pp.orden::text
FROM dim_paginas_modulo pp
JOIN dim_modulos_sistema ms ON pp.id_modulo = ms.id_modulo
WHERE pp.nombre_pagina = 'Bienvenida'
  AND pp.id_modulo IN (18, 20)
ORDER BY id_modulo;

COMMIT;

-- ========================================================================
-- ✅ SCRIPT COMPLETADO
-- ========================================================================
-- Las páginas de Bienvenida han sido agregadas exitosamente.
-- Los usuarios con roles GESTOR DE CITAS, EXTERNO e INSTITUCION_EX
-- ahora verán "Bienvenida" como primera opción en sus módulos.
-- ========================================================================
