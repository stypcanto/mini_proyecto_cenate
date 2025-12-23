-- ============================================================
-- Script: Modulo de Solicitud de Turnos por Telemedicina
-- Fecha: 2025-12-23
-- Descripcion: Crea paginas y permisos para:
--   - Coordinador: Gestion de Periodos
--   - Externo: Formulario de Solicitud
--   - Programacion CENATE: Dashboard consolidado
-- ============================================================

-- ============================================================
-- 1. BUSCAR O CREAR MODULO "Coordinador Medico"
-- ============================================================
INSERT INTO dim_modulos_sistema (nombre_modulo, descripcion, icono, orden, activo, created_at, updated_at)
VALUES (
    'Coordinador Medico',
    'Modulo para coordinadores medicos del CENATE',
    'UserCog',
    10,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (nombre_modulo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 2. CREAR PAGINA "Gestion de Periodos"
-- ============================================================
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, orden, activo, created_at, updated_at)
SELECT
    id_modulo,
    'Gestion de Periodos',
    '/roles/coordinador/gestion-periodos',
    'Crear y administrar periodos de solicitud de turnos',
    5,
    true,
    NOW(),
    NOW()
FROM dim_modulos_sistema
WHERE nombre_modulo = 'Coordinador Medico'
ON CONFLICT (ruta_pagina) DO UPDATE SET
    nombre_pagina = EXCLUDED.nombre_pagina,
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 3. PERMISOS PARA COORDINADOR (acceso completo)
-- ============================================================
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar,
    puede_exportar, puede_importar, puede_aprobar,
    activo, created_at, updated_at
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    true,   -- puede_crear
    true,   -- puede_editar
    true,   -- puede_eliminar
    true,   -- puede_exportar
    false,  -- puede_importar
    true,   -- puede_aprobar
    true,
    NOW(),
    NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'COORDINADOR'
AND p.ruta_pagina = '/roles/coordinador/gestion-periodos'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = true,
    puede_crear = true,
    puede_editar = true,
    puede_eliminar = true,
    puede_exportar = true,
    puede_aprobar = true,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 4. PERMISOS PARA SUPERADMIN Y ADMIN (acceso completo)
-- ============================================================
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar,
    puede_exportar, puede_importar, puede_aprobar,
    activo, created_at, updated_at
)
SELECT
    r.id_rol,
    p.id_pagina,
    true, true, true, true, true, true, true,
    true,
    NOW(),
    NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol IN ('SUPERADMIN', 'ADMIN')
AND p.ruta_pagina = '/roles/coordinador/gestion-periodos'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = true,
    puede_crear = true,
    puede_editar = true,
    puede_eliminar = true,
    puede_exportar = true,
    puede_importar = true,
    puede_aprobar = true,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 5. BUSCAR O CREAR MODULO "Personal Externo"
-- ============================================================
INSERT INTO dim_modulos_sistema (nombre_modulo, descripcion, icono, orden, activo, created_at, updated_at)
VALUES (
    'Personal Externo',
    'Modulo para usuarios externos (IPRESS)',
    'Users',
    15,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (nombre_modulo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 6. CREAR PAGINA "Solicitud de Turnos"
-- ============================================================
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, orden, activo, created_at, updated_at)
SELECT
    id_modulo,
    'Solicitud de Turnos',
    '/roles/externo/solicitud-turnos',
    'Formulario para solicitar turnos de telemedicina',
    4,
    true,
    NOW(),
    NOW()
FROM dim_modulos_sistema
WHERE nombre_modulo = 'Personal Externo'
ON CONFLICT (ruta_pagina) DO UPDATE SET
    nombre_pagina = EXCLUDED.nombre_pagina,
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 7. PERMISOS PARA EXTERNO
-- ============================================================
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar,
    puede_exportar, puede_importar, puede_aprobar,
    activo, created_at, updated_at
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    true,   -- puede_crear
    true,   -- puede_editar
    false,  -- puede_eliminar
    false,  -- puede_exportar
    false,  -- puede_importar
    false,  -- puede_aprobar
    true,
    NOW(),
    NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'EXTERNO'
AND p.ruta_pagina = '/roles/externo/solicitud-turnos'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = true,
    puede_crear = true,
    puede_editar = true,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 8. CREAR MODULO "Programacion CENATE"
-- ============================================================
INSERT INTO dim_modulos_sistema (nombre_modulo, descripcion, icono, orden, activo, created_at, updated_at)
VALUES (
    'Programacion CENATE',
    'Consolidado de solicitudes de turnos por telemedicina',
    'BarChart3',
    11,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (nombre_modulo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    icono = EXCLUDED.icono,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 9. CREAR PAGINA "Dashboard Programacion"
-- ============================================================
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, orden, activo, created_at, updated_at)
SELECT
    id_modulo,
    'Dashboard',
    '/programacion/dashboard',
    'Vista consolidada de solicitudes de turnos',
    1,
    true,
    NOW(),
    NOW()
FROM dim_modulos_sistema
WHERE nombre_modulo = 'Programacion CENATE'
ON CONFLICT (ruta_pagina) DO UPDATE SET
    nombre_pagina = EXCLUDED.nombre_pagina,
    descripcion = EXCLUDED.descripcion,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 10. CREAR PAGINA "Detalle Programacion"
-- ============================================================
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, orden, activo, created_at, updated_at)
SELECT
    id_modulo,
    'Detalle por Periodo',
    '/programacion/detalle',
    'Detalle de solicitudes por periodo',
    2,
    true,
    NOW(),
    NOW()
FROM dim_modulos_sistema
WHERE nombre_modulo = 'Programacion CENATE'
ON CONFLICT (ruta_pagina) DO UPDATE SET
    nombre_pagina = EXCLUDED.nombre_pagina,
    descripcion = EXCLUDED.descripcion,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 11. PERMISOS PARA COORDINADOR EN PROGRAMACION CENATE
-- ============================================================
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar,
    puede_exportar, puede_importar, puede_aprobar,
    activo, created_at, updated_at
)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    false,  -- puede_crear
    true,   -- puede_editar (marcar como revisado)
    false,  -- puede_eliminar
    true,   -- puede_exportar
    false,  -- puede_importar
    true,   -- puede_aprobar
    true,
    NOW(),
    NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'COORDINADOR'
AND p.ruta_pagina IN ('/programacion/dashboard', '/programacion/detalle')
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = true,
    puede_editar = true,
    puede_exportar = true,
    puede_aprobar = true,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 12. PERMISOS PARA SUPERADMIN Y ADMIN EN PROGRAMACION CENATE
-- ============================================================
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar,
    puede_exportar, puede_importar, puede_aprobar,
    activo, created_at, updated_at
)
SELECT
    r.id_rol,
    p.id_pagina,
    true, true, true, true, true, true, true,
    true,
    NOW(),
    NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol IN ('SUPERADMIN', 'ADMIN')
AND p.ruta_pagina IN ('/programacion/dashboard', '/programacion/detalle')
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = true,
    puede_crear = true,
    puede_editar = true,
    puede_eliminar = true,
    puede_exportar = true,
    puede_importar = true,
    puede_aprobar = true,
    activo = true,
    updated_at = NOW();

-- ============================================================
-- 13. VERIFICACION FINAL
-- ============================================================

-- Verificar modulos creados
SELECT id_modulo, nombre_modulo, icono, orden, activo
FROM dim_modulos_sistema
WHERE nombre_modulo IN ('Coordinador Medico', 'Personal Externo', 'Programacion CENATE')
ORDER BY orden;

-- Verificar paginas creadas
SELECT p.id_pagina, m.nombre_modulo, p.nombre_pagina, p.ruta_pagina, p.activo
FROM dim_paginas_modulo p
JOIN dim_modulos_sistema m ON p.id_modulo = m.id_modulo
WHERE p.ruta_pagina IN (
    '/roles/coordinador/gestion-periodos',
    '/roles/externo/solicitud-turnos',
    '/programacion/dashboard',
    '/programacion/detalle'
)
ORDER BY m.orden, p.orden;

-- Verificar permisos asignados
SELECT r.desc_rol, p.ruta_pagina,
       prp.puede_ver, prp.puede_crear, prp.puede_editar,
       prp.puede_eliminar, prp.puede_exportar, prp.activo
FROM segu_permisos_rol_pagina prp
JOIN dim_roles r ON prp.id_rol = r.id_rol
JOIN dim_paginas_modulo p ON prp.id_pagina = p.id_pagina
WHERE p.ruta_pagina IN (
    '/roles/coordinador/gestion-periodos',
    '/roles/externo/solicitud-turnos',
    '/programacion/dashboard',
    '/programacion/detalle'
)
ORDER BY p.ruta_pagina, r.desc_rol;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
