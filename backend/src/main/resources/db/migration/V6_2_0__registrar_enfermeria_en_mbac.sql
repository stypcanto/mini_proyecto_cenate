-- ============================================================================
-- V6_2_0: Registrar módulo Enfermería en MBAC (segu_permisos_rol_pagina)
-- Problema: Las páginas de enfermería estaban en dim_permisos_pagina_rol
--           pero NO en segu_permisos_rol_pagina, por lo que SUPERADMIN
--           no podía verlas ni controlarlas desde el panel MBAC.
-- Solución: Agregar las 3 páginas a segu_permisos_rol_pagina para:
--           - SUPERADMIN (id_rol=1): acceso y control total
--           - COORD. ENFERMERIA: puede ver y editar
-- También: Registrar página "Trazabilidad Recitas/Interconsultas" en BD
--           (existía en componentRegistry pero no en dim_paginas_modulo)
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-02-24
-- ============================================================================

-- ============================================================================
-- PASO 0: Activar módulo Enfermería en dim_modulos_sistema
-- (estaba activo=false, lo que impedía que apareciera en /api/mbac/modulos)
-- ============================================================================
UPDATE dim_modulos_sistema SET activo = true WHERE UPPER(nombre_modulo) LIKE '%ENFERMER%';

-- ============================================================================
-- PASO 1: Registrar página "Trazabilidad Recitas/Interconsultas" en BD
-- (existe en componentRegistry.js pero no tiene entrada en dim_paginas_modulo)
-- ============================================================================
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, icono, orden, activo, created_at)
SELECT
    m.id_modulo,
    'Trazabilidad Recitas/Interconsultas',
    '/enfermeria/trazabilidad-recitas',
    'Seguimiento y trazabilidad de recitas e interconsultas de enfermería',
    'GitBranch',
    19,
    true,
    NOW()
FROM dim_modulos_sistema m
WHERE UPPER(m.nombre_modulo) LIKE '%ENFERMER%'
LIMIT 1
ON CONFLICT (id_modulo, ruta_pagina) DO NOTHING;

-- ============================================================================
-- PASO 2: Permisos en dim_permisos_pagina_rol para "Trazabilidad Recitas"
-- (mismo patrón que las otras páginas de enfermería)
-- ============================================================================

-- SUPERADMIN
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT 1, p.id_pagina, true, false, false, false, true, true, NOW()
FROM dim_paginas_modulo p
WHERE p.ruta_pagina = '/enfermeria/trazabilidad-recitas'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET puede_ver = true, activo = true;

-- COORD. ENFERMERIA
INSERT INTO dim_permisos_pagina_rol (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, created_at)
SELECT r.id_rol, p.id_pagina, true, false, false, false, true, true, NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%COORD%ENFERM%'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/enfermeria/trazabilidad-recitas'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET puede_ver = true, activo = true;

-- ============================================================================
-- PASO 3: Insertar las 3 páginas de Enfermería en segu_permisos_rol_pagina
-- para SUPERADMIN (id_rol=1) — esto las hace visibles y controlables en MBAC
-- ============================================================================
INSERT INTO segu_permisos_rol_pagina (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, autorizado_por, created_at, updated_at)
SELECT
    1,
    p.id_pagina,
    true,   -- puede_ver
    false,  -- puede_crear
    true,   -- puede_editar (control desde MBAC)
    false,  -- puede_eliminar
    true,   -- puede_exportar
    true,   -- activo
    'SUPERADMIN',
    NOW(),
    NOW()
FROM dim_paginas_modulo p
WHERE p.ruta_pagina IN (
    '/enfermeria/trazabilidad-recitas',
    '/enfermeria/rescatar-paciente',
    '/enfermeria/total-pacientes-enfermeria'
)
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, puede_editar = true, activo = true, updated_at = NOW();

-- ============================================================================
-- PASO 4: Insertar las 3 páginas en segu_permisos_rol_pagina
-- para COORD. ENFERMERIA — para que aparezcan en su menú y puedan ser gestionadas
-- ============================================================================
INSERT INTO segu_permisos_rol_pagina (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, autorizado_por, created_at, updated_at)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    true,   -- puede_crear
    true,   -- puede_editar
    false,  -- puede_eliminar
    true,   -- puede_exportar
    true,   -- activo
    'SUPERADMIN',
    NOW(),
    NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%COORD%ENFERM%'
    LIMIT 1
) r
WHERE p.ruta_pagina IN (
    '/enfermeria/trazabilidad-recitas',
    '/enfermeria/rescatar-paciente',
    '/enfermeria/total-pacientes-enfermeria'
)
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, puede_editar = true, activo = true, updated_at = NOW();

-- ============================================================================
-- PASO 5: Permisos para rol MEDICO/PROFESIONAL DE SALUD (ENFERMERIA)
-- Para que el profesional de salud con rol enfermería vea sus páginas en el menú
-- ============================================================================
INSERT INTO segu_permisos_rol_pagina (id_rol, id_pagina, puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar, activo, autorizado_por, created_at, updated_at)
SELECT
    r.id_rol,
    p.id_pagina,
    true,   -- puede_ver
    false,  -- puede_crear
    true,   -- puede_editar (atender pacientes)
    false,  -- puede_eliminar
    false,  -- puede_exportar
    true,   -- activo
    'SUPERADMIN',
    NOW(),
    NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%ENFERM%'
      AND UPPER(desc_rol) NOT LIKE '%COORD%'
    LIMIT 1
) r
WHERE p.ruta_pagina IN (
    '/enfermeria/trazabilidad-recitas',
    '/enfermeria/rescatar-paciente',
    '/enfermeria/total-pacientes-enfermeria'
)
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, activo = true, updated_at = NOW();

-- ============================================================================
-- VERIFICACIÓN FINAL
-- ============================================================================
SELECT
    r.desc_rol               AS rol,
    p.nombre_pagina          AS pagina,
    p.ruta_pagina            AS ruta,
    s.puede_ver              AS ver,
    s.puede_editar           AS editar,
    s.puede_exportar         AS exportar,
    s.activo                 AS activo
FROM segu_permisos_rol_pagina s
JOIN dim_roles r            ON s.id_rol    = r.id_rol
JOIN dim_paginas_modulo p   ON s.id_pagina = p.id_pagina
WHERE p.ruta_pagina IN (
    '/enfermeria/trazabilidad-recitas',
    '/enfermeria/rescatar-paciente',
    '/enfermeria/total-pacientes-enfermeria'
)
  AND s.activo = true
ORDER BY r.desc_rol, p.orden;
