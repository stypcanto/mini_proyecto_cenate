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
-- 2. Configurar permisos para INSTITUCION_EX en /teleekgs/ipress-workspace
-- ============================================================================

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

-- ============================================================================
-- 3. Verificación POST-FIX
-- ============================================================================

SELECT 'Fix aplicado correctamente' as status
WHERE EXISTS (
    SELECT 1 FROM segu_permisos_rol_pagina pp
    JOIN dim_roles r ON pp.id_rol = r.id_rol
    JOIN dim_paginas_modulo p ON pp.id_pagina = p.id_pagina
    WHERE r.desc_rol = 'INSTITUCION_EX'
      AND p.ruta_pagina = '/teleekgs/ipress-workspace'
      AND pp.puede_eliminar = true
      AND pp.activo = true
);

-- ============================================================================
-- FIN DE LA MIGRACIÓN V3.4.2
-- ============================================================================
-- Resumen:
--   ✅ Página /teleekgs/ipress-workspace agregada
--   ✅ Permisos INSTITUCION_EX configurados:
--      - puede_ver = true
--      - puede_crear = true (agregar imágenes)
--      - puede_editar = true (reemplazar imágenes)
--      - puede_eliminar = true (eliminar imágenes) ← FIX
--      - puede_exportar = false
--
-- Impacto:
--   - Usuarios con rol INSTITUCION_EX ahora pueden eliminar imágenes en
--     /teleekgs/ipress-workspace sin error 500
--   - Endpoint DELETE /api/teleekgs/{idImagen} funcionará correctamente
-- ============================================================================
