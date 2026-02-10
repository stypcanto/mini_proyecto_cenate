-- ============================================================================
-- FIX RÁPIDO: Agregar permisos para /teleekgs/ipress-workspace
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

-- 2. Agregar permisos para INSTITUCION_EX
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

-- 3. Verificación
SELECT
    'Página' as tipo,
    ruta_pagina as recurso,
    COUNT(*) as registros
FROM dim_paginas_modulo
WHERE ruta_pagina = '/teleekgs/ipress-workspace'
GROUP BY ruta_pagina

UNION ALL

SELECT
    'Permiso' as tipo,
    CONCAT(r.desc_rol, ' → ', p.ruta_pagina) as recurso,
    CASE WHEN pp.puede_eliminar THEN 1 ELSE 0 END as registros
FROM segu_permisos_rol_pagina pp
JOIN dim_roles r ON pp.id_rol = r.id_rol
JOIN dim_paginas_modulo p ON pp.id_pagina = p.id_pagina
WHERE r.desc_rol = 'INSTITUCION_EX'
  AND p.ruta_pagina = '/teleekgs/ipress-workspace'
  AND pp.puede_eliminar = true;

-- ============================================================================
-- Resultado esperado:
-- ✅ Página /teleekgs/ipress-workspace creada
-- ✅ Permisos INSTITUCION_EX configurados con puede_eliminar = true
-- ============================================================================
