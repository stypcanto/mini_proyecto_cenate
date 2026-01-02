-- ============================================================================
-- Script: 019_agregar_permisos_pacientes_107.sql
-- Descripción: Otorgar permisos de visualización para la página "Pacientes de 107"
-- Autor: Ing. Styp Canto Rondón
-- Fecha: 2026-01-02
-- Versión: v1.15.3
-- ============================================================================

\echo '============================================'
\echo 'AGREGANDO PERMISOS PARA PACIENTES DE 107'
\echo '============================================'

-- 1. SUPERADMIN - Permisos completos
INSERT INTO rel_rol_pagina_permiso (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar)
VALUES (1, 71, true, true, true, true, true)
ON CONFLICT (id_rol, id_pagina) DO UPDATE
SET puede_ver = true, puede_crear = true, puede_editar = true, puede_eliminar = true, puede_exportar = true;

-- 2. ADMIN - Permisos completos
INSERT INTO rel_rol_pagina_permiso (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar)
VALUES (2, 71, true, true, true, true, true)
ON CONFLICT (id_rol, id_pagina) DO UPDATE
SET puede_ver = true, puede_crear = true, puede_editar = true, puede_eliminar = true, puede_exportar = true;

-- 3. COORDINADOR - Permisos de visualización y edición
INSERT INTO rel_rol_pagina_permiso (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar)
VALUES (4, 71, true, true, true, false, true)
ON CONFLICT (id_rol, id_pagina) DO UPDATE
SET puede_ver = true, puede_crear = true, puede_editar = true, puede_exportar = true;

\echo ''
\echo '✅ Permisos agregados exitosamente'
\echo ''

-- Verificar permisos creados
\echo '📋 Permisos para página 71 (Pacientes de 107):'
SELECT
    r.desc_rol,
    p.nombre_pagina,
    rrpp.puede_ver,
    rrpp.puede_crear,
    rrpp.puede_editar,
    rrpp.puede_eliminar,
    rrpp.puede_exportar
FROM rel_rol_pagina_permiso rrpp
JOIN dim_roles r ON rrpp.id_rol = r.id_rol
JOIN dim_paginas_modulo p ON rrpp.id_pagina = p.id_pagina
WHERE rrpp.id_pagina = 71
ORDER BY r.id_rol;

\echo ''
\echo '============================================'
\echo 'PERMISOS CONFIGURADOS CORRECTAMENTE'
\echo '============================================'
\echo ''
\echo '📍 Ahora puedes acceder a:'
\echo '   /roles/coordcitas/pacientes-107 (Visualizar pacientes importados)'
\echo ''
