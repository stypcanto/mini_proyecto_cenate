-- ============================================================
-- Script: Modulo TeleECG para Panel Administrativo
-- Fecha: 2026-01-19
-- Descripcion: Crea modulo TeleECG con pagina "TeleECG Recibidas"
--   - Permite a administradores ver TODAS las ECGs recibidas
--   - Submodulo: TeleECG Recibidas (tabla consolidada de todas IPRESS)
--   - Acceso: SUPERADMIN, ADMIN, COORDINADOR_RED, ENFERMERIA
-- ============================================================

-- ============================================================
-- 1. CREAR MODULO "TeleECG"
-- ============================================================
INSERT INTO dim_modulos_sistema (
    nombre_modulo,
    descripcion,
    icono,
    orden,
    activo,
    created_at,
    updated_at
)
VALUES (
    'TeleECG',
    'Modulo de Gestión de Electrocardiogramas Remotos',
    'HeartHandshake',
    17,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (nombre_modulo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    icono = EXCLUDED.icono,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 2. CREAR PAGINA "TeleECG Recibidas" (submodulo principal)
-- ============================================================
INSERT INTO dim_paginas_modulo (
    id_modulo,
    nombre_pagina,
    ruta_pagina,
    descripcion,
    orden,
    activo,
    created_at,
    updated_at
)
SELECT
    id_modulo,
    'TeleECG Recibidas',
    '/teleecg/recibidas',
    'Vista consolidada de todos los electrocardiogramas recibidos de las IPRESS',
    1,
    true,
    NOW(),
    NOW()
FROM dim_modulos_sistema
WHERE nombre_modulo = 'TeleECG'
ON CONFLICT (ruta_pagina) DO UPDATE SET
    nombre_pagina = EXCLUDED.nombre_pagina,
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 3. CREAR PAGINA "Estadísticas TeleECG" (opcional)
-- ============================================================
INSERT INTO dim_paginas_modulo (
    id_modulo,
    nombre_pagina,
    ruta_pagina,
    descripcion,
    orden,
    activo,
    created_at,
    updated_at
)
SELECT
    id_modulo,
    'Estadísticas',
    '/teleecg/estadisticas',
    'Estadísticas y reportes de ECGs por IPRESS',
    2,
    true,
    NOW(),
    NOW()
FROM dim_modulos_sistema
WHERE nombre_modulo = 'TeleECG'
ON CONFLICT (ruta_pagina) DO UPDATE SET
    nombre_pagina = EXCLUDED.nombre_pagina,
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 4. PERMISOS PARA SUPERADMIN Y ADMIN (acceso completo)
-- ============================================================
INSERT INTO segu_permisos_rol_pagina (
    id_rol,
    id_pagina,
    puede_ver,
    puede_crear,
    puede_editar,
    puede_eliminar,
    puede_exportar,
    puede_importar,
    puede_aprobar,
    activo,
    created_at,
    updated_at
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    true,   -- puede_crear
    true,   -- puede_editar
    true,   -- puede_eliminar
    true,   -- puede_exportar
    true,   -- puede_importar
    true,   -- puede_aprobar
    true,
    NOW(),
    NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol IN ('SUPERADMIN', 'ADMIN')
AND p.ruta_pagina IN ('/teleecg/recibidas', '/teleecg/estadisticas')
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = true,
    puede_crear = true,
    puede_editar = true,
    puede_eliminar = true,
    puede_exportar = true,
    puede_importar = true,
    puede_aprobar = true,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 5. PERMISOS PARA COORDINADOR_RED (lectura y exportación)
-- ============================================================
INSERT INTO segu_permisos_rol_pagina (
    id_rol,
    id_pagina,
    puede_ver,
    puede_crear,
    puede_editar,
    puede_eliminar,
    puede_exportar,
    puede_importar,
    puede_aprobar,
    activo,
    created_at,
    updated_at
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    false,  -- puede_crear
    false,  -- puede_editar
    false,  -- puede_eliminar
    true,   -- puede_exportar
    false,  -- puede_importar
    false,  -- puede_aprobar
    true,
    NOW(),
    NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'COORDINADOR_RED'
AND p.ruta_pagina IN ('/teleecg/recibidas', '/teleecg/estadisticas')
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = true,
    puede_exportar = true,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 6. PERMISOS PARA ENFERMERIA (lectura solamente)
-- ============================================================
INSERT INTO segu_permisos_rol_pagina (
    id_rol,
    id_pagina,
    puede_ver,
    puede_crear,
    puede_editar,
    puede_eliminar,
    puede_exportar,
    puede_importar,
    puede_aprobar,
    activo,
    created_at,
    updated_at
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    false,  -- puede_crear
    false,  -- puede_editar
    false,  -- puede_eliminar
    false,  -- puede_exportar
    false,  -- puede_importar
    false,  -- puede_aprobar
    true,
    NOW(),
    NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'ENFERMERIA'
AND p.ruta_pagina IN ('/teleecg/recibidas', '/teleecg/estadisticas')
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = true,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 7. VERIFICACION FINAL
-- ============================================================

-- Verificar módulo creado
SELECT
    id_modulo,
    nombre_modulo,
    descripcion,
    icono,
    orden,
    activo
FROM dim_modulos_sistema
WHERE nombre_modulo = 'TeleECG';

-- Verificar páginas creadas
SELECT
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
SELECT
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
