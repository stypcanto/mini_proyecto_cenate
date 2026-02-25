-- ============================================================================
-- V5_12_0: Registrar página "Bajas CENACRON" en módulo Asegurados (id_modulo=29)
-- Permisos para todos los roles — solo ver y exportar (página de auditoría)
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-02-24
-- Descripción: Historial de pacientes dados de baja del programa CENACRON
--              con datos completos de auditoría (quién dio la baja y cuándo)
-- ============================================================================

-- 1. Insertar la página en dim_paginas_modulo bajo el módulo Asegurados (id_modulo=29)
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, icono, orden, activo, created_at)
VALUES (
    29,
    'Bajas CENACRON',
    '/asegurados/bajas-cenacron',
    'Historial de pacientes dados de baja del programa CENACRON con auditoría completa',
    'UserX',
    40,
    true,
    NOW()
)
ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- 2. Permisos para SUPERADMIN (id_rol=1)
INSERT INTO segu_permisos_rol_pagina (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_importar, puede_aprobar, activo, autorizado_por, created_at, updated_at)
SELECT
    1,
    p.id_pagina,
    true,   -- puede_ver
    false,  -- puede_crear
    false,  -- puede_editar
    false,  -- puede_eliminar
    true,   -- puede_exportar
    false,  -- puede_importar
    false,  -- puede_aprobar
    true,   -- activo
    'SISTEMA',
    NOW(),
    NOW()
FROM dim_paginas_modulo p
WHERE p.ruta_pagina = '/asegurados/bajas-cenacron'
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, puede_exportar = true, activo = true, updated_at = NOW();

-- 3. Permisos para todos los demás roles (lookup dinámico, excepto SUPERADMIN)
INSERT INTO segu_permisos_rol_pagina (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_importar, puede_aprobar, activo, autorizado_por, created_at, updated_at)
SELECT
    dr.id_rol,
    dp.id_pagina,
    true,   -- puede_ver
    false,  -- puede_crear
    false,  -- puede_editar
    false,  -- puede_eliminar
    true,   -- puede_exportar
    false,  -- puede_importar
    false,  -- puede_aprobar
    true,   -- activo
    'SISTEMA',
    NOW(),
    NOW()
FROM dim_roles dr
CROSS JOIN dim_paginas_modulo dp
WHERE dp.ruta_pagina = '/asegurados/bajas-cenacron'
  AND dr.id_rol <> 1  -- SUPERADMIN ya insertado arriba
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, puede_exportar = true, activo = true, updated_at = NOW();

-- Verificación
SELECT
    r.desc_rol            AS rol,
    p.ruta_pagina         AS pagina,
    pp.puede_ver          AS ver,
    pp.puede_exportar     AS exportar,
    pp.activo             AS activo
FROM segu_permisos_rol_pagina pp
JOIN dim_roles r           ON pp.id_rol    = r.id_rol
JOIN dim_paginas_modulo p  ON pp.id_pagina = p.id_pagina
WHERE p.ruta_pagina = '/asegurados/bajas-cenacron'
  AND pp.activo = true
ORDER BY r.desc_rol;
