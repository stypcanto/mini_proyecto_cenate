-- ============================================================================
-- V5_7_0: Registrar página "Solicitudes Atendidas" en módulo Bolsas de Pacientes
-- Ruta MBAC: /bolsas/solicitudesatendidas
-- Roles: SUPERADMIN(1), COORD. GESTION CITAS(27), GESTOR DE CITAS(25)
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-02-21
-- NOTA: Ya ejecutado manualmente el 2026-02-21
-- ============================================================================

-- 1. Corregir secuencia y agregar página si no existe
SELECT setval(
    pg_get_serial_sequence('dim_paginas_modulo', 'id_pagina'),
    (SELECT MAX(id_pagina) FROM dim_paginas_modulo)
);

INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, icono, orden, activo, created_at)
SELECT
    m.id_modulo,
    'Solicitudes Atendidas',
    '/bolsas/solicitudesatendidas',
    'Ver solicitudes de bolsas con estado ATENDIDO',
    'CheckCircle',
    36,
    true,
    NOW()
FROM dim_modulos_sistema m
WHERE m.nombre_modulo = 'Bolsas de Pacientes'
  AND NOT EXISTS (
      SELECT 1 FROM dim_paginas_modulo WHERE ruta_pagina = '/bolsas/solicitudesatendidas'
  )
LIMIT 1;

-- 2. Permisos: SUPERADMIN(1), COORD. GESTION CITAS(27), GESTOR DE CITAS(25)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT r.id_rol, p.id_pagina, r.ver, false, false, false, r.exportar, true, NOW()
FROM dim_paginas_modulo p
CROSS JOIN (VALUES
    (1,  true, true),
    (27, true, true),
    (25, true, false)
) AS r(id_rol, ver, exportar)
WHERE p.ruta_pagina = '/bolsas/solicitudesatendidas'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET puede_ver = true, activo = true;

-- Verificación
SELECT r.desc_rol, p.nombre_pagina, pp.puede_ver, pp.puede_exportar, pp.activo
FROM dim_permisos_pagina_rol pp
JOIN dim_roles r          ON pp.id_rol    = r.id_rol
JOIN dim_paginas_modulo p ON pp.id_pagina = p.id_pagina
WHERE p.ruta_pagina = '/bolsas/solicitudesatendidas' AND pp.activo = true;

-- ============================================================================
-- FIN DE LA MIGRACIÓN
-- ============================================================================
