-- ============================================================================
-- V6_4_0: Registrar "Producción Diaria" en MBAC y dim_paginas_modulo
-- Página:  /estadisticas/programacion  (antes: Estadísticas de Programación)
-- Nuevo nombre: Producción Diaria  (Power BI embed)
-- Roles con acceso:
--   SUPERADMIN · ADMIN · COORD. TELE URGENCIAS Y TRIAJE · COORD. ESPECIALIDADES
--   GESTIONTERRITORIAL · GESTOR_TERRITORIAL_TI · COORD. GESTION CITAS
--   SUBDIRECCION_DE_TELESALUD · COORD. ENFERMERIA · MESA_DE_AYUDA
-- Autor: Styp Canto Rondón / Claude Code
-- Fecha: 2026-02-26
-- ============================================================================

-- ============================================================================
-- PASO 1: Asegurarse de que el módulo "Estadísticas de Programación" esté activo
-- ============================================================================
UPDATE dim_modulos_sistema
SET activo = true
WHERE UPPER(nombre_modulo) LIKE '%ESTAD%PROGRAM%'
   OR UPPER(nombre_modulo) LIKE '%PROGRAM%CENATE%';

-- ============================================================================
-- PASO 2: Registrar la página en dim_paginas_modulo (si no existe)
--         Usamos ON CONFLICT para que sea idempotente.
--         Actualizamos también el nombre a "Producción Diaria".
-- ============================================================================
INSERT INTO dim_paginas_modulo (
    id_modulo,
    nombre_pagina,
    ruta_pagina,
    descripcion,
    icono,
    orden,
    activo,
    created_at
)
SELECT
    m.id_modulo,
    'Producción Diaria',
    '/estadisticas/programacion',
    'Panel Power BI — Reporte de citas pendientes corte diario (BI_PENDIENTES_DIARIO)',
    'BarChart3',
    10,
    true,
    NOW()
FROM dim_modulos_sistema m
WHERE UPPER(m.nombre_modulo) LIKE '%ESTAD%PROGRAM%'
   OR UPPER(m.nombre_modulo) LIKE '%PROGRAM%CENATE%'
LIMIT 1
ON CONFLICT (id_modulo, ruta_pagina) DO UPDATE
    SET nombre_pagina = 'Producción Diaria',
        activo        = true,
        descripcion   = 'Panel Power BI — Reporte de citas pendientes corte diario (BI_PENDIENTES_DIARIO)';

-- ============================================================================
-- PASO 3: Permisos en segu_permisos_rol_pagina
--         Un bloque por cada rol usando LIKE dinámico + ON CONFLICT idempotente.
--         Permisos: solo VER + EXPORTAR (es un dashboard de solo lectura).
-- ============================================================================

-- ── SUPERADMIN (id_rol = 1, hardcoded) ──────────────────────────────────────
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar,
    activo, autorizado_por, created_at, updated_at
)
SELECT 1, p.id_pagina,
    true, false, false, false, true,
    true, 'SISTEMA', NOW(), NOW()
FROM dim_paginas_modulo p
WHERE p.ruta_pagina = '/estadisticas/programacion'
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, puede_exportar = true, activo = true, updated_at = NOW();

-- ── ADMIN ────────────────────────────────────────────────────────────────────
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar,
    activo, autorizado_por, created_at, updated_at
)
SELECT r.id_rol, p.id_pagina,
    true, false, false, false, true,
    true, 'SISTEMA', NOW(), NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%ADMIN%'
      AND UPPER(desc_rol) NOT LIKE '%SUPER%'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/estadisticas/programacion'
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, puede_exportar = true, activo = true, updated_at = NOW();

-- ── COORD. TELE URGENCIAS Y TRIAJE ───────────────────────────────────────────
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar,
    activo, autorizado_por, created_at, updated_at
)
SELECT r.id_rol, p.id_pagina,
    true, false, false, false, true,
    true, 'SISTEMA', NOW(), NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%TELE%URG%'
       OR UPPER(desc_rol) LIKE '%TRIAJE%'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/estadisticas/programacion'
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, puede_exportar = true, activo = true, updated_at = NOW();

-- ── COORD. ESPECIALIDADES ─────────────────────────────────────────────────────
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar,
    activo, autorizado_por, created_at, updated_at
)
SELECT r.id_rol, p.id_pagina,
    true, false, false, false, true,
    true, 'SISTEMA', NOW(), NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%COORD%ESPEC%'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/estadisticas/programacion'
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, puede_exportar = true, activo = true, updated_at = NOW();

-- ── GESTIONTERRITORIAL ────────────────────────────────────────────────────────
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar,
    activo, autorizado_por, created_at, updated_at
)
SELECT r.id_rol, p.id_pagina,
    true, false, false, false, true,
    true, 'SISTEMA', NOW(), NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%GESTION%TERRIT%'
      AND UPPER(desc_rol) NOT LIKE '%_TI%'
      AND UPPER(desc_rol) NOT LIKE '%TI%'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/estadisticas/programacion'
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, puede_exportar = true, activo = true, updated_at = NOW();

-- ── GESTOR_TERRITORIAL_TI ─────────────────────────────────────────────────────
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar,
    activo, autorizado_por, created_at, updated_at
)
SELECT r.id_rol, p.id_pagina,
    true, false, false, false, true,
    true, 'SISTEMA', NOW(), NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%TERRIT%TI%'
       OR UPPER(desc_rol) LIKE '%GESTOR%TI%'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/estadisticas/programacion'
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, puede_exportar = true, activo = true, updated_at = NOW();

-- ── COORD. GESTION CITAS ──────────────────────────────────────────────────────
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar,
    activo, autorizado_por, created_at, updated_at
)
SELECT r.id_rol, p.id_pagina,
    true, false, false, false, true,
    true, 'SISTEMA', NOW(), NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%COORD%GESTI%CITA%'
       OR UPPER(desc_rol) LIKE '%COORDINADOR_GESTION_CITAS%'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/estadisticas/programacion'
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, puede_exportar = true, activo = true, updated_at = NOW();

-- ── SUBDIRECCION_DE_TELESALUD ─────────────────────────────────────────────────
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar,
    activo, autorizado_por, created_at, updated_at
)
SELECT r.id_rol, p.id_pagina,
    true, false, false, false, true,
    true, 'SISTEMA', NOW(), NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%SUBDIR%TELES%'
       OR UPPER(desc_rol) LIKE '%SUBDIRECCION%TELESALUD%'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/estadisticas/programacion'
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, puede_exportar = true, activo = true, updated_at = NOW();

-- ── COORD. ENFERMERIA ─────────────────────────────────────────────────────────
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar,
    activo, autorizado_por, created_at, updated_at
)
SELECT r.id_rol, p.id_pagina,
    true, false, false, false, true,
    true, 'SISTEMA', NOW(), NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%COORD%ENFERM%'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/estadisticas/programacion'
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, puede_exportar = true, activo = true, updated_at = NOW();

-- ── MESA_DE_AYUDA ─────────────────────────────────────────────────────────────
INSERT INTO segu_permisos_rol_pagina (
    id_rol, id_pagina,
    puede_ver, puede_crear, puede_editar, puede_eliminar, puede_exportar,
    activo, autorizado_por, created_at, updated_at
)
SELECT r.id_rol, p.id_pagina,
    true, false, false, false, true,
    true, 'SISTEMA', NOW(), NOW()
FROM dim_paginas_modulo p
CROSS JOIN (
    SELECT id_rol FROM dim_roles
    WHERE UPPER(desc_rol) LIKE '%MESA%AYUDA%'
       OR UPPER(desc_rol) LIKE '%MESA_DE_AYUDA%'
    LIMIT 1
) r
WHERE p.ruta_pagina = '/estadisticas/programacion'
ON CONFLICT (id_rol, id_pagina) DO UPDATE
    SET puede_ver = true, puede_exportar = true, activo = true, updated_at = NOW();

-- ============================================================================
-- VERIFICACIÓN FINAL: roles que tienen acceso a Producción Diaria
-- ============================================================================
SELECT
    r.desc_rol          AS rol,
    p.nombre_pagina     AS pagina,
    s.puede_ver         AS ver,
    s.puede_exportar    AS exportar,
    s.activo            AS activo
FROM segu_permisos_rol_pagina s
JOIN dim_roles         r ON s.id_rol    = r.id_rol
JOIN dim_paginas_modulo p ON s.id_pagina = p.id_pagina
WHERE p.ruta_pagina = '/estadisticas/programacion'
  AND s.activo = true
ORDER BY r.desc_rol;
