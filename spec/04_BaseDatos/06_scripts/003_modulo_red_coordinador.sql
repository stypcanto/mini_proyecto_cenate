-- ============================================================
-- Script: Modulo de Red para Coordinadores
-- Fecha: 2025-12-23
-- Descripcion: Crea rol, modulo, pagina y permisos MBAC
-- ============================================================

-- ============================================================
-- 1. AGREGAR CAMPO id_red A USUARIOS
-- ============================================================
ALTER TABLE dim_usuarios ADD COLUMN IF NOT EXISTS id_red BIGINT;

-- Agregar foreign key (si no existe)
DO $$
BEGIN
    IF NOT EXISTS (
        SELECT 1 FROM information_schema.table_constraints
        WHERE constraint_name = 'fk_usuarios_red'
        AND table_name = 'dim_usuarios'
    ) THEN
        ALTER TABLE dim_usuarios
        ADD CONSTRAINT fk_usuarios_red
        FOREIGN KEY (id_red) REFERENCES dim_red(id_red);
    END IF;
END $$;

-- Indice para optimizacion
CREATE INDEX IF NOT EXISTS idx_usuarios_red ON dim_usuarios(id_red);

-- ============================================================
-- 2. CREAR ROL COORDINADOR_RED
-- ============================================================
INSERT INTO dim_roles (desc_rol, stat_rol, activo, nivel_jerarquia)
VALUES ('COORDINADOR_RED', 'A', true, 4)
ON CONFLICT (desc_rol) DO NOTHING;

-- Verificar rol creado
-- SELECT * FROM dim_roles WHERE desc_rol = 'COORDINADOR_RED';

-- ============================================================
-- 3. CREAR MODULO "Gestion de Red"
-- ============================================================
INSERT INTO dim_modulos_sistema (nombre_modulo, descripcion, icono, orden, activo, created_at, updated_at)
VALUES (
    'Gestion de Red',
    'Modulo para coordinadores de red asistencial',
    'Network',
    16,
    true,
    NOW(),
    NOW()
)
ON CONFLICT (nombre_modulo) DO UPDATE SET
    descripcion = EXCLUDED.descripcion,
    icono = EXCLUDED.icono,
    orden = EXCLUDED.orden,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- ============================================================
-- 4. CREAR PAGINA "Mi Red"
-- ============================================================
INSERT INTO dim_paginas_modulo (id_modulo, nombre_pagina, ruta_pagina, descripcion, orden, activo, created_at, updated_at)
SELECT
    id_modulo,
    'Mi Red',
    '/red/dashboard',
    'Dashboard de la red asistencial',
    1,
    true,
    NOW(),
    NOW()
FROM dim_modulos_sistema
WHERE nombre_modulo = 'Gestion de Red'
ON CONFLICT (ruta_pagina) DO UPDATE SET
    nombre_pagina = EXCLUDED.nombre_pagina,
    descripcion = EXCLUDED.descripcion,
    orden = EXCLUDED.orden,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- ============================================================
-- 5. PERMISOS PARA COORDINADOR_RED (solo ver y exportar)
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
    false,  -- puede_editar
    false,  -- puede_eliminar
    true,   -- puede_exportar
    false,  -- puede_importar
    false,  -- puede_aprobar
    true,
    NOW(),
    NOW()
FROM dim_roles r
CROSS JOIN dim_paginas_modulo p
WHERE r.desc_rol = 'COORDINADOR_RED'
AND p.ruta_pagina = '/red/dashboard'
ON CONFLICT (id_rol, id_pagina) DO UPDATE SET
    puede_ver = EXCLUDED.puede_ver,
    puede_exportar = EXCLUDED.puede_exportar,
    activo = EXCLUDED.activo,
    updated_at = NOW();

-- ============================================================
-- 6. PERMISOS PARA SUPERADMIN Y ADMIN (acceso completo)
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
AND p.ruta_pagina = '/red/dashboard'
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
-- 7. VERIFICACION FINAL
-- ============================================================

-- Verificar rol
SELECT id_rol, desc_rol, nivel_jerarquia, activo
FROM dim_roles WHERE desc_rol = 'COORDINADOR_RED';

-- Verificar modulo
SELECT id_modulo, nombre_modulo, icono, orden, activo
FROM dim_modulos_sistema WHERE nombre_modulo = 'Gestion de Red';

-- Verificar pagina
SELECT p.id_pagina, m.nombre_modulo, p.nombre_pagina, p.ruta_pagina, p.activo
FROM dim_paginas_modulo p
JOIN dim_modulos_sistema m ON p.id_modulo = m.id_modulo
WHERE p.ruta_pagina = '/red/dashboard';

-- Verificar permisos asignados
SELECT r.desc_rol, p.ruta_pagina,
       prp.puede_ver, prp.puede_crear, prp.puede_editar,
       prp.puede_eliminar, prp.puede_exportar, prp.activo
FROM segu_permisos_rol_pagina prp
JOIN dim_roles r ON prp.id_rol = r.id_rol
JOIN dim_paginas_modulo p ON prp.id_pagina = p.id_pagina
WHERE p.ruta_pagina = '/red/dashboard'
ORDER BY r.desc_rol;

-- ============================================================
-- 8. EJEMPLO: ASIGNAR RED A USUARIO DE PRUEBA
-- ============================================================
-- UPDATE dim_usuarios
-- SET id_red = (SELECT id_red FROM dim_red LIMIT 1)
-- WHERE name_user = '44914706';

-- INSERT INTO rel_user_roles (id_user, id_rol)
-- SELECT u.id_user, r.id_rol
-- FROM dim_usuarios u, dim_roles r
-- WHERE u.name_user = '44914706'
-- AND r.desc_rol = 'COORDINADOR_RED'
-- ON CONFLICT DO NOTHING;

-- ============================================================
-- FIN DEL SCRIPT
-- ============================================================
