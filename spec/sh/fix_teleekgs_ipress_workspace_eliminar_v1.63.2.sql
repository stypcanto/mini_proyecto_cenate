-- ============================================================================
-- FIX RÁPIDO: Agregar página y permisos para /teleekgs/ipress-workspace
-- ============================================================================
-- Problema: El DELETE de imágenes falla con "No tiene permisos..."
-- Causa: Falta la página /teleekgs/ipress-workspace en la BD
--
-- Solución: Ejecutar este SQL directamente contra PostgreSQL
-- ============================================================================

-- 1. Crear página si no existe
INSERT INTO dim_paginas_modulo (nombre_pagina, ruta_pagina, desc_pagina, activo)
VALUES (
    'TeleEKGs - IPRESS Workspace',
    '/teleekgs/ipress-workspace',
    'Workspace de IPRESS para gestionar imágenes ECG (agregar, reemplazar, eliminar)',
    true
)
ON CONFLICT (ruta_pagina) DO NOTHING;

-- 2a. Agregar permisos para INSTITUCION_EX
INSERT INTO segu_permisos_rol_pagina (
    id_rol,
    id_pagina,
    puede_ver,
    puede_crear,
    puede_editar,
    puede_eliminar,
    puede_exportar,
    activo
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    true,   -- puede_crear (agregar imágenes)
    true,   -- puede_editar (reemplazar imágenes)
    true,   -- puede_eliminar (✅ PERMITE ELIMINAR)
    false,  -- puede_exportar
    true    -- activo
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'INSTITUCION_EX'
  AND p.ruta_pagina = '/teleekgs/ipress-workspace'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = true,
    puede_crear = true,
    puede_editar = true,
    puede_eliminar = true,
    puede_exportar = false,
    activo = true,
    updated_at = NOW();

-- 2b. Agregar permisos para MEDICO
INSERT INTO segu_permisos_rol_pagina (
    id_rol,
    id_pagina,
    puede_ver,
    puede_crear,
    puede_editar,
    puede_eliminar,
    puede_exportar,
    activo
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    false,  -- puede_crear
    false,  -- puede_editar
    true,   -- puede_eliminar (✅ PERMITE ELIMINAR)
    true,   -- puede_exportar
    true    -- activo
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'MEDICO'
  AND p.ruta_pagina = '/teleekgs/ipress-workspace'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = true,
    puede_crear = false,
    puede_editar = false,
    puede_eliminar = true,
    puede_exportar = true,
    activo = true,
    updated_at = NOW();

-- 2c. Agregar permisos para COORDINADOR
INSERT INTO segu_permisos_rol_pagina (
    id_rol,
    id_pagina,
    puede_ver,
    puede_crear,
    puede_editar,
    puede_eliminar,
    puede_exportar,
    activo
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    true,   -- puede_crear
    true,   -- puede_editar
    true,   -- puede_eliminar (✅ PERMITE ELIMINAR)
    true,   -- puede_exportar
    true    -- activo
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'COORDINADOR'
  AND p.ruta_pagina = '/teleekgs/ipress-workspace'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = true,
    puede_crear = true,
    puede_editar = true,
    puede_eliminar = true,
    puede_exportar = true,
    activo = true,
    updated_at = NOW();

-- 3. Verificación - Mostrar todos los roles con acceso
SELECT
    r.desc_rol as rol,
    p.ruta_pagina as pagina,
    pp.puede_ver as ver,
    pp.puede_crear as crear,
    pp.puede_editar as editar,
    pp.puede_eliminar as eliminar,
    pp.puede_exportar as exportar,
    pp.activo as activo
FROM segu_permisos_rol_pagina pp
JOIN dim_roles r ON pp.id_rol = r.id_rol
JOIN dim_paginas_modulo p ON pp.id_pagina = p.id_pagina
WHERE p.ruta_pagina = '/teleekgs/ipress-workspace'
  AND pp.activo = true
ORDER BY r.desc_rol;

-- ============================================================================
-- Resultado esperado después de ejecutar:
-- ✅ Página /teleekgs/ipress-workspace creada
-- ✅ INSTITUCION_EX: puede_eliminar = true
-- ✅ MEDICO: puede_eliminar = true
-- ✅ COORDINADOR: puede_eliminar = true
-- ✅ Todos los roles pueden ahora eliminar imágenes
-- ============================================================================
