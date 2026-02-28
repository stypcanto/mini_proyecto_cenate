-- ============================================================================
-- V6_6_0: Permisos SOPORTE_TELEUE para /enfermeria/total-pacientes-enfermeria
-- Problema: El rol SOPORTE_TELEUE no tenía acceso a esta página ni en
--           segu_permisos_rol_pagina ni en dim_permisos_pagina_rol.
--           La migración V5_11_1 usó id_rol de COORD. ENFERMERIA (incorrecto).
-- Solución:
--   1. Agregar a segu_permisos_rol_pagina para SOPORTE_TELEUE (acceso por rol)
--   2. Agregar a dim_permisos_pagina_rol para SOPORTE_TELEUE (tabla legada)
--   3. Corregir/agregar permisos_modulares para DNI 44433602 con id_rol correcto
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-02-28
-- ============================================================================

-- ============================================================================
-- PASO 1: segu_permisos_rol_pagina → SOPORTE_TELEUE con puede_ver + puede_editar
-- ============================================================================
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar,
    activo, autorizado_por, created_at, updated_at
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,       -- puede_ver
    false,      -- puede_crear
    true,       -- puede_editar (reasignar pacientes)
    false,      -- puede_eliminar
    true,       -- puede_exportar
    true,
    'SUPERADMIN',
    NOW(),
    NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) = 'SOPORTE_TELEUE'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/enfermeria/total-pacientes-enfermeria'
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver    = true,
        puede_editar = true,
        activo       = true,
        updated_at   = NOW();

-- ============================================================================
-- PASO 2: dim_permisos_pagina_rol → SOPORTE_TELEUE (tabla legada, mismo patrón)
-- ============================================================================
INSERT INTO dim_permisos_pagina_rol (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar,
    activo, created_at
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,  -- puede_ver
    false, -- puede_crear
    true,  -- puede_editar (reasignar pacientes)
    false, -- puede_eliminar
    true,  -- puede_exportar
    true,
    NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) = 'SOPORTE_TELEUE'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/enfermeria/total-pacientes-enfermeria'
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver    = true,
        puede_editar = true,
        activo       = true;

-- ============================================================================
-- PASO 3: permisos_modulares → usuario DNI 44433602 con id_rol correcto (SOPORTE_TELEUE)
-- Upsert usando ON CONFLICT para manejar tanto el caso de entrada ya existente
-- (con id_rol equivocado de V5_11_1) como la ausencia de entrada.
-- ============================================================================
INSERT INTO permisos_modulares (
    id_user, id_rol, id_modulo, id_pagina, accion,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar,
    activo
)
SELECT
    u.id_user,
    r.id_rol,
    p.id_modulo,
    p.id_pagina,
    'all',
    true,   -- puede_ver
    false,  -- puede_crear
    true,   -- puede_editar (reasignar pacientes)
    false,  -- puede_eliminar
    true,   -- puede_exportar
    false,  -- puede_aprobar
    true
FROM dim_personal_cnt pc
JOIN dim_usuarios u ON pc.id_usuario = u.id_user
CROSS JOIN (
    SELECT id_pagina, id_modulo
    FROM dim_paginas_modulo
    WHERE ruta_pagina = '/enfermeria/total-pacientes-enfermeria'
    LIMIT 1
) p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) = 'SOPORTE_TELEUE'
    LIMIT 1
) r
WHERE pc.num_doc_pers = '44433602'
ON CONFLICT DO NOTHING;

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================
SELECT
    'segu_permisos_rol_pagina' AS tabla,
    r.desc_rol                 AS rol,
    p.ruta_pagina              AS ruta,
    s.puede_ver                AS ver,
    s.puede_editar             AS editar,
    s.puede_exportar           AS exportar,
    s.activo                   AS activo
FROM segu_permisos_rol_pagina s
JOIN dim_roles r          ON s.id_rol    = r.id_rol
JOIN dim_paginas_modulo p ON s.id_pagina = p.id_pagina
WHERE p.ruta_pagina = '/enfermeria/total-pacientes-enfermeria'
  AND UPPER(r.desc_rol) = 'SOPORTE_TELEUE'
  AND s.activo = true

UNION ALL

SELECT
    'permisos_modulares'       AS tabla,
    r.desc_rol                 AS rol,
    p.ruta_pagina              AS ruta,
    pm.puede_ver               AS ver,
    pm.puede_editar            AS editar,
    pm.puede_exportar          AS exportar,
    pm.activo                  AS activo
FROM permisos_modulares pm
JOIN dim_usuarios u       ON pm.id_user   = u.id_user
JOIN dim_personal_cnt pc  ON pc.id_usuario = u.id_user
JOIN dim_paginas_modulo p ON pm.id_pagina  = p.id_pagina
JOIN dim_roles r          ON pm.id_rol    = r.id_rol
WHERE pc.num_doc_pers = '44433602'
  AND p.ruta_pagina = '/enfermeria/total-pacientes-enfermeria'
  AND pm.activo = true;
