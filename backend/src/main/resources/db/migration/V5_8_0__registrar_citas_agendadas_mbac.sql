-- ============================================================================
-- V5_8_0: Registrar página "Citas Agendadas" en módulo Gestión de Citas
-- Ruta MBAC: /citas/citas-agendadas
-- Roles: SUPERADMIN(1), COORD. GESTION CITAS(27), GESTOR DE CITAS(25)
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-02-23
-- ============================================================================

-- 1. Corregir secuencia y agregar página si no existe
SELECT setval(
    pg_get_serial_sequence('dim_paginas_modulo', 'id_pagina'),
    (SELECT MAX(id_pagina) FROM dim_paginas_modulo)
);

INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, icono, orden, activo, created_at)
SELECT
    m.id_modulo,
    'Citas Agendadas',
    '/citas/citas-agendadas',
    'Ver citas agendadas del día para gestoras de citas',
    'CalendarCheck',
    5,
    true,
    NOW()
FROM dim_modulos_sistema m
WHERE m.nombre_modulo = 'Gestión de Citas'
  AND NOT EXISTS (
      SELECT 1 FROM dim_paginas_modulo WHERE ruta_pagina = '/citas/citas-agendadas'
  )
LIMIT 1;

-- 2. Permisos: SUPERADMIN(1), COORD. GESTION CITAS(27), GESTOR DE CITAS(25)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT r.id_rol, p.id_pagina, r.ver, false, r.editar, false, r.exportar, true, NOW()
FROM dim_paginas_modulo p
CROSS JOIN (VALUES
    (1,  true, true,  true),
    (27, true, true,  true),
    (25, true, true,  false)
) AS r(id_rol, ver, editar, exportar)
WHERE p.ruta_pagina = '/citas/citas-agendadas'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET puede_ver = true, activo = true;

-- Verificación
SELECT r.desc_rol, p.nombre_pagina, pp.puede_ver, pp.puede_editar, pp.puede_exportar, pp.activo
FROM dim_permisos_pagina_rol pp
JOIN dim_roles r          ON pp.id_rol    = r.id_rol
JOIN dim_paginas_modulo p ON pp.id_pagina = p.id_pagina
WHERE p.ruta_pagina = '/citas/citas-agendadas' AND pp.activo = true;

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
