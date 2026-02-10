-- ============================================================================
-- Migration V3.4.2: Agregar página y permisos para /teleekgs/ipress-workspace
-- ============================================================================
-- Descripción:
--   El endpoint DELETE de TeleECGs fue cambiado para verificar permisos en
--   /teleekgs/ipress-workspace en lugar de /teleekgs/listar (commit dab6d24).
--   Sin embargo, esta página no estaba registrada en la BD.
--
-- Solución:
--   Crear la página /teleekgs/ipress-workspace y configurar permisos para
--   INSTITUCION_EX y otros roles que necesiten acceso.
--
-- Módulo: TeleEKGs v1.63.2+
-- Fecha: 2026-02-09
-- Autor: Arquitectura CENATE
-- ============================================================================

-- ============================================================================
-- 1. Insertar página /teleekgs/ipress-workspace
-- ============================================================================

INSERT INTO dim_paginas_modulo (nombre_pagina, ruta_pagina, desc_pagina, activo)
VALUES (
    'TeleEKGs - IPRESS Workspace',
    '/teleekgs/ipress-workspace',
    'Workspace de IPRESS para gestionar imágenes ECG (agregar, reemplazar, eliminar)',
    true
)
ON CONFLICT (ruta_pagina) DO NOTHING;

-- ============================================================================
-- 2. Configurar permisos para TODOS los roles que necesiten acceso
-- ============================================================================

-- 2a. INSTITUCION_EX - Usuarios externos que cargan y gestionan imágenes
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
    true,   -- puede_ver (VE el workspace)
    true,   -- puede_crear (CRÍTICO para agregar imágenes)
    true,   -- puede_editar (Para reemplazar imágenes)
    true,   -- puede_eliminar (✅ FIX: PERMITE ELIMINAR IMÁGENES)
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

-- 2b. MEDICO - Los médicos también podrían necesitar eliminar imágenes
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
    true,   -- puede_eliminar (PERMITIR a MEDICO eliminar si es necesario)
    true,   -- puede_exportar (MEDICO puede exportar reportes)
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

-- 2c. COORDINADOR - Coordinadores de atención que gestionan flujo
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
    true,   -- puede_eliminar (PERMITIR a COORDINADOR)
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

-- ============================================================================
-- 3. Verificación POST-FIX
-- ============================================================================

-- Mostrar todos los roles configurados con permisos de eliminación
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
-- FIN DE LA MIGRACIÓN V3.4.2
-- ============================================================================
-- Resumen:
--   ✅ Página /teleekgs/ipress-workspace agregada
--   ✅ Permisos configurados para MÚLTIPLES ROLES:
--
--   1. INSTITUCION_EX (Usuarios externos):
--      - puede_ver = true
--      - puede_crear = true (agregar imágenes)
--      - puede_editar = true (reemplazar imágenes)
--      - puede_eliminar = true ← FIX
--      - puede_exportar = false
--
--   2. MEDICO (Profesionales de salud):
--      - puede_ver = true (ver workspace)
--      - puede_crear = false
--      - puede_editar = false
--      - puede_eliminar = true ← FIX
--      - puede_exportar = true (reportes)
--
--   3. COORDINADOR (Gestión de atención):
--      - puede_ver = true
--      - puede_crear = true
--      - puede_editar = true
--      - puede_eliminar = true ← FIX
--      - puede_exportar = true
--
-- Impacto:
--   - ✅ INSTITUCION_EX puede eliminar imágenes
--   - ✅ MEDICO puede eliminar imágenes
--   - ✅ COORDINADOR puede eliminar imágenes
--   - ✅ Endpoint DELETE /api/teleekgs/{idImagen} funciona para todos
--   - ✅ Error 500 "No tiene permisos" resuelto
-- ============================================================================
