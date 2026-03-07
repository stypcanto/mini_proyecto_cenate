-- ============================================================================
-- V6_36_0: Registrar página "Total Pacientes TeleCe" en módulo Coordinador de Especialidades
-- Módulo: Coordinador de Especialidades (id_modulo = 19)
-- Roles: SUPERADMIN (id_rol=1), COORD. ESPECIALIDADES (id_rol=15)
-- Ruta: /roles/coordinador/total-pacientes-telece
-- Fecha: 2026-03-07
-- ============================================================================

-- 1. Insertar la página en dim_paginas_modulo bajo "Coordinador de Especialidades" (id_modulo=19)
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, icono, orden, activo, created_at)
VALUES (
    19,
    'Total Pacientes TeleCe',
    '/roles/coordinador/total-pacientes-telece',
    'Distribución de pacientes de Medicina Especializada (SGDT) por médico, con reasignación masiva',
    'Users',
    8,
    true,
    NOW()
)
ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- 2. Permisos para SUPERADMIN (id_rol = 1) — tabla operativa que usa el backend
INSERT INTO segu_permisos_rol_pagina (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT 1, id_pagina, true, false, true, false, true, true, NOW()
FROM dim_paginas_modulo
WHERE ruta_pagina = '/roles/coordinador/total-pacientes-telece'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET puede_ver = true, activo = true;

-- 3. Permisos para COORD. ESPECIALIDADES (id_rol = 15)
INSERT INTO segu_permisos_rol_pagina (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT 15, id_pagina, true, false, true, false, true, true, NOW()
FROM dim_paginas_modulo
WHERE ruta_pagina = '/roles/coordinador/total-pacientes-telece'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET puede_ver = true, activo = true;

-- Verificación
SELECT
    r.desc_rol            AS rol,
    p.ruta_pagina         AS pagina,
    pp.puede_ver          AS ver,
    pp.puede_editar       AS editar,
    pp.activo             AS activo
FROM segu_permisos_rol_pagina pp
JOIN dim_roles r           ON pp.id_rol    = r.id_rol
JOIN dim_paginas_modulo p  ON pp.id_pagina = p.id_pagina
WHERE p.ruta_pagina = '/roles/coordinador/total-pacientes-telece'
  AND pp.activo = true;
