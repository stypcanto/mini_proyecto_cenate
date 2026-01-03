-- ========================================================================
-- 👋 Script: Agregar Páginas de Bienvenida a Módulos (VERSIÓN SIMPLIFICADA)
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

-- ========================================================================
-- 3. ASIGNAR PERMISOS A ROLES
-- ------------------------------------------------------------------------
-- Dar permiso "puede_ver" a los roles correspondientes
-- ========================================================================

-- Obtener IDs de páginas recién creadas
DO $$
DECLARE
    v_pagina_citas INTEGER;
    v_pagina_externo INTEGER;
BEGIN
    -- Obtener ID de página Bienvenida Citas
    SELECT id_pagina INTO v_pagina_citas
    FROM dim_paginas_modulo
    WHERE id_modulo = 18 AND ruta_pagina = '/citas/bienvenida';

    -- Obtener ID de página Bienvenida Externo
    SELECT id_pagina INTO v_pagina_externo
    FROM dim_paginas_modulo
    WHERE id_modulo = 20 AND ruta_pagina = '/roles/externo/bienvenida';

    -- Asignar permisos a GESTOR DE CITAS (id_rol = 25)
    IF v_pagina_citas IS NOT NULL THEN
        INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, activo)
        VALUES (25, v_pagina_citas, true, true)
        ON CONFLICT (id_rol, id_pagina) DO UPDATE
        SET puede_ver = true, activo = true;

        RAISE NOTICE '✓ Permiso asignado: GESTOR DE CITAS -> Bienvenida Citas (id_pagina: %)', v_pagina_citas;
    END IF;

    -- Asignar permisos a INSTITUCION_EX (id_rol = 18)
    IF v_pagina_externo IS NOT NULL THEN
        INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, activo)
        VALUES (18, v_pagina_externo, true, true)
        ON CONFLICT (id_rol, id_pagina) DO UPDATE
        SET puede_ver = true, activo = true;

        RAISE NOTICE '✓ Permiso asignado: INSTITUCION_EX -> Bienvenida Externo (id_pagina: %)', v_pagina_externo;
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
    '📄 Páginas de Bienvenida creadas:',
    COUNT(*)::text
FROM dim_paginas_modulo
WHERE nombre_pagina = 'Bienvenida'
  AND id_modulo IN (18, 20)
UNION ALL
SELECT
    '👥 Permisos asignados:',
    COUNT(*)::text
FROM dim_permisos_pagina_rol pr
JOIN dim_paginas_modulo pp ON pr.id_pagina = pp.id_pagina
WHERE pp.nombre_pagina = 'Bienvenida'
  AND pp.id_modulo IN (18, 20);

-- Mostrar páginas creadas
SELECT
    '📋 PÁGINAS CREADAS' as info,
    ms.id_modulo,
    ms.nombre_modulo,
    pp.nombre_pagina,
    pp.ruta_pagina,
    pp.orden
FROM dim_paginas_modulo pp
JOIN dim_modulos_sistema ms ON pp.id_modulo = ms.id_modulo
WHERE pp.nombre_pagina = 'Bienvenida'
  AND pp.id_modulo IN (18, 20)
ORDER BY pp.id_modulo;

-- Mostrar permisos asignados
SELECT
    '🔐 PERMISOS ASIGNADOS' as info,
    r.desc_rol as rol,
    pp.nombre_pagina as pagina,
    pr.puede_ver,
    pr.activo
FROM dim_permisos_pagina_rol pr
JOIN dim_paginas_modulo pp ON pr.id_pagina = pp.id_pagina
JOIN dim_roles r ON pr.id_rol = r.id_rol
WHERE pp.nombre_pagina = 'Bienvenida'
  AND pp.id_modulo IN (18, 20)
ORDER BY r.desc_rol;

COMMIT;

-- ========================================================================
-- ✅ SCRIPT COMPLETADO
-- ========================================================================
-- Las páginas de Bienvenida han sido agregadas exitosamente.
-- Los usuarios con roles GESTOR DE CITAS e INSTITUCION_EX ahora verán
-- "Bienvenida" como primera opción en sus módulos.
-- ========================================================================
