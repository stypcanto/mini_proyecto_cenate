-- ============================================================================
-- SCRIPT: Asignación de permisos para rol INSTITUCION_EX
-- Sistema: CENATE - Centro Nacional de Telemedicina
-- Fecha: Diciembre 2025
-- Descripción: Asigna permisos al rol INSTITUCION_EX para que usuarios
--              externos puedan acceder al módulo de Gestión de Personal Externo
-- ============================================================================

-- ============================================================================
-- ESTRUCTURA ACTUAL (Diciembre 2025):
-- - Rol INSTITUCION_EX: id_rol = 18
-- - Módulo "Gestión de Personal Externo": id_modulo = 20
-- - Página "Formulario de Diagnóstico": id_pagina = 59
--   Ruta: /roles/externo/formulario-diagnostico
-- ============================================================================

-- Asignar permisos al rol INSTITUCION_EX para el módulo de externos
INSERT INTO dim_permisos_modulares (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, puede_aprobar, activo)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    true,   -- puede_crear
    true,   -- puede_editar
    false,  -- puede_eliminar (restringido)
    true,   -- puede_exportar
    false,  -- puede_aprobar (restringido)
    true    -- activo
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
JOIN dim_modulos_sistema m ON m.id_modulo = p.id_modulo
WHERE r.desc_rol = 'INSTITUCION_EX'
  AND m.nombre_modulo = 'Gestión de Personal Externo'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = true,
    puede_crear = true,
    puede_editar = true,
    puede_eliminar = false,
    puede_exportar = true,
    puede_aprobar = false,
    activo = true,
    updated_at = NOW();

-- ============================================================================
-- VERIFICACIÓN
-- ============================================================================

-- Mostrar permisos asignados al rol INSTITUCION_EX
SELECT
    r.desc_rol AS rol,
    m.nombre_modulo AS modulo,
    p.nombre_pagina AS pagina,
    p.ruta_pagina AS ruta,
    pm.puede_ver,
    pm.puede_crear,
    pm.puede_editar,
    pm.puede_eliminar,
    pm.puede_exportar,
    pm.activo
FROM dim_permisos_modulares pm
JOIN dim_roles r ON r.id_rol = pm.id_rol
JOIN dim_paginas_modulo p ON p.id_pagina = pm.id_pagina
JOIN dim_modulos_sistema m ON m.id_modulo = p.id_modulo
WHERE r.desc_rol = 'INSTITUCION_EX'
ORDER BY m.nombre_modulo, p.nombre_pagina;

-- Mostrar usuarios con rol INSTITUCION_EX y sus permisos
SELECT
    u.name_user AS usuario,
    r.desc_rol AS rol,
    m.nombre_modulo AS modulo,
    p.nombre_pagina AS pagina,
    pm.puede_ver,
    pm.puede_crear,
    pm.puede_editar
FROM dim_usuarios u
JOIN rel_user_roles ur ON ur.id_user = u.id_user
JOIN dim_roles r ON ur.id_rol = r.id_rol
JOIN dim_permisos_modulares pm ON pm.id_rol = r.id_rol
JOIN dim_paginas_modulo p ON p.id_pagina = pm.id_pagina
JOIN dim_modulos_sistema m ON m.id_modulo = p.id_modulo
WHERE r.desc_rol = 'INSTITUCION_EX'
ORDER BY u.name_user, m.nombre_modulo, p.nombre_pagina;

-- ============================================================================
-- FIN DEL SCRIPT
-- ============================================================================
