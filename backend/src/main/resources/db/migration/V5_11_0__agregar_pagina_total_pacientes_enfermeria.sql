-- ============================================================================
-- V5_11_0: Registrar página "Total Pacientes Enfermería" en módulo Enfermería
-- Permisos para roles: SUPERADMIN y COORD. ENFERMERIA (id_rol=36)
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-02-24
-- Descripción: Página que muestra el total de pacientes por enfermera (bolsa 3)
--              con soporte para reasignación masiva desde la coordinadora de enfermería
-- NOTA: id_modulo=42 (Enfermería), rol COORD. ENFERMERIA id=36
-- ============================================================================

-- 1. Insertar la página en dim_paginas_modulo bajo "Enfermería" (id_modulo=42)
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, icono, orden, activo, created_at)
SELECT
    m.id_modulo,
    'Total Pacientes Enfermería',
    '/enfermeria/total-pacientes-enfermeria',
    'Distribución de pacientes por enfermera con reasignación masiva',
    'Users',
    21,
    true,
    NOW()
FROM dim_modulos_sistema m
WHERE UPPER(m.nombre_modulo) LIKE '%ENFERMER%'
LIMIT 1
ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- 2. Permisos para SUPERADMIN (id_rol = 1)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT 1, p.id_pagina, true, false, true, false, true, true, NOW()
FROM dim_paginas_modulo p
WHERE p.ruta_pagina = '/enfermeria/total-pacientes-enfermeria'
ON CONFLICT (id_rol, id_pagina) DO NOTHING;

-- 3. Permisos para COORD. ENFERMERIA (lookup dinámico por nombre de rol)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT
    r.id_rol,
    p.id_pagina,
    true,  -- puede_ver
    true,  -- puede_crear
    true,  -- puede_editar (reasignar pacientes)
    false, -- puede_eliminar
    true,  -- puede_exportar
    true,
    NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%COORD%ENFERM%'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/enfermeria/total-pacientes-enfermeria'
ON CONFLICT (id_rol, id_pagina) DO NOTHING;

-- 4. Permisos para usuario Sandra (id_user=454) en permisos_modulares (si aplica)
INSERT INTO permisos_modulares (id_user, id_rol, id_modulo, id_pagina, accion, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo)
SELECT
    454,
    r.id_rol,
    p.id_modulo,
    p.id_pagina,
    'all',
    true, true, true, false, true, false, true
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%COORD%ENFERM%'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/enfermeria/total-pacientes-enfermeria'
ON CONFLICT DO NOTHING;

-- Verificación
SELECT
    r.desc_rol            AS rol,
    p.ruta_pagina         AS pagina,
    pp.puede_ver          AS ver,
    pp.puede_editar       AS editar,
    pp.activo             AS activo
FROM dim_permisos_pagina_rol pp
JOIN dim_roles r           ON pp.id_rol    = r.id_rol
JOIN dim_paginas_modulo p  ON pp.id_pagina = p.id_pagina
WHERE p.ruta_pagina = '/enfermeria/total-pacientes-enfermeria'
  AND pp.activo = true;
