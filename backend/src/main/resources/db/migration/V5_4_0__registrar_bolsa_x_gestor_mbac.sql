-- ============================================================================
-- V5_4_0: Registrar página "Bolsa x Gestor" en módulo Bolsas de Pacientes
-- Permisos para roles: SUPERADMIN e IPRESS: COORD. GESTION CITAS
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-02-20
-- Descripción: Página que muestra pacientes agrupados por gestora de citas
--              con conteos por estado: pendientes, citados, atendidos, anulados
-- ============================================================================

-- 1. Insertar la página en dim_paginas_modulo bajo "Bolsas de Pacientes"
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, icono, orden, activo, created_at)
SELECT
    m.id_modulo,
    'Bolsa x Gestor',
    '/bolsas/bolsa-x-gestor',
    'Vista de pacientes agrupados por gestora de citas con conteos por estado (pendientes, citados, atendidos, anulados)',
    'Users',
    90,
    true,
    NOW()
FROM dim_modulos_sistema m
WHERE m.nombre_modulo = 'Bolsas de Pacientes'
LIMIT 1
ON CONFLICT (ruta_pagina) DO NOTHING;

-- 2. Permisos para SUPERADMIN (id_rol = 1)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT 1, p.id_pagina, true, false, false, false, false, true, NOW()
FROM dim_paginas_modulo p
WHERE p.ruta_pagina = '/bolsas/bolsa-x-gestor'
ON CONFLICT (id_rol, id_pagina) DO NOTHING;

-- 3. Permisos para COORD. GESTION CITAS (lookup dinámico por nombre de rol)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT
    r.id_rol,
    p.id_pagina,
    true,  -- puede_ver
    false, -- puede_crear
    false, -- puede_editar
    false, -- puede_eliminar
    false, -- puede_exportar
    true,
    NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) = 'COORD. GESTION CITAS'
       OR UPPER(desc_rol) = 'COORDINADOR_GESTION_CITAS'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/bolsas/bolsa-x-gestor'
ON CONFLICT (id_rol, id_pagina) DO NOTHING;

-- Verificación
SELECT
    r.desc_rol            AS rol,
    p.ruta_pagina         AS pagina,
    pp.puede_ver          AS ver,
    pp.puede_exportar     AS exportar,
    pp.activo             AS activo
FROM dim_permisos_pagina_rol pp
JOIN dim_roles r           ON pp.id_rol    = r.id_rol
JOIN dim_paginas_modulo p  ON pp.id_pagina = p.id_pagina
WHERE p.ruta_pagina = '/bolsas/bolsa-x-gestor'
  AND pp.activo = true;
