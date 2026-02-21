-- ============================================================================
-- V5_5_0: Registrar página "Bolsa x médico" en módulo Bolsas de Pacientes
-- Ruta MBAC: /modulos/bolsas/bolsa-x-medico
-- Roles: GESTOR DE CITAS, COORD. GESTION CITAS, SUPERADMIN
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-02-21
-- ============================================================================

-- 1. Asegurar que la página exista con la nueva ruta
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, icono, orden, activo, created_at)
SELECT
    m.id_modulo,
    'Bolsas x médico',
    '/modulos/bolsas/bolsa-x-medico',
    'Resumen de la citacion de pacientes por médico',
    'Stethoscope',
    35,
    true,
    NOW()
FROM dim_modulos_sistema m
WHERE m.nombre_modulo = 'Bolsas de Pacientes'
LIMIT 1
ON CONFLICT (ruta_pagina) DO NOTHING;

-- 2. Permiso para SUPERADMIN (id_rol = 1)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT 1, p.id_pagina, true, true, true, false, true, true, NOW()
FROM dim_paginas_modulo p
WHERE p.ruta_pagina = '/modulos/bolsas/bolsa-x-medico'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET puede_ver = true, activo = true;

-- 3. Permiso para GESTOR DE CITAS (puede ver y exportar)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT
    r.id_rol,
    p.id_pagina,
    true,  -- puede_ver
    false, -- puede_crear
    false, -- puede_editar
    false, -- puede_eliminar
    true,  -- puede_exportar
    true,
    NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(TRIM(desc_rol)) IN ('GESTOR DE CITAS', 'GESTOR_DE_CITAS')
    LIMIT 1
) r
WHERE p.ruta_pagina = '/modulos/bolsas/bolsa-x-medico'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET puede_ver = true, activo = true;

-- 4. Permiso para COORD. GESTION CITAS (puede ver, editar y exportar)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT
    r.id_rol,
    p.id_pagina,
    true,  -- puede_ver
    false, -- puede_crear
    true,  -- puede_editar
    false, -- puede_eliminar
    true,  -- puede_exportar
    true,
    NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(TRIM(desc_rol)) IN ('COORD. GESTION CITAS', 'COORDINADOR_GESTION_CITAS')
    LIMIT 1
) r
WHERE p.ruta_pagina = '/modulos/bolsas/bolsa-x-medico'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET puede_ver = true, activo = true;

-- Verificación
SELECT
    r.desc_rol       AS rol,
    p.ruta_pagina    AS pagina,
    pp.puede_ver     AS ver,
    pp.puede_exportar AS exportar,
    pp.activo        AS activo
FROM dim_permisos_pagina_rol pp
JOIN dim_roles r          ON pp.id_rol    = r.id_rol
JOIN dim_paginas_modulo p ON pp.id_pagina = p.id_pagina
WHERE p.ruta_pagina = '/modulos/bolsas/bolsa-x-medico'
  AND pp.activo = true;
