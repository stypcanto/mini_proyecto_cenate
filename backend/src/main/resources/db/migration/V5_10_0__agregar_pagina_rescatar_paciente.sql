-- ============================================================================
-- V5_10_0: Registrar página "Rescatar Paciente" en módulo Enfermería
-- Permisos para roles: SUPERADMIN y COORD. ENFERMERIA (id_rol=36)
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-02-24
-- Descripción: Página que permite a la coordinadora de enfermería recuperar
--              pacientes con estado "Deserción" y reasignarlos como "Pendiente"
-- NOTA: id_modulo=42 (Enfermería), rol COORD. ENFERMERIA id=36
-- ============================================================================

-- 1. Insertar la página en dim_paginas_modulo bajo "Enfermería" (id_modulo=42)
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, icono, orden, activo, created_at)
SELECT
    m.id_modulo,
    'Rescatar Paciente',
    '/enfermeria/rescatar-paciente',
    'Recuperar pacientes con estado Deserción y reasignarlos con estado Pendiente',
    'LifeBuoy',
    20,
    true,
    NOW()
FROM dim_modulos_sistema m
WHERE UPPER(m.nombre_modulo) LIKE '%ENFERMER%'
LIMIT 1
ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- 2. Permisos para SUPERADMIN (id_rol = 1)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT 1, p.id_pagina, true, false, true, false, false, true, NOW()
FROM dim_paginas_modulo p
WHERE p.ruta_pagina = '/enfermeria/rescatar-paciente'
ON CONFLICT (id_rol, id_pagina) DO NOTHING;

-- 3. Permisos para COORD. ENFERMERIA (lookup dinámico por nombre de rol)
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT
    r.id_rol,
    p.id_pagina,
    true,  -- puede_ver
    false, -- puede_crear
    true,  -- puede_editar (rescatar = modificar estado)
    false, -- puede_eliminar
    false, -- puede_exportar
    true,
    NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%COORD%ENFERM%'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/enfermeria/rescatar-paciente'
ON CONFLICT (id_rol, id_pagina) DO NOTHING;

-- Verificación
SELECT
    r.desc_rol            AS rol,
    p.ruta_pagina         AS pagina,
    pp.puede_ver          AS ver,
    pp.puede_editar       AS editar,
    pp.activo             AS activo
FROM dim_permisos_pagina_rol pp
JOIN dim_roles r           ON pp.id_rol    = r.id_rol
JOIN dim_paginas_modulo p  ON pp.id_pagina = p.id_pagina
WHERE p.ruta_pagina = '/enfermeria/rescatar-paciente'
  AND pp.activo = true;
