-- ============================================================================
-- 🧩 CENATE MBAC 2025 – Vistas de control de acceso
-- ----------------------------------------------------------------------------
-- Archivo de respaldo para regenerar las vistas utilizadas por el sistema MBAC.
-- Incluye:
--   1️⃣ vw_modulos_accesibles         → módulos disponibles por usuario
--   2️⃣ vw_permisos_usuario_activos   → permisos activos detallados
--
-- Ejecutar con:
--   psql -h <host> -U postgres -d maestro_cenate -f init_mbac_views.sql
--
-- Este script es seguro: no borra tablas ni datos, solo (re)crea vistas.
-- ============================================================================

-- ============================================================================
-- 1️⃣ Vista: vw_modulos_accesibles
-- ----------------------------------------------------------------------------
-- Lista los módulos accesibles para cada usuario según sus permisos activos.
-- Se usa en la carga del menú lateral (DynamicSidebar / MBAC React Frontend).
-- ============================================================================
CREATE OR REPLACE VIEW vw_modulos_accesibles AS
SELECT DISTINCT
    m.id_modulo,
    m.nombre_modulo,
    m.descripcion,
    m.icono,
    m.ruta_base,
    m.activo,
    m.created_at,
    m.updated_at,
    pm.id_user
FROM permisos_modulares pm
JOIN dim_modulos_sistema m ON pm.id_modulo = m.id_modulo
JOIN dim_usuarios u ON pm.id_user = u.id_user
WHERE pm.activo = TRUE
ORDER BY m.id_modulo;

COMMENT ON VIEW vw_modulos_accesibles IS
    'Vista MBAC: módulos accesibles por usuario según permisos_modulares.';


-- ============================================================================
-- 2️⃣ Vista: vw_permisos_usuario_activos
-- ----------------------------------------------------------------------------
-- Muestra los permisos activos del sistema MBAC, relacionando:
--   - Usuario
--   - Rol
--   - Módulo
--   - Página
--   - Acciones (ver, crear, editar, eliminar, exportar, aprobar)
--
-- Se usa directamente en el backend (PermisoActivoViewRepository)
-- y en el frontend para construir las rutas protegidas MBAC.
-- ============================================================================
CREATE OR REPLACE VIEW vw_permisos_usuario_activos AS
SELECT
    pm.id_permiso,
    u.id_user,
    u.name_user        AS usuario,
    r.id_rol,
    r.desc_rol         AS rol,
    m.id_modulo,
    m.nombre_modulo    AS modulo,
    p.id_pagina,
    p.nombre_pagina    AS pagina,
    p.ruta_pagina,
    pm.puede_ver,
    pm.puede_crear,
    pm.puede_editar,
    pm.puede_eliminar,
    pm.puede_exportar,
    pm.puede_aprobar,
    pm.activo,
    pm.created_at,
    pm.updated_at
FROM permisos_modulares pm
JOIN dim_usuarios        u ON pm.id_user   = u.id_user
JOIN dim_roles           r ON pm.id_rol    = r.id_rol
JOIN dim_modulos_sistema m ON pm.id_modulo = m.id_modulo
JOIN dim_paginas_modulo  p ON pm.id_pagina = p.id_pagina
WHERE pm.activo = TRUE
ORDER BY m.id_modulo, p.id_pagina;

COMMENT ON VIEW vw_permisos_usuario_activos IS
    'Vista MBAC: permisos activos de usuarios (usuario, rol, módulo, página, acciones).';




 -- 💾 Instrucciones de respaldo
 -- Para restaurar las vistas manualmente en tu servidor remoto:
 -- psql -h 10.0.89.13 -U postgres -d maestro_cenate -f backend/src/main/resources/sql/init/init_mbac_views.sql

 -- Verifica que las vistas se regeneraron correctamente:
 -- \dv vw_*